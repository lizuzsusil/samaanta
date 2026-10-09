import { Skeleton } from '@/components/ui/primitives'

export function ShellSkeleton() {
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-[272px] shrink-0 border-r border-stone-200 bg-white lg:block">
        <div className="space-y-4 px-5 py-6">
          <Skeleton className="h-10 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-full" />
            <Skeleton className="h-7 w-full" />
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="border-b border-stone-200 bg-white/80 px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-6 w-72" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-36" />
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1440px] flex-1 space-y-5 px-6 py-8">
          <Skeleton className="h-36 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-72" />
        </main>
      </div>
    </div>
  )
}
