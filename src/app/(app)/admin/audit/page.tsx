import { requirePermission } from '@/lib/auth'
import { getAuditLogs } from '@/lib/queries'
import { PageHeader, Card, CardHeader, EmptyState, Badge } from '@/components/ui/primitives'

export const metadata = { title: 'Audit Log' }

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'RESET_PASSWORD', 'PERMISSION']

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; q?: string }>
}) {
  await requirePermission('audit', 'read')
  const { action = '', q = '' } = await searchParams
  const logs = await getAuditLogs(500)

  const needle = q.trim().toLowerCase()
  const filtered = logs.filter((l) => {
    if (action && l.action !== action) return false
    if (!needle) return true
    return [l.entity, l.entityId, l.detail, l.user?.name ?? '', l.user?.email ?? '']
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(needle))
  })

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit log"
        subtitle="Who changed what, and when. Newest first — retained across sign-ins."
      />

      <Card padded={false}>
        <div className="p-5 pb-4">
          <CardHeader title={`${filtered.length} of ${logs.length} entries`} />
          <form method="GET" className="flex flex-wrap items-end gap-3">
            <label className="block w-52">
              <span className="mb-1 block text-[11px] text-slate-500">Action</span>
              <select name="action" defaultValue={action} className="field">
                <option value="">All actions</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label className="block w-72">
              <span className="mb-1 block text-[11px] text-slate-500">Search</span>
              <input
                name="q"
                defaultValue={q}
                placeholder="user, entity, detail…"
                className="field"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Filter
            </button>
            {(action || q) ? (
              <a href="/admin/audit" className="text-xs text-teal-700 hover:underline">
                Clear
              </a>
            ) : null}
          </form>
        </div>

        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="w-44 px-5 py-2.5 font-semibold">When</th>
                <th className="w-44 px-3 py-2.5 font-semibold">Who</th>
                <th className="w-36 px-3 py-2.5 font-semibold">Action</th>
                <th className="w-44 px-3 py-2.5 font-semibold">Entity</th>
                <th className="px-3 py-2.5 font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-6">
                    <EmptyState title="No entries match" hint="Adjust the filters above." />
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-5 py-2.5 text-xs text-slate-500 tabular-nums">
                      {l.createdAt.toISOString().replace('T', ' ').slice(0, 19)}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-slate-800">{l.user?.name ?? 'System'}</div>
                      <div className="text-xs text-slate-500">{l.user?.email}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        value={l.action}
                        className={
                          l.action === 'DELETE' || l.action === 'RESET_PASSWORD'
                            ? 'bg-rose-50 text-rose-700 ring-rose-200'
                            : l.action === 'CREATE'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : undefined
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5 text-slate-700">
                      <div className="font-medium">{l.entity}</div>
                      <div className="truncate text-xs text-slate-400">{l.entityId}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600">{l.detail || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
