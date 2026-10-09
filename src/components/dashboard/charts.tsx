'use client'

import Link from 'next/link'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BS_MONTHS, CALENDAR_KINDS } from '@/lib/constants'
import { fmtPct, npr } from '@/lib/calc'
import { Card, CardHeader } from '@/components/ui/primitives'
import { ScrollArea } from '@/components/ui/scroll-area'

/* --------------------------------- palette --------------------------------- */

const TEAL = '#0e7d6e'
const OCHRE = '#c07a1f'
const BLUE = '#5468b0'
const EMERALD = '#2f9e6e'
const ROSE = '#c2504a'
const GRID = '#e7e1d3'
const TICK = '#8a8474'

const DONUT_COLORS: Record<string, string> = {
  Completed: EMERALD,
  Submitted: BLUE,
  'In Progress': '#d99a26',
  'Not Started': '#b9b3a4',
  'On Hold': ROSE,
}

/** Compact NPR axis labels: 1.5L, 250k, 900. */
function compactNpr(v: number) {
  if (v >= 100000) return `${trim(v / 100000)}L`
  if (v >= 1000) return `${trim(v / 1000)}k`
  return String(Math.round(v))
}

function trim(v: number) {
  return String(Math.round(v * 10) / 10)
}

/* --------------------------------- tooltip --------------------------------- */

type TipEntry = {
  name?: React.ReactNode
  value?: number | string | Array<number | string>
  color?: string
}

