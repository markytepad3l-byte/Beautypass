import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'
import { PermissionList } from '@/components/app/PermissionList'

type Permission = {
  id: string
  grantee_name: string | null
  grantee_type: 'doctor' | 'clinic'
  access_level: 'readonly' | 'full'
  granted_at: string
  expires_at: string | null
  revoked_at: string | null
}

export default async function PermissionsPage() {
  const all = await serverFetch<Permission[]>('/api/permissions').catch(() => [])
  const active = all.filter(
    (p) => !p.revoked_at && (!p.expires_at || new Date(p.expires_at) > new Date())
  )

  return (
    <PageShell
      title="Permissions"
      subtitle="People and clinics who can currently see your records. Revoke any of them at any time."
    >
      {active.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            You haven&apos;t granted access to anyone yet. Use the <strong>Share</strong> tab to generate a QR code.
          </p>
        </Card>
      ) : (
        <PermissionList permissions={active} />
      )}
    </PageShell>
  )
}
