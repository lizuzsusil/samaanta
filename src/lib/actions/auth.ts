'use server'

import { z } from 'zod'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createSession, destroySession, logAudit, verifyCredentials } from '@/lib/auth'
import { BS_MONTHS, MONTH_COOKIE } from '@/lib/constants'
import type { ActionState } from '@/lib/types'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(3).max(200),
  password: z.string().min(1).max(200),
})

function safeNext(raw: unknown) {
  const value = typeof raw === 'string' ? raw : '/dashboard'
  if (!value.startsWith('/') || value.startsWith('//')) return '/dashboard'
  return value
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email') ?? '',
    password: formData.get('password') ?? '',
  })
  if (!parsed.success) {
    return { ok: false, error: 'Enter a valid email and password.' }
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password)
  if (!user) {
    return { ok: false, error: 'Invalid email or password.' }
  }

  await createSession(user.id)
  await logAudit(user.id, 'LOGIN', 'user', user.id, user.email)

  redirect(safeNext(formData.get('next')))
}

export async function logoutAction(): Promise<void> {
  await destroySession()
  redirect('/login')
}

/** Month preference is a view setting, available to every signed-in user. */
export async function setCurrentMonth(month: number): Promise<void> {
  if (!BS_MONTHS.some((m) => m.n === month)) return
  const jar = await cookies()
  jar.set(MONTH_COOKIE, String(month), {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === 'production',
  })
  revalidatePath('/', 'layout')
}
