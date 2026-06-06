import Link from 'next/link'
import { Header } from '@/components/marketing/Header'
import { Footer } from '@/components/marketing/Footer'
import { MarketingPage } from '@/components/marketing/MarketingPage'

export const metadata = {
  title: 'Privacy Policy — BeautyPass',
  description: 'How BeautyPass handles your data — in plain language.',
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main>
        <MarketingPage
          eyebrow="[ PRIVACY POLICY ]"
          title={<>YOUR DATA,<br />YOUR RULES</>}
          tagline="LAST UPDATED · JUNE 2026. THIS IS A PLAIN-LANGUAGE SUMMARY. THE FULL LEGAL VERSION IS BELOW."
        >
          <h2>The short version.</h2>
          <p>
            BeautyPass holds your beauty record. We encrypt it, we don't sell it, and we don't use your
            photos to train any AI model. You decide who sees what, and for how long. You can export or
            delete everything at any time.
          </p>

          <h3>What we collect</h3>
          <ul>
            <li><strong>Account data</strong> — email, name, role (client or professional), authentication tokens.</li>
            <li><strong>Record data</strong> — treatments, products, photos, notes you choose to upload.</li>
            <li><strong>Sharing logs</strong> — when a QR code was issued, who scanned it, when access expired.</li>
            <li><strong>Technical data</strong> — device type, IP address (for security), basic usage events (no third-party trackers).</li>
          </ul>

          <h3>What we don't do</h3>
          <ul>
            <li>We do not sell, rent, or share your record with advertisers, insurers, or third parties.</li>
            <li>We do not use your photos to train machine-learning models.</li>
            <li>We do not embed third-party analytics or ad trackers in the app.</li>
          </ul>

          <h3>How sharing works</h3>
          <p>
            When you generate a QR code, you choose what to share, what kind of access (read-only or full),
            and how long the window stays open — up to 24 hours. After that window closes, the link is dead.
            Every access is logged and visible to you.
          </p>

          <h3>AI features</h3>
          <p>
            AI-assisted insights are off by default. If you turn them on, your record is processed by a
            third-party model provider under a no-training agreement. You can revoke the consent at any
            time, and your previous insights are deleted.
          </p>

          <h3>Your rights (GDPR)</h3>
          <ul>
            <li><strong>Access</strong> — export everything as a single file at any time.</li>
            <li><strong>Rectification</strong> — edit or correct any record you own.</li>
            <li><strong>Erasure</strong> — delete your account and every record disappears within 30 days.</li>
            <li><strong>Portability</strong> — your export is a clean JSON/PDF you can take anywhere.</li>
            <li><strong>Complaints</strong> — you may contact Lithuania's State Data Protection Inspectorate (VDAI).</li>
          </ul>

          <h3>Retention</h3>
          <p>
            Your record stays until you delete it. Sharing logs are kept for 90 days. Backups are
            encrypted and rotated weekly.
          </p>

          <h3>Contact</h3>
          <p>
            Questions, data requests, or anything privacy-related: <a href="mailto:privacy@beautypass.lt">privacy@beautypass.lt</a>
          </p>

          <hr />

          <p>
            <Link href="/terms">Terms of service</Link>
            {' · '}
            <Link href="/contact">Contact</Link>
          </p>
        </MarketingPage>
      </main>
      <Footer />
    </>
  )
}
