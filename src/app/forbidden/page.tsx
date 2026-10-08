import Link from 'next/link'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export const metadata = { title: 'Not permitted' }

export default function ForbiddenPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-5">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-600">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">Not permitted</h1>
        <p className="mt-2 text-sm text-slate-500">
          Your role does not include access to this area. Ask an administrator if you need it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
