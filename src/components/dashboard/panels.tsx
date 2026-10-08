import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CircleDashed,
} from 'lucide-react'
import type { Dashboard } from '@/lib/queries'
import { BS_MONTHS, CALENDAR_KINDS } from '@/lib/constants'
import { fmtPct, npr, TIMING_LABEL } from '@/lib/calc'
import { Badge, Card, CardHeader, Progress } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'

const TIMING_ICONS = {
  complete: CheckCircle2,
  active: Clock3,
  upcoming: CircleDashed,
  attention: AlertTriangle,
} as const

export function KpiGrid({ data }: { data: Dashboard }) {
  const k = data.kpis
  const cards = [
    { label: 'Total tasks', value: k.total, hint: 'tracked for FY 2083/84', tone: 'slate' as const },
    {
      label: 'Completed',
      value: k.completed,
      hint: `${fmtPct(k.completedPct)} of all tasks`,
      tone: 'green' as const,
    },
    {
      label: 'In progress / submitted',
      value: k.inProgress,
      hint: 'being worked on',
      tone: 'blue' as const,
    },
    { label: 'Not started', value: k.notStarted, hint: 'yet to begin', tone: 'slate' as const },
    {
      label: 'Active this month',
      value: k.active,
      hint: 'in their window now',
      tone: 'teal' as const,
    },
    {
      label: 'Needs attention',
      value: k.attention,
      hint: 'past window, not complete',
      tone: k.attention ? ('rose' as const) : ('slate' as const),
    },
  ]
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className={cn(
            'rounded-xl border bg-white p-4 shadow-card',
            c.tone === 'rose' && c.value ? 'border-rose-300' : 'border-slate-200',
          )}
        >
          <div className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
            {c.label}
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums text-slate-900">{c.value}</div>
          <div className="mt-0.5 text-[11px] text-slate-500">{c.hint}</div>
        </div>
      ))}
    </div>
  )
}

export function ComplianceChain({ data }: { data: Dashboard }) {
  return (
    <Card>
      <CardHeader
        title="Compliance chain"
        subtitle="Each step feeds the next — statuses come from the Task Tracker"
      />
      <ol className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
        {data.chain.map((step, i) => {
          const Icon = TIMING_ICONS[step.timing]
          return (
            <li key={step.code} className="relative">
              <Link
                href="/tasks"
                className="flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50/60 p-3 transition hover:border-teal-200 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-slate-800">{step.name}</span>
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                </div>
                <span className="mt-1 text-[11px] text-slate-500">{step.window}</span>
                <span className="mt-2 self-start">
                  <Badge value={step.status} />
                </span>
              </Link>
              {i < data.chain.length - 1 ? (
                <ArrowRight className="absolute -right-2.5 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-300 xl:block" />
              ) : null}
            </li>
          )
        })}
      </ol>
    </Card>
  )
}

