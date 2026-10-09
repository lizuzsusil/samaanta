import { can, requirePermission } from '@/lib/auth'
import { getMonthlyRecords, getStaff } from '@/lib/queries'
import { PageHeader, Notice } from '@/components/ui/primitives'
import {
  MonthlyBookkeeping,
  type MonthlyRecordDto,
  type StaffDto,
} from '@/components/bookkeeping/MonthlyBookkeeping'

export const metadata = { title: 'Monthly Book-keeping' }

export default async function BookkeepingPage() {
  const user = await requirePermission('bookkeeping', 'read')
  const [records, staff, canWrite] = await Promise.all([
    getMonthlyRecords(),
    getStaff(),
    can(user.role, 'bookkeeping', 'write'),
  ])

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const byMonth = Object.fromEntries(records.map((r) => [r.month, r]))
  const ordered: MonthlyRecordDto[] = months.map(
    (m) =>
      byMonth[m] ?? {
        month: m,
        tdsStatus: 'Pending',
        tdsAmount: 0,
        tdsDate: '',
        tdsVoucher: '',
        rentAmount: 0,
        rentDate: '',
        rentVoucher: '',
        income: 0,
        expenses: 0,
        bookStatus: 'Not Started',
        bookDate: '',
        salaryDate: '',
        remarks: '',
      },
  )

  const staffDto: StaffDto[] = staff.map((s) => ({
    id: s.id,
    name: s.name,
    designation: s.designation,
    pan: s.pan,
    byMonth: s.byMonth as Record<number, number>,
  }))

  return (
    <div className="space-y-5">
      <PageHeader
        crumb="Workspace"
        eyebrow="Monthly Book-keeping"
        title="TDS · rent · salaries · income & expenses"
        subtitle="One column per payment month (BS, Shrawan → Asadh). TDS must be deposited and e-TDS filed by the 25th of the FOLLOWING month. Amounts in NPR."
      />
      <Notice>
        Editable cells save instantly and feed the Dashboard strips and finance totals.
      </Notice>
      <MonthlyBookkeeping records={ordered} staff={staffDto} canWrite={canWrite} />
    </div>
  )
}
