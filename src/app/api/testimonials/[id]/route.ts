import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { prisma } from "@/lib/prisma"
import { testimonialStatusSchema } from "@/lib/schemas/testimonial"

export const dynamic = "force-dynamic"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if ((session.user as unknown as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const parsed = testimonialStatusSchema.safeParse((body as { status?: unknown })?.status)
  if (!parsed.success) {
    return NextResponse.json({ error: "Status inválido (pending|approved|rejected)" }, { status: 422 })
  }
  try {
    const exists = await prisma.testimonial.findUnique({ where: { id } })
    if (!exists) return NextResponse.json({ error: "Depoimento não encontrado" }, { status: 404 })
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: { status: parsed.data },
    })
    return NextResponse.json({ testimonial })
  } catch (e) {
    console.error("Erro ao atualizar depoimento:", e)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if ((session.user as unknown as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }
  const { id } = await params
  try {
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ deleted: true, id })
  } catch {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 })
  }
}
