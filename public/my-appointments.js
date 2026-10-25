const ACCESS_KEY = 'fabi-client-access';
const clientAppointmentsMessage = document.querySelector('#client-appointments-message');
const clientAppointmentsList = document.querySelector('#client-appointments-list');
const clientToken = localStorage.getItem(ACCESS_KEY);

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${clientToken || ''}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Não foi possível concluir a solicitação.');
  return body;
}

function formatDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function statusLabel(status) {
  return ({ active: 'Aguardando confirmação', confirmed: 'Confirmado', cancelled: 'Cancelado', completed: 'Concluído' })[status] || status;
}

function makeAppointment(appointment) {
  const item = document.createElement('article');
  item.className = `client-appointment status-${appointment.status}`;
  const heading = document.createElement('div');
  heading.className = 'client-appointment-heading';
  const details = document.createElement('div');
  details.className = 'client-appointment-details';
  const date = document.createElement('h2');
  date.textContent = formatDate(appointment.date);
  const service = document.createElement('p');
  service.textContent = `${appointment.time} · ${appointment.serviceName}`;
  details.append(date, service);
  const status = document.createElement('span');
  status.className = 'client-appointment-status';
  status.textContent = statusLabel(appointment.status);
  heading.append(details, status);
  item.append(heading);

  if (appointment.cancellationReason) {
    const reason = document.createElement('p');
    reason.className = 'client-cancellation-reason';
    reason.textContent = `Motivo informado: ${appointment.cancellationReason}`;
    item.append(reason);
  }

  if (['active', 'confirmed'].includes(appointment.status)) {
    const form = document.createElement('form');
    form.className = 'client-cancel-form';
    const label = document.createElement('label');
    label.className = 'field';
    const labelText = document.createElement('span');
    labelText.textContent = 'Por que deseja cancelar? (opcional)';
    const reason = document.createElement('textarea');
    reason.name = 'reason';
    reason.maxLength = 500;
    reason.rows = 2;
    reason.placeholder = 'Se quiser, conte o motivo';
    label.append(labelText, reason);
    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.className = 'cancel-button';
    submit.textContent = 'Desmarcar horário';
    form.append(label, submit);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!window.confirm(`Deseja desmarcar ${appointment.serviceName} em ${formatDate(appointment.date)} às ${appointment.time}?`)) return;
      submit.disabled = true;
      clientAppointmentsMessage.textContent = 'Cancelando horário...';
      try {
        await requestJson(`/api/client/appointments/${encodeURIComponent(appointment.id)}/cancel`, {
          method: 'POST',
          body: JSON.stringify({ reason: reason.value }),
        });
        clientAppointmentsMessage.textContent = 'Horário desmarcado.';
        await loadAppointments();
      } catch (error) {
        clientAppointmentsMessage.textContent = error.message;
        submit.disabled = false;
      }
    });
    item.append(form);
  }
  return item;
}

async function loadAppointments() {
  if (!clientToken) {
    clientAppointmentsList.replaceChildren();
    clientAppointmentsMessage.textContent = 'Não há agendamentos salvos neste navegador. Use o mesmo aparelho e navegador usados para marcar.';
    return;
  }
  try {
    const appointments = await requestJson('/api/client/appointments');
    clientAppointmentsList.replaceChildren();
    if (!appointments.length) {
      clientAppointmentsMessage.textContent = 'Você ainda não tem agendamentos vinculados a este navegador.';
      return;
    }
    clientAppointmentsMessage.textContent = `${appointments.length} agendamento(s)`;
    appointments.forEach((appointment) => clientAppointmentsList.append(makeAppointment(appointment)));
  } catch (error) {
    clientAppointmentsMessage.textContent = error.message;
  }
}

loadAppointments();
