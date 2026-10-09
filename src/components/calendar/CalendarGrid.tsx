'use client'

import { useState, useTransition } from 'react'
import { Pencil, X, Check, Trash2 } from 'lucide-react'
import { BS_MONTHS, CALENDAR_KINDS } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { Button, Notice } from '@/components/ui/primitives'
import { updateCalendarCell } from '@/lib/actions/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'

export type CalendarActivityDto = {
  id: string
  section: string
  label: string
  owner: string
  byMonth: Record<number, { text: string; kind: string }>
}

type Editing = {
  activityId: string
  label: string
  month: number
  text: string
  kind: string
}

export function CalendarGrid({
  activities,
  month,
  canWrite,
}: {
  activities: CalendarActivityDto[]
  month: number
  canWrite: boolean
}) {
  const [editing, setEditing] = useState<Editing | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const save = () => {
    if (!editing) return
    startTransition(async () => {
      const res = await updateCalendarCell(editing.activityId, editing.month, {
        text: editing.text,
        kind: editing.kind,
      })
      if (res.ok) setEditing(null)
      setError(res.ok ? null : (res.error ?? 'Could not save'))
    })
  }

  const clear = () => {
    if (!editing) return
    startTransition(async () => {
      const res = await updateCalendarCell(editing.activityId, editing.month, {
        text: '',
        kind: editing.kind,
      })
      if (res.ok) setEditing(null)
      setError(res.ok ? null : (res.error ?? 'Could not clear'))
    })
  }

  const sections: { name: string; items: CalendarActivityDto[] }[] = []
  for (const a of activities) {
    const last = sections[sections.length - 1]
    if (last && last.name === a.section) last.items.push(a)
    else sections.push({ name: a.section, items: [a] })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-stone-200/80 bg-white/85 px-4 py-3 shadow-card backdrop-blur">
        <span className="text-[10px] font-bold tracking-[0.16em] text-stone-400 uppercase">
          Colour key
        </span>
        {Object.entries(CALENDAR_KINDS)
          .filter(([k]) => k)
          .map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
              <span
                className="h-3 w-5 rounded-sm ring-1 ring-black/5"
                style={{ background: v.bg }}
              />
              {v.label}
            </span>
          ))}
        <span className="ml-auto rounded-full bg-stone-900/[0.05] px-2.5 py-1 text-[11px] font-semibold text-stone-500">
          {canWrite ? 'Click any cell to edit' : 'Read-only access'}
        </span>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <ScrollArea orientation="horizontal" className="table-premium rounded-2xl border border-stone-200/80 bg-white/95 shadow-card">
        <table className="w-full min-w-[1800px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
              <th className="sticky left-0 z-10 w-72 bg-slate-50 px-4 py-2.5 font-semibold">
                Area
              </th>
              <th className="w-56 bg-slate-50 px-3 py-2.5 font-semibold">Frequency • owner</th>
              {BS_MONTHS.map((m) => (
                <th
                  key={m.n}
                  className={cn(
                    'w-40 px-2 py-2 text-center font-semibold',
                    m.n === month && 'bg-teal-700 text-white',
                  )}
                >
                  <div>{m.name} 20{m.n <= 9 ? '83' : '84'}</div>
                  <div className="font-normal normal-case text-slate-400">{m.en}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sections.map((section) => (
              <SectionRows
                key={section.name}
                section={section}
                month={month}
                canWrite={canWrite}
                onEdit={(activityId, label, m, text, kind) =>
                  setEditing({ activityId, label, month: m, text, kind })
                }
              />
            ))}
          </tbody>
        </table>
      </ScrollArea>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{editing.label}</h3>
                <p className="text-xs text-slate-500">
                  {BS_MONTHS[editing.month - 1].name} 20
                  {editing.month <= 9 ? '83' : '84'} · {BS_MONTHS[editing.month - 1].en}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <label className="mt-4 block">
              <span className="mb-1.5 block text-[11px] font-medium text-slate-500">
                What happens this month
              </span>
              <textarea
                className="field min-h-24 resize-y"
                value={editing.text}
                autoFocus
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                placeholder="e.g. Submit renewal at IRD"
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-1.5 block text-[11px] font-medium text-slate-500">
                Action type (colour)
              </span>
              <select
                className="field"
                value={editing.kind}
                onChange={(e) => setEditing({ ...editing, kind: e.target.value })}
              >
                <option value="">No colour</option>
                {Object.entries(CALENDAR_KINDS)
                  .filter(([k]) => k)
                  .map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
              </select>
            </label>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="primary" size="sm" onClick={save} disabled={pending}>
                <Check className="h-4 w-4" /> Save
              </Button>
              <Button variant="danger" size="sm" onClick={clear} disabled={pending}>
                <Trash2 className="h-4 w-4" /> Clear cell
              </Button>
              <Button size="sm" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function SectionRows({
  section,
  month,
  canWrite,
  onEdit,
}: {
  section: { name: string; items: CalendarActivityDto[] }
  month: number
  canWrite: boolean
  onEdit: (
    activityId: string,
    label: string,
    month: number,
    text: string,
    kind: string,
  ) => void
}) {
  return (
    <>
      <tr className="bg-slate-100/80">
        <td
          colSpan={14}
          className="px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-slate-600 uppercase"
        >
          {section.name || 'General'}
        </td>
      </tr>
      {section.items.map((a) => (
        <tr key={a.id} className="align-top hover:bg-slate-50/60">
          <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-slate-900">
            {a.label}
          </td>
          <td className="px-3 py-2 text-xs text-slate-500">{a.owner || '—'}</td>
          {BS_MONTHS.map((m) => {
            const cell = a.byMonth[m.n]
            const kind = CALENDAR_KINDS[cell?.kind ?? '']
            const isCurrent = m.n === month
            return (
              <td
                key={m.n}
                className={cn(
                  'border-l border-slate-100 p-1',
                  isCurrent && 'bg-teal-50/40',
                )}
              >
                <button
                  type="button"
                  disabled={!canWrite}
                  onClick={() => onEdit(a.id, a.label, m.n, cell?.text ?? '', cell?.kind ?? '')}
                  className={cn(
                    'min-h-11 w-full rounded-md px-2 py-1.5 text-left text-xs leading-snug transition',
                    canWrite ? 'hover:ring-2 hover:ring-teal-200' : 'cursor-default',
                    cell?.text ? 'font-medium' : 'text-slate-300',
                  )}
                  style={
                    cell?.text
                      ? { background: kind.bg, color: kind.fg }
                      : { background: 'transparent' }
                  }
                  title={canWrite ? 'Click to edit' : undefined}
                >
                  {cell?.text ? (
                    <span className="line-clamp-4">{cell.text}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      {canWrite ? <Pencil className="h-3 w-3" /> : null} —
                    </span>
                  )}
                </button>
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}
