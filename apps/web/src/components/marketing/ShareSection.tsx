'use client'

import { useTranslations } from 'next-intl'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function ShareSection() {
  const t = useTranslations('sections.shareTerms')

  return (
    <section
      className="relative px-6 lg:px-10 overflow-hidden"
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        scrollSnapAlign: 'start',
        background: '#0d0d0d',
        color: '#e0e0e0',
      }}
    >
      {/* Subtle radial glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 60% 50%, rgba(192,96,120,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center py-24 lg:py-0">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <p style={{ fontFamily: 'var(--font-syncopate), sans-serif', fontSize: '0.65rem', letterSpacing: '0.18em', color: '#C06078' }}>
            [ SHARE ON YOUR TERMS ]
          </p>
          <h2
            className="text-4xl md:text-5xl leading-tight tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#e0e0e0', fontWeight: 500, letterSpacing: '-0.02em' }}
          >
            {t('title')}
          </h2>
          <p className="text-lg leading-relaxed max-w-md" style={{ color: 'rgba(224,224,224,0.55)' }}>
            {t('body')}
          </p>
        </motion.div>

        {/* Right — 3D floating card scene */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center"
          style={{ perspective: 1200 }}
        >
          <div className="relative flex items-center gap-8">
            <FloatingCard delay={0}>
              <QrIcon />
            </FloatingCard>

            <div style={{ width: 1, height: 60, background: 'linear-gradient(to bottom, transparent, rgba(192,96,120,0.5), transparent)' }} />

            <FloatingCard delay={0.3}>
              <PermissionCard />
            </FloatingCard>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FloatingCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-80, 80], [12, -12]), { stiffness: 100, damping: 20 })
  const ry = useSpring(useTransform(mx, [-80, 80], [-12, 12]), { stiffness: 100, damping: 20 })

  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4 + delay * 1.5, repeat: Infinity, ease: 'easeInOut', delay }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left - r.width / 2)
        my.set(e.clientY - r.top - r.height / 2)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
    >
      {children}
    </motion.div>
  )
}

function QrIcon() {
  return (
    <div
      className="size-28 rounded-2xl p-3.5 shadow-2xl"
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="grid grid-cols-5 gap-0.5 w-full h-full">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              background: [0, 4, 5, 6, 7, 9, 10, 14, 17, 18, 19, 20, 23].includes(i)
                ? '#C06078'
                : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}

function PermissionCard() {
  return (
    <div
      className="w-48 rounded-2xl p-5 shadow-2xl text-xs space-y-3"
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', color: '#e0e0e0' }}
    >
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full" style={{ background: '#C06078' }} />
        <span className="font-medium" style={{ fontFamily: 'var(--font-syncopate), sans-serif', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
          ACCESS GRANTED
        </span>
      </div>
      <div className="space-y-1.5" style={{ color: 'rgba(224,224,224,0.45)', fontFamily: 'monospace' }}>
        <div>· Read treatments</div>
        <div>· View photos</div>
        <div>· Expires in 24h</div>
      </div>
    </div>
  )
}
