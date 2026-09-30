"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  Calendar,
  Crown,
  LogOut,
  MessageCircle,
  Trash2,
} from "lucide-react"

interface AdminAppointment {
  id: string
  clientName: string
  clientWhatsapp: string
  serviceName: string
  date: string
  time: string
}

function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "")
  if (digits.startsWith("0")) return `55${digits.slice(1)}`
  return digits
}

function formatDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

export function AdminAppointments({
  appointments: initial,
}: {
  appointments: AdminAppointment[]
}) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initial)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function handleCancel(id: string, clientName: string) {
    if (!window.confirm(`Cancelar o agendamento de ${clientName}?`)) return
    setCancellingId(id)
    setError("")
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? "Falha ao cancelar")
      }
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao cancelar")
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-maroon-900 text-rose-200">
            <Crown className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold text-maroon-900 md:text-3xl">
              Minha agenda
            </h1>
            <p className="text-sm text-beige-500">
              {appointments.length}{" "}
              {appointments.length === 1 ? "agendamento" : "agendamentos"} marcados
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="inline-flex items-center gap-2 rounded-full border border-beige-300 px-5 py-2.5 text-sm font-semibold text-beige-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-300 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </header>

      {error && (
        <p className="mb-4 rounded-xl bg-rose-100 px-4 py-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {appointments.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-beige-300 bg-white p-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-beige-100 text-beige-400">
            <Calendar className="h-7 w-7" />
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold text-maroon-900">
            Nenhum agendamento ainda
          </h2>
          <p className="mt-2 text-sm text-beige-500">
            Quando um cliente agendar pelo site, ele aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-beige-200 bg-white p-5 shadow-sm shadow-beige-300/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-maroon-900/10"
            >
              <div className="min-w-0">
                <p className="font-semibold text-maroon-900">{apt.clientName}</p>
                <p className="text-sm text-beige-500">{apt.serviceName}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-beige-600">
                  <span className="font-medium text-rose-600">
                    {formatDate(apt.date)}
                  </span>
                  <span className="font-medium">às {apt.time}</span>
                  <span className="text-beige-400">{apt.clientWhatsapp}</span>
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={`https://wa.me/${normalizePhone(
                    apt.clientWhatsapp
                  )}?text=${encodeURIComponent(
                    `Olá, ${apt.clientName}! Aqui é a Fabi Nails 💅 Confirmo seu agendamento de ${apt.serviceName} para ${formatDate(
                      apt.date
                    )} às ${apt.time}. Qualquer coisa, me chama!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-rose-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-rose-600"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
                <button
                  onClick={() => handleCancel(apt.id, apt.clientName)}
                  disabled={cancellingId === apt.id}
                  className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2.5 text-xs font-semibold text-rose-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-400 hover:bg-rose-50 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {cancellingId === apt.id ? "Cancelando..." : "Cancelar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}