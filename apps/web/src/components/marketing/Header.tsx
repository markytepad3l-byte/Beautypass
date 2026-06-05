'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/utils'

export function Header() {
  const t = useTranslations('nav')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'backdrop-blur-md bg-[var(--bp-bg)]/80 border-b border-[var(--bp-border)]'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
        {/* Wordmark */}
        <Link
          href="/"
          className="text-2xl tracking-tight transition-opacity hover:opacity-80"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--bp-ink)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          beautypass
        </Link>

        {/* Center nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="/for-clients" className="text-[var(--bp-ink)]/70 hover:text-[var(--bp-ink)] transition-colors">
            {t('forClients')}
          </Link>
          <Link href="/for-professionals" className="text-[var(--bp-ink)]/70 hover:text-[var(--bp-ink)] transition-colors">
            {t('forProfessionals')}
          </Link>
          <Link href="/about" className="text-[var(--bp-ink)]/70 hover:text-[var(--bp-ink)] transition-colors">
            {t('about')}
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          <ThemeToggle className="hidden sm:flex" />
          <Link
            href="/login"
            className="hidden sm:inline text-sm text-[var(--bp-ink)]/70 hover:text-[var(--bp-ink)] transition-colors"
          >
            {t('login')}
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 rounded-full text-sm text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--bp-primary)' }}
          >
            {t('getStarted')}
          </Link>
        </div>
      </div>
    </header>
  )
}
