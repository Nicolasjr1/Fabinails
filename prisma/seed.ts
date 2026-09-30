import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const url = process.env.DATABASE_URL ?? "file:./db/dev.db"
const isPostgres = url.startsWith("postgresql://") || url.startsWith("postgres://")
const adapter = isPostgres
  ? new PrismaPg({ connectionString: url })
  : new PrismaBetterSqlite3({ url })
const prisma = new PrismaClient({ adapter })

const FIXED_SERVICES = [
  { name: "Alongamento", price: 150, duration: 2 },
  { name: "Manutenção", price: 100, duration: 2 },
  { name: "Banho de Gel", price: 100, duration: 2 },
]

async function main() {
  for (const s of FIXED_SERVICES) {
    await prisma.service.upsert({
      where: { name: s.name },
      update: { price: s.price, duration: s.duration },
      create: s,
    })
  }
  console.log("Seed OK: serviços garantidos")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
