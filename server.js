const http = require('http');
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const { URL } = require('url');
const { randomUUID, randomBytes, timingSafeEqual, createHmac } = require('crypto');

function loadEnvFile() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2').trim();
    process.env[match[1]] = value;
  }
}

loadEnvFile();

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const dbUrl = process.env.DATABASE_URL;

const db = new Pool({
  connectionString: dbUrl,
  ssl: dbUrl?.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
});
let dbReady = false;
let dbInitialization;
const ADMIN_SESSION_TTL = 8 * 60 * 60 * 1000;

function getBusinessSlotsForDate(date) {
  const weekday = new Date(`${date}T12:00:00-03:00`).getUTCDay();

  if (weekday === 6) {
    return ['08:00', '10:30', '13:00'];
  }

  return ['08:00', '10:30', '13:00', '15:00', '17:00', '19:00'];
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(payload));
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getAdminSession(req) {
  const token = (req.headers.cookie || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith('fabi_admin='))?.slice('fabi_admin='.length);
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expectedSignature = createHmac('sha256', process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD).update(payload).digest('base64url');
  if (!safeEqual(signature, expectedSignature)) return false;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.username === (process.env.ADMIN_USERNAME || 'fabianaap') && session.expiresAt > Date.now();
  } catch {
    return false;
  }
}

function sendAdminJson(res, statusCode, payload) {
  res.setHeader('Cache-Control', 'no-store');
  sendJson(res, statusCode, payload);
}

function isValidAdminDate(date) {
  return typeof date === 'string' && isValidDate(date);
}

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Arquivo não encontrado');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

function isValidDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const parsed = new Date(`${date}T12:00:00-03:00`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}

function saoPauloDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isBookableDate(date) {
  if (!isValidDate(date)) return false;
  const weekday = new Date(`${date}T12:00:00-03:00`).getUTCDay();
  return date >= saoPauloDateKey() && weekday !== 0;
}

function isFutureSlot(date, time) {
  const today = saoPauloDateKey();
  if (date > today) return true;
  if (date < today) return false;
  const currentTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(new Date());
  return time > currentTime;
}

async function readBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 16_384) throw new Error('Corpo da requisição muito grande');
  }
  return JSON.parse(body || '{}');
}

async function loadAvailabilityForMonth(month, holdToken) {
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return {};
  }

  const [year, monthNumber] = month.split('-').map(Number);
  const startDate = `${month}-01`;
  const nextYear = monthNumber === 12 ? year + 1 : year;
  const nextMonth = monthNumber === 12 ? 1 : monthNumber + 1;
  const nextDate = `${String(nextYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}-01`;

  await db.query('DELETE FROM "BookingHold" WHERE "expiresAt" <= NOW()');
  const result = await db.query(
    'SELECT "date", "time" FROM "Appointment" WHERE "date" >= $1 AND "date" < $2 AND status <> \'cancelled\' UNION ALL SELECT "date", "time" FROM "BookingHold" WHERE "date" >= $1 AND "date" < $2 AND "expiresAt" > NOW() AND ($3::text IS NULL OR token <> $3) ORDER BY "date", "time"',
    [startDate, nextDate, holdToken || null],
  );
  const blockedResult = await db.query(
    'SELECT date FROM "BlockedDay" WHERE date >= $1 AND date < $2',
    [startDate, nextDate],
  );
  const blockedDates = new Set(blockedResult.rows.map((row) => row.date));

  const map = {};
  for (const row of result.rows) {
    if (!map[row.date]) map[row.date] = [];
    map[row.date].push(row.time);
  }

  const available = {};
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dateKey = `${month}-${String(day).padStart(2, '0')}`;
    const weekday = new Date(Date.UTC(year, monthNumber - 1, day)).getUTCDay();
    if (weekday === 0 || dateKey < saoPauloDateKey()) continue;

    const taken = map[dateKey] || [];
    const slots = getBusinessSlotsForDate(dateKey);
    available[dateKey] = blockedDates.has(dateKey) ? [] : slots.filter((slot) => !taken.includes(slot) && isFutureSlot(dateKey, slot));
  }

  return available;
}

