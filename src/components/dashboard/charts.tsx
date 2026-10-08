import Link from 'next/link'
import type { Dashboard } from '@/lib/queries'
import { BS_MONTHS, CALENDAR_KINDS } from '@/lib/constants'
import { fmtPct, npr } from '@/lib/calc'
import { Card, CardHeader } from '@/components/ui/primitives'

/* ---------------------------------- helpers ---------------------------------- */

/** Round up to a 1/2/5×10ⁿ axis maximum. */
function niceMax(v: number) {
  if (v <= 0) return 1
  const pow = 10 ** Math.floor(Math.log10(v))
  const n = v / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
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

function Legend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
          {it.label}
        </span>
      ))}
    </div>
  )
}

const FRAME = { w: 760, h: 300, padL: 44, padR: 14, padT: 16, padB: 32 }

function frame(max: number, ticks = 4) {
  const { w, h, padL, padR, padT, padB } = FRAME
  const plotW = w - padL - padR
  const plotH = h - padT - padB
  const y = (v: number) => padT + plotH - (v / max) * plotH
  const band = plotW / 12
  const center = (m: number) => padL + (m - 1) * band + band / 2
  const grid = Array.from({ length: ticks + 1 }, (_, i) => ({
    value: (max * i) / ticks,
    y: y((max * i) / ticks),
  }))
  return { w, h, padL, padT, plotW, plotH, band, y, center, grid, base: padT + plotH }
}

/* --------------------------------- workload --------------------------------- */

const WORK_ACT = '#6366f1'
const WORK_TASK = '#f59e0b'

