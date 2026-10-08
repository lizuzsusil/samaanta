import { requirePermission } from '@/lib/auth'
import { readCurrentMonth } from '@/lib/month'
import { getDashboard } from '@/lib/queries'
import { PageHeader } from '@/components/ui/primitives'
import {
  ActivitiesChart,
  BookkeepingStrip,
  ComplianceChain,
  KpiGrid,
  ProgressByArea,
  StatusBreakdown,
  TdsStrip,
  ThisMonthFocus,
} from '@/components/dashboard/panels'

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

      <div className="grid gap-5 xl:grid-cols-2">
        <TdsStrip data={data} />
        <div className="grid gap-5">
          <StatusBreakdown data={data} />
          <ActivitiesChart data={data} month={month} />
        </div>
      </div>

      <BookkeepingStrip data={data} />
      <ProgressByArea data={data} />
      <ThisMonthFocus data={data} month={month} />

      <p className="text-[11px] text-slate-400">
        Data sources: Task Tracker (status & timing) · Annual Calendar (workload, focus) · step-guide
        sheets (steps done, docs ready) · Monthly Book-keeping (TDS & bookkeeping strips, rent,
        salaries, income &amp; expenses).
      </p>
    </div>
  )
}
