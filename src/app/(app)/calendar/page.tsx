import { can, requirePermission } from '@/lib/auth'
import { readCurrentMonth } from '@/lib/month'
import { getCalendar } from '@/lib/queries'
import { PageHeader } from '@/components/ui/primitives'
import { CalendarGrid } from '@/components/calendar/CalendarGrid'

export const metadata = { title: 'Annual Calendar' }

export default async function CalendarPage() {
  const user = await requirePermission('calendar', 'read')
  const [month, activities, canWrite] = await Promise.all([
    readCurrentMonth(),
    getCalendar(),
    can(user.role, 'calendar', 'write'),
  ])

  return (
    <div className="space-y-5">
      <PageHeader
        crumb="Workspace"
        eyebrow="Annual Calendar"
        title="The year, month by month"
        subtitle="Fiscal Year 2083/84 (2026/27) · Nepali months (BS) with approximate English months · Shrawan → Asadh"
      />
      <CalendarGrid activities={activities} month={month} canWrite={canWrite} />
      <p className="text-[11px] text-slate-400">
        Notes: Nepali month boundaries fall mid-month in the English calendar, so English months are
        approximate. Deadlines marked ‘verify’ depend on current IRD / OCR / SWC / Ward rules and
        should be confirmed before each filing. Monthly TDS is due by the 25th of the month after the
        payment month.
      </p>
    </div>
  )
}
