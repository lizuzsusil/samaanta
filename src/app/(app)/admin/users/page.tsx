import { requirePermission } from '@/lib/auth'
import { getPermissionSummary, getUsers } from '@/lib/queries'
import { PageHeader } from '@/components/ui/primitives'
import { UsersAdmin } from '@/components/admin/UsersAdmin'

export const metadata = { title: 'Users & Roles' }

export default async function UsersPage() {
  const me = await requirePermission('users', 'read')
  const [users, permissions] = await Promise.all([getUsers(), getPermissionSummary()])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users & roles"
        subtitle="Manage sign-ins, assign Admin or Board / Viewer, and control module access per role."
      />
      <UsersAdmin users={users} permissions={permissions} meId={me.id} />
    </div>
  )
}
