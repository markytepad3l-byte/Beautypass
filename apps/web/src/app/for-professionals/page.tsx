import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { MarketingPage } from '@/components/marketing/MarketingPage'

export const metadata = {
  title: 'For Professionals — BeautyPass',
  description: 'See the full history before you treat. A client-owned record they bring to you — no logins, no portals, no platform lock-in.',
}

export default function ForProfessionalsPage() {
  return (
    <>
      <Header />
      <main>
        <MarketingPage
          eyebrow="[ FOR PROFESSIONALS ]"
          title={<>SEE THE<br />WHOLE FACE</>}
          tagline="THE CLIENT BRINGS THEIR RECORD TO YOU. NO LOGINS, NO PORTALS, NO PLATFORM LOCK-IN — JUST THE CONTEXT YOU NEED, WHEN YOU NEED IT."
        >
          <h2>Walk into every consult informed.</h2>
          <p>
            You're being asked to inject, peel, or laser a face you've never seen before — based on what
            the client remembers. BeautyPass gives you the actual record: dates, doses, brands, photos,
            reactions. From their last clinic. And the one before that.
          </p>

          <h3>How it works for you</h3>
          <ul>
            <li><strong>Scan a QR.</strong> The client shows their phone. You scan. You're in — for the window they granted.</li>
            <li><strong>Read or add.</strong> If they granted full access, log your treatment directly into their record. It's signed, timestamped, and theirs.</li>
            <li><strong>No accounts to manage.</strong> Your clients own the data. You see what they share, when they share it. That's it.</li>
          </ul>

          <h3>Built for your workflow</h3>
          <p>
            Records use a standardised schema for injectables, peels, lasers, and skincare — so a note from
            a Vilnius clinic reads the same as one from a Berlin one. Photos are full-resolution, with
            consistent lighting metadata where available.
          </p>

          <h3>You stay in control of your own practice</h3>
          <p>
            BeautyPass isn't your booking system, your CRM, or your billing. We don't touch any of that.
            We're the layer that sits between visits — the part that was missing.
          </p>

          <hr />

          <p>
            <Link href="/register?role=pro">Set up your professional account →</Link>
            {' · '}
            <Link href="/contact">Talk to us</Link>
          </p>
        </MarketingPage>
      </main>
      <Footer />
    </>
  )
}
