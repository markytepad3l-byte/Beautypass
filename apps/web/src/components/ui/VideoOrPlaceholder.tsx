'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  src: string
  poster?: string
  className?: string
  /** Visible while the video doesn't exist yet — a soft animated gradient */
  placeholderLabel?: string
}

/**
 * Renders an autoplay/muted/loop video.
 * If the file is missing (404), shows a soft animated cream→blush gradient
 * with an optional label, so the page works before Higgsfield clips arrive.
 */
export function VideoOrPlaceholder({ src, poster, className, placeholderLabel }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const [missing, setMissing] = useState(false)

  // Detect 404 on the source quickly via a HEAD request, before the video element even tries.
  useEffect(() => {
    let cancelled = false
    fetch(src, { method: 'HEAD' })
      .then(r => { if (!cancelled && !r.ok) setMissing(true) })
      .catch(() => { if (!cancelled) setMissing(true) })
    return () => { cancelled = true }
  }, [src])

  if (missing) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-3xl',
          'bg-gradient-to-br from-[var(--bp-cream)] via-[var(--bp-blush)] to-[var(--bp-cream)]',
          'animate-[shimmer_8s_ease-in-out_infinite]',
          className
        )}
        aria-label={placeholderLabel ?? 'Video placeholder'}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2 px-6">
            <div
              className="size-10 mx-auto rounded-full opacity-40"
              style={{ background: 'var(--bp-primary)' }}
            />
            {placeholderLabel && (
              <p className="text-xs font-mono uppercase tracking-widest opacity-50" style={{ color: 'var(--bp-ink)' }}>
                {placeholderLabel}
              </p>
            )}
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0%, 100% { filter: brightness(1) saturate(1); }
            50%      { filter: brightness(1.05) saturate(1.1); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <video
      ref={ref}
      className={cn('object-cover', className)}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      onError={() => setMissing(true)}
    />
  )
}
