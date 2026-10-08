import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { STATUS_STYLES } from '@/lib/constants'

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-slate-200/90 bg-white shadow-card',
        padded && 'p-5',
        className,
      )}
    >
      {children}
    </section>
  )
}

export function CardHeader({
  title,
  subtitle,
  action,
  icon: Icon,
  className,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  icon?: LucideIcon
  className?: string
}) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-2">
        {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" /> : null}
        <div>
        <h2 className="font-display text-[17px] font-semibold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  )
}

export function Badge({ value, className }: { value: string; className?: string }) {
  const fallback = className ? '' : 'bg-slate-100 text-slate-700 ring-slate-200'
  const style = STATUS_STYLES[value] ?? fallback
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        style,
        className,
      )}
    >
      {value}
    </span>
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50'
  const sizes = size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
  const variants = {
    primary: 'bg-teal-700 text-white hover:bg-teal-600 shadow-sm',
    secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
    danger: 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
  }[variant]
  return <button type={type} className={cn(base, sizes, variants, className)} {...props} />
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[26px] leading-tight font-semibold text-slate-900">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-3xl text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  )
}

export function Stat({
  label,
  value,
  hint,
  tone = 'slate',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'slate' | 'green' | 'amber' | 'blue' | 'rose' | 'teal'
}) {
  const tones = {
    slate: 'border-slate-200',
    green: 'border-emerald-200',
    amber: 'border-amber-200',
    blue: 'border-sky-200',
    rose: 'border-rose-200',
    teal: 'border-teal-600/30',
  }[tone]
  const valueTones = {
    slate: 'text-slate-900',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
    blue: 'text-sky-700',
    rose: 'text-rose-700',
    teal: 'text-teal-700',
  }[tone]
  return (
    <div className={cn('rounded-xl border bg-white p-4 shadow-card', tones)}>
      <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        {label}
      </div>
      <div className={cn('mt-1 text-2xl font-semibold tabular-nums', valueTones)}>{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </div>
  )
}

export function Progress({ value, tone = 'teal' }: { value: number; tone?: 'teal' | 'green' }) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const bar = tone === 'green' ? 'bg-emerald-500' : 'bg-teal-600'
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={cn('h-full rounded-full transition-all', bar)} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center">
      <p className="text-sm font-medium text-slate-600">{title}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function Skeleton({
  className,
  tone = 'light',
}: {
  className?: string
  tone?: 'light' | 'dark'
}) {
  const bg = tone === 'dark' ? 'bg-white/10' : 'bg-slate-200'
  return <div className={cn('animate-pulse rounded-md', bg, className)} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success'
  children: ReactNode
}) {
  const tones = {
    info: 'border-sky-200 bg-sky-50 text-sky-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  }[tone]
  return (
    <div className={cn('rounded-lg border px-3 py-2 text-sm', tones)} role="status">
      {children}
    </div>
  )
}
