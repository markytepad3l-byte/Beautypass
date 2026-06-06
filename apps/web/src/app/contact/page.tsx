import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { MarketingPage } from '@/components/marketing/MarketingPage'

export const metadata = {
  title: 'Contact — BeautyPass',
  description: 'Get in touch with the BeautyPass team.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <MarketingPage
          eyebrow="[ CONTACT ]"
          title={<>TALK<br />TO US</>}
          tagline="QUESTIONS, PARTNERSHIPS, OR JUST CURIOUS — WE READ EVERY MESSAGE."
        >
          <h2>How to reach the team.</h2>

          <h3>General</h3>
          <p>
            <a href="mailto:hello@beautypass.lt">hello@beautypass.lt</a>
          </p>

          <h3>Clinics &amp; professionals</h3>
          <p>
            Want to bring BeautyPass into your practice, or join an early-access cohort?
            <br />
            <a href="mailto:pros@beautypass.lt">pros@beautypass.lt</a>
          </p>

          <h3>Privacy &amp; data requests</h3>
          <p>
            For data exports, deletions, or anything related to your record:
            <br />
            <a href="mailto:privacy@beautypass.lt">privacy@beautypass.lt</a>
          </p>

          <h3>Press</h3>
          <p>
            <a href="mailto:press@beautypass.lt">press@beautypass.lt</a>
          </p>

          <hr />

          <p>
            <strong>BeautyPass UAB</strong><br />
            Vilnius, Lithuania
          </p>

          <p>
            <Link href="/privacy">Privacy policy</Link>
            {' · '}
            <Link href="/terms">Terms of service</Link>
          </p>
        </MarketingPage>
      </main>
      <Footer />
    </>
  )
}
