'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ImageOrPlaceholder } from '@/components/ui/ImageOrPlaceholder'

export function ShareSection() {
  const t = useTranslations('sections.shareTerms')

  return (
    <section className="relative py-32 px-6 lg:px-10 overflow-hidden">
      {/* Background tint */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30"
        style={{ background: 'var(--bp-blush)' }}
      />

      <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Video left */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="aspect-square rounded-3xl overflow-hidden shadow-xl"
        >
          <ImageOrPlaceholder
            src="/images/share-terms.jpg"
            alt="Woman holding a smartphone"
            placeholderLabel="share-terms.jpg"
            className="w-full h-full"
          />
        </motion.div>

        {/* Copy right + animated QR mockup */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8"
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

          {/* QR-as-permission visual */}
          <div className="flex items-center gap-6 pt-4">
            <QrIcon />
            <div className="h-px flex-1" style={{ background: 'var(--bp-border)' }} />
            <PermissionCard />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function QrIcon() {
  return (
    <motion.div
      animate={{ rotate: [0, -2, 0, 2, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="size-24 rounded-2xl p-3 shadow-md"
      style={{ background: 'var(--bp-surface)' }}
    >
      <div className="grid grid-cols-5 gap-0.5 w-full h-full">
        {Array.from({ length: 25 }).map((_, i) => (
          <div
            key={i}
            className="rounded-sm"
            style={{
              background: [0, 4, 5, 6, 7, 9, 10, 14, 17, 18, 19, 20, 23].includes(i)
                ? 'var(--bp-primary-deep)'
                : 'transparent',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

function PermissionCard() {
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      className="w-44 rounded-2xl p-4 shadow-md text-xs space-y-2"
      style={{ background: 'var(--bp-surface)', color: 'var(--bp-ink)' }}
    >
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full" style={{ background: 'var(--bp-primary)' }} />
        <span className="font-medium">Access granted</span>
      </div>
      <div className="space-y-1 opacity-60">
        <div>· Read treatments</div>
        <div>· View photos</div>
        <div>· Expires in 24h</div>
      </div>
    </motion.div>
  )
}
