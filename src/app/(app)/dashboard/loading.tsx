import { Skeleton } from '@/components/ui/primitives'

function Block({ className = '' }: { className?: string }) {
  return <Skeleton className={`rounded-lg ${className}`} />
}

export default function DashboardLoading() {
  return (
    <div className="space-y-4" aria-label="Loading dashboard">
      <div className="space-y-2">
        <Skeleton className="h-7 w-80" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <Block className="h-10 w-full max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Block key={i} className="h-28" />
        ))}
      </div>
      <Block className="h-44" />
      <div className="grid gap-6 xl:grid-cols-3">
        <Block className="h-80 xl:col-span-2" />
        <Block className="h-80" />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Block className="h-72" />
        <Block className="h-72" />
      </div>
    </div>
  )
}
