import { can, requirePermission } from '@/lib/auth'
import { readCurrentMonth } from '@/lib/month'
import { getTasks } from '@/lib/queries'
import { PageHeader } from '@/components/ui/primitives'
import { TaskTracker } from '@/components/tasks/TaskTracker'

export const metadata = { title: 'Task Tracker' }

export default async function TasksPage() {
  const user = await requirePermission('tasks', 'read')
  const [month, tasks, canWrite] = await Promise.all([
    readCurrentMonth(),
    getTasks(),
    can(user.role, 'tasks', 'write'),
  ])

  return (
    <div className="space-y-5">
      <PageHeader
        crumb="Workspace"
        eyebrow="Task Tracker"
        title="Compliance tasks · FY 2083/84"
        subtitle="Update status, dates and follow-up after every action. Timing updates automatically from the month selected in the top bar."
      />
      <TaskTracker tasks={tasks} month={month} canWrite={canWrite} />
    </div>
  )
}
