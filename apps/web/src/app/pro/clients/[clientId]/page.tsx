import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'

type Client = {
  id: string
  full_name: string | null
  email: string
  dob: string | null
  skin_type: string | null
}

type Treatment = {
  id: string
  title: string
  type: string
  date: string
  status: string
  body_zone: string | null
}

export default async function ProClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>
}) {
  const { clientId } = await params

  let client: Client
  try {
    client = await serverFetch<Client>(`/api/professional/clients/${clientId}`)
  } catch {
    notFound()
  }

  const treatments = await serverFetch<Treatment[]>(
    `/api/treatments?clientId=${encodeURIComponent(clientId)}`
  ).catch(() => [] as Treatment[])

  return (
    <PageShell
      title={client.full_name ?? 'Client'}
      subtitle={client.email}
      action={
        <Link
          href={`/pro/clients/${clientId}/treatments/new`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
        >
          <Plus size={16} /> Record treatment
        </Link>
      }
    >
      <Link
        href="/pro/clients"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--bp-muted)' }}
      >
        <ArrowLeft size={14} /> All clients
      </Link>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Meta
          label="Date of birth"
          value={client.dob ? new Date(client.dob).toLocaleDateString() : '—'}
        />
        <Meta label="Skin type" value={client.skin_type ?? '—'} />
        <Meta label="Treatments shared" value={String(treatments.length)} />
      </div>

      <h2
        className="text-xl mb-4"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500 }}
      >
        Treatment history
      </h2>

      {treatments.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            No treatments recorded for this client yet.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {treatments.map((tr) => (
            <Link
              key={tr.id}
              href={`/pro/clients/${clientId}/treatments/${tr.id}`}
              className="flex items-center justify-between p-4 rounded-xl border hover:border-[var(--bp-primary)] transition-colors"
              style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)' }}
            >
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: 'var(--bp-ink)' }}>
                  {tr.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--bp-muted)' }}>
                  {tr.type} · {new Date(tr.date).toLocaleDateString()}
                  {tr.body_zone && ` · ${tr.body_zone}`}
                </div>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full capitalize"
                style={{ background: 'var(--bp-blush)', color: 'var(--bp-primary)' }}
              >
                {tr.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--bp-muted)' }}>
        {label}
      </div>
      <div className="text-sm font-medium capitalize" style={{ color: 'var(--bp-ink)' }}>
        {value}
      </div>
    </Card>
  )
}
