import { prisma } from "@/lib/prisma"

const FIXED_SERVICES = [
  { name: "Alongamento", price: 150, duration: 2 },
  { name: "Manutenção", price: 100, duration: 2 },
  { name: "Banho de Gel", price: 100, duration: 2 },
] as const

export async function ensureFixedServices() {
  for (const service of FIXED_SERVICES) {
    await prisma.service.upsert({
      where: { name: service.name },
      update: { price: service.price, duration: service.duration },
      create: service,
    })
  }
}
