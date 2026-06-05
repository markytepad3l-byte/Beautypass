import Link from 'next/link'
import Image from 'next/image'
import { serverFetch } from '@/lib/serverApi'
import { PageShell, Card } from '@/components/app/PageShell'

type Treatment = { id: string; title: string; date: string }
type Photo = { id: string; phase: string; url: string }

export default async function PhotosPage() {
  const treatments = await serverFetch<Treatment[]>('/api/treatments').catch(() => [])

  const groups = await Promise.all(
    treatments.map(async (tr) => {
      const photos = await serverFetch<Photo[]>(`/api/treatments/${tr.id}/photos`).catch(() => [])
      return { treatment: tr, photos }
    })
  )

  const withPhotos = groups.filter((g) => g.photos.length > 0)

  return (
    <PageShell title="Photos" subtitle="All your treatment photos in one place. Tap a treatment to manage.">
      {withPhotos.length === 0 ? (
        <Card>
          <p className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            No photos yet. Open a treatment to upload before/after photos.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {withPhotos.map(({ treatment, photos }) => (
            <section key={treatment.id}>
              <Link
                href={`/app/treatments/${treatment.id}`}
                className="flex items-center justify-between mb-3 hover:underline"
                style={{ color: 'var(--bp-ink)' }}
              >
                <h2 className="text-base font-medium">{treatment.title}</h2>
                <span className="text-xs" style={{ color: 'var(--bp-muted)' }}>
                  {new Date(treatment.date).toLocaleDateString()}
                </span>
              </Link>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {photos.map((p) => (
                  <Link key={p.id} href={`/app/treatments/${treatment.id}`} className="block">
                    <Image
                      src={p.url}
                      alt={p.phase}
                      width={300}
                      height={300}
                      className="w-full aspect-square object-cover rounded-xl"
                      unoptimized
                    />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </PageShell>
  )
}
