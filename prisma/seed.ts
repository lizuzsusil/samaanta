import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import data from './appdata.json'

const prisma = new PrismaClient()

const TASK_GUIDE: Record<string, string | null> = {
  T01: 'audit',
  T02: 'tax-clearance',
  T03: 'tax-clearance',
  T04: 'ward-renewal',
  T05: 'ocr-update',
  T06: 'swc-renewal',
  T07: 'tax-exemption',
  T08: 'swc-program-approval',
  T09: 'bank-kyc',
  T10: 'bank-kyc',
  T11: null,
  T12: 'governance',
  T13: 'governance',
  T15: null,
}

const MODULES = [
  'dashboard',
  'calendar',
  'tasks',
  'bookkeeping',
  'guides',
  'startHere',
  'users',
  'audit',
]

async function main() {
  console.log('Seeding database…')

  // --- wipe ---
  await prisma.auditLog.deleteMany()
  await prisma.session.deleteMany()
  await prisma.permission.deleteMany()
  await prisma.calendarCell.deleteMany()
  await prisma.calendarActivity.deleteMany()
  await prisma.guideStep.deleteMany()
  await prisma.guideDoc.deleteMany()
  await prisma.guideTip.deleteMany()
  await prisma.guide.deleteMany()
  await prisma.task.deleteMany()
  await prisma.salary.deleteMany()
  await prisma.staff.deleteMany()
  await prisma.monthlyRecord.deleteMany()
  await prisma.contentItem.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.handoverItem.deleteMany()
  await prisma.dropboxFolder.deleteMany()
  await prisma.user.deleteMany()
  await prisma.setting.deleteMany()

  // --- settings ---
  await prisma.setting.create({ data: { key: 'currentMonth', value: '1' } })
  await prisma.setting.create({ data: { key: 'fiscalYear', value: data.meta.fy } })

  // --- RBAC ---
  const perms: { role: string; module: string; canRead: boolean; canWrite: boolean }[] = []
  for (const m of MODULES) perms.push({ role: 'ADMIN', module: m, canRead: true, canWrite: true })
  for (const m of MODULES) {
    const write = false
    const read = ['dashboard', 'calendar', 'tasks', 'bookkeeping', 'guides', 'startHere'].includes(m)
    perms.push({ role: 'VIEWER', module: m, canRead: read, canWrite: write })
  }
  await prisma.permission.createMany({ data: perms })

  // --- users ---
  const adminHash = await bcrypt.hash('Admin@2083', 10)
  const viewerHash = await bcrypt.hash('Board@2083', 10)
  await prisma.user.create({
    data: {
      email: 'admin@samaanta.org.np',
      name: 'Akhilesh Thakur',
      title: 'Senior Program Officer',
      role: 'ADMIN',
      passwordHash: adminHash,
    },
  })
  await prisma.user.create({
    data: {
      email: 'board@samaanta.org.np',
      name: 'Board Secretariat',
      title: 'Board / Viewer',
      role: 'VIEWER',
      passwordHash: viewerHash,
    },
  })

  // --- tasks ---
  for (const t of data.tasks) {
    await prisma.task.create({
      data: {
        code: t.id,
        area: t.area,
        title: t.task,
        frequency: t.frequency,
        window: t.window,
        fromMo: t.fromMo,
        toMo: t.toMo,
        priority: t.priority,
        responsible: t.responsible,
        status: t.status,
        dateStarted: t.dateStarted,
        dateSubmitted: t.dateSubmitted,
        dateCompleted: t.dateCompleted,
        nextFollowup: t.nextFollowup,
        submitTo: t.submitTo,
        documents: t.documents,
        notes: t.notes,
        guideSlug: TASK_GUIDE[t.id] ?? null,
        dropbox: t.dropbox,
      },
    })
  }

  // --- calendar ---
  for (let i = 0; i < data.calendar.length; i++) {
    const a = data.calendar[i]
    const act = await prisma.calendarActivity.create({
      data: { section: a.section, label: a.label, owner: a.owner, sort: i },
    })
    if (a.cells.length) {
      await prisma.calendarCell.createMany({
        data: a.cells.map((c) => ({
          activityId: act.id,
          month: c.month,
          text: c.text,
          kind: c.kind,
        })),
      })
    }
  }

  // --- guides ---
  for (let i = 0; i < data.guides.length; i++) {
    const g = data.guides[i]
    const guide = await prisma.guide.create({
      data: {
        slug: g.slug,
        sheet: g.sheet,
        sortOrder: i,
        title: g.title,
        subtitle: g.subtitle,
        authority: g.glance.authority ?? '',
        frequency: g.glance.frequency ?? '',
        window: g.glance.window ?? '',
        owner: g.glance.owner ?? '',
        dependsOn: g.glance.dependsOn ?? '',
        feedsInto: g.glance.feedsInto ?? '',
        output: g.glance.output ?? '',
        handoverOwner: g.glance.handoverOwner ?? '',
        dropbox: g.glance.dropbox ?? '',
      },
    })
    await prisma.guideStep.createMany({
      data: g.steps.map((s, idx) => ({
        guideId: guide.id,
        no: s.no,
        action: s.action,
        details: s.details,
        who: s.who,
        when: s.when,
        status: s.status,
        remarks: s.remarks,
        dateDone: s.dateDone,
        sort: idx,
      })),
    })
    await prisma.guideDoc.createMany({
      data: g.docs.map((d, idx) => ({
        guideId: guide.id,
        no: d.no,
        document: d.document,
        notes: d.notes,
        source: d.source,
        link: d.link,
        ready: d.ready,
        remarks: d.remarks,
        sort: idx,
      })),
    })
    await prisma.guideTip.createMany({
      data: g.tips.map((t, idx) => ({ guideId: guide.id, text: t, sort: idx })),
    })
  }

  // --- bookkeeping ---
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  for (const m of months) {
    const idx = m - 1
    const num = (v: string) => (v.trim() === '' ? 0 : Number(v))
    await prisma.monthlyRecord.create({
      data: {
        month: m,
        tdsStatus: data.book.tdsStatus[idx] || 'Pending',
        tdsAmount: num(data.book.tdsAmount[idx]),
        tdsDate: data.book.tdsDate[idx] ?? '',
        tdsVoucher: data.book.tdsVoucher[idx] ?? '',
        rentAmount: num(data.book.rentAmount[idx]),
        rentDate: data.book.rentDate[idx] ?? '',
        rentVoucher: data.book.rentVoucher[idx] ?? '',
        income: num(data.book.income[idx]),
        expenses: num(data.book.expenses[idx]),
        bookStatus: data.book.bookStatus[idx] || 'Not Started',
        bookDate: data.book.bookDate[idx] ?? '',
        salaryDate: data.book.salaryDate[idx] ?? '',
        remarks: data.book.remarks[idx] ?? '',
      },
    })
  }
  for (let i = 0; i < data.staff.length; i++) {
    const s = data.staff[i]
    const staff = await prisma.staff.create({
      data: { name: s.name, designation: s.designation, pan: s.pan, sort: i },
    })
    const entries = s.salaries
      .map((v, mi) => ({ staffId: staff.id, month: mi + 1, amount: v.trim() === '' ? 0 : Number(v) }))
      .filter((e) => e.amount > 0)
    if (entries.length) await prisma.salary.createMany({ data: entries })
  }

  // --- overview / start here content ---
  const content: { section: string; key: string; label?: string; value: string; sort: number }[] = []
  let n = 0
  for (const [k, v] of Object.entries(data.meta)) {
    content.push({ section: 'meta', key: k, value: String(v), sort: n++ })
  }
  n = 0
  for (const line of data.overview.howto) {
    content.push({ section: 'howto', key: String(n + 1), value: line, sort: n++ })
  }
  n = 0
  for (const it of data.overview.sheetIndex) {
    content.push({ section: 'sheetIndex', key: it.name, label: it.name, value: it.desc, sort: n++ })
  }
  n = 0
  for (const it of data.overview.colourKey) {
    content.push({ section: 'colourKey', key: it.name, label: it.name, value: it.desc, sort: n++ })
  }
  n = 0
  for (const it of data.overview.roles) {
    content.push({ section: 'roles', key: it.name, label: it.name, value: it.desc, sort: n++ })
  }
  content.push({ section: 'folder', key: 'structure', value: data.overview.folderStructure, sort: 0 })
  content.push({ section: 'tips', key: 'startTip', value: data.overview.startTip, sort: 0 })
  content.push({ section: 'tips', key: 'folderTip', value: data.overview.folderTip, sort: 1 })
  await prisma.contentItem.createMany({ data: content })

  await prisma.contact.createMany({
    data: data.overview.contacts.map((c, i) => ({
      authority: c.authority,
      usedFor: c.usedFor,
      office: c.office,
      person: c.person,
      phone: c.phone,
      email: c.email,
      sort: i,
    })),
  })

  await prisma.handoverItem.createMany({
    data: data.overview.handover.map((h, i) => ({
      item: h.item,
      detail: h.detail,
      owner: h.owner,
      status: h.status,
      sort: i,
    })),
  })

  await prisma.dropboxFolder.createMany({
    data: data.overview.dropbox.map((d, i) => ({
      area: d.area,
      url: d.url,
      folder: d.folder,
      contents: d.contents,
      lastChecked: d.lastChecked,
      sort: i,
    })),
  })

  const counts = {
    tasks: await prisma.task.count(),
    activities: await prisma.calendarActivity.count(),
    cells: await prisma.calendarCell.count(),
    guides: await prisma.guide.count(),
    steps: await prisma.guideStep.count(),
    docs: await prisma.guideDoc.count(),
    staff: await prisma.staff.count(),
    contacts: await prisma.contact.count(),
    handover: await prisma.handoverItem.count(),
    dropbox: await prisma.dropboxFolder.count(),
    content: await prisma.contentItem.count(),
  }
  console.log('Seed complete:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
