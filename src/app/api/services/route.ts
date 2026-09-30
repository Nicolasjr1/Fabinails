import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureFixedServices } from "@/lib/services"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await ensureFixedServices()
    const services = await prisma.service.findMany({
      orderBy: { price: "desc" },
    })
    return NextResponse.json(services, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    })
  } catch (error) {
    console.error("Erro ao listar serviços:", error)
    return NextResponse.json(
      { error: "Erro interno ao listar serviços" },
      { status: 500 }
    )
  }
}
