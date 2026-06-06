import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { MarketingPage } from '@/components/marketing/MarketingPage'

export const metadata = {
  title: 'About — BeautyPass',
  description: 'BeautyPass is the missing layer between visits. A client-owned record for the cosmetic industry.',
}

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <MarketingPage
          eyebrow="[ ABOUT ]"
          title={<>WHY<br />WE BUILT IT</>}
          tagline="THE BEAUTY INDUSTRY MOVES FAST. RECORDS HAVEN'T MOVED IN A DECADE. WE'RE FIXING THAT."
        >
          <h2>A record that belongs to the person it's about.</h2>
          <p>
            Cosmetic medicine sits in a strange place. It's medicine — needles, lasers, chemistry — but
            it's also retail. Most clients see three or four professionals a year, often across cities or
            countries, with no shared record. The result: rough estimates, repeated allergy questions, and
            decisions made without context.
          </p>
          <p>
            BeautyPass was built on a simple premise: the record should belong to the person it's about.
            Not the clinic. Not the platform. The client carries it; the professional reads it; everyone
            else, including us, sees only what they're allowed to.
          </p>

          <h3>What we believe</h3>
          <ul>
            <li><strong>Data is consent.</strong> Every byte is opt-in. Photos, AI processing, sharing windows — the default is closed.</li>
            <li><strong>Privacy is engineering.</strong> Records are encrypted at rest. Access is time-bound. We don't sell anything.</li>
            <li><strong>Professionals are users too.</strong> The product has to make a real consult easier, or it's just paperwork.</li>
          </ul>

          <h3>Where we're based</h3>
          <p>
            BeautyPass is built in Vilnius, Lithuania. We started with clinics here, and we're expanding
            across the Baltics and Northern Europe.
          </p>

          <hr />

          <p>
            <Link href="/contact">Get in touch</Link>
            {' · '}
            <Link href="/for-professionals">For professionals</Link>
            {' · '}
            <Link href="/for-clients">For clients</Link>
          </p>
        </MarketingPage>
      </main>
      <Footer />
    </>
  )
}
