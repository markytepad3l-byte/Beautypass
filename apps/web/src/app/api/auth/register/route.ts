import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))

  const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => null)

  if (!res) {
    return NextResponse.json({ error: 'Could not reach the server. Try again.' }, { status: 502 })
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json({ error: data.error ?? 'Registration failed.' }, { status: res.status })
  }

  return NextResponse.json(data)
}