export function TdsStrip({ data }: { data: Dashboard }) {
  return (
    <Card>
      <CardHeader
        title="Monthly TDS strip"
        subtitle={`Staff salary + other TDS · ${data.tdsFiled} / 12 months deposited & filed`}
      />
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {data.tdsStrip.map((m) => {
          const kind =
            CALENDAR_KINDS[
              m.status === 'Deposited & Filed'
                ? 'followup'
                : m.status === 'Late'
                  ? 'deadline'
                  : m.status === 'Deposited'
                    ? 'submit'
                    : 'monitor'
            ]
          return (
            <div
              key={m.month}
              className="rounded-lg border px-1.5 py-2 text-center"
              style={{ background: kind.bg, borderColor: 'transparent' }}
            >
              <div className="text-[11px] font-semibold" style={{ color: kind.fg }}>
                {BS_MONTHS[m.month - 1].short}
              </div>
              <div className="mt-0.5 text-[9px] leading-tight" style={{ color: kind.fg }}>
                {m.status === 'Deposited & Filed' ? 'Filed' : m.status}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Figure label="Office rent paid" value={data.finance.rent} />
        <Figure label="Salaries paid (net)" value={data.finance.salaries} />
        <Figure label="Income (FY)" value={data.finance.income} />
        <Figure label="Expenses (FY)" value={data.finance.expenses} />
      </div>
    </Card>
  )
}

function Figure({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <div className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </div>
      <div className="mt-0.5 text-lg font-semibold tabular-nums text-slate-900">{npr(value)}</div>
    </div>
  )
}

export function BookkeepingStrip({ data }: { data: Dashboard }) {
  return (
    <Card>
      <CardHeader
        title="Monthly bookkeeping"
        subtitle={`${data.booked} / 12 months booked`}
      />
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
        {data.bookedStrip.map((m) => {
          const done = m.status === 'Completed'
          const running = m.status === 'In Progress'
          return (
            <div
              key={m.month}
              className={cn(
                'flex flex-col items-center rounded-lg border px-1 py-2',
                done
                  ? 'border-emerald-200 bg-emerald-50'
                  : running
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-slate-200 bg-slate-50',
              )}
            >
              <span className="text-[11px] font-semibold text-slate-600">
                {BS_MONTHS[m.month - 1].short}
              </span>
              <span
                className={cn(
                  'mt-0.5 text-sm',
                  done ? 'text-emerald-600' : running ? 'text-amber-600' : 'text-slate-400',
                )}
              >
                {done ? '●' : running ? '◐' : '○'}
              </span>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-500">
        Office rent is paid in the first week of each month; TDS must be deposited and e-TDS filed
        by the 25th of the following month.
      </p>
    </Card>
  )
}

export function ProgressByArea({ data }: { data: Dashboard }) {
  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <CardHeader
          title="Progress by area"
          subtitle="Status, timing and readiness — open a step guide for the detail"
        />
      </div>
      <div className="scroll-slim overflow-x-auto">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
              <th className="px-5 py-2.5 font-semibold">Area</th>
              <th className="px-3 py-2.5 font-semibold">Window</th>
              <th className="px-3 py-2.5 font-semibold">Tracker status</th>
              <th className="px-3 py-2.5 font-semibold">Timing</th>
              <th className="w-44 px-3 py-2.5 font-semibold">Steps done</th>
              <th className="w-44 px-3 py-2.5 font-semibold">Docs ready</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.progress.map((row) => {
              const timingIcon = TIMING_ICONS[row.timing]
              const TimingIcon = timingIcon
              return (
                <tr key={row.area} className="hover:bg-slate-50/70">
                  <td className="px-5 py-2.5">
                    {row.guideSlug ? (
                      <Link
                        href={`/guides/${row.guideSlug}`}
                        className="font-medium text-teal-700 hover:underline"
                      >
                        {row.area}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-800">{row.area}</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">{row.window}</td>
                  <td className="px-3 py-2.5">
                    <Badge value={row.status} />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs">
                      <TimingIcon className="h-3.5 w-3.5" />
                      {TIMING_LABEL[row.timing].replace(/^[✔●○⚠]\s*/, '')}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {row.guideSlug ? (
                      <Meter done={row.stepsDone} total={row.stepsTotal} />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    {row.guideSlug ? (
                      <Meter done={row.docsReady} total={row.docsTotal} tone="green" />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Meter({ done, total, tone }: { done: number; total: number; tone?: 'green' }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Progress value={total ? done / total : 0} tone={tone} />
      </div>
      <span className="w-16 text-right text-[11px] tabular-nums text-slate-500">
        {done}/{total}
      </span>
    </div>
  )
}

export function ThisMonthFocus({
  data,
  month,
}: {
  data: Dashboard
  month: number
}) {
  const monthMeta = BS_MONTHS.find((m) => m.n === month)
  return (
    <Card padded={false}>
      <div className="p-5 pb-0">
        <CardHeader
          title={`This month's focus — ${monthMeta?.name} (month ${month} of 12)`}
          subtitle="From the Annual Calendar"
        />
      </div>
      <div className="scroll-slim overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
              <th className="w-80 px-5 py-2.5 font-semibold">Area</th>
              <th className="px-5 py-2.5 font-semibold">What to do this month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.focus.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-2.5 align-top font-medium text-slate-800">{f.area}</td>
                <td
                  className={cn(
                    'px-5 py-2.5 align-top',
                    f.action === '—' ? 'text-slate-300' : 'text-slate-600',
                  )}
                >
                  {f.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
