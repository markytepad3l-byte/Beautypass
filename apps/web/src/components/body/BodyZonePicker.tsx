'use client'

import { useState } from 'react'

export type BodyZone =
  | 'forehead'
  | 'eyes'
  | 'cheeks'
  | 'nose'
  | 'lips'
  | 'jaw'
  | 'chin'
  | 'neck'
  | 'decolletage'
  | 'shoulders'
  | 'arms'
  | 'hands'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'glutes'
  | 'thighs'
  | 'knees'
  | 'calves'
  | 'feet'

type View = 'front' | 'back'

const ZONE_LABELS: Record<BodyZone, string> = {
  forehead: 'Forehead',
  eyes: 'Eyes',
  cheeks: 'Cheeks',
  nose: 'Nose',
  lips: 'Lips',
  jaw: 'Jawline',
  chin: 'Chin',
  neck: 'Neck',
  decolletage: 'Décolletage',
  shoulders: 'Shoulders',
  arms: 'Arms',
  hands: 'Hands',
  chest: 'Chest',
  abdomen: 'Abdomen',
  back: 'Back',
  glutes: 'Glutes',
  thighs: 'Thighs',
  knees: 'Knees',
  calves: 'Calves',
  feet: 'Feet',
}

type ZonePath = { id: BodyZone; d: string; view: View }

// Simplified anatomical zones — illustrative, not medical.
const ZONES: ZonePath[] = [
  // FRONT
  { view: 'front', id: 'forehead', d: 'M88 42 Q100 30 112 42 L112 56 L88 56 Z' },
  { view: 'front', id: 'eyes',     d: 'M86 60 L114 60 L114 70 L86 70 Z' },
  { view: 'front', id: 'nose',     d: 'M96 72 L104 72 L106 84 L94 84 Z' },
  { view: 'front', id: 'cheeks',   d: 'M80 70 L92 70 L92 86 L80 86 Z M108 70 L120 70 L120 86 L108 86 Z' },
  { view: 'front', id: 'lips',     d: 'M92 88 L108 88 L108 94 L92 94 Z' },
  { view: 'front', id: 'jaw',      d: 'M84 96 Q100 110 116 96 L116 104 Q100 116 84 104 Z' },
  { view: 'front', id: 'chin',     d: 'M94 104 L106 104 L106 112 L94 112 Z' },
  { view: 'front', id: 'neck',     d: 'M90 116 L110 116 L110 130 L90 130 Z' },
  { view: 'front', id: 'decolletage', d: 'M76 132 L124 132 L124 148 L76 148 Z' },
  { view: 'front', id: 'shoulders',d: 'M52 134 L78 132 L78 152 L52 154 Z M122 132 L148 134 L148 154 L122 152 Z' },
  { view: 'front', id: 'chest',    d: 'M76 150 L124 150 L124 184 L76 184 Z' },
  { view: 'front', id: 'arms',     d: 'M44 156 L66 156 L66 220 L44 220 Z M134 156 L156 156 L156 220 L134 220 Z' },
  { view: 'front', id: 'abdomen',  d: 'M78 186 L122 186 L122 230 L78 230 Z' },
  { view: 'front', id: 'hands',    d: 'M40 222 L70 222 L70 244 L40 244 Z M130 222 L160 222 L160 244 L130 244 Z' },
  { view: 'front', id: 'thighs',   d: 'M74 232 L98 232 L98 296 L74 296 Z M102 232 L126 232 L126 296 L102 296 Z' },
  { view: 'front', id: 'knees',    d: 'M74 298 L98 298 L98 314 L74 314 Z M102 298 L126 298 L126 314 L102 314 Z' },
  { view: 'front', id: 'calves',   d: 'M74 316 L98 316 L98 372 L74 372 Z M102 316 L126 316 L126 372 L102 372 Z' },
  { view: 'front', id: 'feet',     d: 'M70 374 L100 374 L100 392 L70 392 Z M100 374 L130 374 L130 392 L100 392 Z' },
  // BACK
  { view: 'back', id: 'back',      d: 'M76 132 L124 132 L124 230 L76 230 Z' },
  { view: 'back', id: 'shoulders', d: 'M52 134 L78 132 L78 152 L52 154 Z M122 132 L148 134 L148 154 L122 152 Z' },
  { view: 'back', id: 'arms',      d: 'M44 156 L66 156 L66 220 L44 220 Z M134 156 L156 156 L156 220 L134 220 Z' },
  { view: 'back', id: 'hands',     d: 'M40 222 L70 222 L70 244 L40 244 Z M130 222 L160 222 L160 244 L130 244 Z' },
  { view: 'back', id: 'glutes',    d: 'M76 232 L124 232 L124 268 L76 268 Z' },
  { view: 'back', id: 'thighs',    d: 'M74 268 L98 268 L98 296 L74 296 Z M102 268 L126 268 L126 296 L102 296 Z' },
  { view: 'back', id: 'knees',     d: 'M74 298 L98 298 L98 314 L74 314 Z M102 298 L126 298 L126 314 L102 314 Z' },
  { view: 'back', id: 'calves',    d: 'M74 316 L98 316 L98 372 L74 372 Z M102 316 L126 316 L126 372 L102 372 Z' },
  { view: 'back', id: 'feet',      d: 'M70 374 L100 374 L100 392 L70 392 Z M100 374 L130 374 L130 392 L100 392 Z' },
]

