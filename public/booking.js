const STORAGE_KEY = "fabi-booking";
const state = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
state.availability ||= {};
const step = location.pathname.split("/").filter(Boolean).at(-1) || "services";
const pages = {
  services: { title: "Escolha o serviço", description: "Selecione o atendimento que deseja agendar." },
  date: { title: "Escolha a data", description: "Veja os dias com horários livres." },
  times: { title: "Horários livres", description: "Escolha um horário. Ele ficará reservado por 10 minutos." },
  contact: { title: "Seus dados", description: "Informe seu nome e telefone para confirmar." },
};
const $ = (selector) => document.querySelector(selector);
const elements = {
  form: $("#booking-form"), serviceList: $("#service-list"), calendarGrid: $("#calendar-grid"),
  monthLabel: $("#month-label"), calendarMessage: $("#calendar-message"),
  selectedDateLabel: $("#selected-date-label"), timeList: $("#time-list"),
  continueDate: $("#continue-date"), continueTimes: $("#continue-times"),
  submit: $("#submit-booking"), formMessage: $("#form-message"), heldMessage: $("#held-slot-message"),
};

function saveState() { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function go(route) { location.href = `/booking/${route}`; }
function dateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function monthKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
function saoPauloDateKey() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}
function displayDate(key, options = { weekday: "long", day: "2-digit", month: "long" }) {
  if (!key) return "";
  const [year, month, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { ...options, timeZone: "America/Sao_Paulo" }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}
function money(value) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value); }
async function requestJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Não foi possível concluir a solicitação.");
  return body;
}
async function loadServices() {
  state.services = await requestJson("/api/services");
  if (!state.services.some((service) => service.id === state.serviceId)) {
    state.serviceId = ""; state.holdToken = ""; state.time = "";
  }
  saveState();
}
function selectedService() { return state.services.find((service) => service.id === state.serviceId); }
function renderServices() {
  elements.serviceList.replaceChildren();
  state.services.forEach((service, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `service-option${service.id === state.serviceId ? " is-selected" : ""}`;
    button.setAttribute("aria-pressed", String(service.id === state.serviceId));
    button.innerHTML = `<span class="service-index">0${index + 1}</span><span class="service-info"><strong></strong><small>${service.duration}h de atendimento</small></span><span class="service-price"></span>`;
    button.querySelector(".service-info strong").textContent = service.name;
    button.querySelector(".service-price").textContent = money(service.price);
    button.addEventListener("click", async () => {
      if (state.holdToken) await releaseHold();
      state.serviceId = service.id; saveState(); renderServices();
      elements.continueDate.disabled = false;
    });
    elements.serviceList.append(button);
  });
  elements.continueDate.disabled = !state.serviceId;
}
function availabilityUrl() {
  const params = new URLSearchParams({ month: monthKey(state.month) });
  if (state.holdToken) params.set("holdToken", state.holdToken);
  return `/api/appointments/available?${params}`;
}
async function loadAvailability() {
  state.loading = true;
  elements.calendarMessage.textContent = "Carregando dias livres...";
  if (step === "times") elements.timeList.innerHTML = '<p class="loading-copy">Carregando horários...</p>';
  try {
    if (step === "times") {
      const params = new URLSearchParams({ date: state.date });
      if (state.holdToken) params.set("holdToken", state.holdToken);
      state.daySlots = await requestJson(`/api/appointments/day?${params}`);
    } else {
      state.availability = await requestJson(availabilityUrl());
    }
  } catch (error) {
    state.availability = {};
    state.daySlots = [];
    elements.calendarMessage.textContent = error.message;
    if (step === "times") elements.timeList.textContent = error.message;
  } finally {
    state.loading = false;
    if (step === "date") renderCalendar();
    if (step === "times") renderTimes();
  }
}
function renderCalendar() {
  const year = state.month.getFullYear(); const month = state.month.getMonth();
  elements.monthLabel.textContent = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(state.month);
  elements.calendarGrid.replaceChildren();
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  for (let index = 0; index < offset; index += 1) {
    const empty = document.createElement("span"); empty.className = "calendar-empty";
    empty.setAttribute("aria-hidden", "true"); elements.calendarGrid.append(empty);
  }
  const today = saoPauloDateKey(); const totalDays = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  let openDays = 0;
  for (let day = 1; day <= totalDays; day += 1) {
    const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; const slots = state.availability[key] || [];
    const button = document.createElement("button"); button.type = "button";
    button.className = `calendar-day${slots.length ? " has-slots" : ""}`; button.textContent = String(day);
    button.disabled = key < today || !slots.length || state.loading;
    button.setAttribute("aria-label", `${displayDate(key, { weekday: "long", day: "numeric", month: "long" })}${slots.length ? `, ${slots.length} horários livres` : ", sem horários"}`);
    if (key === today) button.classList.add("is-today");
    if (key === state.date) button.classList.add("is-selected");
    if (slots.length) openDays += 1;
    button.addEventListener("click", () => {
      state.date = key; state.time = ""; saveState(); renderCalendar();
      elements.continueTimes.disabled = false;
    });
    elements.calendarGrid.append(button);
  }
  elements.calendarMessage.textContent = openDays ? "Dias com horários livres estão destacados." : "Não há dias disponíveis neste mês.";
  $("#previous-month").disabled = year === new Date().getFullYear() && month === new Date().getMonth();
  const maxMonth = new Date(); maxMonth.setMonth(maxMonth.getMonth() + 11);
  $("#next-month").disabled = year > maxMonth.getFullYear() || (year === maxMonth.getFullYear() && month >= maxMonth.getMonth());
  elements.continueTimes.disabled = !state.date || !(state.availability[state.date] || []).length;
}
function renderTimes() {
  const slots = state.daySlots || [];
  elements.selectedDateLabel.textContent = state.date ? displayDate(state.date) : "Escolha uma data";
  elements.timeList.replaceChildren();
  if (!state.date || !slots.length) {
    const empty = document.createElement("p");
    empty.className = "empty-times";
    empty.textContent = "Não há horários livres para esta data. Volte e escolha outro dia.";
    elements.timeList.append(empty);
    return;
  }
  slots.forEach(({ time, available }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `time-option${available ? "" : " is-unavailable"}`;
    button.textContent = available ? time : `${time} · indisponível`;
    button.disabled = !available;
    if (available) button.addEventListener("click", async () => {
      button.disabled = true;
      button.textContent = "Reservando...";
      try {
        if (state.holdToken) await releaseHold();
        const hold = await requestJson("/api/appointments/hold", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId: state.serviceId, date: state.date, time }),
        });
        state.time = time; state.holdToken = hold.token; state.holdExpiresAt = hold.expiresAt;
        saveState(); go("contact");
      } catch (error) {
        elements.calendarMessage.textContent = error.message;
        await loadAvailability();
      }
    });
    elements.timeList.append(button);
  });
}
async function releaseHold() {
  if (state.holdToken) await fetch(`/api/appointments/hold/${encodeURIComponent(state.holdToken)}`, { method: "DELETE" }).catch(() => {});
  state.holdToken = ""; state.holdExpiresAt = ""; state.time = ""; saveState();
}
function updateSubmit() {
  const name = $("#client-name").value.trim(); const phone = $("#client-whatsapp").value.replace(/\D/g, "");
  elements.submit.disabled = !(state.holdToken && name.length >= 2 && phone.length >= 8 && phone.length <= 15);
}
function showConfirmation(payload) {
  $("#confirmed-name").textContent = payload.clientName.split(/\s+/)[0];
  $("#confirmed-details").textContent = `${payload.serviceName} · ${displayDate(payload.date)} às ${payload.time}`;
  $("#whatsapp-confirmation").href = payload.notificationUrl;
  $("#confirmation").hidden = false;
}
async function init() {
  if (!pages[step] && location.pathname === "/") history.replaceState(null, "", "/booking/services");
  document.body.dataset.step = pages[step] ? step : "services";
  const currentPage = pages[step] || pages.services;
  $("#page-title").textContent = currentPage.title;
  $("#page-description").textContent = currentPage.description;
  document.querySelectorAll("[data-step-link]").forEach((link) => link.classList.toggle("is-current", link.dataset.stepLink === step));
  document.querySelectorAll("[data-booking-step]").forEach((panel) => {
    panel.hidden = panel.dataset.bookingStep !== (step === "times" ? "date" : step);
  });
  if (step !== "services" && !state.serviceId) return go("services");
  if (["times", "contact"].includes(step) && !state.date) return go("date");
  if (step === "contact" && (!state.time || !state.holdToken)) return go("times");
  try { await loadServices(); }
  catch (error) {
    if (step === "services") { elements.serviceList.textContent = error.message; }
    else if (elements.formMessage) elements.formMessage.textContent = error.message;
    return;
  }
  if (step === "services") renderServices();
  if (["date", "times"].includes(step)) {
    state.month = state.date ? new Date(`${state.date}T12:00:00`) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    $("#previous-month").addEventListener("click", () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); loadAvailability(); });
    $("#next-month").addEventListener("click", () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); loadAvailability(); });
    if (step === "date") { renderCalendar(); await loadAvailability(); }
    else { await loadAvailability(); window.setInterval(loadAvailability, 15000); }
  }
  if (step === "contact") {
    const service = selectedService();
    elements.heldMessage.textContent = `${service?.name || "Serviço"} · ${displayDate(state.date)} às ${state.time}. Horário reservado por 10 minutos.`;
    elements.form.addEventListener("input", updateSubmit);
    elements.form.addEventListener("submit", async (event) => {
      event.preventDefault(); if (elements.submit.disabled) return;
      elements.submit.disabled = true; elements.formMessage.textContent = "";
      const clientName = $("#client-name").value.trim(); elements.submit.textContent = "Confirmando...";
      try {
        const result = await requestJson("/api/appointments", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId: state.serviceId, date: state.date, time: state.time, holdToken: state.holdToken, clientName, clientWhatsapp: $("#client-whatsapp").value }),
        });
        showConfirmation({ clientName, serviceName: service.name, date: state.date, time: state.time, notificationUrl: result.notificationUrl });
        await releaseHold();
      } catch (error) {
        elements.formMessage.textContent = error.message;
        if (error.message.includes("expirou") || error.message.includes("reservado")) go("times");
      } finally { elements.submit.innerHTML = 'Confirmar agendamento <span aria-hidden="true">→</span>'; updateSubmit(); }
    });
    updateSubmit();
  }
}

elements.continueDate?.addEventListener("click", () => state.serviceId && go("date"));
elements.continueTimes?.addEventListener("click", () => state.date && go("times"));
$("#new-booking")?.addEventListener("click", async () => { await releaseHold(); sessionStorage.removeItem(STORAGE_KEY); go("services"); });
document.querySelectorAll("[data-step-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.dataset.stepLink;
    if (["date", "times", "contact"].includes(target) && !state.serviceId) { event.preventDefault(); go("services"); }
    else if (["times", "contact"].includes(target) && !state.date) { event.preventDefault(); go("date"); }
    else if (target === "contact" && !state.holdToken) { event.preventDefault(); go("times"); }
  });
});
init();