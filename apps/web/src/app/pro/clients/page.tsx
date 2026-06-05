import Link from 'next/link'
import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'

type Client = {
  id: string
  full_name: string | null
  access_level: 'readonly' | 'full'
  granted_at: string
  expires_at: string | null
}

export default async function ClientsPage() {
  const clients = await serverFetch<Client[]>('/api/professional/clients').catch(() => [])

  return (
    <PageShell title="My clients" subtitle="Clients who have granted you access.">
      {clients.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            No active clients. Scan a client&apos;s QR code to begin.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/pro/clients/${c.id}`}
              className="flex items-center justify-between p-4 rounded-xl border hover:border-[var(--bp-primary)] transition-colors"
              style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)' }}
            >
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: 'var(--bp-ink)' }}>
                  {c.full_name ?? 'Unnamed client'}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--bp-muted)' }}>
                  {c.access_level === 'full' ? 'Full access' : 'Read only'} ·{' '}
                  {c.expires_at
                    ? `expires ${new Date(c.expires_at).toLocaleDateString()}`
                    : 'no expiry'}
                </div>
              </div>
              <span className="text-sm" style={{ color: 'var(--bp-primary)' }}>
                Open →
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
