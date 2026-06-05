'use client'

import { useRouter } from 'next/navigation'
import { useState, use } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PageShell, Card } from '@/components/app/PageShell'
import { BodyZonePicker, type BodyZone } from '@/components/body/BodyZonePicker'

export default function ProNewTreatmentPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bodyZone, setBodyZone] = useState<BodyZone | undefined>()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!bodyZone) {
      setError('Please select a body zone.')
      return
    }

    setLoading(true)
    const form = new FormData(e.currentTarget)
    const notes = form.get('notes')?.toString()
    const payload = {
      clientId,
      title: form.get('title'),
      type: form.get('type'),
      date: form.get('date'),
      status: form.get('status'),
      notes: notes && notes.length > 0 ? notes : undefined,
      bodyZone,
    }

    const res = await fetch('/api/treatments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}))
      setError(body?.error ?? 'Could not save treatment.')
      setLoading(false)
      return
    }

    router.push(`/pro/clients/${clientId}`)
    router.refresh()
  }

  return (
    <PageShell
      title="Record treatment"
      subtitle="Tap a body zone, then fill in the treatment details."
    >
      <Link
        href={`/pro/clients/${clientId}`}
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--bp-muted)' }}
      >
        <ArrowLeft size={14} /> Back to client
      </Link>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <Card>
          <BodyZonePicker value={bodyZone} onChange={setBodyZone} />
        </Card>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              className="px-4 py-3 rounded-xl"
              style={{
                background: bodyZone ? 'var(--bp-blush)' : 'var(--bp-bg)',
                color: bodyZone ? 'var(--bp-primary)' : 'var(--bp-muted)',
              }}
            >
              <div className="text-xs uppercase tracking-wider opacity-70">Treating</div>
              <div className="text-base font-medium capitalize mt-0.5">
                {bodyZone ?? 'Select a zone on the body →'}
              </div>
            </div>

            <Field label="Title">
              <Input name="title" required placeholder="e.g. Botox forehead (4 units)" />
            </Field>
            <Field label="Type">
              <Input name="type" required placeholder="e.g. botox, filler, laser" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date">
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </Field>
              <Field label="Status">
                <Select name="status" defaultValue="completed">
                  <option value="planned">Planned</option>
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                </Select>
              </Field>
            </div>
            <Field label="Clinical notes">
              <Textarea
                name="notes"
                rows={4}
                placeholder="Dosage, technique, follow-up notes (encrypted at rest)"
              />
            </Field>

            {error && (
              <p className="text-sm" style={{ color: '#c53030' }}>
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
                style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
              >
                {loading ? '…' : 'Record treatment'}
              </button>
              <Link
                href={`/pro/clients/${clientId}`}
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium"
                style={{ color: 'var(--bp-muted)' }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </PageShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--bp-muted)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

const fieldClass =
  'w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[var(--bp-primary)] transition-colors'
const fieldStyle = {
  background: 'var(--bp-bg)',
  borderColor: 'var(--bp-border)',
  color: 'var(--bp-ink)',
} as React.CSSProperties

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={fieldClass} style={fieldStyle} />
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={fieldClass} style={fieldStyle} />
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={fieldClass} style={fieldStyle} />
}
