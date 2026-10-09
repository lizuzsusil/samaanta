import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Landmark, ShieldCheck, CalendarRange, BookOpenCheck } from 'lucide-react'
import { getSessionUser } from '@/lib/auth'
import { LoginForm } from './login-form'
import { Skeleton } from '@/components/ui/primitives'

export const metadata = { title: 'Sign in' }

const HIGHLIGHTS = [
  {
    icon: ShieldCheck,
    title: 'Audit-ready chain',
    text: 'Audit → tax clearance → OCR → ward → SWC → exemption, tracked end to end.',
  },
  {
    icon: CalendarRange,
    title: 'Full FY calendar',
    text: 'Shrawan 2083 – Asadh 2084 with every deadline, owner and colour key.',
  },
  {
    icon: BookOpenCheck,
    title: 'Guides + book-keeping',
    text: 'Step-by-step processes, document checklists, TDS, rent and salaries.',
  },
]

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-paper">
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
      {/* Left — brand panel */}
      <div className="relative hidden w-[52%] overflow-hidden bg-shell lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 300px at 20% 0%, rgba(45,212,191,0.35), transparent 65%), radial-gradient(500px 260px at 90% 20%, rgba(201,155,63,0.28), transparent 65%), radial-gradient(700px 400px at 50% 110%, rgba(255,255,255,0.07), transparent 60%), linear-gradient(180deg, #0d1f1c 0%, #14302b 55%, #0b5f57 130%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(80% 70% at 30% 20%, black, transparent)',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur">
                <Landmark className="h-5 w-5 text-teal-200" />
              </span>
              <div>
                <div className="text-[11px] font-bold tracking-[0.28em] text-teal-200 uppercase">
                  Samaanta Development Foundation
                </div>
                <div className="text-xs text-white/60">Compliance workspace · FY 2083/84</div>
              </div>
            </div>
            <h1 className="font-display mt-10 max-w-md text-[40px] leading-[1.05] font-semibold tracking-tight text-balance">
              Every filing, on time, with proof.
            </h1>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/65">
              One workspace for the annual compliance chain: audit, tax clearance, OCR, ward
              renewal, SWC, tax exemption, banking KYC and governance records.
            </p>
          </div>

          <div className="space-y-3">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon
              return (
                <div
                  key={h.title}
                  className="flex items-start gap-3 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 backdrop-blur"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-400/15 text-teal-200 ring-1 ring-teal-300/20">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-[13px] font-bold">{h.title}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-white/60">
                      {h.text}
                    </span>
                  </span>
                </div>
              )
            })}
            <p className="pt-1 text-[11px] text-white/40">
              Shrawan 2083 – Asadh 2084 (2026/27) · Handover edition
            </p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex w-full items-center justify-center px-5 py-10 lg:w-[48%]">
        <div className="rise w-full max-w-sm">
          <div className="mb-7 lg:hidden">
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-teal-700 to-[#0d1f1c] text-white">
                <Landmark className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-stone-900">Samaanta Development Foundation</span>
            </div>
          </div>
          <div className="rounded-3xl border border-stone-200/80 bg-white/90 p-7 shadow-pop backdrop-blur sm:p-8">
            <div className="text-[10px] font-bold tracking-[0.24em] text-teal-700 uppercase">
              Compliance workspace
            </div>
            <h2 className="font-display mt-1.5 text-[28px] font-semibold tracking-tight text-stone-900">
              Welcome back
            </h2>
            <p className="mt-1 text-[13px] text-stone-500">
              Sign in with your assigned account to continue.
            </p>

            <div className="mt-6">
              <LoginForm next={next} />
            </div>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5 text-xs leading-relaxed text-stone-500">
              <p className="text-[11px] font-bold tracking-wide text-stone-600 uppercase">
                Demo accounts
              </p>
              <p className="mt-1.5 font-mono text-[12px]">
                admin@samaanta.org.np · Admin@2083
                <br />
                board@samaanta.org.np · Board@2083
              </p>
            </div>
          </div>
          <p className="mt-4 text-center text-[11px] text-stone-400">
            Verify statutory deadlines with IRD / OCR / SWC / Ward before filing.
          </p>
        </div>
      </div>
    </div>
  )
}
