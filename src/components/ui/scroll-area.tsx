'use client'

import { useMemo, type HTMLAttributes, type ReactNode } from 'react'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import type { PartialOptions } from 'overlayscrollbars'
import { cn } from '@/lib/cn'

export type ScrollOrientation = 'vertical' | 'horizontal' | 'both'

type ScrollAreaProps = {
  children: ReactNode
  className?: string
  /** Which axes may scroll. Defaults to 'both'. */
  orientation?: ScrollOrientation
  /** ms before the bars fade out after scrolling. Defaults to 800. */
  hideDelay?: number
  /** Deep-merge overrides for the underlying OverlayScrollbars options. */
  options?: PartialOptions
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>

/**
 * Global auto-reveal scroll container.
 *
 * Bars stay fully hidden until the pointer moves over the region or a
 * scroll happens, then fade back out. Use for every scrollable region
 * (sidebar, wide tables, pill navs) instead of `overflow-*-auto`.
 */
export function ScrollArea({
  children,
  className,
  orientation = 'both',
  hideDelay = 800,
  options,
  ...rest
}: ScrollAreaProps) {
  const merged = useMemo<PartialOptions>(
    () => ({
      ...options,
      overflow: {
        x: orientation === 'vertical' ? 'hidden' : 'scroll',
        y: orientation === 'horizontal' ? 'hidden' : 'scroll',
        ...options?.overflow,
      },
      scrollbars: {
        theme: 'os-theme-saam',
        visibility: 'auto',
        autoHide: 'move',
        autoHideDelay: hideDelay,
        dragScroll: true,
        ...options?.scrollbars,
      },
    }),
    [orientation, hideDelay, options],
  )

  return (
    <OverlayScrollbarsComponent options={merged} className={cn(className)} {...rest}>
      {children}
    </OverlayScrollbarsComponent>
  )
}
