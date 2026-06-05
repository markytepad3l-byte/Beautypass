import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'
import { GenerateInsightButton } from '@/components/app/GenerateInsightButton'
import { Sparkles } from 'lucide-react'

type Insight = {
  id: string
  content: string
  modelVersion: string
  generatedAt: string
  disclaimer: string
}

export default async function InsightsPage() {
  const insights = await serverFetch<Insight[]>('/api/insights').catch(() => [])

  return (
    <PageShell
      title="Insights"
      subtitle="An AI-generated summary of your treatment timeline. Opt-in, never includes your photos or raw notes."
      action={<GenerateInsightButton />}
    >
      {insights.length === 0 ? (
        <Card>
          <div className="text-center py-6">
            <Sparkles className="mx-auto mb-3 opacity-40" size={32} style={{ color: 'var(--bp-primary)' }} />
            <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
              No insights yet. Generate one to see a summary of your timeline.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {insights.map((i) => (
            <Card key={i.id}>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--bp-muted)' }}>
                {new Date(i.generatedAt).toLocaleString()}
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--bp-ink)' }}>
                {i.content}
              </div>
              <p className="mt-4 pt-4 border-t text-xs italic" style={{ borderColor: 'var(--bp-border)', color: 'var(--bp-muted)' }}>
                {i.disclaimer}
              </p>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
