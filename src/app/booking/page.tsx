import { prisma } from "@/lib/prisma"
import { ensureFixedServices } from "@/lib/services"
import { BookingForm } from "@/components/booking-form"

export const dynamic = "force-dynamic"

export default async function BookingPage() {
  await ensureFixedServices()
  const services = await prisma.service.findMany({
    orderBy: { price: "desc" },
  })

  return (
    <main className="min-h-screen bg-beige-50 text-beige-900 font-body antialiased">
      <div className="mx-auto max-w-5xl px-4 py-14 md:py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
            Agendamento online
          </p>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">
            Escolha o melhor dia e horário
          </h1>
          <p className="mx-auto mt-4 max-w-md text-beige-600">
            Selecione o serviço, um dia no calendário e um horário livre.
            Cada atendimento tem 2h de duração.
          </p>
        </div>

        <BookingForm
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            duration: s.duration,
          }))}
        />
      </div>
    </main>
  )
}
