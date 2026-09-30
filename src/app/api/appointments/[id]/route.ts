import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth/auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const { id } = await params

  try {
    const deleted = await prisma.appointment.delete({ where: { id } })
    return NextResponse.json({ deleted: true, id: deleted.id })
  } catch {
    return NextResponse.json(
      { error: "Agendamento não encontrado ou já cancelado" },
      { status: 404 }
    )
  }
}
