'use client'

import { useTransition, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { BS_MONTHS, BOOK_STATUSES, TDS_STATUSES } from '@/lib/constants'
import { npr, SST_RATE } from '@/lib/calc'
import { Button, Notice } from '@/components/ui/primitives'
import { SelectCell, TextCell } from '@/components/ui/edit'
import { addStaff, deleteStaff, setSalary, updateMonthly } from '@/lib/actions/bookkeeping'
import { ScrollArea } from '@/components/ui/scroll-area'

export type MonthlyRecordDto = {
  month: number
  tdsStatus: string
  tdsAmount: number
  tdsDate: string
  tdsVoucher: string
  rentAmount: number
  rentDate: string
  rentVoucher: string
  income: number
  expenses: number
  bookStatus: string
  bookDate: string
  salaryDate: string
  remarks: string
}

export type StaffDto = {
  id: string
  name: string
  designation: string
  pan: string
  byMonth: Record<number, number>
}

type Props = {
  records: MonthlyRecordDto[]
  staff: StaffDto[]
  canWrite: boolean
}

type Patch = (month: number, field: string) => (value: string) => Promise<{ ok: boolean; error?: string }>

export function MonthlyBookkeeping({ records, staff, canWrite }: Props) {
  const [pending, startTransition] = useTransition()
  const rec = Object.fromEntries(records.map((r) => [r.month, r])) as Record<number, MonthlyRecordDto>

  const patch: Patch = (month, field) => async (value) => {
    const numeric = [
      'tdsAmount',
      'rentAmount',
      'income',
      'expenses',
    ].includes(field)
    const payload: Record<string, unknown> = numeric
      ? { [field]: Number(String(value).replace(/[^0-9.-]/g, '')) || 0 }
      : { [field]: value }
    const res = await updateMonthly(month, payload)
    return res
  }

  const salaryOf = (m: number) => staff.reduce((s, x) => s + (x.byMonth[m] ?? 0), 0)
  const total = (get: (r: MonthlyRecordDto) => number) =>
    records.reduce((s, r) => s + get(r), 0)

  const netSalaries = Array.from({ length: 12 }, (_, i) => salaryOf(i + 1))
  const netSalaryTotal = netSalaries.reduce((a, b) => a + b, 0)
  const gross = netSalaryTotal / (1 - SST_RATE)
  const sst = gross * SST_RATE

  const monthTotal = (v: number) => (v ? npr(v) : '0')

  return (
    <div className="space-y-6">
      {!canWrite ? <Notice>Read-only access — your role can view but not edit these figures.</Notice> : null}

      {/* 1 · TDS */}
      <Sheet
        title="1 · TDS deposit & e-TDS filing"
        note="Staff salary + other TDS. Deposit and e-TDS filing are due by the 25th of the following month."
      >
        <MonthHeader total="FY total" />
        <Row label="Deposit & e-TDS due by" note="25th of next month">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>{dueLabel(m.n)}</Cell>
          ))}
          <Total>—</Total>
        </Row>
        <Row label="TDS status ▼" note="Pending / Deposited / Deposited & Filed / Late">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              {canWrite ? (
                <SelectCell
                  value={rec[m.n]?.tdsStatus ?? 'Pending'}
                  options={TDS_STATUSES}
                  onCommit={patch(m.n, 'tdsStatus')}
                  ariaLabel={`TDS status ${m.name}`}
                />
              ) : (
                <span className="px-2 text-xs">{rec[m.n]?.tdsStatus ?? 'Pending'}</span>
              )}
            </Cell>
          ))}
          <Total>
            {records.filter((r) => r.tdsStatus === 'Deposited & Filed').length} / 12
          </Total>
        </Row>
        <Row label="Total TDS deposited (NPR)" note="Salary + other TDS" money>
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={String(rec[m.n]?.tdsAmount ?? 0)}
                onCommit={patch(m.n, 'tdsAmount')}
                disabled={!canWrite}
                align="right"
              />
            </Cell>
          ))}
          <Total>{monthTotal(total((r) => r.tdsAmount))}</Total>
        </Row>
        <Row label="Date TDS deposited">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={rec[m.n]?.tdsDate ?? ''}
                onCommit={patch(m.n, 'tdsDate')}
                disabled={!canWrite}
                placeholder="2083-06-25"
              />
            </Cell>
          ))}
          <Total>
            {records.filter((r) => r.tdsDate).length} / 12
          </Total>
        </Row>
        <Row label="Voucher / receipt no.">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={rec[m.n]?.tdsVoucher ?? ''}
                onCommit={patch(m.n, 'tdsVoucher')}
                disabled={!canWrite}
              />
            </Cell>
          ))}
          <Total>—</Total>
        </Row>
      </Sheet>

      {/* 2 · Office rent */}
      <Sheet
        title="2 · Office rent"
        note="Paid in advance, 1st week of the month. Rent TDS is not a monthly item — it is paid once a year at Ward renewal."
      >
        <MonthHeader total="FY total" />
        <Row label="Rent amount paid (NPR)" money>
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={String(rec[m.n]?.rentAmount ?? 0)}
                onCommit={patch(m.n, 'rentAmount')}
                disabled={!canWrite}
                align="right"
              />
            </Cell>
          ))}
          <Total>{monthTotal(total((r) => r.rentAmount))}</Total>
        </Row>
        <Row label="Date rent paid">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={rec[m.n]?.rentDate ?? ''}
                onCommit={patch(m.n, 'rentDate')}
                disabled={!canWrite}
                placeholder="2083-06-05"
              />
            </Cell>
          ))}
          <Total>
            {records.filter((r) => r.rentDate).length} / 12 paid
          </Total>
        </Row>
        <Row label="Voucher / cheque no.">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={rec[m.n]?.rentVoucher ?? ''}
                onCommit={patch(m.n, 'rentVoucher')}
                disabled={!canWrite}
              />
            </Cell>
          ))}
          <Total>—</Total>
        </Row>
      </Sheet>

      {/* 3 · Salaries */}
      <Sheet
        title="3 · Staff salaries"
        note={`Net paid in the first week of the month · SST rate ${(SST_RATE * 100).toFixed(0)}% · gross = net ÷ (1 − rate)`}
      >
        <SalaryHeader />
        {staff.map((s) => {
          const rowNet = Array.from({ length: 12 }, (_, i) => s.byMonth[i + 1] ?? 0)
          const net = rowNet.reduce((a, b) => a + b, 0)
          const rowGross = net / (1 - SST_RATE)
          const rowSst = rowGross * SST_RATE
          return (
            <tr key={s.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
              <td className="sticky left-0 z-10 bg-white px-3 py-2 text-sm font-medium text-slate-900">
                {s.name}
                {canWrite ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        if (window.confirm(`Remove ${s.name} from the payroll?`)) {
                          await deleteStaff(s.id)
                        }
                      })
                    }
                    className="ml-2 text-[10px] font-normal text-rose-400 hover:underline"
                  >
                    remove
                  </button>
                ) : null}
              </td>
              <td className="px-3 py-2 text-xs text-slate-600">{s.designation || '—'}</td>
              <td className="px-3 py-2 font-mono text-xs text-slate-600">{s.pan || '—'}</td>
              {BS_MONTHS.map((m) => (
                <td key={m.n} className="p-1">
                  <TextCell
                    value={String(s.byMonth[m.n] ?? 0)}
                    onCommit={async (value) => {
                      const res = await setSalary({
                        staffId: s.id,
                        month: m.n,
                        amount: Number(String(value).replace(/[^0-9.]/g, '')) || 0,
                      })
                      return res
                    }}
                    disabled={!canWrite}
                    align="right"
                    placeholder="0"
                  />
                </td>
              ))}
              <td className="bg-slate-50 px-3 py-2 text-right text-sm font-medium tabular-nums">
                {npr(net)}
              </td>
              <td className="px-3 py-2 text-right text-sm tabular-nums text-slate-600">
                {net ? npr(Math.round(rowGross)) : '0'}
              </td>
              <td className="px-3 py-2 text-right text-sm tabular-nums text-slate-600">
                {net ? npr(Math.round(rowSst)) : '0'}
              </td>
              <td className="px-3 py-2 text-right text-sm tabular-nums text-slate-600">0</td>
              <td className="px-3 py-2 text-right text-sm tabular-nums text-slate-600">
                {net ? npr(Math.round(rowSst)) : '0'}
              </td>
            </tr>
          )
        })}
        <tr className="border-t-2 border-slate-200 bg-slate-50 text-sm font-semibold">
          <td className="sticky left-0 z-10 bg-slate-50 px-3 py-2" colSpan={3}>
            Total staff salaries
          </td>
          {netSalaries.map((v, i) => (
            <td key={i} className="px-3 py-2 text-right tabular-nums">
              {npr(v)}
            </td>
          ))}
          <td className="px-3 py-2 text-right tabular-nums">{npr(netSalaryTotal)}</td>
          <td className="px-3 py-2 text-right tabular-nums">{npr(Math.round(gross))}</td>
          <td className="px-3 py-2 text-right tabular-nums">{npr(Math.round(sst))}</td>
          <td className="px-3 py-2 text-right tabular-nums">0</td>
          <td className="px-3 py-2 text-right tabular-nums">{npr(Math.round(sst))}</td>
        </tr>
        <Row label="Salary disbursed on (date)">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={rec[m.n]?.salaryDate ?? ''}
                onCommit={patch(m.n, 'salaryDate')}
                disabled={!canWrite}
                placeholder="2083-06-05"
              />
            </Cell>
          ))}
          <Total>
            {records.filter((r) => r.salaryDate).length} / 12 paid
          </Total>
        </Row>
        {canWrite ? (
          <tr className="border-t border-slate-100">
            <td colSpan={20} className="bg-slate-50/60 px-3 py-3">
              <AddStaffForm
                pending={pending}
                onSubmit={(value) =>
                  startTransition(async () => {
                    await addStaff(value)
                  })
                }
              />
            </td>
          </tr>
        ) : null}
      </Sheet>

      {/* 4 · Income & bookkeeping */}
      <Sheet
        title="4 · Income, expenses & monthly bookkeeping"
        note="Enter each month's totals as booked. Net surplus = income − expenses."
      >
        <MonthHeader total="FY total" />
        <Row label="Total income (NPR)" note="As booked for the month" money>
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={String(rec[m.n]?.income ?? 0)}
                onCommit={patch(m.n, 'income')}
                disabled={!canWrite}
                align="right"
              />
            </Cell>
          ))}
          <Total>{monthTotal(total((r) => r.income))}</Total>
        </Row>
        <Row label="Total expenses (NPR)" note="As booked for the month" money>
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={String(rec[m.n]?.expenses ?? 0)}
                onCommit={patch(m.n, 'expenses')}
                disabled={!canWrite}
                align="right"
              />
            </Cell>
          ))}
          <Total>{monthTotal(total((r) => r.expenses))}</Total>
        </Row>
        <Row label="Net surplus / (deficit)" note="Income − expenses" money muted>
          {BS_MONTHS.map((m) => {
            const r = rec[m.n]
            const v = (r?.income ?? 0) - (r?.expenses ?? 0)
            return <Cell key={m.n}>{v ? npr(v) : '0'}</Cell>
          })}
          <Total>
            {monthTotal(total((r) => r.income - r.expenses))}
          </Total>
        </Row>
        <Row label="  of which office rent" note="From section 2" money muted>
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>{rec[m.n]?.rentAmount ? npr(rec[m.n].rentAmount) : '0'}</Cell>
          ))}
          <Total>{monthTotal(total((r) => r.rentAmount))}</Total>
        </Row>
        <Row label="  of which staff salaries (net)" note="From section 3" money muted>
          {netSalaries.map((v, i) => (
            <Cell key={i}>{v ? npr(v) : '0'}</Cell>
          ))}
          <Total>{monthTotal(netSalaryTotal)}</Total>
        </Row>
        <Row label="Bookkeeping status ▼" note="Not Started / In Progress / Completed">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              {canWrite ? (
                <SelectCell
                  value={rec[m.n]?.bookStatus ?? 'Not Started'}
                  options={BOOK_STATUSES}
                  onCommit={patch(m.n, 'bookStatus')}
                  ariaLabel={`Bookkeeping status ${m.name}`}
                />
              ) : (
                <span className="px-2 text-xs">{rec[m.n]?.bookStatus ?? 'Not Started'}</span>
              )}
            </Cell>
          ))}
          <Total>
            {records.filter((r) => r.bookStatus === 'Completed').length} / 12
          </Total>
        </Row>
        <Row label="Bookkeeping completed on">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={rec[m.n]?.bookDate ?? ''}
                onCommit={patch(m.n, 'bookDate')}
                disabled={!canWrite}
                placeholder="2083-06-28"
              />
            </Cell>
          ))}
          <Total>
            {records.filter((r) => r.bookDate).length} / 12
          </Total>
        </Row>
        <Row label="Remarks">
          {BS_MONTHS.map((m) => (
            <Cell key={m.n}>
              <TextCell
                value={rec[m.n]?.remarks ?? ''}
                onCommit={patch(m.n, 'remarks')}
                disabled={!canWrite}
              />
            </Cell>
          ))}
          <Total>—</Total>
        </Row>
      </Sheet>
    </div>
  )
}

