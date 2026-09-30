import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { prisma } from "@/lib/prisma"
import { appointmentFormSchema } from "@/lib/schemas/appointment"
import { ensureFixedServices } from "@/lib/services"
import {
  formatDateKey,
  getBusinessSlots,
  getCurrentMinutesInSaoPaulo,
  isFreeSlot,
  notificationMessage,
  waMeLink,
} from "@/lib/booking"

export const dynamic = "force-dynamic"

const FABI_WHATSAPP = process.env.FABI_WHATSAPP ?? "5543996524776"

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const url = new URL(request.url)
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20))
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")

  const where: Record<string, unknown> = {}
  if (from || to) {
    const dateFilter: Record<string, string> = {}
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) dateFilter.gte = from
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) dateFilter.lte = to
    if (Object.keys(dateFilter).length > 0) where.date = dateFilter
  }

  try {
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: { service: true },
        orderBy: [{ date: "asc" }, { time: "asc" }, { createdAt: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.appointment.count({ where }),
    ])
    return NextResponse.json({ appointments, total, page, pageSize })
  } catch (error) {
    console.error("Erro ao listar agendamentos:", error)
    return NextResponse.json(
      { error: "Erro interno ao listar agendamentos" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const parsed = appointmentFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { clientName, clientWhatsapp, serviceId, date, time } = parsed.data

  // Zod já garante YYYY-MM-DD, não precisa fallback
  const dateKey = date
  const todayKey = formatDateKey(new Date())
  if (dateKey < todayKey) {
    return NextResponse.json(
      { error: "Não é possível agendar em uma data passada" },
      { status: 422 }
    )
  }
  // Bloqueia horário passado no mesmo dia (America/Sao_Paulo)
  if (dateKey === todayKey) {
    const nowMinutes = getCurrentMinutesInSaoPaulo()
    const slotMinutes = parseInt(time.split(":")[0], 10) * 60 + parseInt(time.split(":")[1], 10)
    if (slotMinutes <= nowMinutes) {
      return NextResponse.json(
        { error: "Este horário já passou. Escolha outro." },
        { status: 422 }
      )
    }
  }

  // Valida que time pertence aos slots do dia
  if (!getBusinessSlots(dateKey).includes(time)) {
    return NextResponse.json(
      { error: `Horário inválido. Horários disponíveis: ${getBusinessSlots(dateKey).join(", ") || "nenhum neste dia"}` },
      { status: 422 }
    )
  }

  try {
    await ensureFixedServices()

    const service = await prisma.service.findUnique({ where: { id: serviceId } })
    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 })
    }

    const conflicting = await prisma.appointment.findMany({
      where: { date: dateKey },
      select: { date: true, time: true },
    })

    if (!isFreeSlot(dateKey, time, conflicting)) {
      return NextResponse.json(
        { error: "Este horário acabou de ser ocupado. Escolha outro." },
        { status: 409 }
      )
    }

    let appointment
    try {
      appointment = await prisma.appointment.create({
        data: {
          clientName: clientName.trim(),
          clientWhatsapp: clientWhatsapp.trim(),
          serviceId: service.id,
          date: dateKey,
          time,
        },
        include: { service: true },
      })
    } catch (createError: unknown) {
      // Unique constraint violation (race condition)
      const msg = createError instanceof Error ? createError.message : ""
      if (msg.includes("Unique constraint") || msg.includes("UNIQUE constraint") || (createError as { code?: string })?.code === "P2002") {
        return NextResponse.json(
          { error: "Este horário acabou de ser ocupado. Escolha outro." },
          { status: 409 }
        )
      }
      throw createError
    }

    const notificationUrl = waMeLink(
      FABI_WHATSAPP,
      notificationMessage({
        clientName: appointment.clientName,
        clientWhatsapp: appointment.clientWhatsapp,
        serviceName: appointment.service.name,
        date: appointment.date,
        time: appointment.time,
      })
    )

    return NextResponse.json(
      { appointment, notificationUrl },
      { status: 201 }
    )
  } catch (error) {
    console.error("Erro ao criar agendamento:", error)
    return NextResponse.json(
      { error: "Erro interno ao criar agendamento" },
      { status: 500 }
    )
  }
}
