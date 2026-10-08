import {
  LayoutDashboard,
  CalendarDays,
  ListChecks,
  Wallet,
  BookOpen,
  Info,
  Users,
  History,
  type LucideIcon,
} from 'lucide-react'
import type { ModuleName } from '@/lib/constants'

export type NavItem = {
  href: string
  label: string
  icon: LucideIcon
  module?: ModuleName
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const MAIN_NAV: NavGroup[] = [
  {
    label: 'Workspace',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard' },
      { href: '/calendar', label: 'Annual Calendar', icon: CalendarDays, module: 'calendar' },
      { href: '/tasks', label: 'Task Tracker', icon: ListChecks, module: 'tasks' },
      { href: '/bookkeeping', label: 'Monthly Book-keeping', icon: Wallet, module: 'bookkeeping' },
    ],
  },
  {
    label: 'Start here',
    items: [
      { href: '/start-here', label: 'Handover guide', icon: Info, module: 'startHere' },
      { href: '/guides', label: 'All step guides', icon: BookOpen, module: 'guides' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: '/admin/users', label: 'Users & roles', icon: Users, module: 'users' },
      { href: '/admin/audit', label: 'Audit log', icon: History, module: 'audit' },
    ],
  },
]

export function isActive(path: string, href: string) {
  return path === href || path.startsWith(href + '/')
}
