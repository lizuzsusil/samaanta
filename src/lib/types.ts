export type ActionState = {
  ok: boolean
  error?: string
  message?: string
}

export type GuideStepInput = {
  status?: string
  remarks?: string
  dateDone?: string
}

export type PermissionMap = Partial<Record<string, { read: boolean; write: boolean }>>

export function canWrite(perms: PermissionMap | undefined, module: string) {
  return Boolean(perms?.[module]?.write)
}

export type ShellUser = {
  id: string
  email: string
  name: string
  role: string
  title: string | null
}
