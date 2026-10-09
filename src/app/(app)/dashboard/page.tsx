import Link from 'next/link'
import { ArrowUpRight, CalendarDays, ListChecks, Wallet } from 'lucide-react'
import { requirePermission } from '@/lib/auth'
import { readCurrentMonth } from '@/lib/month'
import { getDashboard } from '@/lib/queries'
import { BS_MONTHS } from '@/lib/constants'
import { Progress } from '@/components/ui/primitives'
import {
  BookkeepingStrip,
  ComplianceChain,
  KpiGrid,
  ProgressByArea,
  TdsStrip,
  ThisMonthFocus,
} from '@/components/dashboard/panels'
import { SectionNav } from '@/components/dashboard/SectionNav'
import {
  CalendarHeatmap,
  DueCurve,
  GuideReadiness,
  MoneyChart,
  StatusDonut,
  WorkloadChart,
} from '@/components/dashboard/charts'

export const metadata = { title: 'Dashboard' }

const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'workload', label: 'Workload' },
  { id: 'money', label: 'Money & dues' },
  { id: 'calendar', label: 'Year calendar' },
  { id: 'guides', label: 'Guides' },
]

function SectionHead({
  index,
  eyebrow,
  title,
  lede,
}: {
  index: string
  eyebrow: string
  title: string
  lede?: string
}) {
  return (
    <div className="mb-5 flex items-start gap-3.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-stone-900 font-mono text-[12px] font-bold text-white shadow-md">
        {index}
      </span>
      <div className="max-w-3xl">
        <div className="text-[10px] font-bold tracking-[0.22em] text-brand-700 uppercase">
          {eyebrow}
        </div>
        <h2 className="font-display mt-0.5 text-[24px] leading-tight font-semibold tracking-tight text-stone-900">
          {title}
        </h2>
        {lede ? <p className="mt-1 text-sm leading-relaxed text-stone-500">{lede}</p> : null}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  await requirePermission('dashboard', 'read')
  const month = await readCurrentMonth()
  const data = await getDashboard(month)

  const workload = data.workload.map((r) => ({
    ...r,
    label: BS_MONTHS[r.month - 1].short,
  }))
  const money = data.moneyMonthly.map((r) => ({
    ...r,
    label: BS_MONTHS[r.month - 1].short,
  }))
  const readiness = data.progress
    .filter((p) => p.guideSlug)
    .map((p) => {
      const stepsPct = p.stepsTotal ? p.stepsDone / p.stepsTotal : 0
      const docsPct = p.docsTotal ? p.docsReady / p.docsTotal : 0
      return {
        area: p.area,
        slug: p.guideSlug as string,
        stepsDone: p.stepsDone,
        stepsTotal: p.stepsTotal,
        docsReady: p.docsReady,
        docsTotal: p.docsTotal,
        avg: (stepsPct + docsPct) / 2,
      }
    })
    .sort((a, b) => a.avg - b.avg)
    .map((r) => ({
      area: r.area,
      slug: r.slug,
      stepsDone: r.stepsDone,
      stepsTotal: r.stepsTotal,
      docsReady: r.docsReady,
      docsTotal: r.docsTotal,
    }))

  const monthMeta = BS_MONTHS[month - 1]
  const pct = data.kpis.total ? data.kpis.completed / data.kpis.total : 0

  const quick = [
    { href: '/calendar', label: 'Annual Calendar', icon: CalendarDays },
    { href: '/tasks', label: 'Task Tracker', icon: ListChecks },
    { href: '/bookkeeping', label: 'Book-keeping', icon: Wallet },
  ]

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="rise relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#221b1b] via-[#3a2a2a] to-brand-800 p-6 text-white shadow-pop sm:p-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(520px 220px at 12% -20%, rgba(236,52,54,0.35), transparent 65%), radial-gradient(420px 200px at 95% 10%, rgba(201,155,63,0.35), transparent 65%), radial-gradient(600px 300px at 50% 120%, rgba(255,255,255,0.08), transparent 60%)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(70% 90% at 30% 0%, black, transparent)',
          }}
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold tracking-[0.22em] uppercase">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-brand-100 ring-1 ring-white/15">
                FY 2083/84 · 2026/27
              </span>
              <span className="rounded-full bg-amber-300/15 px-2.5 py-1 text-amber-200 ring-1 ring-amber-200/25">
                {monthMeta.name} · month {month} of 12
              </span>
            </div>
            <h1 className="font-display mt-3 text-[30px] leading-[1.05] font-semibold tracking-tight text-balance sm:text-[38px]">
              Samaanta compliance, at a glance.
            </h1>
            <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-white/70">
              Administrative, Governance &amp; Legal Compliance Dashboard · Shrawan 2083 – Asadh
              2084 · Handover edition. Every figure is live.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {quick.map((q) => {
                const Icon = q.icon
                return (
                  <Link
                    key={q.href}
                    href={q.href}
                    className="group inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-[13px] font-semibold text-white ring-1 ring-white/15 backdrop-blur transition hover:bg-white hover:text-stone-900"
                  >
                    <Icon className="h-4 w-4 opacity-80" />
                    {q.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="w-full max-w-xs rounded-2xl bg-white/[0.08] p-4 ring-1 ring-white/15 backdrop-blur">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-bold tracking-[0.16em] text-white/60 uppercase">
                FY completion
              </span>
              <span className="text-2xl font-bold tabular-nums">
                {Math.round(pct * 100)}
                <span className="text-sm text-white/60">%</span>
              </span>
            </div>
            <div className="mt-2.5">
              <Progress value={pct} tone="green" />
            </div>
            <div className="mt-2.5 flex justify-between text-[11px] font-medium text-white/60 tabular-nums">
              <span>{data.kpis.completed} done</span>
              <span>{data.kpis.total} total</span>
              <span className={data.kpis.attention ? 'font-bold text-rose-300' : ''}>
                {data.kpis.attention} overdue
              </span>
            </div>
          </div>
        </div>
      </div>

      <SectionNav sections={SECTIONS} />

      <section id="overview" className="scroll-mt-36 space-y-6">
        <SectionHead
          index="01"
          eyebrow="Overview"
          title="Are we on track?"
          lede="Every figure below is live — edit the Task Tracker, Calendar or Book-keeping and this page follows."
        />
        <KpiGrid data={data} />
        <ComplianceChain data={data} />
      </section>

      <section id="workload" className="scroll-mt-36 space-y-6">
        <SectionHead
          index="02"
          eyebrow="Workload"
          title="When the year gets busy"
          lede="Scheduled actions against tasks sitting inside their window, plus the status mix."
        />
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <WorkloadChart rows={workload} month={month} />
          </div>
          <StatusDonut slices={data.statusBreakdown} total={data.kpis.total} />
        </div>
      </section>

      <section id="money" className="scroll-mt-36 space-y-6">
        <SectionHead
          index="03"
          eyebrow="Money & dues"
          title="Completion plan and cash flow"
          lede="What falls due, when — and money movement as booked each month."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <DueCurve
            curve={data.dueCurve}
            total={data.kpis.total}
            completed={data.kpis.completed}
            month={month}
          />
          <MoneyChart rows={money} month={month} />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          <TdsStrip data={data} />
          <BookkeepingStrip data={data} />
        </div>
      </section>

      <section id="calendar" className="scroll-mt-36 space-y-6">
        <SectionHead
          index="04"
          eyebrow="Year calendar"
          title="The whole fiscal year on one page"
          lede="The Annual Calendar's colours, compressed — hover any cell for the full action."
        />
        <CalendarHeatmap rows={data.heatmap} month={month} />
      </section>

      <section id="guides" className="scroll-mt-36 space-y-6">
        <SectionHead
          index="05"
          eyebrow="Guides"
          title="What needs pushing"
          lede="Readiness per step guide, this month's actions, and the full area table."
        />
        <div className="grid gap-5 xl:grid-cols-2">
          <GuideReadiness rows={readiness} />
          <ThisMonthFocus data={data} month={month} />
        </div>
        <ProgressByArea data={data} />
      </section>

      <p className="rounded-2xl border border-stone-200/70 bg-white/60 px-4 py-3 text-[11px] leading-relaxed text-stone-400">
        Data sources: Task Tracker (status, windows &amp; timing) · Annual Calendar (workload,
        heatmap, focus) · step-guide sheets (readiness) · Monthly Book-keeping (TDS &amp;
        bookkeeping strips, money chart, rent, salaries, income &amp; expenses). Hover any chart for
        exact values.
      </p>
    </div>
  )
}
