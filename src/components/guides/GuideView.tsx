'use client'

import { useState, useTransition, type FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, FolderOpen, Plus, Trash2, Check } from 'lucide-react'
import type { getGuide } from '@/lib/queries'
import { DOC_STATUSES, STEP_STATUSES } from '@/lib/constants'
import { cn } from '@/lib/cn'
import { Badge, Button, Card, CardHeader, Notice } from '@/components/ui/primitives'
import { SelectCell, TextCell } from '@/components/ui/edit'
import {
  addGuideDoc,
  addGuideStep,
  deleteGuideDoc,
  deleteGuideStep,
  updateGuideDoc,
  updateGuideStep,
} from '@/lib/actions/guides'
import { ScrollArea } from '@/components/ui/scroll-area'

type Guide = NonNullable<Awaited<ReturnType<typeof getGuide>>>

const GLANCE: { key: keyof Guide; label: string }[] = [
  { key: 'authority', label: 'Authority / office' },
  { key: 'frequency', label: 'Frequency' },
  { key: 'window', label: 'Target window' },
  { key: 'owner', label: 'Current owner' },
  { key: 'dependsOn', label: 'Depends on' },
  { key: 'feedsInto', label: 'Feeds into' },
  { key: 'output', label: 'Output / proof' },
  { key: 'handoverOwner', label: 'Handover owner' },
  { key: 'dropbox', label: 'Dropbox folder' },
]

