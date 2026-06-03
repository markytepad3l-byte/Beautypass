import { useTranslations } from 'next-intl'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

export default function Home() {
  const t = useTranslations('hero')

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8"
      style={{ backgroundColor: 'var(--bp-bg)' }}>
      <ThemeToggle />

      <div className="text-center max-w-xl space-y-4">
        <h1
          className="text-5xl font-semibold leading-tight whitespace-pre-line"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)' }}
        >
          {t('headline')}
        </h1>
        <p className="text-lg" style={{ color: 'var(--bp-muted)' }}>
          {t('subheadline')}
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            className="px-6 py-3 rounded-full text-white font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--bp-primary)' }}
          >
            {t('ctaClient')}
          </button>
          <button
            className="px-6 py-3 rounded-full font-medium border transition-colors hover:bg-[var(--bp-blush)]"
            style={{ borderColor: 'var(--bp-primary)', color: 'var(--bp-primary)' }}
          >
            {t('ctaPro')}
          </button>
        </div>
      </div>

      <p className="text-xs mt-8 font-mono" style={{ color: 'var(--bp-muted)' }}>
        Phase 1 — design system ✓ · theme switcher ✓ · i18n ✓
      </p>
    </main>
  )
}
