import { redirect } from 'next/navigation'
import { getAccessToken, getRole } from '@/lib/auth'
import { ProSidebar } from '@/components/pro/ProSidebar'

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const [token, role] = await Promise.all([getAccessToken(), getRole()])
  if (!token) redirect('/login')
  if (role === 'client') redirect('/app')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bp-bg)' }}>
      <ProSidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
