'use server'

import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { logAudit, requirePermission } from '@/lib/auth'
import { MODULES, ROLES } from '@/lib/constants'
import { prisma } from '@/lib/db'

type Result = { ok: boolean; error?: string }

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200),
  role: z.enum(ROLES),
  title: z.string().trim().max(120).default(''),
  password: z.string().min(8, 'At least 8 characters').max(200),
})

export async function createUser(input: unknown): Promise<Result> {
  const actor = await requirePermission('users', 'write')
  const parsed = createSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid user.' }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return { ok: false, error: 'A user with that email already exists.' }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  const user = await prisma.user.create({
    data: { ...parsed.data, passwordHash },
  })
  await logAudit(actor.id, 'CREATE', 'user', user.id, `${user.email} (${user.role})`)
  revalidatePath('/admin/users')
  return { ok: true }
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(ROLES).optional(),
  title: z.string().trim().max(120).optional(),
  active: z.boolean().optional(),
})

export async function updateUser(id: string, patch: unknown): Promise<Result> {
  const actor = await requirePermission('users', 'write')
  const parsed = updateSchema.safeParse(patch)
  if (!parsed.success) return { ok: false, error: 'Invalid user update.' }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return { ok: false, error: 'User not found.' }

  if (id === actor.id && (parsed.data.role === 'VIEWER' || parsed.data.active === false)) {
    return { ok: false, error: 'You cannot demote or deactivate your own account.' }
  }

  await prisma.user.update({ where: { id }, data: parsed.data })
  await logAudit(actor.id, 'UPDATE', 'user', id, Object.keys(parsed.data).join(','))
  if (parsed.data.active === false) await prisma.session.deleteMany({ where: { userId: id } })
  revalidatePath('/admin/users')
  return { ok: true }
}

const passwordSchema = z.object({
  id: z.string().min(1),
  password: z.string().min(8, 'At least 8 characters').max(200),
})

export async function resetPassword(input: unknown): Promise<Result> {
  const actor = await requirePermission('users', 'write')
  const parsed = passwordSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid password.' }

  const user = await prisma.user.findUnique({ where: { id: parsed.data.id } })
  if (!user) return { ok: false, error: 'User not found.' }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })
  await prisma.session.deleteMany({ where: { userId: user.id } })
  await logAudit(actor.id, 'RESET_PASSWORD', 'user', user.id, user.email)
  revalidatePath('/admin/users')
  return { ok: true }
}

export async function deleteUser(id: string): Promise<Result> {
  const actor = await requirePermission('users', 'write')
  if (id === actor.id) return { ok: false, error: 'You cannot delete your own account.' }

  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return { ok: false, error: 'User not found.' }

  await prisma.user.delete({ where: { id } })
  await logAudit(actor.id, 'DELETE', 'user', id, user.email)
  revalidatePath('/admin/users')
  return { ok: true }
}

const permSchema = z.object({
  role: z.string().min(1),
  module: z.string().min(1),
  canRead: z.boolean(),
  canWrite: z.boolean(),
})

export async function setPermission(input: unknown): Promise<Result> {
  const actor = await requirePermission('users', 'write')
  const parsed = permSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Invalid permission update.' }
  if (!(MODULES as readonly string[]).includes(parsed.data.module)) {
    return { ok: false, error: 'Unknown module.' }
  }

  const { role, module, canRead, canWrite } = parsed.data
  if (role === 'ADMIN' && module === 'users' && !canRead) {
    return { ok: false, error: 'Admins must keep read access to Users & Roles.' }
  }
  if (role === 'ADMIN' && module === 'audit' && !canRead) {
    return { ok: false, error: 'Admins must keep read access to the Audit Log.' }
  }

  await prisma.permission.upsert({
    where: { role_module: { role, module } },
    create: { role, module, canRead, canWrite },
    update: { canRead, canWrite },
  })
  await logAudit(
    actor.id,
    'PERMISSION',
    'permission',
    `${role}:${module}`,
    `read=${canRead} write=${canWrite}`,
  )
  revalidatePath('/admin/users')
  return { ok: true }
}
