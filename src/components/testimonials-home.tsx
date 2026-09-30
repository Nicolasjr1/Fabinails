"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Star } from "lucide-react"
import { testimonialFormSchema, type TestimonialFormValues } from "@/lib/schemas/testimonial"

interface Testimonial {
  id: string
  name: string
  text: string
  rating: number
  createdAt: string
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-[#d4a373] text-[#d4a373]" : "fill-transparent text-maroon-200"}`}
        />
      ))}
    </div>
  )
}

export function TestimonialsHome() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<TestimonialFormValues>({
    resolver: zodResolver(testimonialFormSchema),
    defaultValues: { name: "", text: "", rating: 5 },
  })
  const rating = watch("rating")

  async function fetchTestimonials() {
    try {
      const res = await fetch("/api/testimonials", { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        setTestimonials(data.testimonials ?? [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchTestimonials()
  }, [])

  async function onSubmit(data: TestimonialFormValues) {
    setError("")
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? "Não foi possível enviar")
        return
      }
      setSent(true)
      reset()
      setTimeout(() => setSent(false), 4000)
    } catch {
      setError("Erro de conexão")
    }
  }

  // Enquanto não houver 3 aprovados, mostra menos cards; se 0, oculta lista mas mantém form
  const hasTestimonials = testimonials.length > 0

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-16 lg:px-12 lg:py-24">
      {/* Lista - só mostra se houver aprovados */}
      {hasTestimonials && !loading && (
        <div className="mb-12">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">Depoimentos</p>
              <h2 className="font-serif text-4xl font-light tracking-[-0.04em] text-maroon-900 md:text-5xl">
                Quem já <span className="italic text-rose-600">transformou as unhas</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm font-light leading-relaxed text-maroon-700">
              Experiências reais de clientes — publicamos apenas depoimentos aprovados.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4 lg:gap-6">
            {/* Primeiro card destaque 8 cols, restante 4 cols em grid */}
            {testimonials.slice(0, 3).map((t, idx) => {
              const isFirst = idx === 0 && testimonials.length >= 2
              return (
                <div
                  key={t.id}
                  className={`${isFirst ? "col-span-12 lg:col-span-8" : "col-span-12 lg:col-span-4"} flex flex-col justify-between rounded-[24px] border bg-white p-8 lg:p-10 ${isFirst ? "border-beige-200" : "border-beige-200 bg-[#fbf9f6]"}`}
                >
                  <div>
                    <Stars rating={t.rating} />
                    <p className="mt-4 font-serif text-xl font-light leading-snug tracking-[-0.02em] text-maroon-900">“{t.text}”</p>
                  </div>
                  <div className="mt-6 flex items-center gap-3 border-t border-beige-200 pt-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-serif font-bold">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-maroon-900">{t.name}</p>
                      <p className="text-xs text-maroon-600">{new Date(t.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <span className="ml-auto hidden text-[10px] tracking-[0.2em] uppercase text-maroon-400 lg:block">{t.rating}.0 · estrelas</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Título quando não há depoimentos - mantém contexto mas não mostra fake */}
      {!hasTestimonials && !loading && (
        <div className="mb-8 text-center">
          <p className="mb-3 text-[10px] font-semibold tracking-[0.25em] uppercase text-rose-600">Depoimentos</p>
          <h2 className="font-serif text-3xl font-light text-maroon-900">Seja a primeira a deixar seu depoimento</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-maroon-700">Ainda não há depoimentos aprovados. Envie o seu abaixo — aparece após aprovação.</p>
        </div>
      )}

      {/* Formulário público */}
      <div className="mx-auto max-w-2xl rounded-[24px] border border-beige-200 bg-white p-8 lg:p-10">
        <h3 className="font-serif text-2xl font-light text-maroon-900">Deixe seu depoimento</h3>
        <p className="mt-2 text-sm text-maroon-700">Seu depoimento ficará pendente até aprovação da Fabi e depois aparecerá aqui (até 3 mais recentes).</p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-maroon-800">Seu nome *</label>
            <input
              {...register("name")}
              placeholder="Ex: Ana Silva"
              className="w-full rounded-xl border border-beige-300 bg-white px-4 py-3 text-maroon-900 placeholder-maroon-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-maroon-800">Sua experiência *</label>
            <textarea
              {...register("text")}
              rows={4}
              placeholder="Conte como foi seu atendimento, o que mais gostou..."
              className="w-full rounded-xl border border-beige-300 bg-white px-4 py-3 text-maroon-900 placeholder-maroon-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            {errors.text && <p className="mt-1 text-xs text-rose-600">{errors.text.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-maroon-800">Nota *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setValue("rating", n)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${rating >= n ? "bg-[#1a1716] border-[#1a1716] text-white" : "bg-white border-beige-300 text-maroon-400 hover:border-rose-300"}`}
                  aria-label={`${n} estrelas`}
                >
                  <Star className={`h-4 w-4 ${rating >= n ? "fill-white" : "fill-transparent"}`} />
                </button>
              ))}
            </div>
            {errors.rating && <p className="mt-1 text-xs text-rose-600">{errors.rating.message}</p>}
          </div>

          {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
          {sent && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">Obrigado! Seu depoimento foi enviado e aguarda aprovação.</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#1a1716] px-7 py-3.5 text-sm font-semibold text-[#fbf9f6] transition-colors hover:bg-[#1a1716]/90 disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Enviar depoimento"}
          </button>
        </form>
      </div>
    </section>
  )
}
