'use client'

import { useRef } from 'react'
import { useTranslations } from 'next-intl'
import { motion, useScroll } from 'framer-motion'
import dynamic from 'next/dynamic'

const MannekinDecor = dynamic(
  () => import('./MannekinDecor').then(m => ({ default: m.MannekinDecor })),
  { ssr: false, loading: () => <div style={{ height: 520 }} /> },
)

export function ZoneMap() {
  const t = useTranslations('sections.mapJourney')
  const sectionRef = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

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

        {/* Right — 3D decorative mannequin */}
        <motion.div
          className="lg:order-2 order-1 flex justify-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="relative w-full max-w-md">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: 'var(--bp-blush)' }}
            />
            <MannekinDecor />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
