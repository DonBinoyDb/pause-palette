import 'dotenv/config'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@example.com'
  const password = await bcrypt.hash('admin123', 10)
  
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    console.log('Admin user already exists:', existingUser)
  } else {
    const admin = await prisma.user.create({
      data: {
        name: 'Admin User',
        email,
        password,
        role: 'admin',
      },
    })
    console.log('Admin user created successfully:', admin)
  }
}

main().finally(() => {
  prisma.$disconnect()
  pool.end()
})
