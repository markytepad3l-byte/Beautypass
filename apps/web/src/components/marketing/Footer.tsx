'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')

  return (
    <>
      <style>{`
        .bp-footer {
          background-color: #0a0a0a;
          color: #e0e0e0;
          font-family: var(--font-syncopate), sans-serif;
          position: relative;
          overflow: hidden;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .bp-footer-grid {
          max-width: 1280px;
          margin: 0 auto;
          padding: 5rem 2.5rem 3rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem;
        }

        .bp-footer-brand h2 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          margin: 0 0 1.25rem;
          color: #e0e0e0;
        }

        .bp-footer-brand p {
          font-family: monospace;
          font-size: 0.7rem;
          color: rgba(224,224,224,0.45);
          line-height: 1.7;
          letter-spacing: 0.04em;
          max-width: 260px;
        }

        .bp-footer-brand .bp-footer-accent {
          display: inline-block;
          width: 8px;
          height: 8px;
          background: #C06078;
          border-radius: 50%;
          margin-right: 0.5rem;
          vertical-align: middle;
        }

        .bp-footer-col h3 {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: rgba(224,224,224,0.35);
          margin: 0 0 1.25rem;
          text-transform: uppercase;
        }

        .bp-footer-col ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .bp-footer-col a {
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          color: rgba(224,224,224,0.55);
          text-decoration: none;
          transition: color 0.2s;
        }
        .bp-footer-col a:hover {
          color: #C06078;
        }

        .bp-footer-divider {
          max-width: 1280px;
          margin: 0 auto;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .bp-footer-bottom {
          max-width: 1280px;
          margin: 0 auto;
          padding: 1.5rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .bp-footer-bottom span {
          font-family: monospace;
          font-size: 0.65rem;
          color: rgba(224,224,224,0.3);
          letter-spacing: 0.06em;
        }

        .bp-footer-wordmark {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: rgba(224,224,224,0.15);
          text-decoration: none;
          transition: color 0.3s;
        }
        .bp-footer-wordmark:hover {
          color: #C06078;
        }

        @media (max-width: 900px) {
          .bp-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
          .bp-footer-brand {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 540px) {
          .bp-footer-grid {
            grid-template-columns: 1fr;
            padding: 3rem 1.5rem 2rem;
          }
          .bp-footer-bottom {
            flex-direction: column;
            gap: 0.75rem;
            padding: 1.5rem;
            text-align: center;
          }
        }
      `}</style>

      <footer className="bp-footer" style={{ scrollSnapAlign: 'start' }}>
        <div className="bp-footer-grid">
          {/* Brand column */}
          <div className="bp-footer-brand">
            <h2>BEAUTY<br />PASS</h2>
            <p>
              <span className="bp-footer-accent" />
              YOUR BEAUTY JOURNEY,<br />
              IN ONE PLACE.<br />
              PRIVATE. SECURE. YOURS.
            </p>
          </div>

          {/* Product */}
          <div className="bp-footer-col">
            <h3>Product</h3>
            <ul>
              <li><Link href="/register?role=client">For Clients</Link></li>
              <li><Link href="/for-professionals">For Pros</Link></li>
              <li><Link href="/register">Get Started</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="bp-footer-col">
            <h3>Company</h3>
            <ul>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">{t('contact')}</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="bp-footer-col">
            <h3>Legal</h3>
            <ul>
              <li><Link href="/privacy">{t('privacy')}</Link></li>
              <li><Link href="/terms">{t('terms')}</Link></li>
            </ul>
          </div>
        </div>

        <div className="bp-footer-divider" />

        <div className="bp-footer-bottom">
          <span>© {new Date().getFullYear()} BEAUTYPASS.LT — ALL RIGHTS RESERVED</span>
          <Link href="/" className="bp-footer-wordmark">BEAUTYPASS</Link>
        </div>
      </footer>
    </>
  )
}
