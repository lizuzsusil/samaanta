'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { RefreshCw, ShieldCheck, Trash2, UserPlus } from 'lucide-react'
import type { getUsers, getPermissionSummary } from '@/lib/queries'
import { MODULES, MODULE_LABELS, ROLE_LABELS, ROLES } from '@/lib/constants'
import { Badge, Button, Card, CardHeader, Notice } from '@/components/ui/primitives'
import { SelectCell, TextCell } from '@/components/ui/edit'
import {
  createUser,
  deleteUser,
  resetPassword,
  setPermission,
  updateUser,
} from '@/lib/actions/users'
import { ScrollArea } from '@/components/ui/scroll-area'

type UserDto = Awaited<ReturnType<typeof getUsers>>[number]
type PermDto = Awaited<ReturnType<typeof getPermissionSummary>>[number]

export function UsersAdmin({
  users,
  permissions,
  meId,
}: {
  users: UserDto[]
  permissions: PermDto[]
  meId: string
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const guard = (res: { ok: boolean; error?: string }) => {
    setError(res.ok ? null : (res.error ?? 'Update failed'))
    return res
  }

  const permIndex = new Map(permissions.map((p) => [`${p.role}:${p.module}`, p]))

  const toggle = (role: string, module: string, field: 'canRead' | 'canWrite', value: boolean) => {
    const next = { canRead: false, canWrite: false }
    const current = permIndex.get(`${role}:${module}`)
    next.canRead = current?.canRead ?? false
    next.canWrite = current?.canWrite ?? false
    next[field] = value
    if (field === 'canRead' && !value) next.canWrite = false
    if (field === 'canWrite' && value) next.canRead = true
    startTransition(async () => {
      guard(await setPermission({ role, module, ...next }))
    })
  }

  const addUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const payload = {
      name: String(f.get('name') ?? '').trim(),
      email: String(f.get('email') ?? '').trim(),
      role: String(f.get('role') ?? 'VIEWER'),
      title: String(f.get('title') ?? '').trim(),
      password: String(f.get('password') ?? ''),
    }
    startTransition(async () => {
      const res = await createUser(payload)
      guard(res)
      if (res.ok) {
        setAdding(false)
        e.currentTarget.reset()
      }
    })
  }

  return (
    <div className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="Users"
            subtitle="Two roles: Admin edits everything, Board / Viewer reads everything and edits nothing."
            action={
              adding ? null : (
                <Button size="sm" variant="primary" onClick={() => setAdding(true)}>
                  <UserPlus className="h-4 w-4" /> Add user
                </Button>
              )
            }
          />
          {adding ? (
            <form
              onSubmit={addUser}
              className="mb-4 grid gap-3 rounded-lg border border-brand-600/20 bg-brand-50/50 p-4 sm:grid-cols-2 lg:grid-cols-6"
            >
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Full name</span>
                <input name="name" className="field" placeholder="Full name" required />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Email</span>
                <input
                  name="email"
                  type="email"
                  className="field"
                  placeholder="name@samaanta.org.np"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Role</span>
                <select name="role" className="field" defaultValue="VIEWER">
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {ROLE_LABELS[r] ?? r}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Title</span>
                <input name="title" className="field" placeholder="e.g. Board Member" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[11px] text-slate-500">Temporary password</span>
                <input
                  name="password"
                  type="password"
                  className="field"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </label>
              <div className="flex items-end gap-2">
                <Button type="submit" variant="primary" size="sm" disabled={pending}>
                  Create
                </Button>
                <Button type="button" size="sm" onClick={() => setAdding(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : null}
        </div>

        <ScrollArea orientation="horizontal">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-2.5 font-semibold">Name / email</th>
                <th className="w-44 px-2 py-2.5 font-semibold">Role</th>
                <th className="w-56 px-2 py-2.5 font-semibold">Title</th>
                <th className="w-32 px-3 py-2.5 font-semibold">Status</th>
                <th className="w-36 px-5 py-2.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-5 py-2.5">
                    <div className="font-medium text-slate-900">
                      {u.name}
                      {u.id === meId ? (
                        <span className="ml-2 text-[11px] font-normal text-brand-600">(you)</span>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                  </td>
                  <td className="px-1 py-1">
                    <SelectCell
                      value={u.role}
                      options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r }))}
                      onCommit={async (value) => guard(await updateUser(u.id, { role: value }))}
                      disabled={pending}
                      ariaLabel={`Role for ${u.name}`}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <TextCell
                      value={u.title ?? ''}
                      onCommit={async (value) => guard(await updateUser(u.id, { title: value }))}
                      disabled={pending}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    {u.active ? (
                      <Badge value="Active" />
                    ) : (
                      <Badge value="Disabled" />
                    )}
                  </td>
                  <td className="px-5 py-2 text-right whitespace-nowrap">
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const pw = window.prompt(`New password for ${u.email}:`, '')
                          if (!pw) return
                          guard(await resetPassword({ id: u.id, password: pw }))
                        })
                      }
                      className="rounded p-1.5 text-slate-400 hover:bg-sky-50 hover:text-sky-600"
                      aria-label="Reset password"
                      title="Reset password"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      disabled={pending || u.id === meId}
                      onClick={() =>
                        startTransition(async () => {
                          if (window.confirm(`Delete ${u.email}?`)) guard(await deleteUser(u.id))
                        })
                      }
                      className="ml-1 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                      aria-label="Delete user"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="Role permissions"
            icon={ShieldCheck}
            subtitle="Modules each role can open (read) and change (write). Admins cannot lose access to Users & Roles or the Audit Log."
          />
        </div>
        <ScrollArea orientation="horizontal">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="px-5 py-2.5 font-semibold">Module</th>
                {ROLES.map((r) => (
                  <th key={r} colSpan={2} className="border-l border-slate-200 px-3 py-2.5 text-center font-semibold">
                    {ROLE_LABELS[r] ?? r}
                  </th>
                ))}
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] text-slate-500 uppercase">
                <th className="px-5 py-1.5" />
                {ROLES.map((r) => (
                  <Fragment2 key={r} />
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MODULES.map((m) => (
                <tr key={m} className="hover:bg-slate-50/60">
                  <td className="px-5 py-2.5 font-medium text-slate-800">{MODULE_LABELS[m]}</td>
                  {ROLES.map((r) => {
                    const p = permIndex.get(`${r}:${m}`)
                    return (
                      <td key={r} colSpan={2} className="border-l border-slate-100 px-3 py-1.5">
                        <div className="flex justify-center gap-4">
                          {(['canRead', 'canWrite'] as const).map((field) => (
                            <label
                              key={field}
                              className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600"
                            >
                              <input
                                type="checkbox"
                                checked={field === 'canRead' ? (p?.canRead ?? false) : (p?.canWrite ?? false)}
                                disabled={pending}
                                onChange={(e) => toggle(r, m, field, e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-slate-300 text-brand-700 focus:ring-brand-600"
                              />
                              {field === 'canRead' ? 'Read' : 'Write'}
                            </label>
                          ))}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollArea>
        <div className="border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
          Changes apply to every session of that role immediately. Signature users: sign out and
          back in after changing your own role.
        </div>
      </Card>

      <Card>
        <CardHeader title="Demo accounts" subtitle="Seeded locally for review" />
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <code className="rounded-lg bg-slate-100 px-3 py-2">
            admin@samaanta.org.np / Admin@2083
          </code>
          <code className="rounded-lg bg-slate-100 px-3 py-2">
            board@samaanta.org.np / Board@2083
          </code>
        </div>
      </Card>
    </div>
  )
}

function Fragment2() {
  return (
    <>
      <th className="border-l border-slate-200 px-3 py-1.5 text-center font-medium">Read</th>
      <th className="px-3 py-1.5 text-center font-medium">Write</th>
    </>
  )
}
