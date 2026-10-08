import 'server-only'
import { prisma } from './db'
import { CHAIN_LABELS, CHAIN_TASK_CODES, PROGRESS_AREAS } from './constants'
import { computeKpis, pct, timingOf, TIMING_LABEL, type Timing } from './calc'

export type Task = Awaited<ReturnType<typeof getTasks>>[number]

export async function getTasks() {
  return prisma.task.findMany({ orderBy: { code: 'asc' } })
}

export async function getTask(code: string) {
  return prisma.task.findUnique({ where: { code } })
}

export async function getGuides() {
  return prisma.guide.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { steps: true, docs: true, tips: { orderBy: { sort: 'asc' } } },
  })
}

export async function getGuide(slug: string) {
  return prisma.guide.findUnique({
    where: { slug },
    include: {
      steps: { orderBy: { sort: 'asc' } },
      docs: { orderBy: { sort: 'asc' } },
      tips: { orderBy: { sort: 'asc' } },
    },
  })
}

export async function getCalendar() {
  const activities = await prisma.calendarActivity.findMany({
    orderBy: { sort: 'asc' },
    include: { cells: true },
  })
  return activities.map((a) => ({
    ...a,
    byMonth: Object.fromEntries(a.cells.map((c) => [c.month, c])),
  }))
}

export async function getMonthlyRecords() {
  return prisma.monthlyRecord.findMany({ orderBy: { month: 'asc' } })
}

export async function getStaff() {
  const staff = await prisma.staff.findMany({
    orderBy: { sort: 'asc' },
    include: { salaries: true },
  })
  return staff.map((s) => ({
    ...s,
    byMonth: Object.fromEntries(s.salaries.map((x) => [x.month, x.amount])),
  }))
}

export async function getStartHere() {
  const [content, contacts, handover, dropbox] = await Promise.all([
    prisma.contentItem.findMany({ orderBy: { sort: 'asc' } }),
    prisma.contact.findMany({ orderBy: { sort: 'asc' } }),
    prisma.handoverItem.findMany({ orderBy: { sort: 'asc' } }),
    prisma.dropboxFolder.findMany({ orderBy: { sort: 'asc' } }),
  ])
  const sections: Record<string, { key: string; label: string; value: string }[]> = {}
  for (const c of content) {
    ;(sections[c.section] ??= []).push({ key: c.key, label: c.label, value: c.value })
  }
  return { sections, contacts, handover, dropbox }
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: { id: true, email: true, name: true, role: true, title: true, active: true, createdAt: true },
  })
}

export async function getAuditLogs(limit = 200) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  })
}

export type ProgressRow = {
  area: string
  taskCode: string
  guideSlug: string | null
  window: string
  status: string
  timing: Timing
  stepsDone: number
  stepsTotal: number
  docsReady: number
  docsTotal: number
}

