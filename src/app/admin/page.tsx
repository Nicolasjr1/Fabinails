import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { prisma } from "@/lib/prisma"
import { AdminAppointments } from "@/components/admin-appointments"
import { AdminTestimonials } from "@/components/admin-testimonials"

export const dynamic = "force-dynamic"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/admin/login")
  }

  const appointments = await prisma.appointment.findMany({
    include: { service: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  })

  return (
    <main className="min-h-screen bg-beige-50 text-beige-900 font-body antialiased">
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-12">
        <AdminAppointments
          appointments={appointments.map((a) => ({
            id: a.id,
            clientName: a.clientName,
            clientWhatsapp: a.clientWhatsapp,
            serviceName: a.service.name,
            date: a.date,
            time: a.time,
          }))}
        />
        <div className="rounded-3xl border border-beige-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="font-display text-2xl font-semibold text-maroon-900">Depoimentos — moderação</h2>
          <p className="mt-1 text-sm text-beige-600">Aprove ou rejeite depoimentos pendentes. Só aprovados aparecem na home (até 3).</p>
          <div className="mt-6">
            <AdminTestimonials />
          </div>
        </div>
      </div>
    </main>
  )
}