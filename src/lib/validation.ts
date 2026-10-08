import { z } from 'zod'

/** zod enum helper that accepts a plain string array (Prisma stores strings). */
export function zChoice(values: readonly string[]) {
  return z.string().refine((v) => values.includes(v), { message: 'Invalid choice' })
}
