import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { prisma } from './db'
import { SESSION_COOKIE, type ModuleName } from './constants'

const SESSION_DAYS = 7

export type SessionUser = {
  id: string
  email: string
  name: string
  role: string
  title: string | null
  active: boolean
}

export async function verifyCredentials(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } })
  if (!user || !user.active) return null
  const ok = await bcrypt.compare(password, user.passwordHash)
  return ok ? user : null
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await prisma.session.create({ data: { token, userId, expiresAt } })
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function destroySession() {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (token) await prisma.session.deleteMany({ where: { token } })
  jar.delete(SESSION_COOKIE)
}

/** Reads the session cookie and resolves the user. Returns null when signed out. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } })
  if (!session || session.expiresAt < new Date()) return null
  const u = session.user
  if (!u.active) return null
  return { id: u.id, email: u.email, name: u.name, role: u.role, title: u.title, active: u.active }
})

/** Current user or redirect to /login. Call inside a <Suspense> boundary. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect('/login')
  return user
}

/**
 * Permission gate for pages and server functions.
 * Redirects to /forbidden when the role lacks the permission.
 */
export async function requirePermission(
  module: ModuleName,
  action: 'read' | 'write' = 'read',
): Promise<SessionUser> {
  const user = await requireUser()
  const allowed = await can(user.role, module, action)
  if (!allowed) redirect('/forbidden')
  return user
}

/** Non-throwing variant, for shaping the UI (hide edit controls). */
export const can = cache(async (role: string, module: ModuleName, action: 'read' | 'write') => {
  const row = await prisma.permission.findUnique({
    where: { role_module: { role, module } },
  })
  if (!row) return false
  return action === 'write' ? row.canWrite : row.canRead
})

export type Permissions = Partial<Record<ModuleName, { read: boolean; write: boolean }>>

/** All permissions for the current user, for client components. */
export async function getPermissionMap(role: string): Promise<Permissions> {
  const rows = await prisma.permission.findMany({ where: { role } })
  const out: Permissions = {}
  for (const r of rows) out[r.module as ModuleName] = { read: r.canRead, write: r.canWrite }
  return out
}


export async function logAudit(
  userId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  detail?: string,
) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId: entityId ?? null, detail: detail ?? null },
  })
}
