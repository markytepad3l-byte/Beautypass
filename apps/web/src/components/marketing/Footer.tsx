'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <footer
      className="border-t mt-16"
      style={{ borderColor: 'var(--bp-border)' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid md:grid-cols-3 gap-8 items-center">
        {/* Wordmark + tagline */}
        <div className="space-y-2">
          <Link
            href="/"
            className="text-2xl tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bp-ink)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            beautypass
          </Link>
          <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            © {new Date().getFullYear()} beautypass.lt
          </p>
        </div>

        {/* Links */}
        <nav className="flex justify-center gap-6 text-sm">
          <Link href="/privacy" className="hover:underline" style={{ color: 'var(--bp-muted)' }}>
            {t('privacy')}
          </Link>
          <Link href="/terms" className="hover:underline" style={{ color: 'var(--bp-muted)' }}>
            {t('terms')}
          </Link>
          <Link href="/contact" className="hover:underline" style={{ color: 'var(--bp-muted)' }}>
            {t('contact')}
          </Link>
        </nav>

        {/* Theme toggle on the right */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  )
}
