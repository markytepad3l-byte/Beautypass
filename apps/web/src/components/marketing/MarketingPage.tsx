'use client'

import { ReactNode } from 'react'

type Props = {
  eyebrow: string
  title: ReactNode
  tagline: string
  children: ReactNode
}

export function MarketingPage({ eyebrow, title, tagline, children }: Props) {
  return (
    <>
      <style>{`
        .bp-mp-hero {
          background-color: #0a0a0a;
          color: #e0e0e0;
          font-family: var(--font-syncopate), sans-serif;
          padding: 8rem 2.5rem 5rem;
          position: relative;
          overflow: hidden;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .bp-mp-hero-grid {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: end;
          gap: 3rem;
        }
        .bp-mp-eyebrow {
          font-family: monospace;
          font-size: 0.65rem;
          letter-spacing: 0.2em;
          color: #C06078;
          margin: 0 0 1rem;
        }
        .bp-mp-title {
          font-size: clamp(3rem, 8vw, 7rem);
          line-height: 0.9;
          letter-spacing: -0.04em;
          font-weight: 700;
          margin: 0;
        }
        .bp-mp-tagline {
          font-family: monospace;
          font-size: 0.75rem;
          line-height: 1.7;
          color: rgba(224,224,224,0.55);
          letter-spacing: 0.04em;
          max-width: 28rem;
          justify-self: end;
        }
        .bp-mp-body {
          background: var(--bp-bg);
          color: var(--bp-ink);
          padding: 5rem 2.5rem 7rem;
        }
        .bp-mp-body-inner {
          max-width: 760px;
          margin: 0 auto;
          font-family: var(--font-inter), system-ui, sans-serif;
        }
        .bp-mp-body-inner h2 {
          font-family: var(--font-fraunces), serif;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.15;
          margin: 3rem 0 1rem;
          color: var(--bp-ink);
        }
        .bp-mp-body-inner h2:first-child { margin-top: 0; }
        .bp-mp-body-inner h3 {
          font-family: var(--font-syncopate), sans-serif;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--bp-primary);
          margin: 2.5rem 0 0.75rem;
        }
        .bp-mp-body-inner p {
          font-size: 1.0625rem;
          line-height: 1.7;
          color: var(--bp-ink);
          margin: 0 0 1.25rem;
          opacity: 0.85;
        }
        .bp-mp-body-inner ul {
          padding-left: 1.25rem;
          margin: 0 0 1.5rem;
        }
        .bp-mp-body-inner li {
          font-size: 1.0625rem;
          line-height: 1.7;
          margin-bottom: 0.5rem;
          opacity: 0.85;
        }
        .bp-mp-body-inner a {
          color: var(--bp-primary);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .bp-mp-body-inner a:hover { color: var(--bp-primary-deep); }
        .bp-mp-body-inner strong { font-weight: 600; opacity: 1; }
        .bp-mp-body-inner hr {
          border: none;
          border-top: 1px solid var(--bp-border);
          margin: 3rem 0;
        }

        @media (max-width: 700px) {
          .bp-mp-hero { padding: 7rem 1.5rem 3rem; }
          .bp-mp-hero-grid { grid-template-columns: 1fr; gap: 1.5rem; }
          .bp-mp-tagline { justify-self: start; }
          .bp-mp-body { padding: 3rem 1.5rem 5rem; }
        }
      `}</style>

      <section className="bp-mp-hero">
        <div className="bp-mp-hero-grid">
          <div>
            <p className="bp-mp-eyebrow">{eyebrow}</p>
            <h1 className="bp-mp-title">{title}</h1>
          </div>
          <p className="bp-mp-tagline">{tagline}</p>
        </div>
      </section>

      <section className="bp-mp-body">
        <div className="bp-mp-body-inner">{children}</div>
      </section>
    </>
  )
}
