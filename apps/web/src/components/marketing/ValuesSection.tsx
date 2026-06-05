'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Lock, ShieldCheck, Sparkles } from 'lucide-react'

export function ValuesSection() {
  const t = useTranslations('sections.builtWithCare')

  const cards = [
    { Icon: Lock,        title: t('encrypted'),  body: t('encryptedDesc') },
    { Icon: ShieldCheck, title: t('yourData'),   body: t('yourDataDesc') },
    { Icon: Sparkles,    title: t('aiControl'),  body: t('aiControlDesc') },
  ]

  return (
    <section className="relative py-32 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl text-center tracking-tight mb-16"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--bp-ink)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          {t('title')}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {cards.map(({ Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-3xl border space-y-4"
              style={{
                background: 'var(--bp-surface)',
                borderColor: 'var(--bp-border)',
              }}
            >
              <div
                className="size-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'var(--bp-blush)' }}
              >
                <Icon size={22} style={{ color: 'var(--bp-primary-deep)' }} />
              </div>
              <h3
                className="text-xl tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--bp-ink)',
                  fontWeight: 500,
                }}
              >
                {title}
              </h3>
              <p className="text-base leading-relaxed" style={{ color: 'var(--bp-muted)' }}>
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
