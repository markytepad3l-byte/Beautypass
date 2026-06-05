import { cookies } from 'next/headers'

export const COOKIE_ACCESS = 'bp_access'
export const COOKIE_REFRESH = 'bp_refresh'
export const COOKIE_TOKEN_ID = 'bp_token_id'
export const COOKIE_ROLE = 'bp_role'

export const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3000'

const FIFTEEN_MIN = 15 * 60
const SEVEN_DAYS = 7 * 24 * 60 * 60

export async function setAuthCookies(tokens: {
  accessToken: string
  refreshToken: string
  tokenId: string
  role: string
}) {
  const store = await cookies()
  const secure = process.env.NODE_ENV === 'production'
  const base = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/' }

  store.set(COOKIE_ACCESS, tokens.accessToken, { ...base, maxAge: FIFTEEN_MIN })
  store.set(COOKIE_REFRESH, tokens.refreshToken, { ...base, maxAge: SEVEN_DAYS })
  store.set(COOKIE_TOKEN_ID, tokens.tokenId, { ...base, maxAge: SEVEN_DAYS })
  store.set(COOKIE_ROLE, tokens.role, { ...base, httpOnly: false, maxAge: SEVEN_DAYS })
}

export async function clearAuthCookies() {
  const store = await cookies()
  for (const name of [COOKIE_ACCESS, COOKIE_REFRESH, COOKIE_TOKEN_ID, COOKIE_ROLE]) {
    store.delete(name)
  }
}

export async function getAccessToken() {
  return (await cookies()).get(COOKIE_ACCESS)?.value
}

export async function getRefreshContext() {
  const store = await cookies()
  const refreshToken = store.get(COOKIE_REFRESH)?.value
  const tokenId = store.get(COOKIE_TOKEN_ID)?.value
  if (!refreshToken || !tokenId) return null
  return { refreshToken, tokenId }
}

export async function getRole() {
  return (await cookies()).get(COOKIE_ROLE)?.value
}

export async function refreshAccessToken(): Promise<boolean> {
  const ctx = await getRefreshContext()
  if (!ctx) return false

  const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ctx),
  }).catch(() => null)

  if (!res || !res.ok) {
    await clearAuthCookies()
    return false
  }

  const body = await res.json()
  const role = (await getRole()) ?? body.role ?? ''
  await setAuthCookies({
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    tokenId: body.tokenId,
    role,
  })
  return true
}
