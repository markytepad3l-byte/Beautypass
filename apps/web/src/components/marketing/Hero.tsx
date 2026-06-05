'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder'

export function Hero() {
  const t = useTranslations('hero')

  return (
    <section className="relative min-h-[100svh] flex items-center pt-24 pb-16 px-6 lg:px-10 overflow-hidden">
      {/* Soft radial glow behind content */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 1200px 800px at 70% 40%, var(--bp-blush), transparent 60%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left — copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
        >
          <h1
            className="text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight whitespace-pre-line"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bp-ink)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            {t('headline')}
          </h1>

          <p
            className="text-lg md:text-xl max-w-lg leading-relaxed"
            style={{ color: 'var(--bp-muted)' }}
          >
            {t('subheadline')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/register?role=client"
              className="px-8 py-4 rounded-full text-white font-medium text-base transition-all hover:opacity-90 hover:scale-[1.02] inline-flex items-center justify-center"
              style={{ backgroundColor: 'var(--bp-primary)' }}
            >
              {t('ctaClient')}
            </Link>
            <Link
              href="/for-professionals"
              className="px-8 py-4 rounded-full font-medium text-base border transition-colors hover:bg-[var(--bp-blush)] inline-flex items-center justify-center"
              style={{
                borderColor: 'var(--bp-primary)',
                color: 'var(--bp-primary)',
              }}
            >
              {t('ctaPro')}
            </Link>
          </div>
        </motion.div>

        {/* Right — video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="relative aspect-[4/5] lg:aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl"
          style={{
            boxShadow:
              '0 30px 60px -20px rgba(192, 96, 120, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.15)',
          }}
        >
          <ImageOrPlaceholder
            src="/images/hero.jpg"
            alt="A serene woman with glowing skin"
            placeholderLabel="hero.jpg"
            className="w-full h-full rounded-3xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}
