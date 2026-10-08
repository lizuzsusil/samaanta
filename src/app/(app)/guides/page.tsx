import Link from 'next/link'
import { requirePermission } from '@/lib/auth'
import { getGuides } from '@/lib/queries'
import { PageHeader, Card, Progress, Badge } from '@/components/ui/primitives'
import { ArrowUpRight } from 'lucide-react'

export const metadata = { title: 'Step Guides' }

export default async function GuidesIndexPage() {
  await requirePermission('guides', 'read')
  const guides = await getGuides()

  return (
    <div className="space-y-5">
      <PageHeader
        title="Step guides"
        subtitle="Detailed process and document checklist for each compliance area — open a guide to mark steps Done and documents Ready."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {guides.map((g) => {
          const stepsDone = g.steps.filter((s) => s.status === 'Done').length
          const docsReady = g.docs.filter((d) => d.ready === 'Yes').length
          const stepPct = g.steps.length ? stepsDone / g.steps.length : 0
          const docPct = g.docs.length ? docsReady / g.docs.length : 0

          return (
            <Link key={g.slug} href={`/guides/${g.slug}`} className="group">
              <Card className="h-full transition group-hover:-translate-y-0.5 group-hover:border-indigo-300 group-hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.16em] text-indigo-500 uppercase">
                      {g.sheet}
                    </div>
                    <h2 className="mt-1 text-sm font-semibold text-slate-900">{g.title}</h2>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500" />
                </div>

                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-500">
                  {g.subtitle}
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Steps done</span>
                      <span className="tabular-nums">
                        {stepsDone}/{g.steps.length}
                      </span>
                    </div>
                    <Progress value={stepPct} />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Docs ready</span>
                      <span className="tabular-nums">
                        {docsReady}/{g.docs.length}
                      </span>
                    </div>
                    <Progress value={docPct} tone="green" />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
                  <Badge value={stepPct === 1 ? 'Completed' : stepPct > 0 ? 'In Progress' : 'Not Started'} />
                  <span className="truncate text-[11px] text-slate-400">{g.window || g.frequency}</span>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
