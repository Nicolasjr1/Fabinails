"use client"

import { useEffect, useState } from "react"
import { Star, Check, X, Clock } from "lucide-react"

interface Testimonial {
  id: string
  name: string
  text: string
  rating: number
  status: string
  createdAt: string
}

export function AdminTestimonials() {
  const [pending, setPending] = useState<Testimonial[]>([])
  const [approved, setApproved] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)

  async function fetchAll() {
    setLoading(true)
    try {
      const [resPending, resApproved] = await Promise.all([
        fetch("/api/testimonials?status=pending&pageSize=20", { cache: "no-store" }),
        fetch("/api/testimonials?status=approved&pageSize=20", { cache: "no-store" }),
      ])
      if (resPending.ok) {
        const d = await resPending.json()
        setPending(d.testimonials ?? [])
      }
      if (resApproved.ok) {
        const d = await resApproved.json()
        setApproved(d.testimonials ?? [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  async function updateStatus(id: string, status: "approved" | "rejected" | "pending") {
    setActionId(id)
    try {
      const res = await fetch(`/api/testimonials/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) await fetchAll()
    } catch {}
    setActionId(null)
  }

  if (loading) return <p className="py-6 text-center text-maroon-600">Carregando depoimentos...</p>

  return (
    <div className="space-y-8">
      <div>
        <h2 className="flex items-center gap-2 font-serif text-2xl font-light text-maroon-900">
          <Clock className="h-5 w-5 text-rose-600" />
          Pendentes ({pending.length})
        </h2>
        <p className="mt-1 text-sm text-maroon-700">Aprove ou rejeite. Só aprovados aparecem na home (até 3).</p>

        {pending.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-beige-200 bg-white p-6 text-center text-sm text-maroon-600">Nenhum depoimento pendente.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {pending.map((t) => (
              <div key={t.id} className="rounded-2xl border border-beige-200 bg-white p-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className={`h-4 w-4 ${i <= t.rating ? "fill-[#d4a373] text-[#d4a373]" : "text-maroon-200"}`} />
                  ))}
                  <span className="ml-2 text-xs text-maroon-600">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</span>
                </div>
                <p className="mt-3 font-medium text-maroon-900">{t.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-maroon-800">“{t.text}”</p>
                <div className="mt-4 flex gap-2">
                  <button
                    disabled={actionId === t.id}
                    onClick={() => updateStatus(t.id, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#1a1716] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a1716]/90 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" /> Aprovar
                  </button>
                  <button
                    disabled={actionId === t.id}
                    onClick={() => updateStatus(t.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-beige-300 bg-white px-4 py-2 text-xs font-semibold text-maroon-700 hover:bg-beige-50 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-serif text-xl text-maroon-900">Aprovados ({approved.length})</h3>
        {approved.length === 0 ? (
          <p className="mt-3 text-sm text-maroon-600">Nenhum aprovado ainda. Seção da home ficará oculta até aprovar.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {approved.map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-xl border border-beige-200 bg-beige-50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-maroon-900">{t.name} · {t.rating}★</p>
                  <p className="text-xs text-maroon-600 line-clamp-1">“{t.text}”</p>
                </div>
                <button
                  onClick={() => updateStatus(t.id, "rejected")}
                  className="text-xs text-maroon-600 hover:text-rose-600"
                >
                  Rejeitar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
