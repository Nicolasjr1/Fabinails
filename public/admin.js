const $ = (selector) => document.querySelector(selector);
const loginPanel = $('#login-panel');
const dashboard = $('#admin-dashboard');
const loginForm = $('#admin-login-form');
const loginMessage = $('#login-message');
const appointmentsList = $('#appointments-list');
const appointmentsMessage = $('#appointments-message');
const blockedDaysList = $('#blocked-days-list');
const blockedMessage = $('#blocked-message');
const calendarGrid = $('#admin-calendar-grid');
const selectedDateLabel = $('#selected-date-label');
let appointments = [];

function saoPauloDateKey() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

let selectedDate = saoPauloDateKey();
let calendarMonth = new Date(`${selectedDate}T12:00:00-03:00`);
calendarMonth.setUTCDate(1);

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Não foi possível concluir a ação.');
  return body;
}

function formatDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function labelStatus(status) {
  return ({ active: 'Aguardando confirmação', confirmed: 'Confirmado', completed: 'Concluído', cancelled: 'Cancelado' })[status] || status;
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function renderCalendar() {
  const year = calendarMonth.getUTCFullYear();
  const month = calendarMonth.getUTCMonth();
  $('#calendar-month-label').textContent = new Intl.DateTimeFormat('pt-BR', {
    month: 'long', year: 'numeric', timeZone: 'UTC',
  }).format(calendarMonth);
  calendarGrid.replaceChildren();

  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  for (let index = 0; index < offset; index += 1) {
    const empty = document.createElement('span');
    empty.className = 'calendar-empty';
    empty.setAttribute('aria-hidden', 'true');
    calendarGrid.append(empty);
  }

  const appointmentsPerDay = new Map();
  appointments.forEach((appointment) => {
    appointmentsPerDay.set(appointment.date, (appointmentsPerDay.get(appointment.date) || 0) + 1);
  });
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const today = saoPauloDateKey();

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = dateKey(year, month, day);
    const count = appointmentsPerDay.get(key) || 0;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `calendar-day admin-calendar-day${count ? ' has-slots' : ''}${key === selectedDate ? ' is-selected' : ''}${key === today ? ' is-today' : ''}`;
    button.setAttribute('aria-pressed', String(key === selectedDate));
    button.setAttribute('aria-label', `${formatDate(key)}${count ? `, ${count} agendamento(s)` : ', sem agendamentos'}`);
    const number = document.createElement('span');
    number.textContent = String(day);
    button.append(number);
    if (count) {
      const badge = document.createElement('span');
      badge.className = 'calendar-count';
      badge.textContent = String(count);
      button.append(badge);
    }
    button.addEventListener('click', () => {
      selectedDate = key;
      renderCalendar();
      renderDaySchedule();
    });
    calendarGrid.append(button);
  }
}

function makeButton(label, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}

