import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { prisma } from "@/lib/prisma"
import { testimonialFormSchema } from "@/lib/schemas/testimonial"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const parsed = testimonialFormSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 422 })
  }
  const { name, text, rating } = parsed.data
  try {
    const testimonial = await prisma.testimonial.create({
      data: {
        name: name.trim(),
        text: text.trim(),
        rating,
        status: "pending",
      },
    })
    return NextResponse.json({ testimonial }, { status: 201 })
  } catch (e) {
    console.error("Erro ao criar depoimento:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const statusParam = url.searchParams.get("status")
  const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1)
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get("pageSize") ?? "20", 10) || 20))

  // Se houver filtro de status, exige admin (para ver pendentes)
  if (statusParam) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    // verifica role admin via token - session.user.role
    if ((session.user as unknown as { role?: string })?.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }
    if (!["pending", "approved", "rejected"].includes(statusParam)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }
    try {
      const [testimonials, total] = await Promise.all([
        prisma.testimonial.findMany({
          where: { status: statusParam as "pending" | "approved" | "rejected" },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.testimonial.count({ where: { status: statusParam as "pending" | "approved" | "rejected" } }),
      ])
      return NextResponse.json({ testimonials, total, page, pageSize })
    } catch (e) {
      console.error("Erro ao listar depoimentos admin:", e)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }
  }

  // Público: só approved, 3 mais recentes
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 3,
    })
    return NextResponse.json({ testimonials })
  } catch (e) {
    console.error("Erro ao listar depoimentos:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
