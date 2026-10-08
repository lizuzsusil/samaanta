'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

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
      className="sticky top-16 z-20 -mx-4 border-y border-stone-200/70 bg-paper/90 px-4 backdrop-blur sm:-mx-6 sm:px-6"
    >
      <ul className="flex gap-1 overflow-x-auto py-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={() => setActive(s.id)}
              aria-current={active === s.id ? 'true' : undefined}
              className={cn(
                'block rounded-full px-3.5 py-1.5 text-[13px] font-medium whitespace-nowrap transition',
                active === s.id
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-500 hover:bg-stone-900/5 hover:text-stone-900',
              )}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