export function GuideView({ guide, canWrite }: { guide: Guide; canWrite: boolean }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const stepsDone = guide.steps.filter((s) => s.status === 'Done').length
  const docsReady = guide.docs.filter((d) => d.ready === 'Yes').length

  return (
    <div className="space-y-5">
      <div className="rise relative overflow-hidden rounded-3xl border border-stone-200/70 bg-gradient-to-br from-white via-brand-50/50 to-amber-50/60 p-6 shadow-card">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-brand-800 ring-1 ring-stone-200 transition hover:ring-brand-600/40"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All step guides
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 max-w-2xl">
            <div className="text-[10px] font-bold tracking-[0.22em] text-brand-700 uppercase">
              {guide.sheet}
            </div>
            <h1 className="font-display mt-1 text-[26px] leading-tight font-semibold tracking-tight text-stone-900">
              {guide.title}
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{guide.subtitle}</p>
          </div>
          <div className="flex gap-2 text-xs tabular-nums">
            <span className="rounded-2xl bg-stone-900 px-3.5 py-2 text-white shadow-md">
              <span className="block text-lg leading-none font-bold">{stepsDone}/{guide.steps.length}</span>
              <span className="mt-0.5 block text-[10px] font-semibold text-white/60 uppercase">steps done</span>
            </span>
            <span className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-emerald-900">
              <span className="block text-lg leading-none font-bold">{docsReady}/{guide.docs.length}</span>
              <span className="mt-0.5 block text-[10px] font-semibold text-emerald-700/70 uppercase">docs ready</span>
            </span>
          </div>
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}

      <Card>
        <CardHeader title="At a glance" subtitle={guide.sheet} />
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {GLANCE.map(({ key, label }) => {
            const value = String(guide[key] ?? '')
            if (!value && key !== 'dropbox') return null
            return (
              <div key={key} className="border-l-2 border-brand-600/10 pl-3">
                <dt className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                  {label}
                </dt>
                <dd className="mt-0.5 text-sm break-words text-slate-700">
                  {key === 'dropbox' && /^https:\/\//.test(value) ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                    >
                      <FolderOpen className="h-3.5 w-3.5" /> Open folder
                    </a>
                  ) : value || (
                    <span className="text-slate-300">—</span>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="Step-by-step process"
            action={
              canWrite ? (
                <AddInline
                  label="Add step"
                  fields={[
                    { name: 'action', placeholder: 'Action', wide: true },
                    { name: 'details', placeholder: 'What to do / details', wide: true },
                    { name: 'who', placeholder: 'Who' },
                    { name: 'when', placeholder: 'When (BS)' },
                  ]}
                  pending={pending}
                  onSubmit={(values) =>
                    startTransition(async () => {
                      const res = await addGuideStep({ guideSlug: guide.slug, ...values })
                      setError(res.ok ? null : (res.error ?? 'Could not add step'))
                    })
                  }
                />
              ) : null
            }
          />
        </div>
        <ScrollArea orientation="horizontal">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="w-14 px-3 py-2.5 font-semibold">Step</th>
                <th className="w-56 px-3 py-2.5 font-semibold">Action</th>
                <th className="px-3 py-2.5 font-semibold">What to do / details</th>
                <th className="w-32 px-3 py-2.5 font-semibold">Who</th>
                <th className="w-40 px-3 py-2.5 font-semibold">When (BS)</th>
                <th className="w-40 px-2 py-2.5 font-semibold">Status</th>
                <th className="w-56 px-3 py-2.5 font-semibold">Remarks</th>
                <th className="w-32 px-3 py-2.5 font-semibold">Date done</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guide.steps.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-6 text-center text-sm text-slate-400">
                    No steps yet.
                  </td>
                </tr>
              ) : (
                guide.steps.map((s) => (
                  <tr key={s.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{s.no}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{s.action}</td>
                    <td className="px-3 py-2 text-slate-600">{s.details}</td>
                    <td className="px-3 py-2 text-slate-600">{s.who || '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{s.when || '—'}</td>
                    <td className="px-1 py-1">
                      {canWrite ? (
                        <SelectCell
                          value={s.status}
                          options={STEP_STATUSES}
                          onCommit={async (value) => updateGuideStep(s.id, { status: value })}
                          ariaLabel={`Status for step ${s.no}`}
                        />
                      ) : (
                        <Badge value={s.status} />
                      )}
                    </td>
                    <td className="px-1 py-1">
                      <TextCell
                        value={s.remarks}
                        onCommit={async (value) => updateGuideStep(s.id, { remarks: value })}
                        disabled={!canWrite}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-1 py-1">
                      <TextCell
                        value={s.dateDone}
                        onCommit={async (value) => updateGuideStep(s.id, { dateDone: value })}
                        disabled={!canWrite}
                        placeholder="2083-06-20"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      {canWrite ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              if (window.confirm('Delete this step?')) {
                                const res = await deleteGuideStep(s.id)
                                setError(res.ok ? null : (res.error ?? 'Delete failed'))
                              }
                            })
                          }
                          className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete step"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="Documents required"
            action={
              canWrite ? (
                <AddInline
                  label="Add document"
                  fields={[
                    { name: 'document', placeholder: 'Document / record', wide: true },
                    { name: 'notes', placeholder: 'Notes / where to get it', wide: true },
                    { name: 'source', placeholder: 'Source / prepared by' },
                  ]}
                  pending={pending}
                  onSubmit={(values) =>
                    startTransition(async () => {
                      const res = await addGuideDoc({ guideSlug: guide.slug, ...values })
                      setError(res.ok ? null : (res.error ?? 'Could not add document'))
                    })
                  }
                />
              ) : null
            }
          />
        </div>
        <ScrollArea orientation="horizontal">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="w-14 px-3 py-2.5 font-semibold">No.</th>
                <th className="w-72 px-3 py-2.5 font-semibold">Document / record</th>
                <th className="px-3 py-2.5 font-semibold">Notes / where to get it</th>
                <th className="w-44 px-3 py-2.5 font-semibold">Source / prepared by</th>
                <th className="w-56 px-3 py-2.5 font-semibold">File location / link</th>
                <th className="w-36 px-2 py-2.5 font-semibold">Ready?</th>
                <th className="w-56 px-3 py-2.5 font-semibold">Remarks</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guide.docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-6 text-center text-sm text-slate-400">
                    No documents listed yet.
                  </td>
                </tr>
              ) : (
                guide.docs.map((d) => (
                  <tr key={d.id} className="align-top hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{d.no}</td>
                    <td className="px-3 py-2 font-medium text-slate-900">{d.document}</td>
                    <td className="px-3 py-2 text-slate-600">{d.notes || '—'}</td>
                    <td className="px-3 py-2 text-slate-600">{d.source || '—'}</td>
                    <td className="px-1 py-1">
                      <TextCell
                        value={d.link}
                        onCommit={async (value) => updateGuideDoc(d.id, { link: value })}
                        disabled={!canWrite}
                        placeholder="https://"
                      />
                    </td>
                    <td className="px-1 py-1">
                      {canWrite ? (
                        <SelectCell
                          value={d.ready}
                          options={DOC_STATUSES}
                          onCommit={async (value) => updateGuideDoc(d.id, { ready: value })}
                          ariaLabel={`Ready status for ${d.document}`}
                        />
                      ) : (
                        <Badge value={d.ready} />
                      )}
                    </td>
                    <td className="px-1 py-1">
                      <TextCell
                        value={d.remarks}
                        onCommit={async (value) => updateGuideDoc(d.id, { remarks: value })}
                        disabled={!canWrite}
                        placeholder="—"
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      {canWrite ? (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              if (window.confirm('Delete this document row?')) {
                                const res = await deleteGuideDoc(d.id)
                                setError(res.ok ? null : (res.error ?? 'Delete failed'))
                              }
                            })
                          }
                          className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </Card>

      {guide.tips.length ? (
        <Card>
          <CardHeader title="Watch-outs & tips" />
          <ul className="space-y-2">
            {guide.tips.map((t) => (
              <li
                key={t.id}
                className="rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 text-sm text-amber-900"
              >
                {t.text}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] text-slate-400">
            Always confirm current-year forms, deadlines and fees with the relevant authority before
            submitting.
          </p>
        </Card>
      ) : null}
    </div>
  )
}

function AddInline({
  label,
  fields,
  onSubmit,
  pending,
}: {
  label: string
  fields: { name: string; placeholder: string; wide?: boolean }[]
  onSubmit: (values: Record<string, string>) => void
  pending: boolean
}) {
  const [open, setOpen] = useState(false)

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const values: Record<string, string> = {}
    for (const f of fields) values[f.name] = String(form.get(f.name) ?? '').trim()
    onSubmit(values)
    e.currentTarget.reset()
    setOpen(false)
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {label}
      </Button>
    )
  }

  return (
    <form
      onSubmit={submit}
      className="flex w-full flex-wrap items-end gap-2 rounded-lg border border-brand-600/20 bg-brand-50/50 p-3"
    >
      {fields.map((f) => (
        <label key={f.name} className={cn('block', f.wide ? 'min-w-64 flex-1' : 'w-44')}>
          <span className="mb-1 block text-[11px] text-slate-500">{f.placeholder}</span>
          <input name={f.name} className="field" placeholder={f.placeholder} required />
        </label>
      ))}
      <div className="flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          <Check className="h-4 w-4" /> Add
        </Button>
        <Button type="button" size="sm" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
