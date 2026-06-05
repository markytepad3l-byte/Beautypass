'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { AuthLayout, Field, Input, SubmitButton } from '@/components/auth/AuthLayout'

function RegisterForm() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') ?? 'client'

  const [role, setRole] = useState<'client' | 'doctor' | 'clinic_admin'>(
    defaultRole === 'professional' ? 'doctor' : 'client'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = { ...Object.fromEntries(new FormData(e.currentTarget)), role }

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}))
      setError(body?.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    window.location.href = '/login?registered=1'
  }

  return (
    <AuthLayout
      title={t('register')}
      subtitle="Create your account. Free for clients."
      footer={
        <>
          {t('haveAccount')}{' '}
          <Link href="/login" className="underline underline-offset-4 hover:opacity-80" style={{ color: 'var(--bp-primary)' }}>
            {t('login')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--bp-blush)' }}>
          {([['client', "I'm a client"], ['doctor', "I'm a professional"]] as const).map(([r, label]) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className="py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
              style={{
                background: role === r ? 'var(--bp-surface)' : 'transparent',
                color: role === r ? 'var(--bp-primary)' : 'var(--bp-muted)',
                boxShadow: role === r ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <Field label="Full name">
          <Input
            name="fullName"
            type="text"
            autoComplete="name"
            required
            placeholder="Your name"
          />
        </Field>

        <Field label={t('email')}>
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
          />
        </Field>

        <Field label={t('password')} error={error || undefined}>
          <Input
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
          />
        </Field>

        <SubmitButton loading={loading}>{t('register')}</SubmitButton>

        <p className="text-xs text-center leading-relaxed" style={{ color: 'var(--bp-muted)' }}>
          By registering you agree to our{' '}
          <Link href="/privacy" className="underline underline-offset-2">Privacy Policy</Link>
          {' '}and{' '}
          <Link href="/terms" className="underline underline-offset-2">Terms</Link>.
        </p>
      </form>
    </AuthLayout>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
