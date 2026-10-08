import 'server-only'

import { PrismaClient } from '@prisma/client'
import { seedDatabase } from '../../prisma/seed'

/**
 * Demo-mode database boot for hosting without a managed database (e.g. Vercel).
 *
 * When DEMO_MODE=true, the app uses a throwaway SQLite file and this ensures it
 * exists, has tables, and is seeded — once per server instance. Every instance
 * gets its own copy, so demo edits evaporate on redeploys and cold starts.
 * NEVER enable for real use: wire DATABASE_URL to Postgres instead.
 */
const DEMO_DDL = `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Permission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "role" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "canRead" BOOLEAN NOT NULL DEFAULT false,
    "canWrite" BOOLEAN NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "detail" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "window" TEXT NOT NULL,
    "fromMo" INTEGER NOT NULL,
    "toMo" INTEGER NOT NULL,
    "priority" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dateStarted" TEXT NOT NULL DEFAULT '',
    "dateSubmitted" TEXT NOT NULL DEFAULT '',
    "dateCompleted" TEXT NOT NULL DEFAULT '',
    "nextFollowup" TEXT NOT NULL DEFAULT '',
    "submitTo" TEXT NOT NULL DEFAULT '',
    "documents" TEXT NOT NULL DEFAULT '',
    "notes" TEXT NOT NULL DEFAULT '',
    "guideSlug" TEXT,
    "dropbox" TEXT NOT NULL DEFAULT '',
    "updatedAt" DATETIME NOT NULL
);
CREATE TABLE IF NOT EXISTS "CalendarActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "sort" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "CalendarCell" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    CONSTRAINT "CalendarCell_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "CalendarActivity" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "Guide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "sheet" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "authority" TEXT NOT NULL DEFAULT '',
    "frequency" TEXT NOT NULL DEFAULT '',
    "window" TEXT NOT NULL DEFAULT '',
    "owner" TEXT NOT NULL DEFAULT '',
    "dependsOn" TEXT NOT NULL DEFAULT '',
    "feedsInto" TEXT NOT NULL DEFAULT '',
    "output" TEXT NOT NULL DEFAULT '',
    "handoverOwner" TEXT NOT NULL DEFAULT '',
    "dropbox" TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS "GuideStep" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guideId" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "when" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "remarks" TEXT NOT NULL DEFAULT '',
    "dateDone" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL,
    CONSTRAINT "GuideStep_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "GuideDoc" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guideId" TEXT NOT NULL,
    "no" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "source" TEXT NOT NULL DEFAULT '',
    "link" TEXT NOT NULL DEFAULT '',
    "ready" TEXT NOT NULL,
    "remarks" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL,
    CONSTRAINT "GuideDoc_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "GuideTip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guideId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sort" INTEGER NOT NULL,
    CONSTRAINT "GuideTip_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "MonthlyRecord" (
    "month" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tdsStatus" TEXT NOT NULL DEFAULT 'Pending',
    "tdsAmount" REAL NOT NULL DEFAULT 0,
    "tdsDate" TEXT NOT NULL DEFAULT '',
    "tdsVoucher" TEXT NOT NULL DEFAULT '',
    "rentAmount" REAL NOT NULL DEFAULT 0,
    "rentDate" TEXT NOT NULL DEFAULT '',
    "rentVoucher" TEXT NOT NULL DEFAULT '',
    "income" REAL NOT NULL DEFAULT 0,
    "expenses" REAL NOT NULL DEFAULT 0,
    "bookStatus" TEXT NOT NULL DEFAULT 'Not Started',
    "bookDate" TEXT NOT NULL DEFAULT '',
    "salaryDate" TEXT NOT NULL DEFAULT '',
    "remarks" TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS "Staff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "designation" TEXT NOT NULL DEFAULT '',
    "pan" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "Salary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Salary_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE TABLE IF NOT EXISTS "ContentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "section" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "value" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "authority" TEXT NOT NULL,
    "usedFor" TEXT NOT NULL DEFAULT '',
    "office" TEXT NOT NULL DEFAULT '',
    "person" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "HandoverItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item" TEXT NOT NULL,
    "detail" TEXT NOT NULL DEFAULT '',
    "owner" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL,
    "sort" INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS "DropboxFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "area" TEXT NOT NULL,
    "url" TEXT NOT NULL DEFAULT '',
    "folder" TEXT NOT NULL DEFAULT '',
    "contents" TEXT NOT NULL DEFAULT '',
    "lastChecked" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Permission_role_module_key" ON "Permission"("role", "module");
CREATE INDEX IF NOT EXISTS "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "Task_code_key" ON "Task"("code");
CREATE INDEX IF NOT EXISTS "Task_area_idx" ON "Task"("area");
CREATE INDEX IF NOT EXISTS "CalendarCell_month_idx" ON "CalendarCell"("month");
CREATE UNIQUE INDEX IF NOT EXISTS "CalendarCell_activityId_month_key" ON "CalendarCell"("activityId", "month");
CREATE UNIQUE INDEX IF NOT EXISTS "Guide_slug_key" ON "Guide"("slug");
CREATE INDEX IF NOT EXISTS "GuideStep_guideId_idx" ON "GuideStep"("guideId");
CREATE INDEX IF NOT EXISTS "GuideDoc_guideId_idx" ON "GuideDoc"("guideId");
CREATE INDEX IF NOT EXISTS "GuideTip_guideId_idx" ON "GuideTip"("guideId");
CREATE UNIQUE INDEX IF NOT EXISTS "Salary_staffId_month_key" ON "Salary"("staffId", "month");
CREATE UNIQUE INDEX IF NOT EXISTS "ContentItem_section_key_key" ON "ContentItem"("section", "key");
`

function isNoSuchTable(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) return false
  const { code, meta } = error as { code?: string; meta?: { message?: string } }
  // Prisma-table calls miss with P2021; raw queries surface sqlite directly as P2010.
  if (code === 'P2021') return true
  return code === 'P2010' && (meta?.message ?? '').includes('no such table')
}

async function bootDemoDb(client: PrismaClient): Promise<void> {
  let users = 0
  try {
    const rows = await client.$queryRawUnsafe<Array<{ n: bigint }>>(
      'SELECT COUNT(*) AS n FROM "User"',
    )
    users = Number(rows[0]?.n ?? 0)
  } catch (error) {
    if (!isNoSuchTable(error)) throw error
  }
  if (users > 0) return

  for (const stmt of DEMO_DDL.split(';')) {
    const sql = stmt.trim()
    if (sql) await client.$executeRawUnsafe(sql)
  }
  await client.$transaction((tx) => seedDatabase(tx), { timeout: 20000 })
  console.log('[demo] database created and seeded')
}

export async function ensureDemoReady(): Promise<void> {
  if (process.env.DEMO_MODE !== 'true') return
  const client = new PrismaClient()
  try {
    await bootDemoDb(client)
  } finally {
    await client.$disconnect()
  }
}