export async function getDashboard(month: number) {
  const [tasks, records, staff, calendar, guides] = await Promise.all([
    getTasks(),
    getMonthlyRecords(),
    getStaff(),
    getCalendar(),
    prisma.guide.findMany({ include: { steps: true, docs: true } }),
  ])

  const kpis = computeKpis(tasks, month)
  const taskByCode = Object.fromEntries(tasks.map((t) => [t.code, t]))
  const guideBySlug = Object.fromEntries(guides.map((g) => [g.slug, g]))

  const chain = CHAIN_TASK_CODES.map((code) => {
    const task = taskByCode[code]
    if (!task) return null
    return { code, name: CHAIN_LABELS[code] ?? task.title, window: task.window, status: task.status, timing: timingOf(task, month) }
  }).filter(Boolean) as { code: string; name: string; window: string; status: string; timing: Timing }[]

  const progress: ProgressRow[] = PROGRESS_AREAS.map(({ area, taskCode, guideSlug }) => {
    const task = taskByCode[taskCode]
    const guide = guideSlug ? guideBySlug[guideSlug] : null
    const stepsDone = guide ? guide.steps.filter((s) => s.status === 'Done').length : 0
    const docsReady = guide ? guide.docs.filter((d) => d.ready === 'Yes').length : 0
    return {
      area,
      taskCode,
      guideSlug,
      window: task?.window ?? '—',
      status: task?.status ?? '—',
      timing: task ? timingOf(task, month) : 'upcoming',
      stepsDone,
      stepsTotal: guide ? guide.steps.length : 0,
      docsReady,
      docsTotal: guide ? guide.docs.length : 0,
    }
  })

  const focus = calendar.map((a) => ({
    id: a.id,
    area: a.label,
    action: a.byMonth[month]?.text ?? '—',
  }))

  const activitiesPerMonth = Array.from({ length: 12 }, (_, i) =>
    calendar.reduce((sum, a) => sum + (a.byMonth[i + 1] ? 1 : 0), 0),
  )

  const statusCounts = {
    Completed: kpis.statusCounts.Completed,
    Submitted: kpis.statusCounts.Submitted,
    'In Progress': kpis.statusCounts['In Progress'],
    'Not Started': kpis.statusCounts['Not Started'],
    'On Hold': kpis.statusCounts['On Hold'],
  }
  const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    pct: pct(count, kpis.total),
  }))

  const tdsStrip = records.map((r) => ({ month: r.month, status: r.tdsStatus }))
  const bookedStrip = records.map((r) => ({ month: r.month, status: r.bookStatus }))
  const tdsFiled = records.filter((r) => r.tdsStatus === 'Deposited & Filed').length
  const booked = records.filter((r) => r.bookStatus === 'Completed').length

  const finance = {
    rent: records.reduce((s, r) => s + r.rentAmount, 0),
    salaries: staff.reduce(
      (s, x) => s + Object.values(x.byMonth).reduce((a, b) => a + b, 0),
      0,
    ),
    income: records.reduce((s, r) => s + r.income, 0),
    expenses: records.reduce((s, r) => s + r.expenses, 0),
  }

  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  /** Workload per payment month: scheduled calendar actions + tasks inside their window. */
  const workload = months.map((m) => ({
    month: m,
    activities: calendar.reduce((sum, a) => sum + (a.byMonth[m] ? 1 : 0), 0),
    activeTasks: tasks.filter((t) => t.fromMo <= m && m <= t.toMo).length,
  }))

  /** Cumulative tasks due (window end) by month — the FY completion plan. */
  const dueCurve = months.map((m) => tasks.filter((t) => t.toMo <= m).length)

  /** Money movement per month for the finance chart. */
  const salaryByMonth: Record<number, number> = {}
  for (const s of staff) {
    for (const [m, amount] of Object.entries(s.byMonth)) {
      salaryByMonth[Number(m)] = (salaryByMonth[Number(m)] ?? 0) + (amount ?? 0)
    }
  }
  const recordByMonth = Object.fromEntries(records.map((r) => [r.month, r]))
  const moneyMonthly = months.map((m) => ({
    month: m,
    income: recordByMonth[m]?.income ?? 0,
    expenses: recordByMonth[m]?.expenses ?? 0,
    salaries: salaryByMonth[m] ?? 0,
    rent: recordByMonth[m]?.rentAmount ?? 0,
  }))

  /** Annual-calendar heatmap: kind + text per activity per month. */
  const heatmap = calendar.map((a) => ({
    id: a.id,
    section: a.section,
    label: a.label,
    cells: months.map((m) => ({
      kind: a.byMonth[m]?.kind ?? null as string | null,
      text: a.byMonth[m]?.text ?? '',
    })),
  }))

  return {
    tasks,
    kpis,
    chain,
    progress,
    focus,
    activitiesPerMonth,
    statusBreakdown,
    tdsStrip,
    bookedStrip,
    tdsFiled,
    booked,
    finance,
    workload,
    dueCurve,
    moneyMonthly,
    heatmap,
    taskTiming: (t: Task) => TIMING_LABEL[timingOf(t, month)],
  }
}

export async function getPermissionSummary() {
  const rows = await prisma.permission.findMany()
  return rows
}

export type Dashboard = Awaited<ReturnType<typeof getDashboard>>
export type PermissionRow = Awaited<ReturnType<typeof getPermissionSummary>>
