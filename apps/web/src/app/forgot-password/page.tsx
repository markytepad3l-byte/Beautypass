'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AuthLayout, Field, Input, SubmitButton } from '@/components/auth/AuthLayout'

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { email } = Object.fromEntries(new FormData(e.currentTarget))

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    }).catch(() => null)

    setLoading(false)
    // Always show success — avoids email enumeration
    if (res?.ok || res?.status === 404) {
      setSent(true)
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <>
          Remember it?{' '}
          <Link href="/login" className="underline underline-offset-4 hover:opacity-80" style={{ color: 'var(--bp-primary)' }}>
            {t('login')}
          </Link>
        </>
      }
    >
      {sent ? (
        <div
          className="rounded-2xl p-6 space-y-2 text-sm"
          style={{ background: 'var(--bp-blush)', color: 'var(--bp-ink)' }}
        >
          <p className="font-medium">Check your inbox</p>
          <p style={{ color: 'var(--bp-muted)' }}>
            If that email is registered, you'll receive a reset link within a minute.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label={t('email')} error={error || undefined}>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
          </Field>
          <SubmitButton loading={loading}>Send reset link</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}
