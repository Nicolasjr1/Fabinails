"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react"

export interface BookingService {
  id: string
  name: string
  price: number
  duration: number
}

interface AvailabilityMap {
  [date: string]: string[]
}

const STEPS = ["Serviço", "Dia", "Horário", "Dados"] as const

function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

function formatDisplayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  })
}

export function BookingForm({ services }: { services: BookingService[] }) {
  const [step, setStep] = useState(0)
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "")
  const [month, setMonth] = useState<Date>(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [availability, setAvailability] = useState<AvailabilityMap>({})
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientName, setClientName] = useState("")
  const [clientWhatsapp, setClientWhatsapp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ notificationUrl: string } | null>(null)
  const [error, setError] = useState("")

  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null
  const slots = selectedKey ? (availability[selectedKey] ?? []) : []

  const fetchAvailability = useCallback(async (targetMonth: Date) => {
    setLoadingSlots(true)
    try {
      const res = await fetch(
        `/api/appointments/available?month=${formatMonthKey(targetMonth)}`
      )
      if (!res.ok) throw new Error("Falha ao carregar disponibilidade")
      const data: AvailabilityMap = await res.json()
      setAvailability(data)
      setSelectedDate((prev) => {
        if (!prev) return prev
        const key = formatDateKey(prev)
        if (!(key in data) || data[key].length === 0) {
          setSelectedTime(null)
          return undefined
        }
        return prev
      })
    } catch {
      setError("Não foi possível carregar os horários. Recarregue a página.")
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    fetchAvailability(month)
  }, [month, fetchAvailability])

  const isDayDisabled = useCallback(
    (day: Date) => {
      const key = formatDateKey(day)
      if (!(key in availability)) return true
      if (day.getDay() === 0) return true
      const todayKey = formatDateKey(new Date())
      return key < todayKey
    },
    [availability]
  )

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  )

  const selectedSummary = useMemo(() => {
    if (!selectedKey || !selectedTime) return null
    return {
      date: formatDisplayDate(selectedKey),
      time: selectedTime,
      serviceName: selectedService?.name ?? "",
      price: selectedService?.price ?? 0,
    }
  }, [selectedKey, selectedTime, selectedService])

  const canSubmit =
    !!serviceId &&
    !!selectedKey &&
    !!selectedTime &&
    clientName.trim().length >= 2 &&
    /^\+?[0-9]{8,15}$/.test(clientWhatsapp.trim()) &&
    !submitting

  function goBack() {
    if (step > 0) setStep(step - 1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || !selectedKey || !selectedTime) return

    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          date: selectedKey,
          time: selectedTime,
          clientName: clientName.trim(),
          clientWhatsapp: clientWhatsapp.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Não foi possível concluir o agendamento")
        return
      }

      setResult({ notificationUrl: data.notificationUrl })
      window.open(data.notificationUrl, "_blank")
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-beige-200 bg-white p-8 text-center shadow-xl shadow-maroon-900/10 md:p-12">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
          <Check className="h-8 w-8" />
        </span>
        <h2 className="mt-6 font-display text-3xl font-semibold text-maroon-900">
          Agendamento confirmado!
        </h2>
        <p className="mt-3 text-beige-600">
          Seu horário foi salvo. Para garantir o aviso, notifique a Fabi no
          WhatsApp:
        </p>

        <a
          href={result.notificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-600"
        >
          <MessageCircle className="h-4 w-4" />
          Notificar a Fabi no WhatsApp
        </a>
        <p className="mt-4 text-xs text-beige-500">
          Se a janela não abriu automaticamente, toque no botão acima.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-beige-500 underline-offset-4 transition-colors hover:text-rose-600 hover:underline"
        >
          Voltar para a página inicial
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Top bar: voltar + cancelar */}
      <div className="mb-6 flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-beige-300 bg-white px-4 py-2 text-sm font-semibold text-beige-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                    i === step
                      ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                      : i < step
                        ? "bg-maroon-900 text-beige-50"
                        : "bg-beige-200 text-beige-500"
                  }`}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="mt-1 hidden text-[10px] font-medium text-beige-500 sm:block">
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span
                  className={`mb-4 hidden h-px w-6 sm:block ${
                    i < step ? "bg-maroon-900" : "bg-beige-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-beige-500 transition-colors hover:text-rose-600"
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Cancelar</span>
        </Link>
      </div>

      <div className="rounded-3xl border border-beige-200 bg-white p-6 shadow-sm shadow-beige-300/30 md:p-8">
        {/* Step 1: serviço */}
        {step === 0 && (
          <div>
            <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-maroon-900">
              <Sparkles className="h-5 w-5 text-rose-500" />
              Qual serviço você deseja?
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setServiceId(service.id)
                    setStep(1)
                  }}
                  className={`group rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                    serviceId === service.id
                      ? "border-rose-400 bg-rose-50 shadow-lg shadow-rose-500/10 ring-2 ring-rose-300"
                      : "border-beige-200 bg-white hover:border-rose-300 hover:shadow-lg"
                  }`}
                >
                  <h3 className="font-display text-lg font-semibold text-maroon-900">
                    {service.name}
                  </h3>
                  <p className="mt-2 font-display text-2xl font-bold text-rose-500">
                    R$ {service.price}
                    <span className="text-sm font-normal text-beige-400">,00</span>
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-beige-500">
                    <Clock className="h-3.5 w-3.5" />
                    {service.duration}h de atendimento
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: dia */}
        {step === 1 && (
          <div>
            <h2 className="mb-2 flex items-center gap-2 font-display text-2xl font-semibold text-maroon-900">
              <Calendar className="h-5 w-5 text-rose-500" />
              Escolha o dia
            </h2>
            <p className="mb-6 text-sm text-beige-500">
              Dias cinza não possuem horários livres. Os atendimentos acontecem
              de segunda a sábado.
            </p>

            <div className="flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(day) => {
                  setSelectedDate(day)
                  if (day) {
                    setSelectedTime(null)
                    setStep(2)
                  }
                }}
                disabled={isDayDisabled}
                month={month}
                onMonthChange={setMonth}
                required
                showOutsideDays={false}
              />
            </div>
          </div>
        )}

        {/* Step 3: horário */}
        {step === 2 && (
          <div>
            <h2 className="mb-2 flex items-center gap-2 font-display text-2xl font-semibold text-maroon-900">
              <Clock className="h-5 w-5 text-rose-500" />
              Horários livres
            </h2>
            {selectedKey && (
              <p className="mb-6 text-sm text-beige-500">
                Para <span className="font-medium text-maroon-900">{formatDisplayDate(selectedKey)}</span>{" "}
                ({selectedService?.name}). Cada horário tem 2h de duração.
              </p>
            )}

            {loadingSlots ? (
              <p className="py-8 text-center text-beige-500">Carregando horários...</p>
            ) : !selectedDate ? (
              <p className="py-8 text-center text-beige-500">
                Nenhum dia selecionado. Use "Voltar" e escolha um dia.
              </p>
            ) : slots.length === 0 ? (
              <p className="py-8 text-center text-beige-500">
                Este dia não possui horários livres. Use "Voltar" e escolha outro dia.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {slots.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      setSelectedTime(time)
                      setStep(3)
                    }}
                    className={`rounded-xl px-3 py-3.5 text-sm font-semibold transition-all duration-200 ${
                      selectedTime === time
                        ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                        : "bg-beige-100 text-beige-800 hover:bg-rose-100 hover:text-rose-600"
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: dados */}
        {step === 3 && (
          <div>
            <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-semibold text-maroon-900">
              <Sparkles className="h-5 w-5 text-rose-500" />
              Seus dados
            </h2>

            {selectedSummary && (
              <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-sm">
                <p className="font-semibold text-maroon-900">Resumo do agendamento</p>
                <p className="mt-1 text-beige-700">
                  {selectedSummary.serviceName} · R$ {selectedSummary.price},00
                </p>
                <p className="text-beige-700">
                  {selectedSummary.date} às {selectedSummary.time}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-beige-700">
                  Nome completo
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-beige-200 bg-beige-50 px-4 py-3 text-beige-900 placeholder-beige-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-beige-700">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  inputMode="tel"
                  value={clientWhatsapp}
                  onChange={(e) => setClientWhatsapp(e.target.value)}
                  placeholder="+55 43 99652-4776"
                  pattern="\+?[0-9]{8,15}"
                  title="Digite um número de WhatsApp válido, ex.: 5543996524776"
                  className="w-full rounded-xl border border-beige-200 bg-beige-50 px-4 py-3 text-beige-900 placeholder-beige-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  required
                />
              </div>

              {error && (
                <p className="rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full rounded-full bg-maroon-900 px-7 py-3.5 text-sm font-semibold text-beige-50 shadow-xl shadow-maroon-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-maroon-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
              >
                {submitting ? "Agendando..." : "Confirmar agendamento"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Barra inferior de navegação */}
      <div className="mt-4 flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-beige-300 bg-white px-5 py-2.5 text-sm font-semibold text-beige-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        ) : (
          <span />
        )}
        <p className="text-xs text-beige-400">
          Etapa {step + 1} de {STEPS.length}
        </p>
      </div>
    </div>
  )
}
