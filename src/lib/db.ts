import { PrismaClient } from '@prisma/client'
import { ensureDemoReady } from './demo'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Demo hosting (Vercel without a managed DB): ensure the throwaway SQLite
// file exists, has tables, and is seeded before the first query runs.
// No-op unless DEMO_MODE=true.
if (process.env.DEMO_MODE === 'true') {
  await ensureDemoReady()
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
