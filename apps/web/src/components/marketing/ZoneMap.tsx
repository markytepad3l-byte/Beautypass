'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'

const ZONES = [
  { id: 'forehead', d: 'M 100 70 Q 150 50 200 70 L 200 110 Q 150 100 100 110 Z' },
  { id: 'cheeksL',  d: 'M 80 150 Q 90 180 110 200 Q 100 180 90 160 Z' },
  { id: 'cheeksR',  d: 'M 220 150 Q 210 180 190 200 Q 200 180 210 160 Z' },
  { id: 'jaw',      d: 'M 110 230 Q 150 260 190 230 Q 175 250 150 255 Q 125 250 110 230 Z' },
  { id: 'lips',     d: 'M 130 215 Q 150 225 170 215 Q 150 230 130 215 Z' },
]

export function ZoneMap() {
  const t = useTranslations('sections.mapJourney')
  const sectionRef = useRef<HTMLElement>(null)
  const faceRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-180, 180], [10, -10]), { stiffness: 80, damping: 18 })
  const ry = useSpring(useTransform(mx, [-180, 180], [-10, 10]), { stiffness: 80, damping: 18 })

  function handleMouse(e: React.MouseEvent) {
    const el = faceRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    mx.set(e.clientX - r.left - r.width / 2)
    my.set(e.clientY - r.top - r.height / 2)
  }

  return (
    <section
      ref={sectionRef}
      className="relative px-6 lg:px-10 overflow-hidden"
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        scrollSnapAlign: 'start',
        background: 'var(--bp-bg)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-24 lg:py-0">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 lg:order-1 order-2"
        >
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
        </motion.div>

        {/* Right — 3D tilting face */}
        <div
          ref={faceRef}
          className="lg:order-2 order-1 flex justify-center"
          onMouseMove={handleMouse}
          onMouseLeave={() => { mx.set(0); my.set(0) }}
        >
          <motion.div
            className="relative w-full max-w-md aspect-square"
            style={{ perspective: 900, rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
          >
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-3xl opacity-40"
              style={{ background: 'var(--bp-blush)', transform: 'translateZ(-40px)' }}
            />
            <motion.svg
              viewBox="0 0 300 320"
              className="relative w-full h-full"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              style={{ color: 'var(--bp-primary-deep)', transform: 'translateZ(20px)' }}
            >
              <path
                d="M 150 30 C 90 30 60 80 60 150 C 60 220 100 280 150 290 C 200 280 240 220 240 150 C 240 80 210 30 150 30 Z"
                opacity="0.5"
              />
              <ellipse cx="120" cy="135" rx="6" ry="3" fill="currentColor" opacity="0.4" />
              <ellipse cx="180" cy="135" rx="6" ry="3" fill="currentColor" opacity="0.4" />
              <path d="M 150 145 Q 148 175 145 195 Q 150 200 155 195 Q 152 175 150 145" opacity="0.3" />
              {ZONES.map((z, i) => {
                const start = 0.15 + i * 0.13
                const end = start + 0.15
                return <Zone key={z.id} d={z.d} start={start} end={end} progress={scrollYProgress} />
              })}
            </motion.svg>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function Zone({
  d, start, end, progress,
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
