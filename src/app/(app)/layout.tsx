import { Suspense, type ReactNode } from 'react'
import { getPermissionMap, requireUser } from '@/lib/auth'
import { readCurrentMonth } from '@/lib/month'
import { prisma } from '@/lib/db'
import { ShellClient } from '@/components/shell/ShellClient'
import { ShellSkeleton } from '@/components/shell/ShellSkeleton'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <Shell>{children}</Shell>
    </Suspense>
  )
}

async function Shell({ children }: { children: ReactNode }) {
  const user = await requireUser()
  const [perms, currentMonth, guides] = await Promise.all([
    getPermissionMap(user.role),
    readCurrentMonth(),
    prisma.guide.findMany({
      select: { slug: true, sheet: true, title: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return (
    <ShellClient
      user={{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        title: user.title,
      }}
      perms={perms}
      guides={guides}
      currentMonth={currentMonth}
    >
      {children}
    </ShellClient>
  )
}
