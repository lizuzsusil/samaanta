'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FolderOpen,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import type { Task } from '@/lib/queries'
import { PRIORITIES, TASK_STATUSES, TIMING_STYLES, BS_MONTHS } from '@/lib/constants'
import { TIMING_LABEL, timingOf } from '@/lib/calc'
import { cn } from '@/lib/cn'
import { Badge, Button, EmptyState, Notice } from '@/components/ui/primitives'
import { SelectCell, TextCell } from '@/components/ui/edit'
import { createTask, deleteTask, updateTask } from '@/lib/actions/tasks'

type Props = {
  tasks: Task[]
  month: number
  canWrite: boolean
}

export function TaskTracker({ tasks, month, canWrite }: Props) {
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('All')
  const [priority, setPriority] = useState('All')
  const [timing, setTiming] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return tasks.filter((t) => {
      const tTiming = TIMING_LABEL[timingOf(t, month)]
      if (
        needle &&
        !`${t.code} ${t.area} ${t.title} ${t.responsible}`.toLowerCase().includes(needle)
      )
        return false
      if (status !== 'All' && t.status !== status) return false
      if (priority !== 'All' && t.priority !== priority) return false
      if (timing !== 'All' && tTiming !== timing) return false
      return true
    })
  }, [tasks, q, status, priority, timing, month])

  const patch = (code: string, field: string) => async (value: string) => {
    const res = await updateTask(code, { [field]: value })
    setError(res.ok ? null : (res.error ?? 'Update failed'))
    return res
  }

  const filterSelect =
    'rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-600/10'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search code, area, task or owner"
            className={cn(filterSelect, 'w-full pl-8')}
          />
        </div>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className={filterSelect}>
          <option value="All">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className={filterSelect}
        >
          <option value="All">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select value={timing} onChange={(e) => setTiming(e.target.value)} className={filterSelect}>
          <option value="All">All timing</option>
          {Object.values(TIMING_LABEL).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>

        <span className="text-xs tabular-nums text-slate-500">
          {rows.length} of {tasks.length} tasks
        </span>

        {canWrite ? (
          <Button variant="primary" size="sm" onClick={() => setShowNew((v) => !v)}>
            <Plus className="h-4 w-4" />
            New task
          </Button>
        ) : null}
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}

      {showNew && canWrite ? (
        <NewTaskForm
          onCancel={() => setShowNew(false)}
          onSubmit={(value) =>
            startTransition(async () => {
              const res = await createTask(value)
              if (res.ok) setShowNew(false)
              setError(res.error ?? null)
            })
          }
          pending={pending}
        />
      ) : null}

      <div className="scroll-slim overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-card">
        <table className="w-full min-w-[1500px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
              <Th>ID</Th>
              <Th>Area</Th>
              <Th className="w-72">Compliance / task</Th>
              <Th>Frequency</Th>
              <Th>Working window (BS)</Th>
              <Th>Priority</Th>
              <Th>Responsible</Th>
              <Th>Status</Th>
              <Th>Timing (auto)</Th>
              <Th>Date started</Th>
              <Th>Date submitted</Th>
              <Th>Date completed</Th>
              <Th>Next follow-up</Th>
              <Th>Guide</Th>
              <Th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={15} className="p-6">
                  <EmptyState title="No tasks match these filters" hint="Adjust the search or filters above." />
                </td>
              </tr>
            ) : (
              rows.map((t) => {
                const tTiming = TIMING_LABEL[timingOf(t, month)]
                const timingKey = timingOf(t, month)
                const open = expanded === t.code
                return (
                  <TaskRows
                    key={t.code}
                    task={t}
                    open={open}
                    canWrite={canWrite}
                    timingLabel={tTiming}
                    timingKey={timingKey}
                    onToggle={() => setExpanded(open ? null : t.code)}
                    onPatch={patch}
                    onDelete={(code) =>
                      startTransition(async () => {
                        if (!window.confirm(`Delete task ${code}? This cannot be undone.`)) return
                        const res = await deleteTask(code)
                        if (!res.ok) setError(res.error ?? 'Delete failed')
                      })
                    }
                    pending={pending}
                  />
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-slate-400">
        Timing is derived from the month selected in the top bar · click any field to edit ·
        expand a row for documents, notes and folder links.
      </p>
    </div>
  )
}

function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <th className={cn('px-3 py-2.5 font-semibold whitespace-nowrap', className)}>{children}</th>
}

function TaskRows({
  task,
  open,
  canWrite,
  timingLabel,
  timingKey,
  onToggle,
  onPatch,
  onDelete,
  pending,
}: {
  task: Task
  open: boolean
  canWrite: boolean
  timingLabel: string
  timingKey: string
  onToggle: () => void
  onPatch: (code: string, field: string) => (value: string) => Promise<{ ok: boolean; error?: string }>
  onDelete: (code: string) => void
  pending: boolean
}) {
  return (
    <>
      <tr className={cn('align-top hover:bg-slate-50/70', open && 'bg-teal-50/40')}>
        <td className="px-3 py-2 font-mono text-xs font-medium text-slate-500">{task.code}</td>
        <td className="px-3 py-2 whitespace-nowrap text-slate-600">{task.area}</td>
        <td className="px-3 py-2 font-medium text-slate-900">{task.title}</td>
        <td className="px-3 py-2 whitespace-nowrap text-slate-600">{task.frequency}</td>
        <td className="px-3 py-2 whitespace-nowrap text-slate-600">{task.window}</td>
        <td className="px-1 py-1 whitespace-nowrap">
          {canWrite ? (
            <SelectCell
              value={task.priority}
              options={PRIORITIES}
              onCommit={onPatch(task.code, 'priority')}
              ariaLabel={`Priority for ${task.code}`}
            />
          ) : (
            <Badge value={task.priority} />
          )}
        </td>
        <td className="px-3 py-2 whitespace-nowrap text-slate-600">{task.responsible}</td>
        <td className="px-1 py-1 whitespace-nowrap">
          {canWrite ? (
            <SelectCell
              value={task.status}
              options={TASK_STATUSES}
              onCommit={onPatch(task.code, 'status')}
              ariaLabel={`Status for ${task.code}`}
            />
          ) : (
            <Badge value={task.status} />
          )}
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          <span className={cn('text-xs font-medium', TIMING_STYLES[timingKey])}>
            {timingLabel}
          </span>
        </td>
        <td className="w-32 px-1 py-1">
          <TextCell
            value={task.dateStarted}
            onCommit={onPatch(task.code, 'dateStarted')}
            disabled={!canWrite}
            placeholder="2083-06-15"
          />
        </td>
        <td className="w-32 px-1 py-1">
          <TextCell
            value={task.dateSubmitted}
            onCommit={onPatch(task.code, 'dateSubmitted')}
            disabled={!canWrite}
          />
        </td>
        <td className="w-32 px-1 py-1">
          <TextCell
            value={task.dateCompleted}
            onCommit={onPatch(task.code, 'dateCompleted')}
            disabled={!canWrite}
          />
        </td>
        <td className="w-32 px-1 py-1">
          <TextCell
            value={task.nextFollowup}
            onCommit={onPatch(task.code, 'nextFollowup')}
            disabled={!canWrite}
          />
        </td>
        <td className="px-3 py-2 whitespace-nowrap">
          {task.guideSlug ? (
            <Link
              href={`/guides/${task.guideSlug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:underline"
            >
              Open guide <ExternalLink className="h-3 w-3" />
            </Link>
          ) : (
            <span className="text-xs text-slate-300">—</span>
          )}
        </td>
        <td className="px-1 py-2 text-center">
          <button
            type="button"
            onClick={onToggle}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={open ? 'Collapse row' : 'Expand row'}
            aria-expanded={open}
          >
            {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </td>
      </tr>

      {open ? (
        <tr className="bg-slate-50/80">
          <td colSpan={15} className="px-5 py-4">
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Key documents
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">
                  {task.documents || '—'}
                </p>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Notes
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{task.notes || '—'}</p>
                <div className="mt-3 grid gap-2">
                  <Labeled label="Submit to / method">
                    <TextCell
                      value={task.submitTo}
                      onCommit={onPatch(task.code, 'submitTo')}
                      disabled={!canWrite}
                    />
                  </Labeled>
                  <Labeled label="Responsible">
                    <TextCell
                      value={task.responsible}
                      onCommit={onPatch(task.code, 'responsible')}
                      disabled={!canWrite}
                    />
                  </Labeled>
                  <Labeled label="Working window (BS)">
                    <TextCell
                      value={task.window}
                      onCommit={onPatch(task.code, 'window')}
                      disabled={!canWrite}
                    />
                  </Labeled>
                </div>
              </div>
              <div>
                <h4 className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  Folder
                </h4>
                {/^https:\/\//.test(task.dropbox) ? (
                  <a
                    href={task.dropbox}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-teal-700 hover:underline"
                  >
                    <FolderOpen className="h-4 w-4" /> Open Dropbox folder
                  </a>
                ) : (
                  <p className="mt-1.5 text-sm text-slate-500">
                    {task.dropbox || 'Add the folder link in Start Here §9.'}
                  </p>
                )}
                {canWrite ? (
                  <div className="mt-4">
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={pending}
                      onClick={() => onDelete(task.code)}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete task
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-slate-500">{label}</span>
      {children}
    </label>
  )
}

function NewTaskForm({
  onSubmit,
  onCancel,
  pending,
}: {
  onSubmit: (value: Record<string, unknown>) => void
  onCancel: () => void
  pending: boolean
}) {
  const [form, setForm] = useState({
    code: 'T14',
    title: '',
    area: '',
    frequency: 'Annual',
    responsible: 'PO',
    priority: 'Medium',
    status: 'Not Started',
    fromMo: 1,
    toMo: 12,
  })

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({
      ...f,
      [key]: key === 'fromMo' || key === 'toMo' ? Number(e.target.value) : e.target.value,
    }))

  const field = 'field'

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(form)
      }}
      className="rounded-xl border border-teal-600/20 bg-teal-50/50 p-4"
    >
      <h3 className="mb-3 text-sm font-semibold text-slate-800">New compliance task</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">ID</span>
          <input className={field} value={form.code} onChange={set('code')} required />
        </label>
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] text-slate-500">Compliance / task</span>
          <input className={field} value={form.title} onChange={set('title')} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">Area</span>
          <input className={field} value={form.area} onChange={set('area')} required />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">Frequency</span>
          <input className={field} value={form.frequency} onChange={set('frequency')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">Responsible</span>
          <input className={field} value={form.responsible} onChange={set('responsible')} />
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">Priority</span>
          <select className={field} value={form.priority} onChange={set('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">Status</span>
          <select className={field} value={form.status} onChange={set('status')}>
            {TASK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">From month</span>
          <select className={field} value={form.fromMo} onChange={set('fromMo')}>
            {BS_MONTHS.map((m) => (
              <option key={m.n} value={m.n}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-[11px] text-slate-500">To month</span>
          <select className={field} value={form.toMo} onChange={set('toMo')}>
            {BS_MONTHS.map((m) => (
              <option key={m.n} value={m.n}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex gap-2">
        <Button type="submit" variant="primary" size="sm" disabled={pending}>
          Add task
        </Button>
        <Button type="button" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
