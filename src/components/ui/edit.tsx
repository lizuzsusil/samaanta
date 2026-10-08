'use client'

import { useState, useTransition, type ChangeEvent } from 'react'
import { cn } from '@/lib/cn'

type Commit = (value: string) => Promise<{ ok: boolean; error?: string }>

/** Spreadsheet-style text cell: commits on blur or Enter. */
export function TextCell({
  value,
  onCommit,
  disabled,
  placeholder,
  className,
  align = 'left',
}: {
  value: string
  onCommit: Commit
  disabled?: boolean
  placeholder?: string
  className?: string
  align?: 'left' | 'right'
}) {
  const [local, setLocal] = useState(value)
  const [prev, setPrev] = useState(value)
  const [pending, startTransition] = useTransition()

  if (value !== prev) {
    setPrev(value)
    setLocal(value)
  }

  const commit = () => {
    if (local === value) return
    startTransition(async () => {
      await onCommit(local)
    })
  }

  if (disabled) {
    return (
      <span className={cn('block px-2 py-1 text-sm text-slate-700', className)}>
        {value || <span className="text-slate-300">—</span>}
      </span>
    )
  }

  return (
    <input
      value={local}
      placeholder={placeholder}
      disabled={pending}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
        if (e.key === 'Escape') {
          setLocal(value)
          e.currentTarget.blur()
        }
      }}
      className={cn(
        'cell-input text-sm',
        align === 'right' && 'text-right tabular-nums',
        pending && 'opacity-60',
        className,
      )}
    />
  )
}

/** Spreadsheet-style select cell: commits immediately. */
export function SelectCell({
  value,
  options,
  onCommit,
  disabled,
  className,
  ariaLabel,
}: {
  value: string
  options: readonly (string | { value: string; label: string })[]
  onCommit: Commit
  disabled?: boolean
  className?: string
  ariaLabel?: string
}) {
  const [local, setLocal] = useState(value)
  const [prev, setPrev] = useState(value)
  const [pending, startTransition] = useTransition()

  if (value !== prev) {
    setPrev(value)
    setLocal(value)
  }

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value
    if (next === value) return
    setLocal(next)
    startTransition(async () => {
      const res = await onCommit(next)
      if (!res.ok) setLocal(value)
    })
  }

  return (
    <select
      aria-label={ariaLabel}
      value={local}
      disabled={disabled || pending}
      onChange={handleChange}
      className={cn(
        'w-full cursor-pointer rounded-md border border-transparent bg-transparent px-2 py-1 text-sm transition',
        'hover:border-slate-300 hover:bg-white focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-200',
        disabled && 'cursor-default hover:border-transparent hover:bg-transparent',
        pending && 'opacity-60',
        className,
      )}
    >
      {options.map((o) => (
        <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : o.value}>
          {typeof o === 'string' ? o : o.label}
        </option>
      ))}
    </select>
  )
}
