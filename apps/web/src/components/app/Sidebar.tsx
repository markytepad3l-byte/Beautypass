'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  CalendarHeart,
  ImageIcon,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserRound,
  LogOut,
} from 'lucide-react'

const items = [
  { href: '/app', key: 'dashboard', icon: LayoutDashboard },
  { href: '/app/treatments', key: 'treatments', icon: CalendarHeart },
  { href: '/app/photos', key: 'photos', icon: ImageIcon },
  { href: '/app/qr', key: 'qr', icon: QrCode },
  { href: '/app/permissions', key: 'permissions', icon: ShieldCheck },
  { href: '/app/insights', key: 'insights', icon: Sparkles },
  { href: '/app/account', key: 'account', icon: UserRound },
] as const

export function Sidebar() {
  const t = useTranslations('app.nav')
  const pathname = usePathname()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => null)
    window.location.href = '/login'
  }

  return (
    <aside
      className="hidden md:flex md:flex-col w-60 shrink-0 border-r"
      style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)' }}
    >
      <Link
        href="/app"
        className="px-6 py-6 text-2xl tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', letterSpacing: '-0.02em' }}
      >
        beautypass
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ href, key, icon: Icon }) => {
          const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{
                background: active ? 'var(--bp-blush)' : 'transparent',
                color: active ? 'var(--bp-primary)' : 'var(--bp-muted)',
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={18} aria-hidden />
              {t(key)}
            </Link>
          )
        })}
      </nav>

      <button
        onClick={logout}
        className="flex items-center gap-3 mx-3 mb-4 px-3 py-2.5 rounded-xl text-sm hover:bg-[var(--bp-blush)] transition-colors"
        style={{ color: 'var(--bp-muted)' }}
      >
        <LogOut size={18} aria-hidden />
        {t('logout')}
      </button>
    </aside>
  )
}
