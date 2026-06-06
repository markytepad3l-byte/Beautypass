'use client'

import { useTranslations } from 'next-intl'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Lock, ShieldCheck, Sparkles } from 'lucide-react'

export function ValuesSection() {
  const t = useTranslations('sections.builtWithCare')

  const cards = [
    { Icon: Lock,        title: t('encrypted'),  body: t('encryptedDesc') },
    { Icon: ShieldCheck, title: t('yourData'),   body: t('yourDataDesc') },
    { Icon: Sparkles,    title: t('aiControl'),  body: t('aiControlDesc') },
  ]

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
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 50%, rgba(192,96,120,0.06) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto w-full py-24 lg:py-0">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16 space-y-3"
        >
          <p style={{ fontFamily: 'var(--font-syncopate), sans-serif', fontSize: '0.65rem', letterSpacing: '0.18em', color: '#C06078' }}>
            [ BUILT WITH CARE ]
          </p>
          <h2
            className="text-4xl md:text-5xl tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#e0e0e0', fontWeight: 500, letterSpacing: '-0.02em' }}
          >
            {t('title')}
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6" style={{ perspective: 1600 }}>
          {cards.map(({ Icon, title, body }, i) => (
            <ValueCard key={title} Icon={Icon} title={title} body={body} delay={i * 0.1} floatOffset={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ValueCard({
  Icon, title, body, delay, floatOffset,
}: {
  Icon: React.FC<{ size?: number; style?: React.CSSProperties }>
  title: string
  body: string
  delay: number
  floatOffset: number
}) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-100, 100], [10, -10]), { stiffness: 100, damping: 20 })
  const ry = useSpring(useTransform(mx, [-100, 100], [-10, 10]), { stiffness: 100, damping: 20 })

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      animate={{ y: [0, -6 - floatOffset * 2, 0] }}
      // @ts-ignore — framer-motion allows both whileInView + animate
      style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d',
        animationDuration: `${4 + floatOffset}s`,
      }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set(e.clientX - r.left - r.width / 2)
        my.set(e.clientY - r.top - r.height / 2)
      }}
      onMouseLeave={() => { mx.set(0); my.set(0) }}
      className="p-8 rounded-3xl space-y-4"
      style={{
        background: '#161616',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="size-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(192,96,120,0.15)', border: '1px solid rgba(192,96,120,0.2)' }}
      >
        <Icon size={22} style={{ color: '#C06078' }} />
      </div>
      <h3
        className="text-xl tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: '#e0e0e0', fontWeight: 500 }}
      >
        {title}
      </h3>
      <p className="text-base leading-relaxed" style={{ color: 'rgba(224,224,224,0.5)' }}>
        {body}
      </p>
    </motion.div>
  )
}