function dueLabel(month: number) {
  const n = (month % 12) + 1
  const year = month === 12 || n >= 10 ? 2084 : 2083
  return `25 ${BS_MONTHS[n - 1].name} ${year}`
}

/* ---------- table primitives ---------- */

function Sheet({
  title,
  note,
  children,
}: {
  title: string
  note?: string
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 bg-gradient-to-b from-stone-50/80 to-white px-5 pt-5 pb-3">
        <div>
          <h2 className="font-display text-[16px] font-semibold tracking-tight text-stone-900">{title}</h2>
          {note ? <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-500">{note}</p> : null}
        </div>
      </div>
      <ScrollArea orientation="horizontal">
        <table className="w-full min-w-[1700px] border-collapse text-sm">{children}</table>
      </ScrollArea>
    </section>
  )
}

function MonthHeader({ total }: { total: string }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] text-slate-500">
        <th className="sticky left-0 z-10 w-56 bg-slate-50 px-3 py-2 font-semibold tracking-wide uppercase">
          Item
        </th>
        <th className="w-44 bg-slate-50 px-3 py-2 font-semibold tracking-wide uppercase">
          Notes
        </th>
        {BS_MONTHS.map((m) => (
          <th key={m.n} className="w-32 px-2 py-2 text-center font-semibold">
            <div className="text-[11px] text-slate-700">
              {m.name} {m.n <= 9 ? '2083' : '2084'}
            </div>
            <div className="font-normal text-[10px] text-slate-400">{m.en}</div>
          </th>
        ))}
        <th className="w-28 bg-slate-50 px-3 py-2 text-right font-semibold tracking-wide uppercase">
          {total}
        </th>
      </tr>
    </thead>
  )
}

