'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * Soft illustrated face with treatment zones that highlight as you scroll.
 * Pure SVG — no 3D, instant load, works on every device.
 */
const ZONES = [
  { id: 'forehead', label: 'Forehead', d: 'M 100 70 Q 150 50 200 70 L 200 110 Q 150 100 100 110 Z' },
  { id: 'cheeksL',  label: 'Cheek',    d: 'M 80 150 Q 90 180 110 200 Q 100 180 90 160 Z' },
  { id: 'cheeksR',  label: 'Cheek',    d: 'M 220 150 Q 210 180 190 200 Q 200 180 210 160 Z' },
  { id: 'jaw',      label: 'Jaw',      d: 'M 110 230 Q 150 260 190 230 Q 175 250 150 255 Q 125 250 110 230 Z' },
  { id: 'lips',     label: 'Lips',     d: 'M 130 215 Q 150 225 170 215 Q 150 230 130 215 Z' },
]

export function ZoneMap() {
  const t = useTranslations('sections.mapJourney')
  const ref = useRef<HTMLDivElement>(null)

  // Drive zone highlighting from scroll progress
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  return (
    <section
      ref={ref}
      className="relative py-32 px-6 lg:px-10 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left — copy */}
        <div className="space-y-6 lg:order-1 order-2">
          <h2
            className="text-4xl md:text-5xl leading-tight tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bp-ink)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            {t('title')}
          </h2>
          <p className="text-lg leading-relaxed max-w-md" style={{ color: 'var(--bp-muted)' }}>
            {t('body')}
          </p>
        </div>

        {/* Right — face SVG */}
        <div className="lg:order-2 order-1 flex justify-center">
          <div className="relative w-full max-w-md aspect-square">
            {/* Soft glow background */}
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-3xl opacity-40"
              style={{ background: 'var(--bp-blush)' }}
            />

            <svg
              viewBox="0 0 300 320"
              className="relative w-full h-full"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              style={{ color: 'var(--bp-primary-deep)' }}
            >
              {/* Face outline — soft oval */}
              <path
                d="M 150 30 C 90 30 60 80 60 150 C 60 220 100 280 150 290 C 200 280 240 220 240 150 C 240 80 210 30 150 30 Z"
                opacity="0.5"
              />
              {/* Eyes */}
              <ellipse cx="120" cy="135" rx="6" ry="3" fill="currentColor" opacity="0.4" />
              <ellipse cx="180" cy="135" rx="6" ry="3" fill="currentColor" opacity="0.4" />
              {/* Nose hint */}
              <path d="M 150 145 Q 148 175 145 195 Q 150 200 155 195 Q 152 175 150 145" opacity="0.3" />

              {/* Animated zones */}
              {ZONES.map((z, i) => {
                // Each zone lights up at a different scroll progress point
                const start = 0.15 + i * 0.13
                const end = start + 0.15
                return <Zone key={z.id} d={z.d} start={start} end={end} progress={scrollYProgress} />
              })}
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}

function Zone({
  d,
  start,
  end,
  progress,
}: {
  d: string
  start: number
  end: number
  progress: ReturnType<typeof useScroll>['scrollYProgress']
}) {
  const opacity = useTransform(progress, [start, (start + end) / 2, end], [0, 0.7, 0.3])
  const scale = useTransform(progress, [start, (start + end) / 2], [0.95, 1])

  return (
    <motion.path
      d={d}
      fill="var(--bp-primary)"
      stroke="var(--bp-primary)"
      strokeWidth="0.5"
      style={{ opacity, scale, transformOrigin: 'center' }}
    />
  )
}