function ChartTip({
  active,
  payload,
  label,
  suffix = '',
}: {
  active?: boolean
  payload?: TipEntry[]
  label?: React.ReactNode
  suffix?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="min-w-[180px] rounded-xl border border-stone-900/90 bg-stone-900/95 px-3 py-2.5 shadow-pop backdrop-blur">
      {label != null && label !== '' ? (
        <div className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-white/60 uppercase">
          {label}
        </div>
      ) : null}
      <ul className="space-y-1">
        {payload.map((p, i) => (
          <li key={i} className="flex items-center gap-2 text-[13px]">
            <span className="h-2 w-2 shrink-0 rounded-full ring-2 ring-white/20" style={{ background: p.color }} />
            <span className="text-white/60">{p.name}</span>
            <span className="ml-auto pl-4 font-bold tabular-nums text-white">
              {p.value}
              {suffix}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {items.map((it) => (
        <span
          key={it.label}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-600"
        >
          <span className="h-2 w-2 rounded-full shadow-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

const AXIS_TICK = { fill: TICK, fontSize: 11 } as const

/* --------------------------------- workload --------------------------------- */

export type WorkloadRow = { month: number; label: string; activities: number; activeTasks: number }

export function WorkloadChart({ rows, month }: { rows: WorkloadRow[]; month: number }) {
  const totalActs = rows.reduce((s, r) => s + r.activities, 0)
  const peakTasks = Math.max(...rows.map((r) => r.activeTasks), 0)
  const current = BS_MONTHS[month - 1].short

  return (
    <Card className="h-full">
      <CardHeader
        title="Workload across the year"
        subtitle={`${totalActs} calendar actions scheduled · up to ${peakTasks} tasks running in a single month`}
        action={
          <Legend
            items={[
              { color: TEAL, label: 'Calendar actions' },
              { color: OCHRE, label: 'Tasks in window' },
            ]}
          />
        }
      />
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: -14 }} barGap={4}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: GRID }} tick={AXIS_TICK} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={AXIS_TICK} />
            <Tooltip
              content={<ChartTip />}
              cursor={{ fill: TEAL, opacity: 0.06 }}
            />
            <ReferenceArea x1={current} x2={current} fill={TEAL} fillOpacity={0.08} />
            <Bar
              dataKey="activities"
              name="Calendar actions"
              fill={TEAL}
              radius={[5, 5, 0, 0]}
              maxBarSize={26}
              animationDuration={700}
            />
            <Bar
              dataKey="activeTasks"
              name="Tasks in window"
              fill={OCHRE}
              radius={[5, 5, 0, 0]}
              maxBarSize={26}
              animationDuration={700}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* --------------------------------- due curve --------------------------------- */

export function DueCurve({
  curve,
  total,
  completed,
  month,
}: {
  curve: number[]
  total: number
  completed: number
  month: number
}) {
  const rows = curve.map((n, i) => ({ label: BS_MONTHS[i].short, due: n }))
  const current = BS_MONTHS[month - 1].short
  const last = rows[rows.length - 1]

  return (
    <Card className="h-full">
      <CardHeader
        title="Completion plan"
        subtitle={`${completed} of ${total} tasks completed to date · ${last.due} fall due by Asadh`}
      />
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 12, bottom: 0, left: -14 }}>
            <defs>
              <linearGradient id="dueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={TEAL} stopOpacity={0.32} />
                <stop offset="100%" stopColor={TEAL} stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: GRID }} tick={AXIS_TICK} />
            <YAxis
              allowDecimals={false}
              domain={[0, total]}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK}
            />
            <Tooltip content={<ChartTip />} cursor={{ stroke: TEAL, strokeOpacity: 0.3 }} />
            <Area
              type="stepAfter"
              dataKey="due"
              name="Tasks due"
              stroke={TEAL}
              strokeWidth={2.5}
              fill="url(#dueFill)"
              dot={{ r: 3, fill: TEAL, stroke: '#fff', strokeWidth: 1.5 }}
              animationDuration={800}
            />
            <ReferenceLine
              x={current}
              stroke={TEAL}
              strokeDasharray="5 4"
              label={{ value: 'today', position: 'insideTopLeft', fontSize: 10, fill: TEAL }}
            />
            {last.due > 0 ? (
              <ReferenceDot
                x={last.label}
                y={last.due}
                r={5}
                fill={TEAL}
                stroke="#fff"
                strokeWidth={2}
              />
            ) : null}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

/* ---------------------------------- money ---------------------------------- */

export type MoneyRow = {
  month: number
  label: string
  income: number
  expenses: number
  salaries: number
  rent: number
}

const MONEY = [
  { key: 'income', label: 'Income', color: EMERALD },
  { key: 'expenses', label: 'Expenses', color: ROSE },
  { key: 'salaries', label: 'Salaries (net)', color: BLUE },
  { key: 'rent', label: 'Office rent', color: OCHRE },
] as const

export function MoneyChart({ rows, month }: { rows: MoneyRow[]; month: number }) {
  const totals = MONEY.map((s) => ({
    ...s,
    total: rows.reduce((sum, r) => sum + r[s.key], 0),
  }))
  const peak = Math.max(...rows.flatMap((r) => MONEY.map((s) => r[s.key])), 0)
  const current = BS_MONTHS[month - 1].short
  const cashIn = totals[0].total
  const cashOut = totals[1].total + totals[2].total + totals[3].total

  return (
    <Card className="h-full">
      <CardHeader
        title="Money in & out"
        subtitle={`FY totals · in NPR ${npr(cashIn)} / out NPR ${npr(cashOut)}`}
        action={<Legend items={MONEY.map((s) => ({ color: s.color, label: s.label }))} />}
      />
      {peak <= 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
          <p className="font-display text-lg text-slate-700">Nothing booked yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Add income, expenses, rent and salaries in Monthly Book-keeping and this chart fills in.
          </p>
        </div>
      ) : (
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={3}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: GRID }} tick={AXIS_TICK} />
              <YAxis
                tickFormatter={compactNpr}
                tickLine={false}
                axisLine={false}
                tick={AXIS_TICK}
                width={44}
              />
              <Tooltip
                content={<ChartTip />}
                cursor={{ fill: TEAL, opacity: 0.06 }}
              />
              <ReferenceArea x1={current} x2={current} fill={TEAL} fillOpacity={0.08} />
              {MONEY.map((s) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={s.color}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={13}
                  animationDuration={700}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {totals.map((t) => (
          <div key={t.key} className="rounded-lg bg-stone-100/70 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              <span className="h-2 w-2 rounded-full" style={{ background: t.color }} />
              {t.label}
            </div>
            <div className="font-display mt-0.5 text-lg font-semibold tabular-nums text-slate-900">
              {npr(t.total)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ---------------------------------- donut ---------------------------------- */

export type DonutSlice = { status: string; count: number; pct: number }

export function StatusDonut({ slices, total }: { slices: DonutSlice[]; total: number }) {
  const cells = slices.filter((s) => s.count > 0)

  return (
    <Card className="h-full">
      <CardHeader title="Where things stand" subtitle="Task Tracker statuses" />
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <div className="relative h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<ChartTip />} />
              <Pie
                data={cells}
                dataKey="count"
                nameKey="status"
                innerRadius="66%"
                outerRadius="92%"
                paddingAngle={3}
                cornerRadius={5}
                strokeWidth={0}
                animationDuration={800}
              >
                {cells.map((s) => (
                  <Cell key={s.status} fill={DONUT_COLORS[s.status] ?? '#a8a29e'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-semibold text-slate-900">{total}</span>
            <span className="text-[11px] text-slate-400">tasks</span>
          </div>
        </div>
        <ul className="w-full space-y-2">
          {slices.map((s) => (
            <li key={s.status} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: DONUT_COLORS[s.status] ?? '#a8a29e' }}
              />
              <span className="flex-1 text-slate-700">{s.status}</span>
              <span className="font-semibold tabular-nums text-slate-900">{s.count}</span>
              <span className="w-10 text-right tabular-nums text-slate-400">{fmtPct(s.pct)}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}

/* --------------------------------- heatmap --------------------------------- */

export type HeatCell = { kind: string | null; text: string }
export type HeatRow = { id: string; section: string; label: string; cells: HeatCell[] }

const KIND_ORDER = ['prepare', 'submit', 'deadline', 'followup', 'monthly', 'monitor']

export function CalendarHeatmap({ rows, month }: { rows: HeatRow[]; month: number }) {
  const sections = rows.map((h) => h.section).filter((s, i, arr) => arr.indexOf(s) === i)

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-6 pb-0">
        <CardHeader
          title="Annual calendar heatmap"
          subtitle="Every scheduled action across the fiscal year — hover a cell for detail"
          className="mb-0"
        />
        <Legend
          items={KIND_ORDER.map((k) => ({ color: CALENDAR_KINDS[k].bg, label: CALENDAR_KINDS[k].label }))}
        />
      </div>
      <ScrollArea orientation="horizontal" className="p-6 pt-4">
        <table className="w-full min-w-[1080px] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 w-60 bg-white px-2 py-1 text-left text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                Area
              </th>
              {BS_MONTHS.map((m) => (
                <th
                  key={m.n}
                  className={
                    m.n === month
                      ? 'rounded bg-teal-700 px-1 py-1 text-[11px] font-semibold text-white'
                      : 'px-1 py-1 text-[11px] font-medium text-slate-400'
                  }
                  title={`${m.name} · ${m.en}`}
                >
                  {m.short}
                </th>
              ))}
            </tr>
          </thead>
          {sections.map((section) => (
            <tbody key={section}>
              <tr>
                <td
                  colSpan={13}
                  className="pt-4 pb-1 text-[10px] font-semibold tracking-[0.16em] text-teal-800 uppercase"
                >
                  {section}
                </td>
              </tr>
              {rows
                .filter((h) => h.section === section)
                .map((h) => (
                  <tr key={h.id}>
                    <td className="sticky left-0 max-w-60 bg-white pr-3 text-xs font-medium text-slate-700">
                      {h.label}
                    </td>
                    {h.cells.map((c, i) => {
                      const kind = c.kind ? CALENDAR_KINDS[c.kind] : null
                      const isCurrent = i + 1 === month
                      return (
                        <td
                          key={i}
                          title={c.text || undefined}
                          className="h-11 min-w-20 rounded-md border border-slate-100 px-1.5 py-1 align-top transition hover:brightness-95"
                          style={{
                            background: kind ? kind.bg : '#faf8f2',
                            boxShadow: isCurrent ? 'inset 0 0 0 2px #0f766e' : undefined,
                          }}
                        >
                          {c.text ? (
                            <span
                              className="line-clamp-2 text-[10px] leading-tight"
                              style={{ color: kind ? kind.fg : '#64748b' }}
                            >
                              {c.text}
                            </span>
                          ) : null}
                        </td>
                      )
                    })}
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </ScrollArea>
    </Card>
  )
}

/* ------------------------------- guide readiness ------------------------------- */

export type ReadinessRow = {
  area: string
  slug: string
  stepsDone: number
  stepsTotal: number
  docsReady: number
  docsTotal: number
}

export function GuideReadiness({ rows }: { rows: ReadinessRow[] }) {
  const data = rows.map((r) => ({
    ...r,
    stepsPct: r.stepsTotal ? r.stepsDone / r.stepsTotal : 0,
    docsPct: r.docsTotal ? r.docsReady / r.docsTotal : 0,
  }))

  return (
    <Card className="h-full">
      <CardHeader
        title="Guide readiness"
        subtitle="Least ready first — open a guide to push it forward"
        action={
          <Legend
            items={[
              { color: TEAL, label: 'Steps done' },
              { color: EMERALD, label: 'Docs ready' },
            ]}
          />
        }
      />
      <div style={{ height: Math.max(data.length * 62 + 8, 120) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barGap={3}>
            <XAxis type="number" domain={[0, 1]} hide />
            <YAxis
              type="category"
              dataKey="area"
              width={148}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#44403c', fontSize: 12 }}
            />
            <Tooltip
              content={<ChartTip suffix="" />}
              cursor={{ fill: TEAL, opacity: 0.06 }}
            />
            <Bar
              dataKey="stepsPct"
              name="Steps"
              fill={TEAL}
              radius={[0, 5, 5, 0]}
              barSize={9}
              background={{ fill: '#ece7d8', radius: 5 }}
              animationDuration={700}
            />
            <Bar
              dataKey="docsPct"
              name="Docs"
              fill={EMERALD}
              radius={[0, 5, 5, 0]}
              barSize={9}
              background={{ fill: '#ece7d8', radius: 5 }}
              animationDuration={700}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
        {data.map((r) => (
          <li key={r.area} className="flex items-center justify-between gap-3 text-xs">
            <Link href={`/guides/${r.slug}`} className="truncate font-medium text-teal-800 hover:underline">
              {r.area}
            </Link>
            <span className="shrink-0 tabular-nums text-slate-400">
              {r.stepsDone}/{r.stepsTotal} steps · {r.docsReady}/{r.docsTotal} docs
            </span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
