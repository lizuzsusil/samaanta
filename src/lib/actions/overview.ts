'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { logAudit, requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { HANDOVER_STATUSES } from '@/lib/constants'
import { zChoice } from '@/lib/validation'

type Result = { ok: boolean; error?: string }

const handoverSchema = z.object({
  status: zChoice(HANDOVER_STATUSES).optional(),
  owner: z.string().trim().max(120).optional(),
  detail: z.string().trim().max(1000).optional(),
})

export async function updateHandover(id: string, patch: unknown): Promise<Result> {
  const user = await requirePermission('startHere', 'write')
  const parsed = handoverSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid handover entry.' }

  const item = await prisma.handoverItem.findUnique({ where: { id } })
  if (!item) return { ok: false, error: 'Item not found.' }

  await prisma.handoverItem.update({ where: { id }, data: parsed.data })
  await logAudit(user.id, 'UPDATE', 'handover', id, item.item)
  revalidatePath('/start-here')
  return { ok: true }
}

const dropboxSchema = z.object({
  url: z
    .string()
    .trim()
    .max(600)
    .refine((v) => v === '' || /^https:\/\//.test(v), 'Only https links')
    .optional(),
  lastChecked: z.string().trim().max(40).optional(),
  folder: z.string().trim().max(200).optional(),
})

export async function updateDropbox(id: string, patch: unknown): Promise<Result> {
  const user = await requirePermission('startHere', 'write')
  const parsed = dropboxSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid link.' }

  const folder = await prisma.dropboxFolder.findUnique({ where: { id } })
  if (!folder) return { ok: false, error: 'Folder not found.' }

  await prisma.dropboxFolder.update({ where: { id }, data: parsed.data })
  await logAudit(user.id, 'UPDATE', 'dropbox', id, folder.area)
  revalidatePath('/start-here')
  revalidatePath('/tasks')
  return { ok: true }
}

const contactSchema = z.object({
  authority: z.string().trim().min(2).max(200).optional(),
  usedFor: z.string().trim().max(300).optional(),
  office: z.string().trim().max(300).optional(),
  person: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(200).optional(),
  email: z.string().trim().max(300).optional(),
})

export async function updateContact(id: string, patch: unknown): Promise<Result> {
  const user = await requirePermission('startHere', 'write')
  const parsed = contactSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid contact entry.' }

  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact) return { ok: false, error: 'Contact not found.' }

  await prisma.contact.update({ where: { id }, data: parsed.data })
  await logAudit(user.id, 'UPDATE', 'contact', id, contact.authority)
  revalidatePath('/start-here')
  return { ok: true }
}

const newContactSchema = contactSchema.extend({
  authority: z.string().trim().min(2).max(200),
})

export async function addContact(input: unknown): Promise<Result> {
  const user = await requirePermission('startHere', 'write')
  const parsed = newContactSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid contact.' }

  const last = await prisma.contact.findFirst({ orderBy: { sort: 'desc' } })
  await prisma.contact.create({ data: { ...parsed.data, sort: (last?.sort ?? -1) + 1 } })
  await logAudit(user.id, 'CREATE', 'contact', undefined, parsed.data.authority)
  revalidatePath('/start-here')
  return { ok: true }
}

export async function deleteContact(id: string): Promise<Result> {
  const user = await requirePermission('startHere', 'write')
  const contact = await prisma.contact.findUnique({ where: { id } })
  if (!contact) return { ok: false, error: 'Contact not found.' }

  await prisma.contact.delete({ where: { id } })
  await logAudit(user.id, 'DELETE', 'contact', id, contact.authority)
  revalidatePath('/start-here')
  return { ok: true }
}
