// Static domain configuration mirroring the source workbook.

export const SESSION_COOKIE = 'saam_session'
export const MONTH_COOKIE = 'saam_month'
export type Status = 'Not Started' | 'In Progress' | 'Submitted' | 'Completed' | 'On Hold'
export type Priority = 'High' | 'Medium' | 'Low'

export const BS_MONTHS = [
  { n: 1, name: 'Shrawan', np: 'श्रावण', short: 'Shr', en: 'Jul–Aug 2026' },
  { n: 2, name: 'Bhadra', np: 'भाद्र', short: 'Bha', en: 'Aug–Sep 2026' },
  { n: 3, name: 'Ashwin', np: 'आश्विन', short: 'Ash', en: 'Sep–Oct 2026' },
  { n: 4, name: 'Kartik', np: 'कार्तिक', short: 'Kar', en: 'Oct–Nov 2026' },
  { n: 5, name: 'Mangsir', np: 'मंसिर', short: 'Man', en: 'Nov–Dec 2026' },
  { n: 6, name: 'Poush', np: 'पौष', short: 'Pou', en: 'Dec 2026–Jan 2027' },
  { n: 7, name: 'Magh', np: 'माघ', short: 'Mag', en: 'Jan–Feb 2027' },
  { n: 8, name: 'Falgun', np: 'फाल्गुन', short: 'Fal', en: 'Feb–Mar 2027' },
  { n: 9, name: 'Chaitra', np: 'चैत्र', short: 'Cha', en: 'Mar–Apr 2027' },
  { n: 10, name: 'Baisakh', np: 'वैशाख', short: 'Bai', en: 'Apr–May 2027' },
  { n: 11, name: 'Jestha', np: 'जेष्ठ', short: 'Jes', en: 'May–Jun 2027' },
  { n: 12, name: 'Asadh', np: 'आषाढ', short: 'Asa', en: 'Jun–Jul 2027' },
] as const

export const TASK_STATUSES: Status[] = ['Not Started', 'In Progress', 'Submitted', 'Completed', 'On Hold']
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low']

export const STEP_STATUSES = ['Not Started', 'In Progress', 'Done', 'N/A'] as const
export const DOC_STATUSES = ['Yes', 'No', 'In Progress', 'N/A'] as const
export const TDS_STATUSES = ['Pending', 'Deposited', 'Deposited & Filed', 'Late'] as const
export const BOOK_STATUSES = ['Not Started', 'In Progress', 'Completed'] as const
export const HANDOVER_STATUSES = ['Not Started', 'In Progress', 'Done'] as const

// Order of the compliance chain on the dashboard (task code -> display name).
export const CHAIN_TASK_CODES = ['T01', 'T04', 'T03', 'T05', 'T06', 'T07'] as const
export const CHAIN_LABELS: Record<string, string> = {
  T01: 'Audit Report',
  T04: 'Ward Renewal',
  T03: 'Tax Clearance',
  T05: 'OCR Update',
  T06: 'SWC Renewal',
  T07: 'Tax Exemption',
}

// "Progress by area" rows on the dashboard.
export const PROGRESS_AREAS: { area: string; taskCode: string; guideSlug: string | null }[] = [
  { area: 'Audit Report', taskCode: 'T01', guideSlug: 'audit' },
  { area: 'Tax Clearance', taskCode: 'T03', guideSlug: 'tax-clearance' },
  { area: 'OCR Update', taskCode: 'T05', guideSlug: 'ocr-update' },
  { area: 'Ward Renewal', taskCode: 'T04', guideSlug: 'ward-renewal' },
  { area: 'Monthly Bookkeeping', taskCode: 'T11', guideSlug: null },
  { area: 'SWC Certificate Renewal', taskCode: 'T06', guideSlug: 'swc-renewal' },
  { area: 'Tax Exemption', taskCode: 'T07', guideSlug: 'tax-exemption' },
  { area: 'SWC Program Approval', taskCode: 'T08', guideSlug: 'swc-program-approval' },
  { area: 'Bank KYC (HBL & Sanima)', taskCode: 'T09', guideSlug: 'bank-kyc' },
  { area: 'Governance', taskCode: 'T12', guideSlug: 'governance' },
]

// Colour key of the Annual Calendar (fill colours from the spreadsheet).
export const CALENDAR_KINDS: Record<string, { label: string; bg: string; fg: string }> = {
  prepare: { label: 'Prepare', bg: '#dce9f5', fg: '#1e3a5f' },
  submit: { label: 'Apply / Submit', bg: '#fde8d3', fg: '#7c4a12' },
  deadline: { label: 'Deadline / Filing', bg: '#f8d3cb', fg: '#7f2f22' },
  followup: { label: 'Follow-up / Collect', bg: '#d8f0ec', fg: '#1d5b52' },
  monthly: { label: 'Recurring monthly', bg: '#e8e4f3', fg: '#403a75' },
  monitor: { label: 'Monitor / Review', bg: '#eeeeee', fg: '#4b5563' },
  '': { label: '', bg: '#ffffff', fg: '#374151' },
}

export const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Submitted: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  'In Progress': 'bg-amber-100 text-amber-900 ring-amber-200',
  'Not Started': 'bg-slate-100 text-slate-700 ring-slate-200',
  'On Hold': 'bg-rose-100 text-rose-800 ring-rose-200',
  Done: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Yes: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  No: 'bg-rose-100 text-rose-800 ring-rose-200',
  Pending: 'bg-amber-100 text-amber-900 ring-amber-200',
  Deposited: 'bg-sky-100 text-sky-800 ring-sky-200',
  'Deposited & Filed': 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Late: 'bg-rose-100 text-rose-800 ring-rose-200',
  High: 'bg-rose-100 text-rose-800 ring-rose-200',
  Medium: 'bg-amber-100 text-amber-900 ring-amber-200',
  Low: 'bg-slate-100 text-slate-700 ring-slate-200',
  'N/A': 'bg-slate-50 text-slate-500 ring-slate-200',
  Active: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  Disabled: 'bg-rose-100 text-rose-800 ring-rose-200',
}

export const TIMING_STYLES: Record<string, string> = {
  complete: 'text-emerald-700',
  active: 'text-sky-700',
  upcoming: 'text-slate-500',
  attention: 'text-rose-700',
}

export const ROLES = ['ADMIN', 'VIEWER'] as const

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  VIEWER: 'Board / Viewer',
}

export const MODULES = [
  'dashboard',
  'calendar',
  'tasks',
  'bookkeeping',
  'guides',
  'startHere',
  'users',
  'audit',
] as const

export type ModuleName = (typeof MODULES)[number]

export const MODULE_LABELS: Record<ModuleName, string> = {
  dashboard: 'Dashboard',
  calendar: 'Annual Calendar',
  tasks: 'Task Tracker',
  bookkeeping: 'Monthly Book-keeping',
  guides: 'Step Guides',
  startHere: 'Start Here',
  users: 'Users & Roles',
  audit: 'Audit Log',
}
