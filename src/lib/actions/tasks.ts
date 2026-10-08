'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { logAudit, requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { BS_MONTHS, PRIORITIES, TASK_STATUSES } from '@/lib/constants'
import { zChoice } from '@/lib/validation'

type Result = { ok: boolean; error?: string }

const taskPatchSchema = z.object({
  area: z.string().trim().min(1).max(80).optional(),
  title: z.string().trim().min(1).max(300).optional(),
  frequency: z.string().trim().max(80).optional(),
  window: z.string().trim().max(120).optional(),
  fromMo: z.number().int().min(1).max(12).optional(),
  toMo: z.number().int().min(1).max(12).optional(),
  priority: zChoice(PRIORITIES).optional(),
  responsible: z.string().trim().max(120).optional(),
  status: zChoice(TASK_STATUSES).optional(),
  dateStarted: z.string().trim().max(40).optional(),
  dateSubmitted: z.string().trim().max(40).optional(),
  dateCompleted: z.string().trim().max(40).optional(),
  nextFollowup: z.string().trim().max(40).optional(),
  submitTo: z.string().trim().max(200).optional(),
  documents: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(2000).optional(),
  dropbox: z.string().trim().max(500).optional(),
  guideSlug: z.string().trim().max(60).nullable().optional(),
})

export async function updateTask(code: string, patch: unknown): Promise<Result> {
  const user = await requirePermission('tasks', 'write')
  const parsed = taskPatchSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid task update.' }

  const existing = await prisma.task.findUnique({ where: { code } })
  if (!existing) return { ok: false, error: 'Task not found.' }

  const data = parsed.data
  await prisma.task.update({ where: { code }, data })
  await logAudit(
    user.id,
    'UPDATE',
    'task',
    code,
    Object.keys(data).join(','),
  )
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { ok: true }
}

const newTaskSchema = taskPatchSchema.extend({
  code: z
    .string()
    .trim()
    .regex(/^T\d{2,3}$/, 'Use a code like T14'),
  title: z.string().trim().min(3).max(300),
  area: z.string().trim().min(2).max(80),
  status: zChoice(TASK_STATUSES),
  priority: zChoice(PRIORITIES),
  fromMo: z.number().int().min(1).max(12),
  toMo: z.number().int().min(1).max(12),
})

export async function createTask(input: unknown): Promise<Result> {
  const user = await requirePermission('tasks', 'write')
  const parsed = newTaskSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid task.' }

  const exists = await prisma.task.findUnique({ where: { code: parsed.data.code } })
  if (exists) return { ok: false, error: 'A task with that code already exists.' }

  const d = parsed.data
  await prisma.task.create({
    data: {
      code: d.code,
      title: d.title,
      area: d.area,
      status: d.status,
      priority: d.priority,
      fromMo: d.fromMo,
      toMo: d.toMo,
      frequency: d.frequency ?? 'Annual',
      window:
        d.window ?? `${BS_MONTHS[d.fromMo - 1].name} – ${BS_MONTHS[d.toMo - 1].name}`,
      responsible: d.responsible ?? '',
      dateStarted: d.dateStarted ?? '',
      dateSubmitted: d.dateSubmitted ?? '',
      dateCompleted: d.dateCompleted ?? '',
      nextFollowup: d.nextFollowup ?? '',
      submitTo: d.submitTo ?? '',
      documents: d.documents ?? '',
      notes: d.notes ?? '',
      dropbox: d.dropbox ?? '',
      guideSlug: d.guideSlug ?? null,
    },
  })
  await logAudit(user.id, 'CREATE', 'task', parsed.data.code, parsed.data.title)
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function deleteTask(code: string): Promise<Result> {
  const user = await requirePermission('tasks', 'write')
  const existing = await prisma.task.findUnique({ where: { code } })
  if (!existing) return { ok: false, error: 'Task not found.' }

  await prisma.task.delete({ where: { code } })
  await logAudit(user.id, 'DELETE', 'task', code, existing.title)
  revalidatePath('/tasks')
  revalidatePath('/dashboard')
  return { ok: true }
}
