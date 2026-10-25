const cancelDetails = document.querySelector('#cancel-details');
const cancelMessage = document.querySelector('#cancel-message');
const confirmCancel = document.querySelector('#confirm-cancel');
const cancelReason = document.querySelector('#cancel-reason');
const token = new URLSearchParams(location.search).get('token');

async function requestCancellation(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Não foi possível concluir o cancelamento.');
  return body;
}

function displayDate(date) {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo',
  }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

async function loadAppointment() {
  if (!token) throw new Error('Este link de cancelamento está incompleto.');
  const appointment = await requestCancellation(`/api/appointments/cancel?token=${encodeURIComponent(token)}`);
  cancelDetails.textContent = appointment.message || `${appointment.serviceName} · ${displayDate(appointment.date)} às ${appointment.time}`;
  if (appointment.status === 'cancelled') {
    cancelMessage.textContent = 'Este horário já foi cancelado.';
    return;
  }
  confirmCancel.disabled = false;
}

confirmCancel.addEventListener('click', async () => {
  if (!window.confirm('Tem certeza de que deseja cancelar este agendamento?')) return;
  confirmCancel.disabled = true;
  cancelMessage.textContent = 'Cancelando agendamento...';
  try {
    const result = await requestCancellation('/api/appointments/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, reason: cancelReason.value }),
    });
    cancelDetails.textContent = result.message;
    cancelMessage.textContent = 'O horário foi liberado para outra cliente.';
    confirmCancel.hidden = true;
  } catch (error) {
    cancelMessage.textContent = error.message;
    confirmCancel.disabled = false;
  }
});

loadAppointment().catch((error) => {
  cancelDetails.textContent = '';
  cancelMessage.textContent = error.message;
});