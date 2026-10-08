import { requirePermission } from '@/lib/auth'
import { readCurrentMonth } from '@/lib/month'
import { getDashboard } from '@/lib/queries'
import { BS_MONTHS } from '@/lib/constants'
import { PageHeader } from '@/components/ui/primitives'
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
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string
  title: string
  lede?: string
}) {
  return (
    <div className="mb-5 max-w-3xl">
      <div className="text-[11px] font-semibold tracking-[0.2em] text-teal-800 uppercase">
        {eyebrow}
      </div>
      <h2 className="font-display mt-1 text-[22px] font-semibold text-slate-900">{title}</h2>
      {lede ? <p className="mt-1 text-sm leading-relaxed text-slate-500">{lede}</p> : null}
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="Samaanta Development Foundation"
        subtitle="Administrative, Governance & Legal Compliance Dashboard · Fiscal Year 2083/84 (2026/27) · Shrawan 2083 – Asadh 2084 · Handover edition"
      />

      <SectionNav sections={SECTIONS} />

      <section id="overview" className="scroll-mt-32 space-y-6">
        <SectionHead
          eyebrow="Overview"
          title="Are we on track?"
          lede="Every figure below is live — edit the Task Tracker, Calendar or Book-keeping and this page follows."
        />
        <KpiGrid data={data} />
        <ComplianceChain data={data} />
      </section>

      <section id="workload" className="scroll-mt-32 space-y-6">
        <SectionHead
          eyebrow="Workload"
          title="When the year gets busy"
          lede="Scheduled actions against tasks sitting inside their window, plus the status mix."
        />
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <WorkloadChart rows={workload} month={month} />
          </div>
          <StatusDonut slices={data.statusBreakdown} total={data.kpis.total} />
        </div>
      </section>

      <section id="money" className="scroll-mt-32 space-y-6">
        <SectionHead
          eyebrow="Money & dues"
          title="Completion plan and cash flow"
          lede="What falls due, when — and money movement as booked each month."
        />
        <div className="grid gap-6 xl:grid-cols-2">
          <DueCurve
            curve={data.dueCurve}
            total={data.kpis.total}
            completed={data.kpis.completed}
            month={month}
          />
          <MoneyChart rows={money} month={month} />
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <TdsStrip data={data} />
          <BookkeepingStrip data={data} />
        </div>
      </section>

      <section id="calendar" className="scroll-mt-32 space-y-6">
        <SectionHead
          eyebrow="Year calendar"
          title="The whole fiscal year on one page"
          lede="The Annual Calendar's colours, compressed — hover any cell for the full action."
        />
        <CalendarHeatmap rows={data.heatmap} month={month} />
      </section>

      <section id="guides" className="scroll-mt-32 space-y-6">
        <SectionHead
          eyebrow="Guides"
          title="What needs pushing"
          lede="Readiness per step guide, this month's actions, and the full area table."
        />
        <div className="grid gap-6 xl:grid-cols-2">
          <GuideReadiness rows={readiness} />
          <ThisMonthFocus data={data} month={month} />
        </div>
        <ProgressByArea data={data} />
      </section>

      <p className="text-[11px] leading-relaxed text-slate-400">
        Data sources: Task Tracker (status, windows & timing) · Annual Calendar (workload, heatmap,
        focus) · step-guide sheets (readiness) · Monthly Book-keeping (TDS & bookkeeping strips,
        money chart, rent, salaries, income &amp; expenses). Hover any chart for exact values.
      </p>
    </div>
  )
}
