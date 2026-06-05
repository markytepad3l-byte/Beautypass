'use client'

import { useState } from 'react'
import { Download, Trash2 } from 'lucide-react'
import { Card } from './PageShell'

export function AccountActions({ initialConsent }: { initialConsent: boolean }) {
  const [consent, setConsent] = useState(initialConsent)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function toggleConsent(next: boolean) {
    setSaving(true)
    const res = await fetch('/api/account/consent', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ consentAiProcessing: next }),
    })
    if (res.ok) setConsent(next)
    setSaving(false)
  }

  async function exportData() {
    const res = await fetch('/api/account/export')
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `beautypass-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function deleteAccount() {
    const ok = confirm(
      'Delete your account? Your photos and records will be purged within 30 days. This cannot be undone.'
    )
    if (!ok) return
    setDeleting(true)
    await fetch('/api/account', { method: 'DELETE' })
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-medium mb-1" style={{ color: 'var(--bp-ink)' }}>
              AI insights consent
            </h3>
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
              Allow us to send your treatment titles, types, and dates to Claude to generate
              summaries. We never send photos or your raw notes.
            </p>
          </div>
          <Toggle checked={consent} onChange={toggleConsent} disabled={saving} />
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-medium mb-1" style={{ color: 'var(--bp-ink)' }}>
              Export your data
            </h3>
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
              Download a JSON file with all your treatments, photos metadata, permissions, and audit log.
            </p>
          </div>
          <button
            type="button"
            onClick={exportData}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap"
            style={{ borderColor: 'var(--bp-border)', color: 'var(--bp-ink)' }}
          >
            <Download size={14} /> Export
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-medium mb-1" style={{ color: '#c53030' }}>
              Delete account
            </h3>
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
              Permanently delete your account and all associated data.
            </p>
          </div>
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border whitespace-nowrap disabled:opacity-60"
            style={{ borderColor: '#fecaca', color: '#c53030' }}
          >
            <Trash2 size={14} /> {deleting ? '…' : 'Delete'}
          </button>
        </div>
      </Card>
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-7 w-12 rounded-full transition-colors disabled:opacity-60 shrink-0"
      style={{ background: checked ? 'var(--bp-primary)' : 'var(--bp-border)' }}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white transform transition-transform"
        style={{ transform: `translate(${checked ? '22px' : '4px'}, 4px)` }}
      />
    </button>
  )
}
