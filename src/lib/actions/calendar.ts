'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { logAudit, requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/db'

type Result = { ok: boolean; error?: string }

const cellSchema = z.object({
  text: z.string().trim().max(600),
  kind: z.string().trim().max(20),
})

export async function updateCalendarCell(
  activityId: string,
  month: number,
  patch: unknown,
): Promise<Result> {
  const user = await requirePermission('calendar', 'write')
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { ok: false, error: 'Invalid month.' }
  }
  const parsed = cellSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid calendar entry.' }

  const activity = await prisma.calendarActivity.findUnique({ where: { id: activityId } })
  if (!activity) return { ok: false, error: 'Activity not found.' }

  const existing = await prisma.calendarCell.findUnique({
    where: { activityId_month: { activityId, month } },
  })

  if (!parsed.data.text) {
    if (existing) await prisma.calendarCell.delete({ where: { id: existing.id } })
  } else if (existing) {
    await prisma.calendarCell.update({ where: { id: existing.id }, data: parsed.data })
  } else {
    await prisma.calendarCell.create({ data: { activityId, month, ...parsed.data } })
  }

  await logAudit(
    user.id,
    existing ? 'UPDATE' : 'CREATE',
    'calendarCell',
    activityId,
    `month ${month}`,
  )
  revalidatePath('/calendar')
  revalidatePath('/dashboard')
  return { ok: true }
}
