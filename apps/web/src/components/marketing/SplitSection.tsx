'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder'

export function SplitSection() {
  const tHero = useTranslations('hero')
  const tNav = useTranslations('nav')

  return (
    <section
      className="relative px-6 lg:px-10"
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        scrollSnapAlign: 'start',
        background: 'var(--bp-bg)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full py-24 lg:py-0">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
          style={{ fontFamily: 'var(--font-syncopate), sans-serif', fontSize: '0.65rem', letterSpacing: '0.18em', color: 'var(--bp-primary)' }}
        >
          [ WHO IS IT FOR? ]
        </motion.p>
        <div className="grid md:grid-cols-2 gap-8" style={{ perspective: 1400 }}>
          <TiltCard
            href="/for-clients"
            title="For clients"
            body="Your personal beauty diary. Track every treatment, store your photos privately, and share with doctors only when you choose."
            videoSrc="/images/for-clients.jpg"
            videoLabel="for-clients.jpg"
            ctaLabel={tHero('ctaClient')}
            delay={0}
          />
          <TiltCard
            href="/for-professionals"
            title="For professionals"
            body="Access client history with their consent. Add notes, view treatment timelines, and build trust through transparency."
            videoSrc="/images/for-pro.jpg"
            videoLabel="for-pro.jpg"
            ctaLabel={tNav('forProfessionals')}
            delay={0.1}
          />
        </div>
      </div>
    </section>
  )
}

function TiltCard({
  href, title, body, videoSrc, videoLabel, ctaLabel, delay,
}: {
  href: string
  title: string
  body: string
  videoSrc: string
  videoLabel: string
  ctaLabel: string
  delay: number
}) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-120, 120], [8, -8]), { stiffness: 120, damping: 22 })
  const ry = useSpring(useTransform(mx, [-120, 120], [-8, 8]), { stiffness: 120, damping: 22 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left - r.width / 2)
        my.set(e.clientY - r.top - r.height / 2)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      className="rounded-3xl overflow-hidden border flex flex-col"
      css-shadow="0 20px 60px rgba(0,0,0,0.12)"
    >
      <div
        className="rounded-3xl overflow-hidden border flex flex-col h-full"
        style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}
      >
        <div className="aspect-[16/10] overflow-hidden">
          <ImageOrPlaceholder
            src={videoSrc}
            alt={title}
            placeholderLabel={videoLabel}
            className="w-full h-full"
          />
        </div>
        <div className="p-8 lg:p-10 space-y-5 flex-1 flex flex-col">
          <h3
            className="text-3xl tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500, letterSpacing: '-0.02em' }}
          >
            {title}
          </h3>
          <p className="text-base leading-relaxed flex-1" style={{ color: 'var(--bp-muted)' }}>
            {body}
          </p>
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all w-fit"
            style={{ color: 'var(--bp-primary)' }}
          >
            {ctaLabel} <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
