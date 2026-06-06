'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'

export function Hero() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const layersRef = useRef<HTMLDivElement[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let targetX = 0
    let targetY = 0

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (window.innerWidth / 2 - e.pageX) / 25
      targetY = (window.innerHeight / 2 - e.pageY) / 25

      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        canvas.style.transform = `rotateX(${55 + targetY / 2}deg) rotateZ(${-25 + targetX / 2}deg)`
        layersRef.current.forEach((layer, index) => {
          if (!layer) return
          layer.style.transform = `translateZ(${(index + 1) * 15}px) translate(${targetX * (index + 1) * 0.2}px, ${targetY * (index + 1) * 0.2}px)`
        })
      })
    }

    canvas.style.opacity = '0'
    canvas.style.transform = 'rotateX(90deg) rotateZ(0deg) scale(0.8)'

    const timeout = setTimeout(() => {
      canvas.style.transition = 'all 2.5s cubic-bezier(0.16, 1, 0.3, 1)'
      canvas.style.opacity = '1'
      canvas.style.transform = 'rotateX(55deg) rotateZ(-25deg) scale(1)'
    }, 300)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeout)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <>
      <style>{`
        .bp-hero-section {
          background-color: #0a0a0a;
          color: #e0e0e0;
          font-family: var(--font-syncopate), sans-serif;
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bp-grain {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 10;
          opacity: 0.10;
          filter: url(#bp-grain-filter);
          will-change: auto;
        }

        .bp-viewport {
          position: absolute;
          inset: 0;
          perspective: 2000px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .bp-canvas-3d {
          position: relative;
          width: 800px;
          height: 500px;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        .bp-layer {
          position: absolute;
          inset: 0;
          border: 1px solid rgba(224, 224, 224, 0.08);
          background-size: cover;
          background-position: center top;
          transition: transform 0.5s ease;
          will-change: transform;
          backface-visibility: hidden;
        }

        .bp-layer-1 {
          background-image: url('https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&fm=webp&q=65&w=1200');
          filter: grayscale(1) contrast(1.3) brightness(0.45);
        }
        .bp-layer-2 {
          background-image: url('https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&fm=webp&q=65&w=1200');
          filter: grayscale(1) contrast(1.2) brightness(0.65);
          opacity: 0.6;
          mix-blend-mode: screen;
        }
        .bp-layer-3 {
          background-image: url('https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&fm=webp&q=65&w=1200');
          filter: grayscale(1) contrast(1.4) brightness(0.75);
          opacity: 0.4;
          mix-blend-mode: overlay;
        }

        .bp-contours {
          position: absolute;
          width: 200%;
          height: 200%;
          top: -50%;
          left: -50%;
          background-image: repeating-radial-gradient(
            circle at 50% 50%,
            transparent 0,
            transparent 40px,
            rgba(255, 255, 255, 0.035) 41px,
            transparent 42px
          );
          transform: translateZ(120px);
          pointer-events: none;
        }

        .bp-interface {
          position: absolute;
          inset: 0;
          padding: 4rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: auto 1fr auto;
          z-index: 20;
          pointer-events: none;
        }

        .bp-hero-title {
          grid-column: 1 / -1;
          align-self: center;
          font-size: clamp(3rem, 10vw, 10rem);
          line-height: 0.85;
          letter-spacing: -0.04em;
          mix-blend-mode: difference;
          font-weight: 700;
        }

        .bp-cta-row {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          pointer-events: auto;
        }

        .bp-cta-meta {
          font-family: monospace;
          font-size: 0.75rem;
          line-height: 1.6;
          color: rgba(224, 224, 224, 0.6);
        }

        .bp-cta-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .bp-btn-primary {
          background: #e0e0e0;
          color: #0a0a0a;
          padding: 1rem 2rem;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          clip-path: polygon(0 0, 100% 0, 100% 70%, 88% 100%, 0 100%);
          transition: background 0.3s, color 0.3s, transform 0.3s;
          display: inline-block;
        }
        .bp-btn-primary:hover {
          background: #C06078;
          color: #fff;
          transform: translateY(-4px);
        }

        .bp-btn-secondary {
          border: 1px solid rgba(224, 224, 224, 0.5);
          color: #e0e0e0;
          padding: 1rem 2rem;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          clip-path: polygon(0 0, 100% 0, 100% 70%, 88% 100%, 0 100%);
          transition: background 0.3s, border-color 0.3s, transform 0.3s;
          display: inline-block;
        }
        .bp-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: #C06078;
          transform: translateY(-4px);
        }

        .bp-scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          width: 1px;
          height: 60px;
          background: linear-gradient(to bottom, #e0e0e0, transparent);
          animation: bp-flow 2s infinite ease-in-out;
          z-index: 20;
        }

        @keyframes bp-flow {
          0%, 100% { transform: scaleY(0); transform-origin: top; }
          50%       { transform: scaleY(1); transform-origin: top; }
          51%       { transform: scaleY(1); transform-origin: bottom; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bp-canvas-3d {
            transition: none !important;
            transform: rotateX(55deg) rotateZ(-25deg) scale(1) !important;
            opacity: 1 !important;
          }
          .bp-scroll-hint { animation: none; opacity: 0.4; }
        }

        @media (max-width: 640px) {
          .bp-canvas-3d { width: 100vw; height: 320px; }
          .bp-interface { padding: 1.5rem; }
          .bp-cta-buttons { flex-direction: column; align-items: flex-end; gap: 0.5rem; }
          .bp-hero-title { font-size: clamp(2.5rem, 16vw, 6rem); }
        }
      `}</style>

      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
        <filter id="bp-grain-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </svg>

      <section className="bp-hero-section">
        <div className="bp-grain" aria-hidden />

        <div className="bp-viewport" aria-hidden>
          <div className="bp-canvas-3d" ref={canvasRef}>
            <div className="bp-layer bp-layer-1" ref={el => { if (el) layersRef.current[0] = el }} />
            <div className="bp-layer bp-layer-2" ref={el => { if (el) layersRef.current[1] = el }} />
            <div className="bp-layer bp-layer-3" ref={el => { if (el) layersRef.current[2] = el }} />
            <div className="bp-contours" />
          </div>
        </div>

        <div className="bp-interface">
          <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.1em' }}>
            BEAUTYPASS
          </div>
          <div style={{ textAlign: 'right', fontFamily: 'monospace', color: '#C06078', fontSize: '0.65rem', lineHeight: 1.8 }}>
            <div>EST. 2024</div>
            <div>YOUR DATA, YOUR RULES</div>
          </div>

          <h1 className="bp-hero-title">
            BEAUTY<br />PASS
          </h1>

          <div className="bp-cta-row">
            <div className="bp-cta-meta">
              <p>[ YOUR JOURNEY ]</p>
              <p>TRACK · SHARE · OWN</p>
            </div>
            <div className="bp-cta-buttons">
              <Link href="/register?role=client" className="bp-btn-primary">
                I&apos;M A CLIENT →
              </Link>
              <Link href="/for-professionals" className="bp-btn-secondary">
                I&apos;M A PRO →
              </Link>
            </div>
          </div>
        </div>

        <div className="bp-scroll-hint" aria-hidden />
      </section>
    </>
  )
}
