import 'server-only'
import { cookies } from 'next/headers'
import { MONTH_COOKIE, BS_MONTHS } from './constants'

/** Selected Nepali month (1-12). Defaults to Shrawan, month 1. */
export async function readCurrentMonth(): Promise<number> {
  const jar = await cookies()
  const raw = Number(jar.get(MONTH_COOKIE)?.value ?? NaN)
  return BS_MONTHS.some((m) => m.n === raw) ? raw : 1
}