async function loadDaySlots(date, holdToken) {
  if (!isBookableDate(date)) return [];
  const blocked = await db.query('SELECT 1 FROM "BlockedDay" WHERE date = $1', [date]);
  if (blocked.rowCount) return [];
  await db.query('DELETE FROM "BookingHold" WHERE "expiresAt" <= NOW()');
  const result = await db.query(
    'SELECT "time" FROM "Appointment" WHERE "date" = $1 AND status <> \'cancelled\' UNION SELECT "time" FROM "BookingHold" WHERE "date" = $1 AND "expiresAt" > NOW() AND ($2::text IS NULL OR token <> $2)',
    [date, holdToken || null],
  );
  const taken = new Set(result.rows.map((row) => row.time));
  return getBusinessSlotsForDate(date).map((time) => ({ time, available: !taken.has(time) && isFutureSlot(date, time) }));
}

function buildWhatsappMessage({ clientName, clientWhatsapp, serviceName, date, time }) {
  return `Olá, Fabi! Gostaria de confirmar o agendamento de ${serviceName} para ${date} às ${time}. Nome: ${clientName}. WhatsApp: ${clientWhatsapp}.`;
}

async function handleApi(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (url.pathname === '/api/health') {
    sendJson(res, dbReady ? 200 : 503, { ok: dbReady, database: dbReady ? 'connected' : 'unavailable' });
    return;
  }

  if (url.pathname === '/api/admin/login' && req.method === 'POST') {
    try {
      const { username, password } = await readBody(req);
      const expectedUsername = process.env.ADMIN_USERNAME || 'fabianaap';
      const expectedPassword = process.env.ADMIN_PASSWORD;
      if (!expectedPassword) {
        sendAdminJson(res, 503, { error: 'Configure ADMIN_PASSWORD no arquivo .env.' });
        return;
      }
      if (!safeEqual(username, expectedUsername) || !safeEqual(password, expectedPassword)) {
        sendAdminJson(res, 401, { error: 'Usuário ou senha incorretos.' });
        return;
      }
      const payload = Buffer.from(JSON.stringify({
        username: expectedUsername,
        expiresAt: Date.now() + ADMIN_SESSION_TTL,
      })).toString('base64url');
      const signature = createHmac('sha256', process.env.ADMIN_SESSION_SECRET || expectedPassword).update(payload).digest('base64url');
      const token = `${payload}.${signature}`;
      const secureCookie = req.socket.encrypted || req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : '';
      res.setHeader('Set-Cookie', `fabi_admin=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_TTL / 1000}${secureCookie}`);
      sendAdminJson(res, 200, { ok: true, username: expectedUsername });
    } catch {
      sendAdminJson(res, 400, { error: 'Não foi possível entrar.' });
    }
    return;
  }

  if (url.pathname === '/api/admin/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', 'fabi_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
    sendAdminJson(res, 200, { ok: true });
    return;
  }

  if (url.pathname.startsWith('/api/admin/')) {
    if (!getAdminSession(req)) {
      sendAdminJson(res, 401, { error: 'Entre como administradora para continuar.' });
      return;
    }

    if (url.pathname === '/api/admin/session' && req.method === 'GET') {
      sendAdminJson(res, 200, { ok: true, username: process.env.ADMIN_USERNAME || 'fabianaap' });
      return;
    }

    if (url.pathname === '/api/admin/appointments' && req.method === 'GET') {
      try {
        const result = await db.query(
          'SELECT a.id, a."clientName", a."clientWhatsapp", a.date, a.time, a.status, a."createdAt", s.name AS "serviceName" FROM "Appointment" a JOIN "Service" s ON s.id = a."serviceId" WHERE a.status <> \'cancelled\' ORDER BY a.date ASC, a.time ASC, a."createdAt" ASC',
        );
        sendAdminJson(res, 200, result.rows);
      } catch (error) {
        console.error('Erro ao carregar agenda administrativa:', error);
        sendAdminJson(res, 500, { error: 'Não foi possível carregar a agenda.' });
      }
      return;
    }

    const appointmentMatch = url.pathname.match(/^\/api\/admin\/appointments\/([a-f0-9-]+)$/i);
    if (appointmentMatch && req.method === 'PATCH') {
      try {
        const { status } = await readBody(req);
        if (!['confirmed', 'cancelled'].includes(status)) {
          sendAdminJson(res, 400, { error: 'Status inválido.' });
          return;
        }
        const result = await db.query(
          'UPDATE "Appointment" SET status = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING id, status',
          [status, appointmentMatch[1]],
        );
        if (!result.rowCount) {
          sendAdminJson(res, 404, { error: 'Agendamento não encontrado.' });
          return;
        }
        sendAdminJson(res, 200, result.rows[0]);
      } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        sendAdminJson(res, 500, { error: 'Não foi possível atualizar o agendamento.' });
      }
      return;
    }

    if (url.pathname === '/api/admin/blocked-days' && req.method === 'GET') {
      try {
        const result = await db.query('SELECT date, reason FROM "BlockedDay" ORDER BY date ASC');
        sendAdminJson(res, 200, result.rows);
      } catch (error) {
        console.error('Erro ao carregar dias fechados:', error);
        sendAdminJson(res, 500, { error: 'Não foi possível carregar os dias fechados.' });
      }
      return;
    }

    if (url.pathname === '/api/admin/blocked-days' && req.method === 'POST') {
      let connection;
      try {
        const { date, reason = '' } = await readBody(req);
        if (!isValidAdminDate(date) || new Date(`${date}T12:00:00-03:00`).getUTCDay() === 0) {
          sendAdminJson(res, 400, { error: 'Escolha uma data válida (domingo não pode ser agendado).' });
          return;
        }
        connection = await db.connect();
        await connection.query('BEGIN');
        await connection.query('INSERT INTO "BlockedDay" (date, reason) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET reason = EXCLUDED.reason', [date, String(reason).slice(0, 160)]);
        const cancelled = await connection.query('UPDATE "Appointment" SET status = \'cancelled\', "updatedAt" = NOW() WHERE date = $1 AND status <> \'cancelled\'', [date]);
        await connection.query('DELETE FROM "BookingHold" WHERE date = $1', [date]);
        await connection.query('COMMIT');
        sendAdminJson(res, 200, { ok: true, cancelled: cancelled.rowCount });
      } catch (error) {
        if (connection) await connection.query('ROLLBACK').catch(() => {});
        console.error('Erro ao bloquear dia:', error);
        sendAdminJson(res, 500, { error: 'Não foi possível bloquear esse dia.' });
      } finally {
        connection?.release();
      }
      return;
    }

    const blockedDayMatch = url.pathname.match(/^\/api\/admin\/blocked-days\/(\d{4}-\d{2}-\d{2})$/);
    if (blockedDayMatch && req.method === 'DELETE') {
      try {
        await db.query('DELETE FROM "BlockedDay" WHERE date = $1', [blockedDayMatch[1]]);
        sendAdminJson(res, 200, { ok: true });
      } catch (error) {
        console.error('Erro ao reabrir dia:', error);
        sendAdminJson(res, 500, { error: 'Não foi possível reabrir esse dia.' });
      }
      return;
    }
  }

  if (url.pathname === '/api/services') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Método não permitido' });
      return;
    }

    try {
      if (!dbReady) throw new Error('Banco de dados indisponível');
      const result = await db.query('SELECT * FROM "Service" ORDER BY price DESC');
      sendJson(res, 200, result.rows);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      sendJson(res, 500, { error: 'Erro ao buscar serviços' });
    }
    return;
  }

  if (url.pathname === '/api/appointments/available') {
    if (req.method !== 'GET') {
      sendJson(res, 405, { error: 'Método não permitido' });
      return;
    }

    const month = url.searchParams.get('month');
    try {
      if (!dbReady) throw new Error('Banco de dados indisponível');
      const availability = await loadAvailabilityForMonth(month, url.searchParams.get('holdToken'));
      sendJson(res, 200, availability);
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
      sendJson(res, 500, { error: 'Erro ao carregar disponibilidade' });
    }
    return;
  }

  if (url.pathname === '/api/appointments/day' && req.method === 'GET') {
    try {
      if (!dbReady) throw new Error('Banco de dados indisponível');
      const slots = await loadDaySlots(url.searchParams.get('date'), url.searchParams.get('holdToken'));
      sendJson(res, 200, slots);
    } catch (error) {
      console.error('Erro ao buscar horários do dia:', error);
      sendJson(res, 500, { error: 'Não foi possível carregar os horários.' });
    }
    return;
  }

  const holdMatch = url.pathname.match(/^\/api\/appointments\/hold\/([0-9a-f-]+)$/i);
  if (holdMatch && req.method === 'DELETE') {
    try {
      if (!dbReady) throw new Error('Banco de dados indisponível');
      await db.query('DELETE FROM "BookingHold" WHERE token = $1', [holdMatch[1]]);
      sendJson(res, 200, { ok: true });
    } catch (error) {
      sendJson(res, 500, { error: error.message });
    }
    return;
  }

  if (url.pathname === '/api/appointments/hold' && req.method === 'POST') {
    let connection;
    try {
      if (!dbReady) throw new Error('Banco de dados indisponível');
      const { serviceId, date, time } = await readBody(req);
      if (!serviceId || !isBookableDate(date) || !getBusinessSlotsForDate(date).includes(time)) {
        sendJson(res, 400, { error: 'Escolha um dia e horário válidos.' });
        return;
      }

      connection = await db.connect();
      await connection.query('BEGIN');
      await connection.query('DELETE FROM "BookingHold" WHERE "expiresAt" <= NOW()');
      const service = await connection.query('SELECT id FROM "Service" WHERE id = $1', [serviceId]);
      if (!service.rowCount) {
        await connection.query('ROLLBACK');
        sendJson(res, 404, { error: 'Serviço não encontrado.' });
        return;
      }

      const blocked = await connection.query('SELECT 1 FROM "BlockedDay" WHERE date = $1', [date]);
      if (blocked.rowCount) {
        await connection.query('ROLLBACK');
        sendJson(res, 409, { error: 'Este dia está fechado para agendamentos.' });
        return;
      }

      const booked = await connection.query('SELECT 1 FROM "Appointment" WHERE "date" = $1 AND "time" = $2 AND status <> \'cancelled\'', [date, time]);
      if (booked.rowCount) {
        await connection.query('ROLLBACK');
        sendJson(res, 409, { error: 'Esse horário acabou de ser reservado. Escolha outro.' });
        return;
      }

      const token = randomUUID();
      const held = await connection.query(
        'INSERT INTO "BookingHold" (token, "serviceId", "date", "time", "expiresAt") VALUES ($1, $2, $3, $4, NOW() + INTERVAL \'10 minutes\') ON CONFLICT ("date", "time") DO NOTHING RETURNING token, "expiresAt"',
        [token, serviceId, date, time],
      );
      if (!held.rowCount) {
        await connection.query('ROLLBACK');
        sendJson(res, 409, { error: 'Alguém está preenchendo este horário. Escolha outro.' });
        return;
      }

      await connection.query('COMMIT');
      sendJson(res, 201, { token: held.rows[0].token, expiresAt: held.rows[0].expiresAt });
    } catch (error) {
      if (connection) await connection.query('ROLLBACK').catch(() => {});
      console.error('Erro ao reservar temporariamente:', error);
      sendJson(res, 500, { error: 'Não foi possível reservar esse horário agora.' });
    } finally {
      connection?.release();
    }
    return;
  }

  if (url.pathname === '/api/appointments') {
    if (req.method !== 'POST') {
      sendJson(res, 405, { error: 'Método não permitido' });
      return;
    }

    let connection;
    try {
        if (!dbReady) throw new Error('Banco de dados indisponível');
        const payload = await readBody(req);
        const { serviceId, date, time, clientName, clientWhatsapp } = payload;

        const cleanName = typeof clientName === 'string' ? clientName.trim() : '';
        const cleanWhatsapp = typeof clientWhatsapp === 'string' ? clientWhatsapp.replace(/\D/g, '') : '';
if (!serviceId || !isBookableDate(date) || !getBusinessSlotsForDate(date).includes(time) || cleanName.length < 2 || cleanName.length > 80 || cleanWhatsapp.length < 8 || cleanWhatsapp.length > 15 || !payload.holdToken) {
          sendJson(res, 400, { error: 'Dados incompletos' });
          return;
        }

        connection = await db.connect();
        await connection.query('BEGIN');
        const hold = await connection.query(
          'SELECT * FROM "BookingHold" WHERE token = $1 AND "serviceId" = $2 AND "date" = $3 AND "time" = $4 AND "expiresAt" > NOW() FOR UPDATE',
          [payload.holdToken, serviceId, date, time],
        );
        if (!hold.rowCount) {
          await connection.query('ROLLBACK');
          sendJson(res, 409, { error: 'Sua reserva temporária expirou. Escolha o horário novamente.' });
          return;
        }

        const serviceResult = await connection.query('SELECT * FROM "Service" WHERE id = $1', [serviceId]);
        if (!serviceResult.rowCount) {
          await connection.query('ROLLBACK');
          sendJson(res, 404, { error: 'Serviço não encontrado' });
          return;
        }

        const inserted = await connection.query(
          'INSERT INTO "Appointment" (id, "clientName", "clientWhatsapp", "serviceId", "date", "time", "status", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING *',
          [randomUUID(), cleanName, cleanWhatsapp, serviceId, date, time, 'active'],
        );
        await connection.query('DELETE FROM "BookingHold" WHERE token = $1', [payload.holdToken]);
        await connection.query('COMMIT');

        const service = serviceResult.rows[0];
        const message = buildWhatsappMessage({
          clientName: inserted.rows[0].clientName,
          clientWhatsapp: inserted.rows[0].clientWhatsapp,
          serviceName: service.name,
          date: inserted.rows[0].date,
          time: inserted.rows[0].time,
        });

        const whatsapp = process.env.FABI_WHATSAPP || '5543996524776';
        const notificationUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

        sendJson(res, 201, {
          ok: true,
          message: 'Agendamento salvo com sucesso.',
          notificationUrl,
        });
    } catch (error) {
        if (connection) await connection.query('ROLLBACK').catch(() => {});
        if (error.code === '23505') {
          sendJson(res, 409, { error: 'Este horário já foi reservado' });
          return;
        }
        console.error('Erro ao salvar agendamento:', error);
        sendJson(res, 500, { error: 'Erro ao salvar agendamento' });
    } finally {
      connection?.release();
    }
    return;
  }

  sendJson(res, 404, { error: 'Rota não encontrada' });
}

