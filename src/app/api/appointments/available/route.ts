import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatDateKey, getCurrentMinutesInSaoPaulo, getFreeSlots } from "@/lib/booking"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const month = url.searchParams.get("month")

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: "Parâmetro month obrigatório no formato YYYY-MM" },
      { status: 400 }
    )
  }

  const [year, monthNum] = month.split("-").map(Number)
  if (monthNum < 1 || monthNum > 12) {
    return NextResponse.json({ error: "Mês inválido" }, { status: 400 })
  }

  const firstDay = new Date(year, monthNum - 1, 1)
  const lastDay = new Date(year, monthNum, 0)
  const startKey = formatDateKey(firstDay)
  const endKey = formatDateKey(lastDay)

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startKey,
          lte: endKey,
        },
      },
      select: { date: true, time: true },
    })

    const todayKey = formatDateKey(new Date())
    const nowMinutes = getCurrentMinutesInSaoPaulo()
    const result: Record<string, string[]> = {}
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const dateKey = formatDateKey(new Date(year, monthNum - 1, day))
      if (dateKey < todayKey) continue
      let slots = getFreeSlots(dateKey, appointments)
      // Filtra horários passados no dia de hoje
      if (dateKey === todayKey) {
        slots = slots.filter((t) => {
          const [h, m] = t.split(":").map(Number)
          return h * 60 + m > nowMinutes
        })
      }
      if (slots.length > 0) {
        result[dateKey] = slots
      }
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch (error) {
    console.error("Erro ao calcular disponibilidade:", error)
    return NextResponse.json(
      { error: "Erro interno ao calcular disponibilidade" },
      { status: 500 }
    )
  }
}
