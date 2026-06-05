import { redirect } from 'next/navigation'
import { BACKEND_URL, getAccessToken, refreshAccessToken } from '@/lib/auth'

type Init = Omit<RequestInit, 'body'> & { body?: unknown }

async function call(path: string, init: Init = {}): Promise<Response> {
  const token = await getAccessToken()
  const headers = new Headers(init.headers)
  if (token) headers.set('Authorization', `Bearer ${token}`)
  if (init.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  })
}

export async function serverFetch<T>(path: string, init: Init = {}): Promise<T> {
  let res = await call(path, init)
  if (res.status === 401 && (await refreshAccessToken())) {
    res = await call(path, init)
  }
  if (res.status === 401) {
    redirect('/login')
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.error ?? `Request failed (${res.status})`)
  }
  return res.json() as Promise<T>
}
