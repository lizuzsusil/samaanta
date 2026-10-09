import Link from 'next/link'
import {
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  CircleDashed,
  Layers,
  CircleCheck,
  Loader,
  Circle,
  Zap,
  Siren,
} from 'lucide-react'
import type { Dashboard } from '@/lib/queries'
import { BS_MONTHS, CALENDAR_KINDS } from '@/lib/constants'
import { fmtPct, npr, TIMING_LABEL } from '@/lib/calc'
import { Badge, Card, CardHeader, Progress } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'
import { ScrollArea } from '@/components/ui/scroll-area'

const TIMING_ICONS = {
  complete: CheckCircle2,
  active: Clock3,
  upcoming: CircleDashed,
  attention: AlertTriangle,
} as const

export function KpiGrid({ data }: { data: Dashboard }) {
  const k = data.kpis
  const cards = [
    { label: 'Total tasks', value: k.total, hint: 'tracked FY 2083/84', tone: 'slate' as const, icon: Layers, bar: 'bg-stone-300' },
    {
      label: 'Completed',
      value: k.completed,
      hint: `${fmtPct(k.completedPct)} of all tasks`,
      tone: 'green' as const,
      icon: CircleCheck,
      bar: 'bg-emerald-500',
    },
    {
      label: 'In progress',
      value: k.inProgress,
      hint: 'being worked on',
      tone: 'blue' as const,
      icon: Loader,
      bar: 'bg-sky-500',
    },
    { label: 'Not started', value: k.notStarted, hint: 'yet to begin', tone: 'slate' as const, icon: Circle, bar: 'bg-stone-300' },
    {
      label: 'Active now',
      value: k.active,
      hint: 'in window this month',
      tone: 'teal' as const,
      icon: Zap,
      bar: 'bg-teal-600',
    },
    {
      label: 'Needs attention',
      value: k.attention,
      hint: 'past window, open',
      tone: k.attention ? ('rose' as const) : ('slate' as const),
      icon: Siren,
      bar: k.attention ? 'bg-rose-500' : 'bg-stone-300',
    },
  ]
  const iconBg = {
    slate: 'bg-stone-100 text-stone-500',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-sky-100 text-sky-700',
    rose: 'bg-rose-100 text-rose-600',
    teal: 'bg-teal-700 text-white',
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c, i) => {
        const Icon = c.icon
        const alert = c.tone === 'rose' && c.value > 0
        return (
          <div
            key={c.label}
            className={cn(
              'rise group relative overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-pop',
              alert ? 'border-rose-300 ring-1 ring-rose-200' : 'border-stone-200/80',
            )}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className={cn('absolute inset-x-0 top-0 h-1', c.bar)} />
            <div className="flex items-start justify-between gap-2">
              <div className="text-[10px] font-bold tracking-[0.13em] text-stone-500 uppercase">
                {c.label}
              </div>
              <span className={cn('grid h-7 w-7 place-items-center rounded-lg', iconBg[c.tone])}>
                <Icon className="h-3.5 w-3.5" />
              </span>
            </div>
            <div
              className={cn(
                'mt-1 text-[30px] leading-none font-semibold tracking-tight tabular-nums',
                c.tone === 'green'
                  ? 'text-emerald-700'
                  : c.tone === 'rose' && c.value
                    ? 'text-rose-600'
                    : c.tone === 'teal'
                      ? 'text-teal-800'
                      : c.tone === 'blue'
                        ? 'text-sky-700'
                        : 'text-stone-900',
              )}
            >
              {c.value}
            </div>
            <div className="mt-1.5 text-[11px] font-medium text-stone-400">{c.hint}</div>
          </div>
        )
      })}
    </div>
  )
}

export function ComplianceChain({ data }: { data: Dashboard }) {
  const timingDot = {
    complete: 'bg-emerald-500',
    active: 'bg-sky-500',
    upcoming: 'bg-stone-300',
    attention: 'bg-rose-500',
  } as const
  return (
    <Card lift>
      <CardHeader
        eyebrow="Chain"
        title="Compliance chain"
        subtitle="Each step feeds the next — statuses come straight from the Task Tracker"
        action={
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm transition hover:border-teal-600/40 hover:text-teal-800"
          >
            Open tracker <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />
      <ol className="grid gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {data.chain.map((step, i) => {
          const Icon = TIMING_ICONS[step.timing]
          return (
            <li key={step.code} className="relative">
              <Link
                href="/tasks"
                className="group flex h-full flex-col rounded-2xl border border-stone-200/80 bg-gradient-to-b from-stone-50/80 to-white p-3.5 transition-all hover:-translate-y-0.5 hover:border-teal-600/30 hover:shadow-pop"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-stone-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`h-1.5 w-1.5 rounded-full ${timingDot[step.timing]}`} />
                  <Icon className="ml-auto h-4 w-4 shrink-0 text-stone-300 transition group-hover:text-teal-700" />
                </div>
                <span className="mt-1.5 text-[13px] leading-snug font-bold tracking-tight text-stone-800">
                  {step.name}
                </span>
                <span className="mt-0.5 text-[11px] font-medium text-stone-400">{step.window}</span>
                <span className="mt-2.5 self-start">
                  <Badge value={step.status} />
                </span>
              </Link>
              {i < data.chain.length - 1 ? (
                <ArrowRight className="absolute top-1/2 -right-2 z-10 hidden h-4 w-4 -translate-y-1/2 rounded-full bg-white text-stone-300 shadow-sm ring-1 ring-stone-200 xl:block" />
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
      <ScrollArea orientation="horizontal">
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
      </ScrollArea>
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
      <ScrollArea orientation="horizontal">
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
      </ScrollArea>
    </Card>
  )
}
