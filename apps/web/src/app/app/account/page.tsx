import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'
import { AccountActions } from '@/components/app/AccountActions'

type ExportPayload = {
  profile: { consent_ai_processing: boolean; full_name?: string } | null
}

export default async function AccountPage() {
  const exportData = await serverFetch<ExportPayload>('/api/account/export').catch(
    () => ({ profile: null } as ExportPayload)
  )
  const consent = exportData.profile?.consent_ai_processing ?? false
  const name = exportData.profile?.full_name ?? null

  return (
    <PageShell title="Account" subtitle="Your data, your settings.">
      {name && (
        <Card className="mb-6">
          <div className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--bp-muted)' }}>
            Name
          </div>
          <div className="text-base" style={{ color: 'var(--bp-ink)' }}>
            {name}
          </div>
        </Card>
      )}

      <AccountActions initialConsent={consent} />
    </PageShell>
  )
}
