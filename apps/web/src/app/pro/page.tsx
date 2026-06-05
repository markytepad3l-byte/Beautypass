import Link from 'next/link'
import { ScanLine, Users, ArrowRight } from 'lucide-react'
import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'

type Client = {
  id: string
  full_name: string | null
  access_level: 'readonly' | 'full'
  granted_at: string
  expires_at: string | null
}

export default async function ProDashboard() {
  const clients = await serverFetch<Client[]>('/api/professional/clients').catch(() => [])
  const recent = clients.slice(0, 6)

  return (
    <PageShell
      title="Welcome back"
      subtitle="Your professional console."
      action={
        <Link
          href="/pro/scan"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
        >
          <ScanLine size={16} /> Scan QR
        </Link>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--bp-muted)' }}>
            Active clients
          </div>
          <div
            className="text-3xl"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500 }}
          >
            {clients.length}
          </div>
        </Card>
        <Card>
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--bp-muted)' }}>
            New client
          </div>
          <Link
            href="/pro/scan"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:gap-2 transition-all"
            style={{ color: 'var(--bp-primary)' }}
          >
            Scan their QR code <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500 }}
        >
          Recent clients
        </h2>
        {clients.length > 0 && (
          <Link
            href="/pro/clients"
            className="text-sm hover:underline"
            style={{ color: 'var(--bp-primary)' }}
          >
            View all
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <Card>
          <div className="flex items-start gap-3 mb-3">
            <Users style={{ color: 'var(--bp-primary)' }} aria-hidden />
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
              No clients yet. Have a client show you their QR code from their BeautyPass app, then scan it here.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {recent.map((c) => (
            <Link
              key={c.id}
              href={`/pro/clients/${c.id}`}
              className="block p-4 rounded-xl border hover:border-[var(--bp-primary)] transition-colors"
              style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)' }}
            >
              <div className="font-medium truncate" style={{ color: 'var(--bp-ink)' }}>
                {c.full_name ?? 'Unnamed client'}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--bp-muted)' }}>
                {c.access_level === 'full' ? 'Full access' : 'Read only'} · since{' '}
                {new Date(c.granted_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}
