'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export function GenerateInsightButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/insights/generate', { method: 'POST' }).catch(() => null)
    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}))
      if (body?.error === 'AI_CONSENT_REQUIRED') {
        setError('Enable AI consent in Account first.')
      } else {
        setError(body?.error ?? 'Could not generate.')
      }
      setLoading(false)
      return
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
        style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
      >
        <Sparkles size={16} />
        {loading ? 'Generating…' : 'Generate insight'}
      </button>
      {error && (
        <p className="text-xs mt-2" style={{ color: '#c53030' }}>
          {error}
        </p>
      )}
    </div>
  )
}
