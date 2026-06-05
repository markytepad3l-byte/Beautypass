import { NextResponse } from 'next/server'
import { BACKEND_URL, clearAuthCookies, getRefreshContext } from '@/lib/auth'

export async function POST() {
  const ctx = await getRefreshContext()
  if (ctx) {
    await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ctx),
    }).catch(() => null)
  }
  await clearAuthCookies()
  return NextResponse.json({ ok: true })
}
