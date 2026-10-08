import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/auth'
import { LoginForm } from './login-form'
import { Skeleton } from '@/components/ui/primitives'

export const metadata = { title: 'Sign in' }

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-100">
          <Skeleton className="h-80 w-full max-w-sm" />
        </div>
      }
    >
      <LoginContent searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginContent({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const user = await getSessionUser()
  if (user) redirect('/dashboard')

  const params = await searchParams
  const next = typeof params.next === 'string' && params.next.startsWith('/') ? params.next : '/dashboard'

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-shell lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(79,70,229,0.35),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <div className="text-xs font-semibold tracking-[0.3em] text-indigo-300 uppercase">
              Samaanta Development Foundation
            </div>
            <h1 className="mt-6 max-w-md text-3xl leading-tight font-semibold">
              Administrative, Governance &amp; Legal Compliance
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
              One workspace for the annual compliance chain: audit, tax clearance, OCR, ward
              renewal, SWC, tax exemption, banking KYC and governance records.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-4 text-sm">
            <div className="rounded-xl bg-white/5 p-4">
              <dt className="text-[11px] tracking-wide text-slate-400 uppercase">Fiscal year</dt>
              <dd className="mt-1 font-medium">2083/84</dd>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <dt className="text-[11px] tracking-wide text-slate-400 uppercase">Tasks</dt>
              <dd className="mt-1 font-medium">14 tracked</dd>
            </div>
            <div className="rounded-xl bg-white/5 p-4">
              <dt className="text-[11px] tracking-wide text-slate-400 uppercase">Guides</dt>
              <dd className="mt-1 font-medium">9 processes</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="flex w-full items-center justify-center px-5 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="text-xs font-semibold tracking-[0.25em] text-indigo-600 uppercase">
              Compliance workspace
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Use your assigned account to continue.</p>
          </div>

          <LoginForm next={next} />

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-600">Demo accounts</p>
            <p className="mt-1">
              admin@samaanta.org.np · Admin@2083
              <br />
              board@samaanta.org.np · Board@2083
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
