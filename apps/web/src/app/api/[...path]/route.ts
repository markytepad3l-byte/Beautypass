import { NextResponse } from 'next/server'
import { BACKEND_URL, getAccessToken, refreshAccessToken, clearAuthCookies } from '@/lib/auth'

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'host',
  'content-length',
])

async function proxy(request: Request, path: string[]) {
  const url = new URL(request.url)
  const target = `${BACKEND_URL}/api/${path.join('/')}${url.search}`

  const buildInit = async (): Promise<RequestInit> => {
    const headers = new Headers()
    request.headers.forEach((value, key) => {
      if (!HOP_BY_HOP.has(key.toLowerCase())) headers.set(key, value)
    })
    const token = await getAccessToken()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const init: RequestInit = { method: request.method, headers }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = await request.clone().arrayBuffer()
    }
    return init
  }

  let res = await fetch(target, await buildInit())

  if (res.status === 401 && (await refreshAccessToken())) {
    res = await fetch(target, await buildInit())
  }

  if (res.status === 401) {
    await clearAuthCookies()
  }

  const responseHeaders = new Headers()
  res.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) responseHeaders.set(key, value)
  })

  return new NextResponse(res.body, { status: res.status, headers: responseHeaders })
}

type Ctx = { params: Promise<{ path: string[] }> }

export async function GET(req: Request, ctx: Ctx) {
  return proxy(req, (await ctx.params).path)
}
export async function POST(req: Request, ctx: Ctx) {
  return proxy(req, (await ctx.params).path)
}
export async function PUT(req: Request, ctx: Ctx) {
  return proxy(req, (await ctx.params).path)
}
export async function PATCH(req: Request, ctx: Ctx) {
  return proxy(req, (await ctx.params).path)
}
export async function DELETE(req: Request, ctx: Ctx) {
  return proxy(req, (await ctx.params).path)
}
