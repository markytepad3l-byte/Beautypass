'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthLayout, Field, Input, SubmitButton, SocialButton } from '@/components/auth/AuthLayout'

export default function LoginPage() {
  const t = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const data = Object.fromEntries(new FormData(e.currentTarget))

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => null)

    if (!res || !res.ok) {
      const body = await res?.json().catch(() => ({}))
      setError(body?.error ?? 'Invalid email or password.')
      setLoading(false)
      return
    }

    const { role } = await res.json()
    window.location.href = role === 'client' ? '/app' : '/pro'
  }

  return (
    <AuthLayout
      title={t('login')}
      subtitle="Welcome back. Log in to continue."
      footer={
        <>
          {t('noAccount')}{' '}
          <Link href="/register" className="underline underline-offset-4 hover:opacity-80" style={{ color: 'var(--bp-primary)' }}>
            {t('register')}
          </Link>
        </>
      }
    >
      {/* Social login */}
      <div className="space-y-3">
        <SocialButton provider="google" onClick={() => alert('Google sign-in coming soon.')} />
        <SocialButton provider="apple" onClick={() => alert('Apple sign-in coming soon.')} />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'var(--bp-border)' }} />
        <span className="text-xs" style={{ color: 'var(--bp-muted)' }}>or continue with email</span>
        <div className="flex-1 h-px" style={{ background: 'var(--bp-border)' }} />
      </div>

      {/* Email / password form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Field label={t('email')}>
          <Input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        </Field>

        <Field label={t('password')} error={error || undefined}>
          <Input name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
        </Field>

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: 'var(--bp-muted)' }}>
            {t('forgotPassword')}
          </Link>
        </div>

        <SubmitButton loading={loading}>{t('login')}</SubmitButton>
      </form>
    </AuthLayout>
  )
}
