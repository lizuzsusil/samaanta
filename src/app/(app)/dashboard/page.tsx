import { requirePermission } from '@/lib/auth'
import { readCurrentMonth } from '@/lib/month'
import { getDashboard } from '@/lib/queries'
import { PageHeader } from '@/components/ui/primitives'
import {
  BookkeepingStrip,
  ComplianceChain,
  KpiGrid,
  ProgressByArea,
  StatusBreakdown,
  TdsStrip,
  ThisMonthFocus,
} from '@/components/dashboard/panels'
import {
  CalendarHeatmap,
  DueCurve,
  GuideReadiness,
  MoneyChart,
  WorkloadChart,
} from '@/components/dashboard/charts'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  await requirePermission('dashboard', 'read')
  const month = await readCurrentMonth()
  const data = await getDashboard(month)

  return (
    <div className="space-y-5">
      <PageHeader
        title="Samaanta Development Foundation"
        subtitle="Administrative, Governance & Legal Compliance Dashboard · Fiscal Year 2083/84 (2026/27) · Shrawan 2083 – Asadh 2084 · Handover edition"
      />

      <KpiGrid data={data} />
      <ComplianceChain data={data} />

      <div className="grid gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <WorkloadChart data={data} month={month} />
        </div>
        <StatusBreakdown data={data} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <DueCurve data={data} month={month} />
        <MoneyChart data={data} month={month} />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <TdsStrip data={data} />
        <BookkeepingStrip data={data} />
      </div>

      <CalendarHeatmap data={data} month={month} />

      <div className="grid gap-5 xl:grid-cols-2">
        <GuideReadiness data={data} />
        <ThisMonthFocus data={data} month={month} />
      </div>

      <ProgressByArea data={data} />

      <p className="text-[11px] text-slate-400">
        Data sources: Task Tracker (status, windows & timing) · Annual Calendar (workload, heatmap,
        focus) · step-guide sheets (readiness) · Monthly Book-keeping (TDS & bookkeeping strips,
        money chart, rent, salaries, income &amp; expenses). Hover any chart element for exact
        values.
      </p>
    </div>
  )
}
