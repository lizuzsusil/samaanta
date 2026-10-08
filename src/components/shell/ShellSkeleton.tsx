import { Skeleton } from '@/components/ui/primitives'

export function ShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-slate-800 bg-shell lg:block">
        <div className="space-y-4 px-5 py-6">
          <Skeleton tone="dark" className="h-10 w-40" />
          <div className="space-y-2">
            <Skeleton tone="dark" className="h-4 w-24" />
            <Skeleton tone="dark" className="h-8 w-full" />
            <Skeleton tone="dark" className="h-8 w-full" />
            <Skeleton tone="dark" className="h-8 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton tone="dark" className="h-4 w-24" />
            <Skeleton tone="dark" className="h-6 w-full" />
            <Skeleton tone="dark" className="h-6 w-full" />
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton tone="dark" className="h-5 w-72" />
            <div className="flex items-center gap-2">
              <Skeleton tone="dark" className="h-8 w-36" />
              <Skeleton tone="dark" className="h-8 w-36" />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] flex-1 space-y-5 px-6 py-6">
          <Skeleton tone="dark" className="h-8 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton tone="dark" className="h-24" />
            <Skeleton tone="dark" className="h-24" />
            <Skeleton tone="dark" className="h-24" />
          </div>
          <Skeleton tone="dark" className="h-72" />
        </main>
      </div>
    </div>
  )
}
