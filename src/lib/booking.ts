export const TIMEZONE = "America/Sao_Paulo"

const APPOINTMENT_DURATION_MINUTES = 120

// Horários FIXOS conforme solicitado — não é intervalo livre de 2h
const WEEKDAY_SLOTS = ["08:00", "10:30", "13:00", "15:00", "17:30", "18:30"]
const SATURDAY_SLOTS = ["08:00", "10:30", "13:00"]
const SUNDAY_SLOTS: string[] = []

export interface AppointmentLike {
  date: string
  time: string
}

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export function formatDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function getCurrentMinutesInSaoPaulo(date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0")
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? "0")
  return h * 60 + m
}

export function getTodayKey(): string {
  return formatDateKey(new Date())
}

function getWeekday(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number)
  // dateKey representa data no calendário America/Sao_Paulo.
  // Weekday do calendário é determinístico; usar UTC evita variação do timezone do servidor.
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function getBusinessSlots(dateKey: string): string[] {
  const weekday = getWeekday(dateKey)
  if (weekday === 0) return SUNDAY_SLOTS
  if (weekday === 6) return SATURDAY_SLOTS
  return WEEKDAY_SLOTS
}

export function getFreeSlots(
  dateKey: string,
  appointments: AppointmentLike[]
): string[] {
  const slots = getBusinessSlots(dateKey)
  // Regra: horário só disponível se exato dia+horário não existir no banco
  const occupiedSet = new Set(
    appointments.filter((a) => a.date === dateKey).map((a) => a.time)
  )
  return slots.filter((slot) => !occupiedSet.has(slot))
}

export function isFreeSlot(
  dateKey: string,
  time: string,
  appointments: AppointmentLike[]
): boolean {
  return getFreeSlots(dateKey, appointments).includes(time)
}

export function normalizeWhatsapp(input: string): string {
  return input.replace(/\D/g, "")
}

export function waMeLink(phone: string, message: string): string {
  return `https://wa.me/${normalizeWhatsapp(phone)}?text=${encodeURIComponent(message)}`
}

export function notificationMessage(input: {
  clientName: string
  clientWhatsapp: string
  serviceName: string
  date: string
  time: string
}): string {
  const [y, m, d] = input.date.split("-").map(Number)
  // Usar meio-dia UTC para evitar shift de dia ao formatar em Sao Paulo
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const formattedDate = dateObj.toLocaleDateString("pt-BR", {
    timeZone: TIMEZONE,
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
  return [
    `💅 Novo agendamento no site!`,
    ``,
    `Cliente: ${input.clientName}`,
    `WhatsApp do cliente: ${input.clientWhatsapp}`,
    `Serviço: ${input.serviceName}`,
    `Data: ${formattedDate}`,
    `Horário: ${input.time}`,
    ``,
    `Agendamento salvo automaticamente no site.`,
  ].join("\n")
}