export function WorkloadChart({ data, month }: { data: Dashboard; month: number }) {
  const peak = Math.max(...data.workload.flatMap((r) => [r.activities, r.activeTasks]), 0)
  const max = niceMax(peak)
  const f = frame(max)
  const barW = Math.min(26, f.band * 0.26)
  const gap = 5
  const totalActs = data.workload.reduce((s, r) => s + r.activities, 0)
  const peakTasks = Math.max(...data.workload.map((r) => r.activeTasks), 0)

  return (
    <Card className="h-full">
      <CardHeader
        title="FY workload — scheduled actions vs active tasks"
        subtitle={`${totalActs} calendar actions scheduled · up to ${peakTasks} tasks running in a single month`}
        action={
          <Legend
            items={[
              { color: WORK_ACT, label: 'Calendar actions' },
              { color: WORK_TASK, label: 'Tasks in window' },
            ]}
          />
        }
      />
      <svg
        viewBox={`0 0 ${f.w} ${f.h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Monthly workload bar chart"
      >
        <rect
          x={FRAME.padL + (month - 1) * f.band}
          y={FRAME.padT}
          width={f.band}
          height={f.plotH}
          rx={4}
          fill="#eef2ff"
        />
        {f.grid.map((g) => (
          <g key={g.y}>
            <line x1={FRAME.padL} x2={FRAME.padL + f.plotW} y1={g.y} y2={g.y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={FRAME.padL - 8} y={g.y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {Math.round(g.value)}
            </text>
          </g>
        ))}
        {data.workload.map((r) => {
          const hActs = (r.activities / max) * f.plotH
          const hTasks = (r.activeTasks / max) * f.plotH
          const cx = f.center(r.month)
          return (
            <g key={r.month}>
              <rect
                x={cx - barW - gap / 2}
                y={f.base - hActs}
                width={barW}
                height={Math.max(hActs, 0)}
                rx={3}
                fill={WORK_ACT}
              >
                <title>
                  {BS_MONTHS[r.month - 1].name}: {r.activities} scheduled actions
                </title>
              </rect>
              <rect
                x={cx + gap / 2}
                y={f.base - hTasks}
                width={barW}
                height={Math.max(hTasks, 0)}
                rx={3}
                fill={WORK_TASK}
              >
                <title>
                  {BS_MONTHS[r.month - 1].name}: {r.activeTasks} tasks in window
                </title>
              </rect>
              <text
                x={cx}
                y={f.h - 10}
                textAnchor="middle"
                className={
                  r.month === month
                    ? 'fill-indigo-600 text-[11px] font-semibold'
                    : 'fill-slate-400 text-[11px]'
                }
              >
                {BS_MONTHS[r.month - 1].short}
              </text>
            </g>
          )
        })}
      </svg>
    </Card>
  )
}

/* --------------------------------- due curve --------------------------------- */

export function DueCurve({ data, month }: { data: Dashboard; month: number }) {
  const total = data.kpis.total || 1
  const max = niceMax(total)
  const f = frame(max)
  const pts = data.dueCurve.map((n, i) => ({ x: f.center(i + 1), y: f.y(n), n }))
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ')
  const area = `${line} L${pts[11].x},${f.base} L${pts[0].x},${f.base} Z`
  const due = data.dueCurve[11]

  return (
    <Card className="h-full">
      <CardHeader
        title="Planned completion curve"
        subtitle={`${data.kpis.completed} of ${total} tasks completed to date · ${due} fall due by Asadh`}
      />
      <svg
        viewBox={`0 0 ${f.w} ${f.h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Cumulative tasks due per month"
      >
        <rect
          x={FRAME.padL + (month - 1) * f.band}
          y={FRAME.padT}
          width={f.band}
          height={f.plotH}
          rx={4}
          fill="#eef2ff"
        />
        {f.grid.map((g) => (
          <g key={g.y}>
            <line x1={FRAME.padL} x2={FRAME.padL + f.plotW} y1={g.y} y2={g.y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={FRAME.padL - 8} y={g.y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {Math.round(g.value)}
            </text>
          </g>
        ))}
        <line
          x1={f.center(month)}
          x2={f.center(month)}
          y1={FRAME.padT}
          y2={f.base}
          stroke="#6366f1"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <text x={f.center(month)} y={FRAME.padT - 4} textAnchor="middle" className="fill-indigo-500 text-[10px] font-semibold">
          today
        </text>
        <path d={area} fill="#c7d2fe" opacity={0.45} />
        <path d={line} fill="none" stroke="#4f46e5" strokeWidth={2.5} strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#4f46e5" stroke="#fff" strokeWidth={1.5}>
            <title>
              By {BS_MONTHS[i].name}: {p.n} of {total} tasks due
            </title>
          </circle>
        ))}
        {data.workload.map((_, i) => (
          <text
            key={i}
            x={f.center(i + 1)}
            y={f.h - 10}
            textAnchor="middle"
            className={
              i + 1 === month
                ? 'fill-indigo-600 text-[11px] font-semibold'
                : 'fill-slate-400 text-[11px]'
            }
          >
            {BS_MONTHS[i].short}
          </text>
        ))}
      </svg>
    </Card>
  )
}

/* ---------------------------------- money ---------------------------------- */

const MONEY = [
  { key: 'income', label: 'Income', color: '#10b981' },
  { key: 'expenses', label: 'Expenses', color: '#f43f5e' },
  { key: 'salaries', label: 'Salaries (net)', color: '#6366f1' },
  { key: 'rent', label: 'Office rent', color: '#f59e0b' },
] as const

type MoneyKey = (typeof MONEY)[number]['key']

export function MoneyChart({ data, month }: { data: Dashboard; month: number }) {
  const peak = Math.max(...data.moneyMonthly.flatMap((r) => MONEY.map((s) => r[s.key])), 0)
  const totals = MONEY.map((s) => ({
    ...s,
    total: data.moneyMonthly.reduce((sum, r) => sum + r[s.key], 0),
  }))

  if (peak <= 0) {
    return (
      <Card className="h-full">
        <CardHeader
          title="Monthly money — income, expenses, salaries, rent"
          subtitle="Nothing booked yet"
        />
        <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center">
          <p className="text-sm font-medium text-slate-600">No amounts entered yet</p>
          <p className="mt-1 text-xs text-slate-400">
            Add income, expenses, rent and salaries in Monthly Book-keeping and this chart fills in.
          </p>
        </div>
      </Card>
    )
  }

  const max = niceMax(peak)
  const f = frame(max)
  const barW = Math.min(13, (f.band / MONEY.length) * 0.62)
  const step = f.band / MONEY.length
  const startX = (m: number, i: number) => FRAME.padL + (m - 1) * f.band + i * step + (step - barW) / 2

  return (
    <Card className="h-full">
      <CardHeader
        title="Monthly money — income, expenses, salaries, rent"
        subtitle={`FY totals · in ${npr(totals[0].total)} / out ${npr(totals[1].total + totals[2].total + totals[3].total)}`}
        action={<Legend items={MONEY.map((s) => ({ color: s.color, label: s.label }))} />}
      />
      <svg
        viewBox={`0 0 ${f.w} ${f.h}`}
        className="h-auto w-full"
        role="img"
        aria-label="Monthly income, expenses, salaries and rent"
      >
        <rect
          x={FRAME.padL + (month - 1) * f.band}
          y={FRAME.padT}
          width={f.band}
          height={f.plotH}
          rx={4}
          fill="#eef2ff"
        />
        {f.grid.map((g) => (
          <g key={g.y}>
            <line x1={FRAME.padL} x2={FRAME.padL + f.plotW} y1={g.y} y2={g.y} stroke="#e2e8f0" strokeWidth={1} />
            <text x={FRAME.padL - 8} y={g.y + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
              {compactNpr(g.value)}
            </text>
          </g>
        ))}
        {data.moneyMonthly.map((r) =>
          MONEY.map((s, i) => {
            const hgt = (r[s.key as MoneyKey] / max) * f.plotH
            return (
              <rect
                key={`${r.month}-${s.key}`}
                x={startX(r.month, i)}
                y={f.base - hgt}
                width={barW}
                height={Math.max(hgt, 0)}
                rx={2}
                fill={s.color}
              >
                <title>
                  {BS_MONTHS[r.month - 1].name} · {s.label}: NPR {npr(r[s.key as MoneyKey])}
                </title>
              </rect>
            )
          }),
        )}
        {data.moneyMonthly.map((r) => (
          <text
            key={r.month}
            x={f.center(r.month)}
            y={f.h - 10}
            textAnchor="middle"
            className={
              r.month === month
                ? 'fill-indigo-600 text-[11px] font-semibold'
                : 'fill-slate-400 text-[11px]'
            }
          >
            {BS_MONTHS[r.month - 1].short}
          </text>
        ))}
      </svg>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {totals.map((t) => (
          <div key={t.key} className="rounded-lg bg-slate-50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              <span className="h-2 w-2 rounded-sm" style={{ background: t.color }} />
              {t.label}
            </div>
            <div className="mt-0.5 text-sm font-semibold tabular-nums text-slate-900">
              {npr(t.total)}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* --------------------------------- heatmap --------------------------------- */

const KIND_ORDER = ['prepare', 'submit', 'deadline', 'followup', 'monthly', 'monitor']

export function CalendarHeatmap({ data, month }: { data: Dashboard; month: number }) {
  const sections = data.heatmap.map((h) => h.section).filter((s, i, arr) => arr.indexOf(s) === i)

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-0">
        <CardHeader
          title="Annual calendar heatmap"
          subtitle="Every scheduled action across the fiscal year — hover a cell for detail"
          className="mb-0"
        />
        <Legend
          items={KIND_ORDER.map((k) => ({ color: CALENDAR_KINDS[k].bg, label: CALENDAR_KINDS[k].label }))}
        />
      </div>
      <div className="scroll-slim overflow-x-auto p-5 pt-3">
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
                      ? 'rounded bg-indigo-600 px-1 py-1 text-[11px] font-semibold text-white'
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
                  className="pt-3 pb-1 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase"
                >
                  {section}
                </td>
              </tr>
              {data.heatmap
                .filter((h) => h.section === section)
                .map((h) => (
                  <tr key={h.id}>
                    <td className="sticky left-0 max-w-60 bg-white pr-3 text-xs font-medium text-slate-700">
                      {h.label}
                    </td>
                    {h.cells.map((c, i) => {
                      const kind = c.kind ? CALENDAR_KINDS[c.kind] : null
                      return (
                        <td
                          key={i}
                          title={c.text || undefined}
                          className="h-11 min-w-20 rounded-md border border-slate-100 px-1.5 py-1 align-top"
                          style={{ background: kind ? kind.bg : '#f8fafc' }}
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
      </div>
    </Card>
  )
}

/* ------------------------------- guide readiness ------------------------------- */

export function GuideReadiness({ data }: { data: Dashboard }) {
  const rows = data.progress
    .filter((p) => p.guideSlug)
    .map((p) => {
      const stepsPct = p.stepsTotal ? p.stepsDone / p.stepsTotal : 0
      const docsPct = p.docsTotal ? p.docsReady / p.docsTotal : 0
      return { ...p, stepsPct, docsPct, avg: (stepsPct + docsPct) / 2 }
    })
    .sort((a, b) => a.avg - b.avg)

  return (
    <Card className="h-full">
      <CardHeader
        title="Step-guide readiness"
        subtitle="Least ready first — open a guide to push it forward"
      />
      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.area}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <Link
                href={`/guides/${r.guideSlug}`}
                className="truncate text-sm font-medium text-indigo-600 hover:underline"
              >
                {r.area}
              </Link>
              <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                {fmtPct(r.avg)} ready
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] text-slate-500">Steps</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${r.stepsPct * 100}%` }}
                    title={`${r.stepsDone}/${r.stepsTotal} steps done`}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
                  {r.stepsDone}/{r.stepsTotal}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-[11px] text-slate-500">Docs</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${r.docsPct * 100}%` }}
                    title={`${r.docsReady}/${r.docsTotal} documents ready`}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
                  {r.docsReady}/{r.docsTotal}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}
