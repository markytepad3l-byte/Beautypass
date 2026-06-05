'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { VideoOrPlaceholder } from '@/components/ui/VideoOrPlaceholder'

export function SplitSection() {
  const tHero = useTranslations('hero')
  const tNav = useTranslations('nav')

  return (
    <section className="relative py-32 px-6 lg:px-10">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
        {/* Clients */}
        <SplitCard
          href="/register?role=client"
          title="For clients"
          tag={tHero('ctaClient')}
          body="Your personal beauty diary. Track every treatment, store your photos privately, and share with doctors only when you choose."
          videoSrc="/videos/for-clients.mp4"
          videoLabel="for-clients.mp4"
          ctaLabel={tHero('ctaClient')}
        />
        {/* Professionals */}
        <SplitCard
          href="/for-professionals"
          title="For professionals"
          tag={tNav('forProfessionals')}
          body="Access client history with their consent. Add notes, view treatment timelines, and build trust through transparency."
          videoSrc="/videos/for-pro.mp4"
          videoLabel="for-pro.mp4"
          ctaLabel="Apply for access"
        />
      </div>
    </section>
  )
}

function SplitCard({
  href,
  title,
  body,
  videoSrc,
  videoLabel,
  ctaLabel,
}: {
  href: string
  title: string
  tag: string
  body: string
  videoSrc: string
  videoLabel: string
  ctaLabel: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl overflow-hidden border flex flex-col"
      style={{
        background: 'var(--bp-surface)',
        borderColor: 'var(--bp-border)',
      }}
    >
      <div className="aspect-[16/10] overflow-hidden">
        <VideoOrPlaceholder
          src={videoSrc}
          placeholderLabel={videoLabel}
          className="w-full h-full"
        />
      </div>

      <div className="p-8 lg:p-10 space-y-5 flex-1 flex flex-col">
        <h3
          className="text-3xl tracking-tight"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--bp-ink)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
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
    </motion.div>
  )
}
