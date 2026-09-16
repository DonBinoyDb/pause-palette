import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const users = await prisma.user.findMany()
  console.log('Users in DB:', JSON.stringify(users, null, 2))
}

main().finally(() => prisma.$disconnect())
