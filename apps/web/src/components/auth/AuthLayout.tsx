'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  title: string
  subtitle: string
  footer: React.ReactNode
}

export function AuthLayout({ children, title, subtitle, footer }: Props) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      <AuthBrand />

      {/* Right — form */}
      <div
        className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16"
        style={{ background: 'var(--bp-bg)' }}
      >
        <Link
          href="/"
          className="lg:hidden text-2xl tracking-tight mb-10 w-fit"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500, letterSpacing: '-0.02em' }}
        >
          beautypass
        </Link>

        <div className="w-full max-w-sm mx-auto space-y-8">
          <div className="space-y-2">
            <h1
              className="text-3xl tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500, letterSpacing: '-0.02em' }}
            >
              {title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>{subtitle}</p>
          </div>

          {children}

          <p className="text-sm text-center" style={{ color: 'var(--bp-muted)' }}>{footer}</p>
        </div>
      </div>
    </div>
  )
}

function AuthBrand() {
  const panelRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const layer2Ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const onMove = (e: MouseEvent) => {
      const r = panel.getBoundingClientRect()
      const x = (e.clientX - r.left - r.width / 2) / r.width
      const y = (e.clientY - r.top - r.height / 2) / r.height
      if (imgRef.current) {
        imgRef.current.style.transform = `scale(1.1) translate(${x * -18}px, ${y * -18}px)`
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate(${x * -8}px, ${y * -8}px)`
      }
    }

    panel.addEventListener('mousemove', onMove, { passive: true })
    return () => panel.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <>
      <style>{`
        @keyframes bp-face-reveal {
          0%   { clip-path: circle(0% at 50% 38%); opacity: 0; }
          40%  { opacity: 1; }
          100% { clip-path: circle(80% at 50% 38%); opacity: 1; }
        }
        @keyframes bp-text-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bp-auth-image {
          animation: bp-face-reveal 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .bp-auth-text {
          animation: bp-text-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) 1.4s both;
        }
        @media (prefers-reduced-motion: reduce) {
          .bp-auth-image { animation: none; clip-path: none; opacity: 1; }
          .bp-auth-text  { animation: none; opacity: 1; }
        }
      `}</style>

      <div
        ref={panelRef}
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0a0a0a' }}
      >
        {/* SVG grain */}
        <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
          <filter id="bp-auth-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </svg>

        {/* Face image — reveals with circular mask */}
        <div
          ref={imgRef}
          className="bp-auth-image absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&fm=webp&q=70&w=900')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            filter: 'grayscale(1) contrast(1.2) brightness(0.55)',
          }}
        />

        {/* Second depth layer */}
        <div
          ref={layer2Ref}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&fm=webp&q=60&w=900')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(1) contrast(1.1) brightness(0.4)',
            opacity: 0.35,
            mixBlendMode: 'screen',
            transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.55) 0%, transparent 40%, rgba(10,10,10,0.7) 100%)' }}
        />

        {/* Rose tint */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(192,96,120,0.12) 0%, transparent 70%)' }}
        />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.08, filter: 'url(#bp-auth-grain)' }}
          aria-hidden
        />

        {/* Wordmark */}
        <Link
          href="/"
          className="bp-auth-text relative z-10 w-fit"
          style={{
            fontFamily: 'var(--font-syncopate), sans-serif',
            color: '#e0e0e0',
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
          }}
        >
          BEAUTYPASS
        </Link>

        {/* Bottom text */}
        <blockquote className="bp-auth-text relative z-10 space-y-3">
          <p
            className="text-2xl leading-snug tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: '#e0e0e0', fontWeight: 500 }}
          >
            "Your skin has a story.<br />Now it has a home."
          </p>
          <div style={{ width: 32, height: 2, background: '#C06078', borderRadius: 1 }} />
          <footer
            style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(224,224,224,0.45)' }}
          >
            BEAUTYPASS.LT · EST. 2024
          </footer>
        </blockquote>
      </div>
    </>
  )
}

/* ── Shared field components ── */

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--bp-ink)' }}>{label}</label>
      {children}
      {error && <p className="text-xs" style={{ color: '#C06078' }}>{error}</p>}
    </div>
  )
}

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn('w-full px-4 py-3 rounded-xl text-sm outline-none transition-all border focus:ring-2', className)}
      style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)', color: 'var(--bp-ink)', '--tw-ring-color': 'var(--bp-primary)' } as React.CSSProperties}
      {...props}
    />
  )
}

export function SubmitButton({ children, loading }: { children: React.ReactNode; loading?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3.5 rounded-full text-white font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{ backgroundColor: 'var(--bp-primary)' }}
    >
      {loading ? 'Please wait…' : children}
    </button>
  )
}

export function SocialButton({ provider, onClick }: { provider: 'google' | 'apple'; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-80"
      style={{ background: 'var(--bp-surface)', border: '1px solid var(--bp-border)', color: 'var(--bp-ink)' }}
    >
      {provider === 'google' ? <GoogleIcon /> : <AppleIcon />}
      Continue with {provider === 'google' ? 'Google' : 'Apple'}
    </button>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden style={{ color: 'var(--bp-ink)' }}>
      <path fill="currentColor" d="M12.48 0c.195 1.334-.388 2.714-1.16 3.68-.782.974-2.04 1.72-3.28 1.62-.23-1.3.418-2.67 1.16-3.58C9.968.78 11.24.06 12.48 0ZM16.2 13.07c-.56 1.22-1.24 2.35-2.2 3.19-.72.62-1.43.9-2.18.9-.78 0-1.44-.24-2.08-.47-.62-.22-1.23-.45-1.96-.45-.74 0-1.37.22-1.98.44-.65.22-1.3.45-2.1.44-.82 0-1.6-.34-2.34-1.03C.44 15.1 0 13.28 0 11.4c0-3.53 2.3-5.4 4.56-5.43.84-.01 1.63.27 2.33.51.56.19 1.06.37 1.47.37.38 0 .88-.19 1.47-.4.75-.27 1.6-.57 2.5-.52 1.7.07 3.02.78 3.83 2.07-1.53.93-2.3 2.34-2.27 3.97.03 1.6.9 3.06 2.31 3.6Z"/>
    </svg>
  )
}
