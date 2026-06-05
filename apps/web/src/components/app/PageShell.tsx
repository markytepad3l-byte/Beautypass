export function PageShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="px-6 lg:px-10 py-8 lg:py-12 max-w-5xl">
      <header className="flex items-start justify-between gap-6 mb-8">
        <div>
          <h1
            className="text-3xl lg:text-4xl tracking-tight"
            style={{
              fontFamily: 'var(--font-display)',
              color: 'var(--bp-ink)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-base" style={{ color: 'var(--bp-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </div>
  )
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${className}`}
      style={{ background: 'var(--bp-surface)', borderColor: 'var(--bp-border)' }}
    >
      {children}
    </div>
  )
}
