'use client'

import { useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, CalendarRange, ShieldCheck, Eye } from 'lucide-react'
import { cn, initials } from '@/lib/cn'
import { BS_MONTHS } from '@/lib/constants'
import type { PermissionMap, ShellUser } from '@/lib/types'
import { logoutAction, setCurrentMonth } from '@/lib/actions/auth'
import { MAIN_NAV, isActive, type NavItem } from './nav'

type GuideLink = { slug: string; sheet: string; title: string }

export function ShellClient({
  user,
  perms,
  guides,
  currentMonth,
  children,
}: {
  user: ShellUser
  perms: PermissionMap
  guides: GuideLink[]
  currentMonth: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const [monthPending, startMonth] = useTransition()

  const visible = (item: NavItem) => !item.module || Boolean(perms[item.module]?.read)

  const nav = (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-3 py-5">
      <div className="px-2">
        <div className="text-[11px] font-semibold tracking-[0.2em] text-indigo-300 uppercase">
          Samaanta
        </div>
        <div className="mt-0.5 text-sm font-medium text-white">Development Foundation</div>
        <div className="mt-1 text-[11px] text-slate-400">Compliance workspace</div>
      </div>

      {MAIN_NAV.map((group) => {
        const items = group.items.filter(visible)
        if (!items.length) return null
        return (
          <div key={group.label}>
            <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition',
                        active
                          ? 'bg-indigo-500/20 font-medium text-white'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}

      {perms.guides?.read ? (
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-[0.16em] text-slate-500 uppercase">
            Step guides
          </div>
          <ul className="space-y-0.5">
            {guides.map((g) => {
              const href = `/guides/${g.slug}`
              const active = isActive(pathname, href)
              return (
                <li key={g.slug}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'block truncate rounded-lg px-2.5 py-1.5 text-[13px] transition',
                      active
                        ? 'bg-indigo-500/20 font-medium text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    {g.sheet} · {g.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto px-2 pt-4">
        <div className="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-2 text-[11px] text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          Role: <span className="font-medium text-slate-200">{user.role}</span>
        </div>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-shell-line bg-shell lg:block">
        {nav}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-shell shadow-xl">{nav}</aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-sm font-semibold text-slate-900">
                Administrative, Governance &amp; Legal Compliance
              </div>
              <div className="truncate text-[11px] text-slate-500">
                Fiscal Year 2083/84 (2026/27) · Shrawan 2083 – Asadh 2084
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm">
                <CalendarRange className="h-4 w-4 text-slate-400" />
                <span className="sr-only">Current Nepali month</span>
                <select
                  className="bg-transparent text-sm font-medium text-slate-700 focus:outline-none"
                  value={currentMonth}
                  disabled={monthPending}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    startMonth(() => setCurrentMonth(value))
                  }}
                >
                  {BS_MONTHS.map((m) => (
                    <option key={m.n} value={m.n}>
                      {m.name} {m.n <= 9 ? '2083' : '2084'}
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white py-1 pr-2 pl-1">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-600 text-[11px] font-semibold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-[10rem] truncate text-xs font-medium text-slate-800">
                    {user.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    {user.role === 'ADMIN' ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    {user.role === 'ADMIN' ? 'Administrator' : 'Board / Viewer'}
                  </span>
                </span>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-rose-600"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-6 sm:px-6">{children}</main>

        <footer className="border-t border-slate-200 px-6 py-4 text-center text-[11px] text-slate-400">
          Verify statutory deadlines with IRD / OCR / SWC / Ward before filing.
        </footer>
      </div>
    </div>
  )
}
