import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'
import { PhotoGallery } from '@/components/app/PhotoGallery'

type Treatment = {
  id: string
  title: string
  type: string
  date: string
  status: string
  notes: string | null
  body_zone: string | null
}

type Photo = {
  id: string
  phase: 'before' | 'after' | 'progress'
  areaTag: string | null
  url: string
  createdAt: string
}

export default async function TreatmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let treatment: Treatment
  try {
    treatment = await serverFetch<Treatment>(`/api/treatments/${id}`)
  } catch {
    notFound()
  }

  const photos = await serverFetch<Photo[]>(`/api/treatments/${id}/photos`).catch(() => [])

  const date = new Date(treatment.date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <PageShell title={treatment.title}>
      <Link
        href="/app/treatments"
        className="inline-flex items-center gap-1.5 text-sm mb-6 hover:underline"
        style={{ color: 'var(--bp-muted)' }}
      >
        <ArrowLeft size={14} /> All treatments
      </Link>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Meta label="Date" value={date} />
        <Meta label="Type" value={treatment.type} />
        <Meta label="Status" value={treatment.status} />
        <Meta label="Body zone" value={treatment.body_zone ?? '—'} />
      </div>

      {treatment.notes && (
        <Card className="mb-6">
          <div className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--bp-muted)' }}>
            Notes
          </div>
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--bp-ink)' }}>
            {treatment.notes}
          </p>
        </Card>
      )}

      <PhotoGallery treatmentId={treatment.id} initialPhotos={photos} />
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