export function BodyZonePicker({
  value,
  onChange,
}: {
  value?: string
  onChange: (zone: BodyZone) => void
}) {
  const [view, setView] = useState<View>('front')
  const [hover, setHover] = useState<BodyZone | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div
          className="inline-flex p-1 rounded-xl"
          style={{ background: 'var(--bp-blush)' }}
        >
          {(['front', 'back'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: view === v ? 'var(--bp-surface)' : 'transparent',
                color: view === v ? 'var(--bp-primary)' : 'var(--bp-muted)',
                boxShadow: view === v ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="text-sm" style={{ color: 'var(--bp-muted)' }}>
          {value ? (
            <span style={{ color: 'var(--bp-ink)' }}>
              <span className="opacity-60">Selected: </span>
              {ZONE_LABELS[value as BodyZone] ?? value}
            </span>
          ) : (
            'Tap a zone'
          )}
        </div>
      </div>

      <div
        className="relative rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bp-bg)', borderColor: 'var(--bp-border)' }}
      >
        <svg
          viewBox="0 0 200 420"
          className="w-full h-[480px]"
          role="img"
          aria-label="Body zone picker"
        >
          <defs>
            <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="var(--bp-surface)" />
              <stop offset="100%" stopColor="var(--bp-blush)" />
            </radialGradient>
            <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>

          {/* Body silhouette */}
          <BodySilhouette view={view} />

          {/* Zones overlay */}
          {ZONES.filter((z) => z.view === view).map((z) => {
            const selected = value === z.id
            const hovered = hover === z.id
            return (
              <path
                key={`${z.view}-${z.id}`}
                d={z.d}
                onClick={() => onChange(z.id)}
                onMouseEnter={() => setHover(z.id)}
                onMouseLeave={() => setHover(null)}
                style={{
                  cursor: 'pointer',
                  fill: selected
                    ? 'var(--bp-primary)'
                    : hovered
                    ? 'var(--bp-blush-deep, var(--bp-primary))'
                    : 'transparent',
                  fillOpacity: selected ? 0.45 : hovered ? 0.25 : 0,
                  stroke: selected ? 'var(--bp-primary)' : 'transparent',
                  strokeWidth: selected ? 1.5 : 0,
                  transition: 'fill-opacity 150ms, fill 150ms',
                }}
              >
                <title>{ZONE_LABELS[z.id]}</title>
              </path>
            )
          })}
        </svg>
      </div>

      {/* Quick-pick chips */}
      <div className="flex flex-wrap gap-1.5">
        {ZONES.filter((z) => z.view === view).map((z) => {
          const selected = value === z.id
          return (
            <button
              key={`chip-${z.view}-${z.id}`}
              type="button"
              onClick={() => onChange(z.id)}
              className="px-2.5 py-1 rounded-full text-xs transition-colors"
              style={{
                background: selected ? 'var(--bp-primary)' : 'var(--bp-bg)',
                color: selected ? 'var(--bp-surface)' : 'var(--bp-muted)',
                border: `1px solid ${selected ? 'var(--bp-primary)' : 'var(--bp-border)'}`,
              }}
            >
              {ZONE_LABELS[z.id]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BodySilhouette({ view }: { view: View }) {
  // Head + torso + arms + legs silhouette, gentle gradient for a soft 3D feel
  return (
    <g>
      {/* Head */}
      <ellipse cx="100" cy="62" rx="22" ry="28" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      {/* Neck */}
      <rect x="92" y="86" width="16" height="20" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      {/* Torso */}
      <path
        d="M58 132 Q72 120 100 120 Q128 120 142 132 L150 232 Q126 248 100 248 Q74 248 50 232 Z"
        fill="url(#bodyGrad)"
        stroke="var(--bp-border)"
        strokeWidth="1"
      />
      {/* Arms */}
      <path d="M50 132 L40 220 L66 224 L62 138 Z" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      <path d="M150 132 L160 220 L134 224 L138 138 Z" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      {/* Hands */}
      <ellipse cx="55" cy="234" rx="14" ry="12" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      <ellipse cx="145" cy="234" rx="14" ry="12" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      {/* Hips */}
      <path
        d="M62 234 Q100 248 138 234 L140 270 Q100 280 60 270 Z"
        fill="url(#bodyGrad)"
        stroke="var(--bp-border)"
        strokeWidth="1"
      />
      {/* Legs */}
      <path d="M70 270 L74 372 L98 372 L98 270 Z" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      <path d="M102 270 L102 372 L126 372 L130 270 Z" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      {/* Feet */}
      <ellipse cx="84" cy="386" rx="16" ry="10" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      <ellipse cx="116" cy="386" rx="16" ry="10" fill="url(#bodyGrad)" stroke="var(--bp-border)" strokeWidth="1" />
      {/* View label */}
      <text x="100" y="412" textAnchor="middle" fontSize="10" fill="var(--bp-muted)">
        {view === 'front' ? 'Front view' : 'Back view'}
      </text>
    </g>
  )
}
