'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Upload, Trash2 } from 'lucide-react'
import { Card } from './PageShell'

type Photo = {
  id: string
  phase: 'before' | 'after' | 'progress'
  areaTag: string | null
  url: string
  createdAt: string
}

const PHASES: Photo['phase'][] = ['before', 'progress', 'after']

export function PhotoGallery({
  treatmentId,
  initialPhotos,
}: {
  treatmentId: string
  initialPhotos: Photo[]
}) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState<Photo['phase'] | null>(null)
  const [error, setError] = useState('')

  const inputs = {
    before: useRef<HTMLInputElement>(null),
    progress: useRef<HTMLInputElement>(null),
    after: useRef<HTMLInputElement>(null),
  }

  async function upload(phase: Photo['phase'], file: File) {
    setError('')
    setUploading(phase)
    const fd = new FormData()
    fd.append('photo', file)
    fd.append('phase', phase)

    const res = await fetch(`/api/treatments/${treatmentId}/photos`, {
      method: 'POST',
      body: fd,
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}))
      setError(body?.error ?? 'Upload failed.')
      setUploading(null)
      return
    }

    // Refetch the list to get signed URLs
    const fresh = await fetch(`/api/treatments/${treatmentId}/photos`)
      .then((r) => r.json())
      .catch(() => null)
    if (fresh) setPhotos(fresh)
    setUploading(null)
  }

  async function remove(photoId: string) {
    if (!confirm('Delete this photo?')) return
    const res = await fetch(`/api/treatments/${treatmentId}/photos/${photoId}`, { method: 'DELETE' })
    if (res.ok) setPhotos((p) => p.filter((x) => x.id !== photoId))
  }

  const byPhase = (phase: Photo['phase']) => photos.filter((p) => p.phase === phase)

  return (
    <section>
      <h2
        className="text-xl mb-4"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500 }}
      >
        Photos
      </h2>

      {error && (
        <p className="mb-3 text-sm" style={{ color: '#c53030' }}>
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {PHASES.map((phase) => (
          <Card key={phase}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--bp-muted)' }}>
                {phase}
              </span>
              <button
                type="button"
                onClick={() => inputs[phase].current?.click()}
                disabled={uploading !== null}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full disabled:opacity-60"
                style={{ background: 'var(--bp-blush)', color: 'var(--bp-primary)' }}
              >
                <Upload size={12} />
                {uploading === phase ? 'Uploading…' : 'Add'}
              </button>
              <input
                ref={inputs[phase]}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) upload(phase, file)
                  e.target.value = ''
                }}
              />
            </div>

            <div className="space-y-2">
              {byPhase(phase).length === 0 ? (
                <div
                  className="aspect-square rounded-xl border border-dashed flex items-center justify-center text-xs"
                  style={{ borderColor: 'var(--bp-border)', color: 'var(--bp-muted)' }}
                >
                  No photos
                </div>
              ) : (
                byPhase(phase).map((p) => (
                  <div key={p.id} className="relative group">
                    <Image
                      src={p.url}
                      alt={`${phase} photo`}
                      width={400}
                      height={400}
                      className="w-full aspect-square object-cover rounded-xl"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
                      aria-label="Delete photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
