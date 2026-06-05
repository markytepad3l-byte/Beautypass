'use client'

import { useState } from 'react'
import Image from 'next/image'
import { PageShell, Card } from '@/components/app/PageShell'
import { QrCode, RefreshCw } from 'lucide-react'

type Qr = {
  tokenId: string
  qrCode: string
  expiresAt: string
}

export default function QrSharePage() {
  const [accessLevel, setAccessLevel] = useState<'readonly' | 'full'>('readonly')
  const [duration, setDuration] = useState(60) // minutes
  const [qr, setQr] = useState<Qr | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    setQr(null)
    const expiresAt = new Date(Date.now() + duration * 60 * 1000).toISOString()
    const res = await fetch('/api/qr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessLevel, expiresAt }),
    }).catch(() => null)
    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}))
      setError(body?.error ?? 'Could not generate QR.')
      setLoading(false)
      return
    }
    setQr(await res.json())
    setLoading(false)
  }

  return (
    <PageShell title="Share" subtitle="Show this QR code to a doctor or clinic to grant them access — only for the time you choose.">
      <div className="grid lg:grid-cols-[360px_1fr] gap-6">
        <Card>
          <div className="space-y-5">
            <div>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--bp-muted)' }}>
                Access level
              </div>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--bp-blush)' }}>
                {(['readonly', 'full'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setAccessLevel(lvl)}
                    className="py-2 px-3 rounded-lg text-xs font-medium capitalize transition-all"
                    style={{
                      background: accessLevel === lvl ? 'var(--bp-surface)' : 'transparent',
                      color: accessLevel === lvl ? 'var(--bp-primary)' : 'var(--bp-muted)',
                      boxShadow: accessLevel === lvl ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    {lvl === 'readonly' ? 'Read only' : 'Full access'}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--bp-muted)' }}>
                {accessLevel === 'readonly'
                  ? 'They can see your treatments and photos.'
                  : 'They can also add notes and record treatments.'}
              </p>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--bp-muted)' }}>
                Expires in
              </div>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
                style={{ background: 'var(--bp-bg)', borderColor: 'var(--bp-border)', color: 'var(--bp-ink)' }}
              >
                <option value={15}>15 minutes</option>
                <option value={60}>1 hour</option>
                <option value={240}>4 hours</option>
                <option value={1440}>24 hours (max)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={generate}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
              style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
            >
              {qr ? <RefreshCw size={16} /> : <QrCode size={16} />}
              {loading ? 'Generating…' : qr ? 'Generate new code' : 'Generate code'}
            </button>

            {error && (
              <p className="text-sm" style={{ color: '#c53030' }}>
                {error}
              </p>
            )}
          </div>
        </Card>

        <Card className="flex items-center justify-center min-h-[400px]">
          {qr ? (
            <div className="text-center">
              <Image
                src={qr.qrCode}
                alt="QR code"
                width={300}
                height={300}
                className="rounded-2xl"
                unoptimized
              />
              <p className="mt-4 text-xs" style={{ color: 'var(--bp-muted)' }}>
                Expires {new Date(qr.expiresAt).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="text-center" style={{ color: 'var(--bp-muted)' }}>
              <QrCode size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">Your QR code will appear here.</p>
            </div>
          )}
        </Card>
      </div>
    </PageShell>
  )
}
