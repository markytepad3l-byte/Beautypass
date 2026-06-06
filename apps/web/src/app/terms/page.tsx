import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { MarketingPage } from '@/components/marketing/MarketingPage'

export const metadata = {
  title: 'Terms of Service — BeautyPass',
  description: 'BeautyPass terms of service.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <MarketingPage
          eyebrow="[ TERMS OF SERVICE ]"
          title={<>THE<br />RULES</>}
          tagline="LAST UPDATED · JUNE 2026. BY USING BEAUTYPASS YOU AGREE TO THE TERMS BELOW."
        >
          <h2>1. What BeautyPass is.</h2>
          <p>
            BeautyPass is a service that lets you (the client) keep a private record of cosmetic and
            skincare treatments, and selectively share that record with cosmetic professionals. It is
            not a medical device, not a diagnostic tool, and not a substitute for advice from a
            licensed professional.
          </p>

          <h2>2. Accounts.</h2>
          <p>
            You must be 18 or older to use BeautyPass. You're responsible for keeping your login
            credentials safe and for everything that happens under your account. If you suspect
            unauthorised access, contact us immediately.
          </p>

          <h2>3. Your content.</h2>
          <p>
            You retain ownership of every record, note, and photo you upload. By uploading, you grant
            BeautyPass a limited licence to store, encrypt, and display that content back to you and to
            the people you explicitly share it with. We don't claim any other rights.
          </p>

          <h2>4. Sharing.</h2>
          <p>
            QR-code sharing is time-bound and revocable. You're responsible for choosing what to share,
            with whom, and for how long. We log every access so you can audit it.
          </p>

          <h2>5. Professional users.</h2>
          <p>
            If you're a cosmetic professional, you agree to use shared records solely for the
            consultation, treatment, or aftercare of the client who shared them — and to comply with the
            laws governing your practice in your jurisdiction.
          </p>

          <h2>6. Prohibited use.</h2>
          <ul>
            <li>Uploading content that isn't yours, or content of someone else without their consent.</li>
            <li>Using the service to harm, deceive, or impersonate anyone.</li>
            <li>Attempting to circumvent access controls or extract another user's data.</li>
            <li>Reselling or redistributing access to professional features.</li>
          </ul>

          <h2>7. Termination.</h2>
          <p>
            You can delete your account any time from the app. We may suspend accounts that violate
            these terms or that we reasonably believe pose a security risk.
          </p>

          <h2>8. Liability.</h2>
          <p>
            BeautyPass is provided "as is". To the maximum extent permitted by law, we're not liable
            for indirect or consequential damages arising from your use of the service. Nothing in
            these terms limits liability that can't be limited under applicable law.
          </p>

          <h2>9. Changes.</h2>
          <p>
            We may update these terms. Material changes will be announced at least 30 days before they
            take effect.
          </p>

          <h2>10. Law.</h2>
          <p>
            These terms are governed by the laws of the Republic of Lithuania. Disputes will be heard
            in the courts of Vilnius.
          </p>

          <hr />

          <p>
            <Link href="/privacy">Privacy policy</Link>
            {' · '}
            <Link href="/contact">Contact</Link>
          </p>
        </MarketingPage>
      </main>
      <Footer />
    </>
  )
}
