'use client'

import { useState, useTransition, type ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  LogOut,
  CalendarRange,
  ShieldCheck,
  Eye,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { cn, initials } from '@/lib/cn'
import { BS_MONTHS } from '@/lib/constants'
import type { PermissionMap, ShellUser } from '@/lib/types'
import { logoutAction, setCurrentMonth } from '@/lib/actions/auth'
import { MAIN_NAV, isActive, type NavItem } from './nav'
import { ScrollArea } from '@/components/ui/scroll-area'

type GuideLink = { slug: string; sheet: string; title: string }

const CRUMBS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Annual Calendar',
  '/tasks': 'Task Tracker',
  '/bookkeeping': 'Monthly Book-keeping',
  '/start-here': 'Handover guide',
  '/guides': 'Step guides',
  '/admin/users': 'Users & roles',
  '/admin/audit': 'Audit log',
}

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
  const monthMeta = BS_MONTHS[currentMonth - 1]
  const crumb = CRUMBS[pathname] ?? (pathname.startsWith('/guides/') ? 'Step guide' : 'Workspace')

  const nav = (
    <nav className="flex min-h-full flex-col gap-5 px-3 py-5">
      {/* Brand — official Samaanta Foundation lockup */}
      <div className="px-1">
        <Link href="/dashboard" onClick={() => setOpen(false)} className="group block">
          <Image
            src="/brand/samaanta-logo.png"
            alt="Samaanta Foundation"
            width={324}
            height={118}
            className="h-auto w-full mx-auto transition-transform group-hover:scale-[1.02]"
          />
        </Link>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-brand-700/15 bg-gradient-to-br from-brand-50 to-amber-50 px-3 py-2">
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-brand-700" />
          <p className="text-[11px] leading-tight font-medium text-stone-700">
            FY 2083/84 <span className="text-stone-400">· Handover edition</span>
          </p>
        </div>
      </div>

      {MAIN_NAV.map((group) => {
        const items = group.items.filter(visible)
        if (!items.length) return null
        return (
          <div key={group.label}>
            <div className="px-2.5 pb-1.5 text-[10px] font-bold tracking-[0.18em] text-stone-400 uppercase">
              {group.label}
            </div>
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActive(pathname, item.href)
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-all',
                        active
                          ? 'bg-gradient-to-b from-brand-700 to-brand-800 font-semibold text-white shadow-[0_8px_20px_-8px_rgb(196_42_45/0.7)]'
                          : 'font-medium text-stone-600 hover:bg-stone-900/[0.05] hover:text-stone-900',
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition',
                          active ? 'text-brand-100' : 'text-stone-400 group-hover:text-stone-700',
                        )}
                      />
                      <span className="flex-1 truncate">{item.label}</span>
                      {active ? (
                        <ChevronRight className="h-3.5 w-3.5 text-brand-200" />
                      ) : null}
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
          <div className="flex items-center justify-between px-2.5 pb-1.5">
            <span className="text-[10px] font-bold tracking-[0.18em] text-stone-400 uppercase">
              Step guides
            </span>
            <Link
              href="/guides"
              className="text-[11px] font-semibold text-brand-700 hover:underline"
              onClick={() => setOpen(false)}
            >
              All
            </Link>
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
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12.5px] transition',
                      active
                        ? 'bg-brand-700/10 font-semibold text-brand-900'
                        : 'text-stone-500 hover:bg-stone-900/[0.04] hover:text-stone-800',
                    )}
                  >
                    <span
                      className={cn(
                        'h-1.5 w-1.5 shrink-0 rounded-full',
                        active ? 'bg-brand-600' : 'bg-stone-300',
                      )}
                    />
                    <span className="truncate">
                      {g.sheet} · {g.title}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto space-y-2 px-1 pt-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#221b1b] via-[#3a2a2a] to-brand-800 p-3.5 text-white shadow-pop">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                'radial-gradient(180px 90px at 85% -10%, rgba(236,52,54,0.5), transparent 70%), radial-gradient(140px 80px at 0% 110%, rgba(201,155,63,0.35), transparent 70%)',
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.16em] text-brand-200 uppercase">
              <ShieldCheck className="h-3.5 w-3.5" /> {user.role === 'ADMIN' ? 'Administrator' : 'Board view'}
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-white/85">
              {user.role === 'ADMIN'
                ? 'You can edit every sheet, guide and roster.'
                : 'Read-only access across the workspace.'}
            </p>
          </div>
        </div>
      </div>
    </nav>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-stone-200/80 bg-white/85 backdrop-blur-xl lg:block">
        <ScrollArea orientation="vertical" className="h-full">
          {nav}
        </ScrollArea>
      </aside>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Close navigation"
            className="absolute inset-0 bg-stone-900/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-[280px] overflow-hidden rounded-r-3xl bg-white shadow-pop">
            <ScrollArea orientation="vertical" className="h-full">
              {nav}
            </ScrollArea>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-white/75 backdrop-blur-xl">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-xl border border-stone-200 bg-white p-2 text-stone-600 shadow-sm hover:bg-stone-50 lg:hidden"
              aria-label="Toggle navigation"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <div className="hidden min-w-0 md:block">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-400">
                <span>Workspace</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-stone-700">{crumb}</span>
              </div>
              <div className="mt-0.5 truncate text-[13px] font-bold tracking-tight text-stone-900">
                Administrative, Governance &amp; Legal Compliance
                <span className="ml-2 rounded-full bg-brand-700/10 px-2 py-0.5 align-middle text-[10px] font-bold tracking-wide text-brand-800 uppercase">
                  {monthMeta.name} · mo {currentMonth}/12
                </span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white py-2 pr-3 pl-3 text-sm shadow-sm transition hover:border-brand-600/40 hover:shadow-md">
                <CalendarRange className="h-4 w-4 text-brand-700" />
                <span className="sr-only">Current Nepali month</span>
                <select
                  className="cursor-pointer bg-transparent text-[13px] font-semibold text-stone-800 focus:outline-none"
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
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    monthPending ? 'animate-pulse bg-amber-500' : 'bg-emerald-500',
                  )}
                />
              </label>

              <div className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white py-1.5 pr-1.5 pl-1.5 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-700 to-[#241b1b] text-[11px] font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="hidden text-left leading-tight xl:block">
                  <span className="block max-w-[9rem] truncate text-[12px] font-bold text-stone-800">
                    {user.name}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-medium text-stone-500">
                    {user.role === 'ADMIN' ? (
                      <ShieldCheck className="h-3 w-3 text-brand-700" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                    {user.role === 'ADMIN' ? 'Administrator' : 'Board / Viewer'}
                  </span>
                </span>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="rounded-lg p-2 text-stone-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>

        <footer className="border-t border-stone-200/70 bg-white/60 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex w-full max-w-[1440px] flex-wrap items-center justify-between gap-2 text-[11px] text-stone-400">
            <span>
              Samaanta Development Foundation · Sajha Complex, Thapagaun, Kathmandu ·{' '}
              <a
                href="https://samaantafoundation.org"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-brand-700 hover:underline"
              >
                samaantafoundation.org
              </a>
            </span>
            <span className="font-medium">
              Verify statutory deadlines with IRD / OCR / SWC / Ward before filing.
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
