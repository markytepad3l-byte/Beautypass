'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

export type BodyZone =
  | 'forehead' | 'eyes' | 'cheeks' | 'nose' | 'lips' | 'jaw' | 'chin'
  | 'neck' | 'decolletage' | 'shoulders' | 'arms' | 'hands'
  | 'chest' | 'abdomen' | 'back' | 'glutes'
  | 'thighs' | 'knees' | 'calves' | 'feet'

export const ZONE_LABELS: Record<BodyZone, string> = {
  forehead: 'Forehead', eyes: 'Eyes', cheeks: 'Cheeks', nose: 'Nose',
  lips: 'Lips', jaw: 'Jawline', chin: 'Chin', neck: 'Neck',
  decolletage: 'Décolletage', shoulders: 'Shoulders', arms: 'Arms',
  hands: 'Hands', chest: 'Chest', abdomen: 'Abdomen', back: 'Back',
  glutes: 'Glutes', thighs: 'Thighs', knees: 'Knees', calves: 'Calves', feet: 'Feet',
}

const ZONE_GROUPS: { label: string; zones: BodyZone[] }[] = [
  { label: 'Face', zones: ['forehead', 'eyes', 'cheeks', 'nose', 'lips', 'jaw', 'chin'] },
  { label: 'Upper body', zones: ['neck', 'decolletage', 'shoulders', 'chest', 'abdomen', 'back'] },
  { label: 'Arms', zones: ['arms', 'hands'] },
  { label: 'Lower body', zones: ['glutes', 'thighs', 'knees', 'calves', 'feet'] },
]

// Lazy-load the 3D canvas so Three.js is never server-rendered
const Body3DPicker = dynamic(
  () => import('./Body3DPicker').then((m) => m.Body3DPicker),
  { ssr: false, loading: () => (
    <div
      className="w-full rounded-2xl border flex items-center justify-center text-sm"
      style={{ height: 480, borderColor: 'var(--bp-border)', color: 'var(--bp-muted)' }}
    >
      Loading 3D model…
    </div>
  )}
)

export function BodyZonePicker({
  value,
  onChange,
}: {
  value?: string
  onChange: (zone: BodyZone) => void
}) {
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider" style={{ color: 'var(--bp-muted)' }}>
          Body zone
        </span>
        {value ? (
          <span className="text-sm font-medium" style={{ color: 'var(--bp-primary)' }}>
            {ZONE_LABELS[value as BodyZone] ?? value}
          </span>
        ) : (
          <span className="text-sm" style={{ color: 'var(--bp-muted)' }}>
            None selected
          </span>
        )}
      </div>

      {/* 3D model */}
      <Body3DPicker value={value} onSelect={onChange} />

      {/* Chip groups for quick-pick */}
      <div className="flex flex-col gap-2">
        {ZONE_GROUPS.map(({ label, zones }) => (
          <div key={label}>
            <button
              type="button"
              onClick={() => setOpenGroup(openGroup === label ? null : label)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors"
              style={{
                background: openGroup === label ? 'var(--bp-blush)' : 'var(--bp-bg)',
                color: openGroup === label ? 'var(--bp-primary)' : 'var(--bp-muted)',
                border: '1px solid var(--bp-border)',
              }}
            >
              {label}
              <span style={{ opacity: 0.5 }}>{openGroup === label ? '▲' : '▼'}</span>
            </button>
            {openGroup === label && (
              <div className="flex flex-wrap gap-1.5 mt-1.5 px-1">
                {zones.map((z) => {
                  const sel = value === z
                  return (
                    <button
                      key={z}
                      type="button"
                      onClick={() => onChange(z)}
                      className="px-2.5 py-1 rounded-full text-xs transition-colors"
                      style={{
                        background: sel ? 'var(--bp-primary)' : 'var(--bp-bg)',
                        color: sel ? 'var(--bp-surface)' : 'var(--bp-muted)',
                        border: `1px solid ${sel ? 'var(--bp-primary)' : 'var(--bp-border)'}`,
                      }}
                    >
                      {ZONE_LABELS[z]}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
