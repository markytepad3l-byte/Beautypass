import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { MarketingPage } from '@/components/marketing/MarketingPage'

export const metadata = {
  title: 'For Clients — BeautyPass',
  description: 'Your beauty journey, kept in one private place. Track every treatment, photo, and product — and share it with your doctor when you want to.',
}

export default function ForClientsPage() {
  return (
    <>
      <Header />
      <main>
        <MarketingPage
          eyebrow="[ FOR CLIENTS ]"
          title={<>YOUR<br />JOURNEY</>}
          tagline="EVERY TREATMENT. EVERY PHOTO. EVERY PRODUCT. ONE PRIVATE PLACE — AND ONLY YOU DECIDE WHO SEES IT."
        >
          <h2>Beauty records, finally yours.</h2>
          <p>
            Every clinic keeps a separate file. Every doctor sees one fragment. You're the only person
            who's ever held the full picture — except you're holding it in screenshots, group chats, and memory.
            BeautyPass changes that.
          </p>

          <h3>What you can track</h3>
          <ul>
            <li><strong>Treatments.</strong> Injectables, peels, lasers, facials, skincare routines — with dates, products, doses, and the professional who delivered them.</li>
            <li><strong>Photos.</strong> Before, after, healing. Encrypted at rest, never used to train anything.</li>
            <li><strong>Reactions &amp; notes.</strong> What worked, what didn't, what your skin felt like in week two.</li>
            <li><strong>Products.</strong> Brand, batch, expiry — so you know exactly what's gone into you.</li>
          </ul>

          <h3>How sharing works</h3>
          <p>
            When you visit a new clinic, generate a QR code. They scan it, and for a window of time you set
            (15 minutes, an hour, a day — never longer than 24 hours) they can see what you choose to show:
            read-only, or read-and-add. The moment that window closes, access is gone.
          </p>

          <h3>Your data, your rules</h3>
          <p>
            Export everything as a single file at any time. Delete your account and every record is gone.
            AI insights are opt-in only — and even then, your photos never leave our servers unencrypted.
          </p>

          <hr />

          <p>
            <Link href="/register?role=client">Create your free account →</Link>
          </p>
        </MarketingPage>
      </main>
      <Footer />
    </>
  )
}
