import { NextResponse } from 'next/server'
import { BACKEND_URL, setAuthCookies } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)

  if (!res) {
    return NextResponse.json({ error: 'Could not reach the server. Try again.' }, { status: 502 })
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json({ error: data.error ?? 'Login failed.' }, { status: res.status })
  }

  await setAuthCookies({
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenId: data.tokenId,
    role: data.role,
  })

  return NextResponse.json({ role: data.role })
}
