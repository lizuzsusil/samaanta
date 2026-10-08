'use client'

import { useActionState } from 'react'
import { LogIn } from 'lucide-react'
import { loginAction } from '@/lib/actions/auth'
import { Button, Notice } from '@/components/ui/primitives'
import type { ActionState } from '@/lib/types'

const initialState: ActionState = { ok: false }

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-600">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@samaanta.org.np"
          className="field"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-600">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="field"
        />
      </div>

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        <LogIn className="h-4 w-4" />
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
