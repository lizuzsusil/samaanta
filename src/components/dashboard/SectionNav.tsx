'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { ScrollArea } from '@/components/ui/scroll-area'

export function SectionNav({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    for (const s of sections) {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [sections])

  return (
    <nav
      aria-label="Dashboard sections"
      className="sticky top-[65px] z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <ScrollArea
        orientation="horizontal"
        className="rounded-2xl border border-stone-200/80 bg-white/85 shadow-card backdrop-blur-xl"
      >
        <ul className="flex gap-1 p-1.5">
        {sections.map((s, i) => (
          <li key={s.id} className="shrink-0">
            <a
              href={`#${s.id}`}
              onClick={() => setActive(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap transition-all',
                active === s.id
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'text-stone-500 hover:bg-stone-900/[0.05] hover:text-stone-900',
              )}
            >
              <span
                className={cn(
                  'grid h-5 w-5 place-items-center rounded-md text-[10px] font-bold tabular-nums',
                  active === s.id ? 'bg-white/15 text-white' : 'bg-stone-900/[0.06] text-stone-500',
                )}
              >
                {i + 1}
              </span>
              {s.label}
            </a>
          </li>
        ))}
        </ul>
      </ScrollArea>
    </nav>
  )
}
