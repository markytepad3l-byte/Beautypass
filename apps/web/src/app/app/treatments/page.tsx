import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Plus } from 'lucide-react'
import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'

type Treatment = {
  id: string
  title: string
  type: string
  date: string
  status: 'planned' | 'completed' | 'ongoing'
}

export default async function TreatmentsPage() {
  const t = await getTranslations('app.treatments')
  const treatments = await serverFetch<Treatment[]>('/api/treatments').catch(() => [] as Treatment[])

  return (
    <PageShell
      title={t('title')}
      action={
        <Link
          href="/app/treatments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
        >
          <Plus size={16} aria-hidden />
          {t('new')}
        </Link>
      }
    >
      {treatments.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            {t('empty')}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {treatments.map((tr) => (
            <Link
              key={tr.id}
              href={`/app/treatments/${tr.id}`}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border hover:border-[var(--bp-primary)] transition-colors"
              style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)' }}
            >
              <div className="min-w-0">
                <div className="font-medium truncate" style={{ color: 'var(--bp-ink)' }}>
                  {tr.title}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--bp-muted)' }}>
                  {tr.type} ·{' '}
                  {new Date(tr.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <span
                className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
                style={{
                  background: tr.status === 'completed' ? 'var(--bp-blush)' : 'var(--bp-border)',
                  color: tr.status === 'completed' ? 'var(--bp-primary)' : 'var(--bp-ink)',
                }}
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