function whatsappLink(appointment) {
  const digits = appointment.clientWhatsapp.replace(/\D/g, '');
  const phone = digits.startsWith('55') ? digits : `55${digits}`;
  const message = `Oi, ${appointment.clientName.split(/\s+/)[0]}! Aqui é da Fabi Nails. Gostaria de confirmar seu agendamento de ${appointment.serviceName} para ${formatDate(appointment.date)} às ${appointment.time}. Responda SIM para confirmar ou NÃO se precisar cancelar.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

async function updateStatus(appointment, status) {
  if (status === 'cancelled' && !window.confirm(`Cancelar o horário de ${appointment.clientName} em ${formatDate(appointment.date)} às ${appointment.time}?`)) return;
  if (status === 'completed' && !window.confirm(`Marcar o atendimento de ${appointment.clientName} às ${appointment.time} como concluído? Ele sairá da agenda ativa.`)) return;
  try {
    await api(`/api/admin/appointments/${encodeURIComponent(appointment.id)}`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
    await loadAppointments();
  } catch (error) {
    appointmentsMessage.textContent = error.message;
  }
}

function renderDaySchedule() {
  selectedDateLabel.textContent = formatDate(selectedDate);
  appointmentsList.replaceChildren();
  const dayAppointments = appointments.filter((appointment) => appointment.date === selectedDate);
  if (!dayAppointments.length) {
    appointmentsMessage.textContent = 'Nenhum horário marcado para este dia.';
    return;
  }

  appointmentsMessage.textContent = `${dayAppointments.length} horário(s) marcado(s)`;
  dayAppointments.forEach((appointment) => {
    const row = document.createElement('article');
    row.className = 'appointment-row';
    const time = document.createElement('time');
    time.className = 'appointment-row-time';
    time.textContent = appointment.time;
    const details = document.createElement('div');
    details.className = 'appointment-row-details';
    const name = document.createElement('strong');
    name.textContent = appointment.clientName;
    const service = document.createElement('span');
    service.textContent = `${appointment.serviceName} · ${appointment.clientWhatsapp}`;
    details.append(name, service);
    const status = document.createElement('span');
    status.className = 'appointment-status';
    status.textContent = labelStatus(appointment.status);
    const actions = document.createElement('div');
    actions.className = 'appointment-row-actions';
    if (appointment.status !== 'confirmed') {
      actions.append(makeButton('Confirmar', 'secondary-button', () => updateStatus(appointment, 'confirmed')));
    }
    actions.append(makeButton('Concluído', 'secondary-button', () => updateStatus(appointment, 'completed')));
    actions.append(makeButton('Cancelar', 'cancel-button', () => updateStatus(appointment, 'cancelled')));
    const whatsapp = document.createElement('a');
    whatsapp.className = 'appointment-whatsapp';
    whatsapp.href = whatsappLink(appointment);
    whatsapp.target = '_blank';
    whatsapp.rel = 'noopener noreferrer';
    whatsapp.textContent = 'WhatsApp';
    actions.append(whatsapp);
    row.append(time, details, status, actions);
    appointmentsList.append(row);
  });
}

async function loadAppointments() {
  appointmentsMessage.textContent = 'Carregando agenda...';
  try {
    appointments = await api('/api/admin/appointments');
    renderCalendar();
    renderDaySchedule();
  } catch (error) {
    appointmentsMessage.textContent = error.message;
  }
}

function changeCalendarMonth(offset) {
  calendarMonth = new Date(Date.UTC(calendarMonth.getUTCFullYear(), calendarMonth.getUTCMonth() + offset, 1));
  renderCalendar();
}

async function loadBlockedDays() {
  try {
    const blockedDays = await api('/api/admin/blocked-days');
    blockedDaysList.replaceChildren();
    blockedDays.forEach((blockedDay) => {
      const item = document.createElement('div');
      item.className = 'blocked-day-item';
      const text = document.createElement('span');
      text.textContent = `${formatDate(blockedDay.date)}${blockedDay.reason ? ` · ${blockedDay.reason}` : ''}`;
      item.append(text, makeButton('Reabrir dia', 'secondary-button', async () => {
        try {
          await api(`/api/admin/blocked-days/${blockedDay.date}`, { method: 'DELETE' });
          blockedMessage.textContent = 'Dia reaberto para agendamentos.';
          await loadBlockedDays();
        } catch (error) {
          blockedMessage.textContent = error.message;
        }
      }));
      blockedDaysList.append(item);
    });
  } catch (error) {
    blockedMessage.textContent = error.message;
  }
}

async function showDashboard() {
  loginPanel.hidden = true;
  dashboard.hidden = false;
  await Promise.all([loadAppointments(), loadBlockedDays()]);
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginMessage.textContent = '';
  const data = new FormData(loginForm);
  try {
    await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username: data.get('username'), password: data.get('password') }),
    });
    loginForm.reset();
    await showDashboard();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
});

$('#blocked-day-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const date = data.get('date');
  if (!window.confirm(`Fechar ${formatDate(date)}? Os agendamentos existentes nesse dia serão cancelados.`)) return;
  blockedMessage.textContent = '';
  try {
    const result = await api('/api/admin/blocked-days', {
      method: 'POST', body: JSON.stringify({ date, reason: data.get('reason') }),
    });
    blockedMessage.textContent = `Dia fechado. ${result.cancelled} agendamento(s) cancelado(s).`;
    form.reset();
    await Promise.all([loadAppointments(), loadBlockedDays()]);
  } catch (error) {
    blockedMessage.textContent = error.message;
  }
});

$('#reload-appointments').addEventListener('click', loadAppointments);
$('#calendar-previous').addEventListener('click', () => changeCalendarMonth(-1));
$('#calendar-next').addEventListener('click', () => changeCalendarMonth(1));
$('#admin-logout').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
  dashboard.hidden = true;
  loginPanel.hidden = false;
});

api('/api/admin/session').then(showDashboard).catch(() => {
  loginPanel.hidden = false;
  dashboard.hidden = true;
});