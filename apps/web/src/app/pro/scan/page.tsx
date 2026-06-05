'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Keyboard } from 'lucide-react'
import { PageShell, Card } from '@/components/app/PageShell'

type ScanResult = {
  permissionId: string
  clientId: string
  accessLevel: 'readonly' | 'full'
  client: { full_name?: string | null; email?: string }
}

type BarcodeDetectorLike = {
  new (init?: { formats?: string[] }): {
    detect(source: HTMLVideoElement | ImageBitmap): Promise<Array<{ rawValue: string }>>
  }
}

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorLike
  }
}

export default function ScanPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mode, setMode] = useState<'camera' | 'manual'>('camera')
  const [supported, setSupported] = useState<boolean | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window)
  }, [])

  useEffect(() => {
    if (mode !== 'camera' || !supported) return
    let stopped = false
    let stream: MediaStream | null = null

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        if (stopped || !videoRef.current) return
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setScanning(true)
        loop()
      } catch {
        setError('Camera unavailable. Use manual entry instead.')
      }
    }

    const detector = supported ? new window.BarcodeDetector!({ formats: ['qr_code'] }) : null

    async function loop() {
      if (stopped || !videoRef.current || !detector) return
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes.length > 0) {
          handleRaw(codes[0].rawValue)
          return
        }
      } catch {
        /* ignore frame errors */
      }
      requestAnimationFrame(loop)
    }

    start()
    return () => {
      stopped = true
      setScanning(false)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [mode, supported])

  async function submit(tokenId: string, rawToken: string) {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/qr/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenId, rawToken }),
    }).catch(() => null)
    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}))
      setError(body?.error ?? 'Scan failed.')
      setSubmitting(false)
      return
    }
    const data: ScanResult = await res.json()
    router.push(`/pro/clients/${data.clientId}`)
    router.refresh()
  }

  function handleRaw(raw: string) {
    try {
      const payload = JSON.parse(raw)
      if (payload?.tokenId && payload?.rawToken) {
        submit(payload.tokenId, payload.rawToken)
      } else {
        setError('Unrecognised QR payload.')
      }
    } catch {
      setError('Could not read QR code.')
    }
  }

  return (
    <PageShell title="Scan client QR" subtitle="Point your camera at the QR code the client shows you.">
      <div
        className="inline-flex p-1 rounded-xl mb-6"
        style={{ background: 'var(--bp-blush)' }}
      >
        {(['camera', 'manual'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all inline-flex items-center gap-1.5"
            style={{
              background: mode === m ? 'var(--bp-surface)' : 'transparent',
              color: mode === m ? 'var(--bp-primary)' : 'var(--bp-muted)',
            }}
          >
            {m === 'camera' ? <Camera size={14} /> : <Keyboard size={14} />}
            {m}
          </button>
        ))}
      </div>

      <Card className="max-w-2xl">
        {mode === 'camera' ? (
          supported === null ? null : !supported ? (
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
              This browser doesn&apos;t support camera-based QR scanning. Use Chrome or Safari, or
              switch to Manual.
            </p>
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full aspect-square rounded-2xl object-cover"
                style={{ background: 'var(--bp-bg)' }}
              />
              {!scanning && (
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-2xl text-sm"
                  style={{ background: 'var(--bp-bg)', color: 'var(--bp-muted)' }}
                >
                  Requesting camera…
                </div>
              )}
              <div
                className="pointer-events-none absolute inset-8 rounded-2xl border-2"
                style={{ borderColor: 'var(--bp-primary)', opacity: 0.6 }}
              />
            </div>
          )
        ) : (
          <ManualForm onSubmit={submit} disabled={submitting} />
        )}

        {submitting && (
          <p className="mt-4 text-sm" style={{ color: 'var(--bp-muted)' }}>
            Verifying…
          </p>
        )}
        {error && (
          <p className="mt-4 text-sm" style={{ color: '#c53030' }}>
            {error}
          </p>
        )}
      </Card>
    </PageShell>
  )
}

function ManualForm({
  onSubmit,
  disabled,
}: {
  onSubmit: (tokenId: string, rawToken: string) => void
  disabled: boolean
}) {
  const [tokenId, setTokenId] = useState('')
  const [rawToken, setRawToken] = useState('')

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(tokenId.trim(), rawToken.trim())
      }}
    >
      <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
        Ask the client to read out the values from the QR payload.
      </p>
      <label className="block">
        <span className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--bp-muted)' }}>
          Token ID
        </span>
        <input
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
          style={{ background: 'var(--bp-bg)', borderColor: 'var(--bp-border)', color: 'var(--bp-ink)' }}
        />
      </label>
      <label className="block">
        <span className="block text-xs uppercase tracking-wider mb-1.5" style={{ color: 'var(--bp-muted)' }}>
          Raw token
        </span>
        <input
          value={rawToken}
          onChange={(e) => setRawToken(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm"
          style={{ background: 'var(--bp-bg)', borderColor: 'var(--bp-border)', color: 'var(--bp-ink)' }}
        />
      </label>
      <button
        type="submit"
        disabled={disabled}
        className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-60"
        style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
      >
        Verify
      </button>
    </form>
  )
}
