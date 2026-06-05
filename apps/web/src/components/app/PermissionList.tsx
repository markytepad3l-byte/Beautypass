'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from './PageShell'
import { Building2, UserRound } from 'lucide-react'

type Permission = {
  id: string
  grantee_name: string | null
  grantee_type: 'doctor' | 'clinic'
  access_level: 'readonly' | 'full'
  granted_at: string
  expires_at: string | null
}

export function PermissionList({ permissions }: { permissions: Permission[] }) {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)

  async function revoke(id: string) {
    if (!confirm('Revoke this permission?')) return
    setPending(id)
    await fetch(`/api/permissions/${id}`, { method: 'DELETE' })
    setPending(null)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {permissions.map((p) => {
        const Icon = p.grantee_type === 'doctor' ? UserRound : Building2
        return (
          <Card key={p.id}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'var(--bp-blush)', color: 'var(--bp-primary)' }}
                >
                  <Icon size={18} />
                </div>
                <div className="min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--bp-ink)' }}>
                    {p.grantee_name ?? 'Unnamed'}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--bp-muted)' }}>
                    {p.access_level === 'readonly' ? 'Read only' : 'Full access'} ·{' '}
                    {p.expires_at
                      ? `expires ${new Date(p.expires_at).toLocaleString()}`
                      : 'no expiry'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => revoke(p.id)}
                disabled={pending === p.id}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-60"
                style={{ borderColor: 'var(--bp-border)', color: 'var(--bp-ink)' }}
              >
                {pending === p.id ? '…' : 'Revoke'}
              </button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
