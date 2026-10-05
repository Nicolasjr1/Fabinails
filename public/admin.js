const $ = (selector) => document.querySelector(selector);
const loginPanel = $('#login-panel');
const dashboard = $('#admin-dashboard');
const loginForm = $('#admin-login-form');
const loginMessage = $('#login-message');
const appointmentsList = $('#appointments-list');
const appointmentsMessage = $('#appointments-message');
const blockedDaysList = $('#blocked-days-list');
const blockedMessage = $('#blocked-message');

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
  return ({ active: 'Aguardando confirmação', confirmed: 'Confirmado', cancelled: 'Cancelado' })[status] || status;
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
  try {
    await api(`/api/admin/appointments/${encodeURIComponent(appointment.id)}`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    });
    await loadAppointments();
  } catch (error) {
    appointmentsMessage.textContent = error.message;
  }
}

async function loadAppointments() {
  appointmentsMessage.textContent = 'Carregando agenda...';
  try {
    const appointments = await api('/api/admin/appointments');
    appointmentsList.replaceChildren();
    if (!appointments.length) {
      appointmentsMessage.textContent = 'Ainda não há agendamentos.';
      return;
    }
    appointmentsMessage.textContent = `${appointments.length} agendamento(s)`;
    appointments.forEach((appointment) => {
      const item = document.createElement('article');
      item.className = `appointment-item status-${appointment.status}`;
      const details = document.createElement('div');
      details.className = 'appointment-details';
      const date = document.createElement('p');
      date.className = 'appointment-date';
      date.textContent = `${formatDate(appointment.date)} · ${appointment.time}`;
      const name = document.createElement('h3');
      name.textContent = appointment.clientName;
      const info = document.createElement('p');
      info.className = 'appointment-info';
      info.textContent = `${appointment.serviceName} · ${appointment.clientWhatsapp}`;
      const status = document.createElement('span');
      status.className = 'appointment-status';
      status.textContent = labelStatus(appointment.status);
      details.append(date, name, info, status);

      const actions = document.createElement('div');
      actions.className = 'appointment-actions';
      if (appointment.status !== 'cancelled') {
        const whatsapp = document.createElement('a');
        whatsapp.className = 'secondary-button';
        whatsapp.href = whatsappLink(appointment);
        whatsapp.target = '_blank';
        whatsapp.rel = 'noopener noreferrer';
        whatsapp.textContent = 'Pedir confirmação no WhatsApp';
        actions.append(whatsapp);
      }
      if (appointment.status !== 'confirmed' && appointment.status !== 'cancelled') {
        actions.append(makeButton('Marcar confirmado', 'secondary-button', () => updateStatus(appointment, 'confirmed')));
      }
      if (appointment.status !== 'cancelled') {
        actions.append(makeButton('Cancelar horário', 'cancel-button', () => updateStatus(appointment, 'cancelled')));
      }
      item.append(details, actions);
      appointmentsList.append(item);
    });
  } catch (error) {
    appointmentsMessage.textContent = error.message;
  }
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
});

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
$('#admin-logout').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' }).catch(() => {});
  dashboard.hidden = true;
  loginPanel.hidden = false;
});

api('/api/admin/session').then(showDashboard).catch(() => {
  loginPanel.hidden = false;
  dashboard.hidden = true;
});