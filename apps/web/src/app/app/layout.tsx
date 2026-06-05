import { redirect } from 'next/navigation'
import { getAccessToken, getRole } from '@/lib/auth'
import { Sidebar } from '@/components/app/Sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [token, role] = await Promise.all([getAccessToken(), getRole()])
  if (!token) redirect('/login')
  if (role && role !== 'client') redirect('/pro')

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bp-bg)' }}>
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
