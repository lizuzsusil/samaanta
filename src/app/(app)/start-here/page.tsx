import { requirePermission } from '@/lib/auth'
import { getStartHere } from '@/lib/queries'
import { PageHeader, Card, CardHeader, Notice, Badge } from '@/components/ui/primitives'
import {
  EditableSections,
  type ContactDto,
  type DropboxDto,
  type HandoverDto,
} from '@/components/start-here/EditableSections'
import { can } from '@/lib/auth'
import { BookOpen, Database, FolderTree, KeyRound, LayoutList, ListChecks, Users } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

export const metadata = { title: 'Start Here' }

const SWATCHES: { match: RegExp; bg: string }[] = [
  { match: /prepare/i, bg: '#DCE9F5' },
  { match: /submit/i, bg: '#FDE8D3' },
  { match: /deadline/i, bg: '#F8D3CB' },
  { match: /follow/i, bg: '#D8F0EC' },
  { match: /recurring/i, bg: '#E8E4F3' },
  { match: /monitor/i, bg: '#EEEEEE' },
]

export default async function StartHerePage() {
  const user = await requirePermission('startHere', 'read')
  const [data, canWrite] = await Promise.all([
    getStartHere(),
    can(user.role, 'startHere', 'write'),
  ])

  const { sections, contacts, handover, dropbox } = data
  const meta = new Map((sections.meta ?? []).map((m) => [m.key, m.value]))
  const howto = sections.howto ?? []
  const sheetIndex = sections.sheetIndex ?? []
  const colourKey = sections.colourKey ?? []
  const roles = sections.roles ?? []
  const folder = (sections.folder ?? [])[0]?.value ?? ''
  const tips = sections.tips ?? []

  return (
    <div className="space-y-5">
      <PageHeader
        title={meta.get('title') ?? 'Start Here'}
        subtitle={meta.get('subtitle') ?? undefined}
        actions={
          <div className="text-right text-xs text-slate-500">
            <div className="font-medium text-slate-700">{meta.get('org')}</div>
            <div className="mt-0.5">
              {meta.get('fy')} • Shrawan {meta.get('fy')?.split('/')[0]} – Asadh{' '}
              {String(Number(meta.get('fy')?.split('/')[1] ?? 0) + 1)}
            </div>
          </div>
        }
      />

      <Notice>
        This is the orientation sheet: how the tracker works, what each colour means, who does what,
        and where every file lives.
      </Notice>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="1 · How to use it" icon={BookOpen} />
          <ol className="space-y-3">
            {howto.map((h) => (
              <li key={h.key} className="flex gap-3 text-sm text-slate-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-700 text-[11px] font-semibold text-white">
                  {h.key}
                </span>
                <span className="leading-relaxed">{h.value}</span>
              </li>
            ))}
          </ol>
          {tips.length ? (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              {tips.map((t) => (
                <p key={t.key} className="text-xs leading-relaxed text-slate-500">
                  <span className="font-semibold text-slate-700">Tip —</span> {t.value}
                </p>
              ))}
            </div>
          ) : null}
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader title="2 · Sheet index" icon={LayoutList} />
          </div>
          <ScrollArea orientation="horizontal">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {sheetIndex.map((s) => (
                  <tr key={s.key} className="align-top hover:bg-slate-50/60">
                    <td className="w-56 px-5 py-2.5 font-medium text-slate-900">{s.label}</td>
                    <td className="px-5 py-2.5 text-slate-600">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="3 · Colour key" />
          <ul className="space-y-2.5">
            {colourKey.map((c) => {
              const hit = SWATCHES.find((s) => s.match.test(c.label ?? c.key))
              return (
                <li key={c.key} className="flex items-start gap-3 text-sm">
                  <span
                    className="mt-0.5 h-4 w-7 shrink-0 rounded border border-slate-200"
                    style={{ background: hit?.bg ?? '#EEEEEE' }}
                  />
                  <span>
                    <span className="font-medium text-slate-800">{c.label}</span>{' '}
                    <span className="text-slate-500">— {c.value}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="4 · Roles & abbreviations" icon={Users} />
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {roles.map((r) => (
              <div key={r.key}>
                <dt className="text-xs font-semibold text-teal-700">{r.label}</dt>
                <dd className="text-xs leading-relaxed text-slate-600">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="5 · Digital compliance folder structure" icon={FolderTree} />
          <ScrollArea
            orientation="horizontal"
            className="rounded-lg bg-slate-900 px-4 py-3"
          >
            <pre className="text-[12px] leading-relaxed whitespace-pre-wrap text-slate-100">
              {folder}
            </pre>
          </ScrollArea>
        </Card>

        <Card>
          <CardHeader title="6 · Access in this app" icon={KeyRound} />
          <div className="space-y-3 text-sm text-slate-700">
            <p className="leading-relaxed">
              Two roles are in use. <strong>Admin</strong> can read and edit every module including
              users and the audit log. <strong>Board / Viewer</strong> can read the operational
              modules and edit nothing — status changes, contacts, guides and settings are all
              blocked.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-800">Admin</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge value="Read" />
                  <Badge value="Write" />
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold text-slate-800">Board / Viewer</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge value="Read" />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
              <ListChecks className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                You are signed in as <strong>{user.name}</strong> ({user.role}). Every edit is
                recorded in the audit log with your name and timestamp.
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Security note"
          icon={Database}
          subtitle="Stored once here, referenced everywhere else"
        />
        <p className="text-sm leading-relaxed text-slate-600">
          Keep only links in the tables below — never passwords or API keys. Dropbox folders are
          referenced by the Task Tracker column T and by every step guide&apos;s Dropbox field, so
          pasting a link here updates the whole workbook.
        </p>
      </Card>

      <EditableSections
        handover={handover as HandoverDto[]}
        contacts={contacts as ContactDto[]}
        dropbox={dropbox as DropboxDto[]}
        canWrite={canWrite}
      />
    </div>
  )
}
