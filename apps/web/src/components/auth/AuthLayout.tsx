'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  children: React.ReactNode
  title: string
  subtitle: string
  footer: React.ReactNode
}

/**
 * Shared two-column auth shell.
 * Left: brand panel (decorative, hidden on mobile).
 * Right: form content.
 */
export function AuthLayout({ children, title, subtitle, footer }: Props) {
  return (
    <div className="min-h-svh grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--bp-blush)' }}
      >
        {/* Wordmark */}
        <Link
          href="/"
          className="text-2xl tracking-tight w-fit"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--bp-ink)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          beautypass
        </Link>

        {/* Decorative circles */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 -left-32 size-96 rounded-full opacity-40 blur-3xl"
            style={{ background: 'var(--bp-primary)' }}
          />
          <div
            className="absolute -bottom-32 -right-32 size-96 rounded-full opacity-30 blur-3xl"
            style={{ background: 'var(--bp-primary-deep)' }}
          />
        </div>

        {/* Quote */}
        <blockquote className="relative space-y-4">
          <p
            className="text-2xl leading-snug tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bp-ink)',
              fontWeight: 500,
            }}
          >
            "Your skin has a story. Now it has a home."
          </p>
          <footer className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            beautypass.lt
          </footer>
        </blockquote>
      </div>

      {/* Right — form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        {/* Mobile wordmark */}
        <Link
          href="/"
          className="lg:hidden text-2xl tracking-tight mb-10 w-fit"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--bp-ink)',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}
        >
          beautypass
        </Link>

        <div className="w-full max-w-sm mx-auto space-y-8">
          {/* Heading */}
          <div className="space-y-2">
            <h1
              className="text-3xl tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--bp-ink)',
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              {title}
            </h1>
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
              {subtitle}
            </p>
          </div>

          {/* Form slot */}
          {children}

          {/* Footer link */}
          <p className="text-sm text-center" style={{ color: 'var(--bp-muted)' }}>
            {footer}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Shared field components ──────────────────────────────────────── */

export function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--bp-ink)' }}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: '#C06078' }}>
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full px-4 py-3 rounded-xl text-sm outline-none transition-all',
        'border focus:ring-2',
        className
      )}
      style={
        {
          background: 'var(--bp-surface)',
          borderColor: 'var(--bp-border)',
          color: 'var(--bp-ink)',
          '--tw-ring-color': 'var(--bp-primary)',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export function SubmitButton({
  children,
  loading,
}: {
  children: React.ReactNode
  loading?: boolean
}) {
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
