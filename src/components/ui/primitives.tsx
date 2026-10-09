import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { AlertCircle, CheckCircle2, Info, Inbox } from 'lucide-react'
import { cn } from '@/lib/cn'
import { STATUS_STYLES } from '@/lib/constants'

export function Card({
  children,
  className,
  padded = true,
  lift = false,
}: {
  children: ReactNode
  className?: string
  padded?: boolean
  lift?: boolean
}) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 shadow-card backdrop-blur-sm',
        lift && 'card-lift',
        padded && 'p-5 sm:p-6',
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
  eyebrow,
}: {
  title: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  icon?: LucideIcon
  className?: string
  eyebrow?: string
}) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-start justify-between gap-3', className)}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-600 text-white shadow-[0_6px_16px_-6px_rgb(196_42_45/0.6)]">
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          {eyebrow ? (
            <div className="mb-0.5 text-[10px] font-bold tracking-[0.18em] text-brand-700 uppercase">
              {eyebrow}
            </div>
          ) : null}
          <h2 className="font-display text-[18px] leading-snug font-semibold tracking-tight text-stone-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-stone-500">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  )
}

const DOT_STYLES: Record<string, string> = {
  Completed: 'bg-emerald-500',
  Submitted: 'bg-sky-500',
  'In Progress': 'bg-amber-500',
  'Not Started': 'bg-stone-400',
  'On Hold': 'bg-rose-500',
  Done: 'bg-emerald-500',
  Yes: 'bg-emerald-500',
  No: 'bg-rose-500',
  Pending: 'bg-amber-500',
  Deposited: 'bg-sky-500',
  'Deposited & Filed': 'bg-emerald-500',
  Late: 'bg-rose-500',
  High: 'bg-rose-500',
  Medium: 'bg-amber-500',
  Low: 'bg-stone-400',
}

export function Badge({ value, className }: { value: string; className?: string }) {
  const fallback = className ? '' : 'bg-stone-100 text-stone-700 ring-stone-200'
  const style = STATUS_STYLES[value] ?? fallback
  const dot = DOT_STYLES[value]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap ring-1 ring-inset',
        style,
        className,
      )}
    >
      {dot ? (
        <span className={cn('h-1.5 w-1.5 rounded-full shadow-sm', dot)}>
          <span className="sr-only">·</span>
        </span>
      ) : null}
      {value}
    </span>
  )
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl font-semibold tracking-tight transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-brand-700'
  const sizes =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : size === 'lg'
        ? 'px-5 py-3 text-sm'
        : 'px-4 py-2.5 text-sm'
  const variants = {
    primary:
      'bg-gradient-to-b from-brand-600 to-brand-800 text-white shadow-[0_8px_20px_-8px_rgb(196_42_45/0.7),inset_0_1px_0_rgb(255_255_255/0.2)] hover:from-brand-500 hover:to-brand-700 hover:shadow-[0_12px_28px_-8px_rgb(196_42_45/0.7)]',
    secondary:
      'border border-stone-300/90 bg-white text-stone-800 shadow-[0_1px_2px_rgb(0_0_0/0.05)] hover:border-stone-400 hover:bg-stone-50',
    ghost: 'text-stone-600 hover:bg-stone-900/5 hover:text-stone-900',
    danger:
      'border border-rose-200 bg-gradient-to-b from-rose-50 to-white text-rose-700 shadow-sm hover:border-rose-300 hover:bg-rose-50',
    gold: 'bg-gradient-to-b from-[#c99b3f] to-[#9a6f1e] text-white shadow-[0_8px_20px_-8px_rgb(184_134_46/0.7)] hover:brightness-110',
  }[variant]
  return <button type={type} className={cn(base, sizes, variants, className)} {...props} />
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
  crumb,
}: {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  eyebrow?: string
  crumb?: string
}) {
  return (
    <header className="rise mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {crumb || eyebrow ? (
          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase">
            {crumb ? <span className="text-stone-400">{crumb}</span> : null}
            {crumb && eyebrow ? <span className="text-stone-300">/</span> : null}
            {eyebrow ? <span className="text-brand-700">{eyebrow}</span> : null}
          </div>
        ) : null}
        <h1 className="font-display max-w-3xl text-[30px] leading-[1.1] font-semibold tracking-tight text-balance text-stone-900 sm:text-[34px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-pretty text-stone-500">
            {subtitle}
          </p>
        ) : null}
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
  icon: Icon,
  delta,
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'slate' | 'green' | 'amber' | 'blue' | 'rose' | 'brand'
  icon?: LucideIcon
  delta?: string
}) {
  const ring = {
    slate: 'border-stone-200/90',
    green: 'border-emerald-200/90',
    amber: 'border-amber-200/90',
    blue: 'border-sky-200/90',
    rose: 'border-rose-200/90',
    brand: 'border-brand-600/25',
  }[tone]
  const valueTones = {
    slate: 'text-stone-900',
    green: 'text-emerald-700',
    amber: 'text-amber-700',
    blue: 'text-sky-700',
    rose: 'text-rose-700',
    brand: 'text-brand-800',
  }[tone]
  const iconBg = {
    slate: 'bg-stone-100 text-stone-600',
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-sky-100 text-sky-700',
    rose: 'bg-rose-100 text-rose-700',
    brand: 'bg-brand-700 text-white',
  }[tone]
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-pop',
        ring,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-bold tracking-[0.14em] text-stone-500 uppercase">
          {label}
        </div>
        {Icon ? (
          <span className={cn('grid h-7 w-7 place-items-center rounded-lg', iconBg)}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        ) : null}
      </div>
      <div className={cn('mt-1.5 text-[28px] leading-none font-semibold tracking-tight tabular-nums', valueTones)}>
        {value}
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        {delta ? (
          <span className="rounded-full bg-stone-900 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
            {delta}
          </span>
        ) : null}
        {hint ? <div className="truncate text-xs text-stone-500">{hint}</div> : null}
      </div>
    </div>
  )
}

export function Progress({
  value,
  tone = 'brand',
}: {
  value: number
  tone?: 'brand' | 'green' | 'gold'
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100
  const bar =
    tone === 'green'
      ? 'from-emerald-500 to-emerald-600'
      : tone === 'gold'
        ? 'from-amber-400 to-amber-600'
        : 'from-brand-500 to-brand-700'
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-900/8 shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)]">
      <div
        className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-700', bar)}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export function EmptyState({
  title,
  hint,
  icon: Icon = Inbox,
}: {
  title: string
  hint?: string
  icon?: LucideIcon
}) {
  return (
    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 px-4 py-10 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-white text-stone-400 shadow-card">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-stone-700">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-stone-400">{hint}</p> : null}
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
  if (tone === 'dark') {
    return <div className={cn('animate-pulse rounded-lg bg-white/10', className)} />
  }
  return <div className={cn('skeleton-shimmer rounded-lg', className)} />
}

export function PageSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success' | 'warn'
  children: ReactNode
}) {
  const tones = {
    info: 'border-sky-200 bg-sky-50/80 text-sky-900',
    error: 'border-rose-200 bg-rose-50/80 text-rose-900',
    success: 'border-emerald-200 bg-emerald-50/80 text-emerald-900',
    warn: 'border-amber-200 bg-amber-50/80 text-amber-900',
  }[tone]
  const Icon = tone === 'error' ? AlertCircle : tone === 'success' ? CheckCircle2 : Info
  return (
    <div
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm',
        tones,
      )}
      role="status"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
      <div className="min-w-0">{children}</div>
    </div>
  )
}
