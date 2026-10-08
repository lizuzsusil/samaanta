'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { logAudit, requirePermission } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { DOC_STATUSES, STEP_STATUSES } from '@/lib/constants'
import { zChoice } from '@/lib/validation'

type Result = { ok: boolean; error?: string }

const stepSchema = z.object({
  status: zChoice(STEP_STATUSES).optional(),
  remarks: z.string().trim().max(1000).optional(),
  dateDone: z.string().trim().max(40).optional(),
})

export async function updateGuideStep(id: string, patch: unknown): Promise<Result> {
  const user = await requirePermission('guides', 'write')
  const parsed = stepSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid step update.' }

  const step = await prisma.guideStep.findUnique({ where: { id } })
  if (!step) return { ok: false, error: 'Step not found.' }

  await prisma.guideStep.update({ where: { id }, data: parsed.data })
  await logAudit(user.id, 'UPDATE', 'guideStep', id, `${step.no} ${step.action}`)
  revalidatePath('/guides')
  return { ok: true }
}

const docSchema = z.object({
  ready: zChoice(DOC_STATUSES).optional(),
  remarks: z.string().trim().max(1000).optional(),
  link: z.string().trim().max(500).optional(),
})

export async function updateGuideDoc(id: string, patch: unknown): Promise<Result> {
  const user = await requirePermission('guides', 'write')
  const parsed = docSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid document update.' }

  const doc = await prisma.guideDoc.findUnique({ where: { id } })
  if (!doc) return { ok: false, error: 'Document not found.' }

  await prisma.guideDoc.update({ where: { id }, data: parsed.data })
  await logAudit(user.id, 'UPDATE', 'guideDoc', id, doc.document)
  revalidatePath('/guides')
  return { ok: true }
}

const newStepSchema = z.object({
  guideSlug: z.string().trim().min(1).max(60),
  action: z.string().trim().min(3).max(200),
  details: z.string().trim().max(2000).default(''),
  who: z.string().trim().max(120).default(''),
  when: z.string().trim().max(120).default(''),
  status: zChoice(STEP_STATUSES).default('Not Started'),
})

export async function addGuideStep(input: unknown): Promise<Result> {
  const user = await requirePermission('guides', 'write')
  const parsed = newStepSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid step.' }

  const guide = await prisma.guide.findUnique({ where: { slug: parsed.data.guideSlug } })
  if (!guide) return { ok: false, error: 'Guide not found.' }

  const last = await prisma.guideStep.findFirst({
    where: { guideId: guide.id },
    orderBy: { sort: 'desc' },
  })
  const next = (last?.sort ?? -1) + 1
  const no = String(next + 1)

  await prisma.guideStep.create({
    data: { ...parsed.data, guideId: guide.id, no, sort: next },
  })
  await logAudit(user.id, 'CREATE', 'guideStep', guide.slug, parsed.data.action)
  revalidatePath(`/guides/${guide.slug}`)
  return { ok: true }
}

export async function deleteGuideStep(id: string): Promise<Result> {
  const user = await requirePermission('guides', 'write')
  const step = await prisma.guideStep.findUnique({ where: { id }, include: { guide: true } })
  if (!step) return { ok: false, error: 'Step not found.' }

  await prisma.guideStep.delete({ where: { id } })
  await logAudit(user.id, 'DELETE', 'guideStep', id, step.action)
  revalidatePath(`/guides/${step.guide.slug}`)
  return { ok: true }
}

const newDocSchema = z.object({
  guideSlug: z.string().trim().min(1).max(60),
  document: z.string().trim().min(3).max(300),
  notes: z.string().trim().max(1000).default(''),
  source: z.string().trim().max(200).default(''),
  ready: zChoice(DOC_STATUSES).default('No'),
})

export async function addGuideDoc(input: unknown): Promise<Result> {
  const user = await requirePermission('guides', 'write')
  const parsed = newDocSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid document.' }

  const guide = await prisma.guide.findUnique({ where: { slug: parsed.data.guideSlug } })
  if (!guide) return { ok: false, error: 'Guide not found.' }

  const last = await prisma.guideDoc.findFirst({
    where: { guideId: guide.id },
    orderBy: { sort: 'desc' },
  })
  const next = (last?.sort ?? -1) + 1

  await prisma.guideDoc.create({
    data: { ...parsed.data, guideId: guide.id, no: String(next + 1), sort: next },
  })
  await logAudit(user.id, 'CREATE', 'guideDoc', guide.slug, parsed.data.document)
  revalidatePath(`/guides/${guide.slug}`)
  return { ok: true }
}

export async function deleteGuideDoc(id: string): Promise<Result> {
  const user = await requirePermission('guides', 'write')
  const doc = await prisma.guideDoc.findUnique({ where: { id }, include: { guide: true } })
  if (!doc) return { ok: false, error: 'Document not found.' }

  await prisma.guideDoc.delete({ where: { id } })
  await logAudit(user.id, 'DELETE', 'guideDoc', id, doc.document)
  revalidatePath(`/guides/${doc.guide.slug}`)
  return { ok: true }
}