async function initializeDatabase() {
  if (dbReady) return;
  if (!dbInitialization) {
    dbInitialization = (async () => {
    if (!dbUrl) throw new Error('DATABASE_URL não foi configurada no arquivo .env');
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await db.query(schema);
    await db.query('ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS "Appointment_date_time_key"');
    await db.query('CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_date_time_active_key" ON "Appointment" (date, time) WHERE status <> \'cancelled\'');
    const services = [
      { name: 'Alongamento', price: 150, duration: 2 },
      { name: 'Manutenção', price: 100, duration: 2 },
      { name: 'Banho de Gel', price: 100, duration: 2 },
    ];
    for (const service of services) {
      await db.query(
        'INSERT INTO "Service" (id, name, price, duration) VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO UPDATE SET price = EXCLUDED.price, duration = EXCLUDED.duration',
        [randomUUID(), service.name, service.price, service.duration],
      );
    }
    dbReady = true;
    console.log('Conectado ao banco');
    })().catch((error) => {
      dbInitialization = null;
      throw error;
    });
  }
  await dbInitialization;
}

async function handleRequest(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  if (pathname.startsWith('/api/')) {
    try {
      await initializeDatabase();
    } catch (error) {
      console.error('Não foi possível conectar ao banco:', error.message || error);
    }
    await handleApi(req, res);
    return;
  }

  const bookingRoutes = ['/booking/services', '/booking/date', '/booking/times', '/booking/contact', '/booking/confirmation'];
  const safePath = pathname === '/' || bookingRoutes.includes(pathname) ? '/index.html' : pathname === '/admin' ? '/admin.html' : pathname;
  const filePath = path.resolve(PUBLIC_DIR, `.${safePath}`);

  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Acesso negado');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      sendFile(res, path.join(PUBLIC_DIR, 'index.html'));
      return;
    }
    sendFile(res, filePath);
  });
}

async function startServer() {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Não foi possível conectar ao banco:', error.message || error);
  }

  const server = http.createServer(handleRequest);
  server.listen(PORT, () => {
    console.log(`Servidor online em http://localhost:${PORT}`);
  });
}

if (require.main === module) startServer();

module.exports = handleRequest;
