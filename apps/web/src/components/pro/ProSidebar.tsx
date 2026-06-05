'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ScanLine, Users, LogOut } from 'lucide-react'

const items = [
  { href: '/pro', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pro/scan', label: 'Scan QR', icon: ScanLine },
  { href: '/pro/clients', label: 'My clients', icon: Users },
] as const

export function ProSidebar() {
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
        href="/pro"
        className="px-6 py-6 text-2xl tracking-tight"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', letterSpacing: '-0.02em' }}
      >
        beautypass
        <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded-md align-middle" style={{ background: 'var(--bp-blush)', color: 'var(--bp-primary)' }}>
          pro
        </span>
      </Link>

      <nav className="flex-1 px-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = href === '/pro' ? pathname === '/pro' : pathname.startsWith(href)
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
              {label}
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
        Log out
      </button>
    </aside>
  )
}