function SalaryHeader() {
  return (
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] text-slate-500">
        <th className="sticky left-0 z-10 w-44 bg-slate-50 px-3 py-2 font-semibold tracking-wide uppercase">
          Name
        </th>
        <th className="w-40 bg-slate-50 px-3 py-2 font-semibold tracking-wide uppercase">
          Designation
        </th>
        <th className="w-28 bg-slate-50 px-3 py-2 font-semibold tracking-wide uppercase">
          PAN no.
        </th>
        {BS_MONTHS.map((m) => (
          <th key={m.n} className="w-28 px-2 py-2 text-center font-semibold">
            <div className="text-[11px] text-slate-700">{m.short}</div>
            <div className="font-normal text-[10px] text-slate-400">{m.np}</div>
          </th>
        ))}
        {['Total (net)', 'Gross', 'SST 1%', 'RT', 'Total tax'].map((h) => (
          <th
            key={h}
            className="w-28 bg-slate-50 px-3 py-2 text-right font-semibold tracking-wide uppercase"
          >
            {h}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function Row({
  label,
  note,
  children,
  money,
  muted,
}: {
  label: string
  note?: string
  children: ReactNode
  money?: boolean
  muted?: boolean
}) {
  return (
    <tr className="border-t border-slate-100 align-top hover:bg-slate-50/50">
      <td
        className={cn(
          'sticky left-0 z-10 bg-white px-3 py-2 text-sm',
          muted ? 'text-slate-500' : 'font-medium text-slate-800',
          money && 'tabular-nums',
        )}
      >
        {label}
      </td>
      <td className="px-3 py-2 text-xs text-slate-400">{note ?? ''}</td>
      {children}
    </tr>
  )
}

function Cell({ children }: { children: ReactNode }) {
  return <td className="p-1 text-sm text-slate-700">{children}</td>
}

function Total({ children }: { children: ReactNode }) {
  return (
    <td className="bg-slate-50 px-3 py-2 text-right text-sm font-medium tabular-nums text-slate-800">
      {children}
    </td>
  )
}

function AddStaffForm({
  onSubmit,
  pending,
}: {
  onSubmit: (value: Record<string, string>) => void
  pending: boolean
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-[11px] text-slate-500">Add staff member</span>
        <input id="staff-name" className="field w-48" placeholder="Full name" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] text-slate-500">Designation</span>
        <input id="staff-desig" className="field w-48" placeholder="Designation" />
      </label>
      <label className="block">
        <span className="mb-1 block text-[11px] text-slate-500">PAN</span>
        <input id="staff-pan" className="field w-36" placeholder="PAN no." />
      </label>
      <Button
        size="sm"
        variant="primary"
        disabled={pending}
        onClick={() => {
          const name = (document.getElementById('staff-name') as HTMLInputElement)?.value ?? ''
          const designation =
            (document.getElementById('staff-desig') as HTMLInputElement)?.value ?? ''
          const pan = (document.getElementById('staff-pan') as HTMLInputElement)?.value ?? ''
          if (!name.trim()) return
          onSubmit({ name: name.trim(), designation: designation.trim(), pan: pan.trim() })
          const ids = ['staff-name', 'staff-desig', 'staff-pan']
          ids.forEach((id) => {
            const el = document.getElementById(id) as HTMLInputElement
            if (el) el.value = ''
          })
        }}
      >
        Add
      </Button>
    </div>
  )
}
