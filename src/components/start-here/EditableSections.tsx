'use client'

import { useState, useTransition } from 'react'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { HANDOVER_STATUSES } from '@/lib/constants'
import { Badge, Button, Card, CardHeader, Notice } from '@/components/ui/primitives'
import { SelectCell, TextCell } from '@/components/ui/edit'
import {
  addContact,
  deleteContact,
  updateContact,
  updateDropbox,
  updateHandover,
} from '@/lib/actions/overview'

export type HandoverDto = { id: string; item: string; detail: string; owner: string; status: string }
export type ContactDto = {
  id: string
  authority: string
  usedFor: string
  office: string
  person: string
  phone: string
  email: string
}
export type DropboxDto = {
  id: string
  area: string
  url: string
  folder: string
  contents: string
  lastChecked: string
}

export function EditableSections({
  handover,
  contacts,
  dropbox,
  canWrite,
}: {
  handover: HandoverDto[]
  contacts: ContactDto[]
  dropbox: DropboxDto[]
  canWrite: boolean
}) {
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const guard = (res: { ok: boolean; error?: string }) => {
    setError(res.ok ? null : (res.error ?? 'Update failed'))
    return res
  }

  return (
    <div className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="8 · Handover checklist (outgoing officer)"
            subtitle="Track each item until the successor has everything"
          />
        </div>
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="w-64 px-5 py-2.5 font-semibold">Item</th>
                <th className="px-3 py-2.5 font-semibold">Detail</th>
                <th className="w-44 px-3 py-2.5 font-semibold">Owner</th>
                <th className="w-44 px-2 py-2.5 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {handover.map((h) => (
                <tr key={h.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-5 py-2.5 font-medium text-slate-900">{h.item}</td>
                  <td className="px-3 py-2.5 text-slate-600">{h.detail || '—'}</td>
                  <td className="px-1 py-1">
                    <TextCell
                      value={h.owner}
                      onCommit={async (v) => guard(await updateHandover(h.id, { owner: v }))}
                      disabled={!canWrite}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-1 py-1">
                    {canWrite ? (
                      <SelectCell
                        value={h.status}
                        options={HANDOVER_STATUSES}
                        onCommit={async (v) => guard(await updateHandover(h.id, { status: v }))}
                        ariaLabel={`Status for ${h.item}`}
                      />
                    ) : (
                      <Badge value={h.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="7 · Authorities & contacts"
            subtitle="Fill in and keep current — store only links here, never passwords"
            action={
              canWrite ? (
                <Button
                  size="sm"
                  onClick={() =>
                    startTransition(async () => {
                      const res = await addContact({ authority: 'New authority' })
                      guard(res)
                    })
                  }
                >
                  <Plus className="h-4 w-4" /> Add contact
                </Button>
              ) : null
            }
          />
        </div>
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="w-56 px-5 py-2.5 font-semibold">Authority / person</th>
                <th className="w-64 px-3 py-2.5 font-semibold">Used for</th>
                <th className="w-64 px-3 py-2.5 font-semibold">Office / portal</th>
                <th className="w-44 px-3 py-2.5 font-semibold">Contact person</th>
                <th className="w-40 px-2 py-2.5 font-semibold">Phone</th>
                <th className="px-3 py-2.5 font-semibold">Email / notes</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contacts.map((c) => (
                <tr key={c.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-5 py-2.5 font-medium text-slate-900">{c.authority}</td>
                  <td className="px-1 py-1 text-slate-600">
                    <TextCell
                      value={c.usedFor}
                      onCommit={async (v) => guard(await updateContact(c.id, { usedFor: v }))}
                      disabled={!canWrite}
                    />
                  </td>
                  <td className="px-1 py-1 text-slate-600">
                    <TextCell
                      value={c.office}
                      onCommit={async (v) => guard(await updateContact(c.id, { office: v }))}
                      disabled={!canWrite}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <TextCell
                      value={c.person}
                      onCommit={async (v) => guard(await updateContact(c.id, { person: v }))}
                      disabled={!canWrite}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <TextCell
                      value={c.phone}
                      onCommit={async (v) => guard(await updateContact(c.id, { phone: v }))}
                      disabled={!canWrite}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <TextCell
                      value={c.email}
                      onCommit={async (v) => guard(await updateContact(c.id, { email: v }))}
                      disabled={!canWrite}
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    {canWrite ? (
                      <button
                        type="button"
                        onClick={() =>
                          startTransition(async () => {
                            if (window.confirm(`Delete ${c.authority}?`)) {
                              guard(await deleteContact(c.id))
                            }
                          })
                        }
                        className="rounded p-1 text-slate-300 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete contact"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader
            title="9 · Dropbox file locations"
            subtitle="Paste each folder link — the Task Tracker and every step guide pick it up automatically"
          />
        </div>
        <div className="scroll-slim overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50 text-left text-[11px] tracking-wide text-slate-500 uppercase">
                <th className="w-64 px-5 py-2.5 font-semibold">Area</th>
                <th className="w-72 px-3 py-2.5 font-semibold">Suggested folder name</th>
                <th className="px-3 py-2.5 font-semibold">Dropbox folder link</th>
                <th className="w-56 px-3 py-2.5 font-semibold">What is kept there</th>
                <th className="w-36 px-2 py-2.5 font-semibold">Last checked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dropbox.map((d) => (
                <tr key={d.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-5 py-2.5 font-medium text-slate-900">{d.area}</td>
                  <td className="px-1 py-1">
                    <TextCell
                      value={d.folder}
                      onCommit={async (v) => guard(await updateDropbox(d.id, { folder: v }))}
                      disabled={!canWrite}
                    />
                  </td>
                  <td className="px-1 py-1">
                    <div className="flex items-center gap-1">
                      <TextCell
                        value={d.url}
                        onCommit={async (v) => guard(await updateDropbox(d.id, { url: v }))}
                        disabled={!canWrite}
                        placeholder="https://www.dropbox.com/…"
                      />
                      {/^https:\/\//.test(d.url) ? (
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded p-1 text-indigo-500 hover:bg-indigo-50"
                          aria-label={`Open ${d.area} folder`}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-slate-500">{d.contents || '—'}</td>
                  <td className="px-1 py-1">
                    <TextCell
                      value={d.lastChecked}
                      onCommit={async (v) => guard(await updateDropbox(d.id, { lastChecked: v }))}
                      disabled={!canWrite}
                      placeholder="2083-06-01"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
