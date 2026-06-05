'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { PageShell, Card } from '@/components/app/PageShell'

export default function NewTreatmentPage() {
  const t = useTranslations('app.treatments.form')
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const payload = {
      title: form.get('title'),
      type: form.get('type'),
      date: form.get('date'),
      status: form.get('status'),
      notes: form.get('notes') || undefined,
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

    router.push('/app/treatments')
    router.refresh()
  }

  return (
    <PageShell title="New treatment" subtitle="Add a treatment to your timeline.">
      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
          <Field label={t('title')}>
            <Input name="title" required placeholder={t('titlePlaceholder')} />
          </Field>
          <Field label={t('type')}>
            <Input name="type" required placeholder={t('typePlaceholder')} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('date')}>
              <Input name="date" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} />
            </Field>
            <Field label={t('status')}>
              <Select name="status" defaultValue="completed">
                <option value="scheduled">{t('statusScheduled')}</option>
                <option value="completed">{t('statusCompleted')}</option>
                <option value="cancelled">{t('statusCancelled')}</option>
              </Select>
            </Field>
          </div>
          <Field label={t('notes')}>
            <Textarea name="notes" rows={4} placeholder={t('notesPlaceholder')} />
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
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
              style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
            >
              {loading ? '…' : t('save')}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ color: 'var(--bp-muted)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Card>
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
