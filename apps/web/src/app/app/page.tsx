import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Plus, ArrowRight, Sparkles } from 'lucide-react'
import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'

type Treatment = {
  id: string
  title: string
  type: string
  date: string
  status: 'scheduled' | 'completed' | 'cancelled'
}

type Permission = { id: string; revoked_at: string | null; expires_at: string | null }

export default async function DashboardPage() {
  const t = await getTranslations('app.dashboard')

  const [treatments, permissions] = await Promise.all([
    serverFetch<Treatment[]>('/api/treatments').catch(() => [] as Treatment[]),
    serverFetch<Permission[]>('/api/permissions').catch(() => [] as Permission[]),
  ])

  const activePermissions = permissions.filter(
    (p) => !p.revoked_at && (!p.expires_at || new Date(p.expires_at) > new Date())
  )
  const recent = treatments.slice(0, 5)

  return (
    <PageShell
      title={t('greeting')}
      action={
        <Link
          href="/app/treatments/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ background: 'var(--bp-primary)', color: 'var(--bp-surface)' }}
        >
          <Plus size={16} aria-hidden />
          New treatment
        </Link>
      }
    >
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <StatCard label={t('treatmentsCount')} value={treatments.length} />
        <StatCard label={t('permissionsCount')} value={activePermissions.length} />
      </div>

      <Card className="mb-6">
        <div className="flex items-start gap-3 mb-2">
          <Sparkles size={18} style={{ color: 'var(--bp-primary)' }} aria-hidden />
          <h2
            className="text-lg"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500 }}
          >
            {t('insight')}
          </h2>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--bp-muted)' }}>
          {t('noInsight')}
        </p>
        <Link
          href="/app/insights"
          className="inline-flex items-center gap-1.5 text-sm font-medium hover:gap-2 transition-all"
          style={{ color: 'var(--bp-primary)' }}
        >
          {t('generateInsight')} <ArrowRight size={14} aria-hidden />
        </Link>
      </Card>

      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-xl"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500 }}
        >
          {t('recentTreatments')}
        </h2>
        {treatments.length > 0 && (
          <Link
            href="/app/treatments"
            className="text-sm hover:underline"
            style={{ color: 'var(--bp-primary)' }}
          >
            {t('viewAll')}
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <Card>
          <p className="text-sm mb-4" style={{ color: 'var(--bp-muted)' }}>
            {t('noTreatments')}
          </p>
          <Link
            href="/app/treatments/new"
            className="inline-flex items-center gap-1.5 text-sm font-medium hover:gap-2 transition-all"
            style={{ color: 'var(--bp-primary)' }}
          >
            {t('addFirst')} <ArrowRight size={14} aria-hidden />
          </Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {recent.map((tr) => (
            <TreatmentRow key={tr.id} treatment={tr} />
          ))}
        </div>
      )}
    </PageShell>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--bp-muted)' }}>
        {label}
      </div>
      <div
        className="text-3xl"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--bp-ink)', fontWeight: 500 }}
      >
        {value}
      </div>
    </Card>
  )
}

function TreatmentRow({ treatment }: { treatment: Treatment }) {
  const date = new Date(treatment.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  return (
    <Link
      href={`/app/treatments/${treatment.id}`}
      className="flex items-center justify-between gap-4 p-4 rounded-xl border hover:border-[var(--bp-primary)] transition-colors"
      style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)' }}
    >
      <div className="min-w-0">
        <div className="font-medium truncate" style={{ color: 'var(--bp-ink)' }}>
          {treatment.title}
        </div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--bp-muted)' }}>
          {treatment.type} · {date}
        </div>
      </div>
      <StatusPill status={treatment.status} />
    </Link>
  )
}

function StatusPill({ status }: { status: Treatment['status'] }) {
  const tone =
    status === 'completed'
      ? { bg: 'var(--bp-blush)', fg: 'var(--bp-primary)' }
      : status === 'scheduled'
      ? { bg: 'var(--bp-border)', fg: 'var(--bp-ink)' }
      : { bg: 'transparent', fg: 'var(--bp-muted)' }
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {status}
    </span>
  )
}
