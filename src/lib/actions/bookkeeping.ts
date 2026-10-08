'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { logAudit, requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BOOK_STATUSES, TDS_STATUSES } from '@/lib/constants'
import { zChoice } from '@/lib/validation'

type Result = { ok: boolean; error?: string }

const monthPatchSchema = z.object({
  tdsStatus: zChoice(TDS_STATUSES).optional(),
  tdsAmount: z.number().min(0).max(1_000_000_000).optional(),
  tdsDate: z.string().trim().max(40).optional(),
  tdsVoucher: z.string().trim().max(80).optional(),
  rentAmount: z.number().min(0).max(1_000_000_000).optional(),
  rentDate: z.string().trim().max(40).optional(),
  rentVoucher: z.string().trim().max(80).optional(),
  income: z.number().min(-1_000_000_000).max(1_000_000_000).optional(),
  expenses: z.number().min(-1_000_000_000).max(1_000_000_000).optional(),
  bookStatus: zChoice(BOOK_STATUSES).optional(),
  bookDate: z.string().trim().max(40).optional(),
  salaryDate: z.string().trim().max(40).optional(),
  remarks: z.string().trim().max(1000).optional(),
})

export async function updateMonthly(month: number, patch: unknown): Promise<Result> {
  const user = await requirePermission('bookkeeping', 'write')
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { ok: false, error: 'Invalid month.' }
  }
  const parsed = monthPatchSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid entry.' }

  await prisma.monthlyRecord.upsert({
    where: { month },
    create: { month, ...parsed.data },
    update: parsed.data,
  })
  await logAudit(user.id, 'UPDATE', 'monthlyRecord', String(month), Object.keys(parsed.data).join(','))
  revalidatePath('/bookkeeping')
  revalidatePath('/dashboard')
  return { ok: true }
}

const salarySchema = z.object({
  staffId: z.string().min(1),
  month: z.number().int().min(1).max(12),
  amount: z.number().min(0).max(10_000_000),
})

export async function setSalary(input: unknown): Promise<Result> {
  const user = await requirePermission('bookkeeping', 'write')
  const parsed = salarySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid salary entry.' }

  const staff = await prisma.staff.findUnique({ where: { id: parsed.data.staffId } })
  if (!staff) return { ok: false, error: 'Staff member not found.' }

  await prisma.salary.upsert({
    where: { staffId_month: { staffId: parsed.data.staffId, month: parsed.data.month } },
    create: parsed.data,
    update: { amount: parsed.data.amount },
  })
  await logAudit(user.id, 'UPDATE', 'salary', parsed.data.staffId, `month ${parsed.data.month}`)
  revalidatePath('/bookkeeping')
  revalidatePath('/dashboard')
  return { ok: true }
}

const staffSchema = z.object({
  name: z.string().trim().min(2).max(120),
  designation: z.string().trim().max(120).default(''),
  pan: z.string().trim().max(30).default(''),
})

export async function addStaff(input: unknown): Promise<Result> {
  const user = await requirePermission('bookkeeping', 'write')
  const parsed = staffSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid staff entry.' }

  const last = await prisma.staff.findFirst({ orderBy: { sort: 'desc' } })
  await prisma.staff.create({ data: { ...parsed.data, sort: (last?.sort ?? -1) + 1 } })
  await logAudit(user.id, 'CREATE', 'staff', undefined, parsed.data.name)
  revalidatePath('/bookkeeping')
  return { ok: true }
}

export async function deleteStaff(id: string): Promise<Result> {
  const user = await requirePermission('bookkeeping', 'write')
  const staff = await prisma.staff.findUnique({ where: { id } })
  if (!staff) return { ok: false, error: 'Staff member not found.' }

  await prisma.staff.delete({ where: { id } })
  await logAudit(user.id, 'DELETE', 'staff', id, staff.name)
  revalidatePath('/bookkeeping')
  revalidatePath('/dashboard')
  return { ok: true }
}
