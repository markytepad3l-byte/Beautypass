'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface Props {
  src: string
  alt: string
  className?: string
  placeholderLabel?: string
  priority?: boolean
}

/**
 * Shows a Next.js Image if the file exists, otherwise a soft animated placeholder.
 * Accepts both /images/hero.jpg (static) and future CDN URLs.
 */
export function ImageOrPlaceholder({ src, alt, className, placeholderLabel, priority }: Props) {
  const [missing, setMissing] = useState(false)

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
          'relative overflow-hidden',
          'bg-gradient-to-br from-[var(--bp-cream)] via-[var(--bp-blush)] to-[var(--bp-cream)]',
          className
        )}
        aria-label={placeholderLabel ?? alt}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2 px-6">
            <div className="size-10 mx-auto rounded-full opacity-30" style={{ background: 'var(--bp-primary)' }} />
            {placeholderLabel && (
              <p className="text-xs font-mono uppercase tracking-widest opacity-40" style={{ color: 'var(--bp-ink)' }}>
                {placeholderLabel}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        priority={priority}
        onError={() => setMissing(true)}
      />
    </div>
  )
}
