import { BS_MONTHS } from './constants'

export type TaskLike = {
  code: string
  fromMo: number
  toMo: number
  status: string
  area: string
  title: string
}

export type Timing = 'complete' | 'active' | 'upcoming' | 'attention'

export const TIMING_LABEL: Record<Timing, string> = {
  complete: '✔ Complete',
  active: '● Active now',
  upcoming: '○ Upcoming',
  attention: '⚠ Past window',
}

export function monthName(n: number) {
  return BS_MONTHS.find((m) => m.n === n)?.name ?? ''
}

export function monthShort(n: number) {
  return BS_MONTHS.find((m) => m.n === n)?.short ?? ''
}

/** Timing flag used across the dashboard and tracker. */
export function timingOf(task: TaskLike, currentMonth: number): Timing {
  if (task.status === 'Completed') return 'complete'
  if (currentMonth >= task.fromMo && currentMonth <= task.toMo) return 'active'
  if (currentMonth > task.toMo) return 'attention'
  return 'upcoming'
}

export function computeKpis(tasks: TaskLike[], currentMonth: number) {
  const total = tasks.length
  const byStatus = (s: string) => tasks.filter((t) => t.status === s).length
  const completed = byStatus('Completed')
  const inProgress = byStatus('In Progress') + byStatus('Submitted')
  const notStarted = byStatus('Not Started')
  const active = tasks.filter(
    (t) => t.status !== 'Completed' && currentMonth >= t.fromMo && currentMonth <= t.toMo,
  ).length
  const attention = tasks.filter(
    (t) => t.status !== 'Completed' && currentMonth > t.toMo,
  ).length
  return {
    total,
    completed,
    inProgress,
    notStarted,
    active,
    attention,
    completedPct: total ? completed / total : 0,
    statusCounts: {
      Completed: completed,
      Submitted: byStatus('Submitted'),
      'In Progress': byStatus('In Progress'),
      'Not Started': notStarted,
      'On Hold': byStatus('On Hold'),
    },
  }
}

export function pct(done: number, total: number) {
  return total ? done / total : 0
}

export function fmtPct(v: number) {
  return `${Math.round(v * 100)}%`
}

export function npr(v: number) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(v || 0)
}

/** Statutory SST rate applied to salaries. */
export const SST_RATE = 0.01

/** SST: net pay grossed up by the rate. */
export function grossFromNet(net: number, rate = 0.01) {
  if (!net) return 0
  return net / (1 - rate)
}
