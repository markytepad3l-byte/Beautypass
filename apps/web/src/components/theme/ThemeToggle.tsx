'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme, type Theme } from './ThemeProvider'
import { cn } from '@/lib/utils'

const THEMES: { id: Theme; color: string; label: string }[] = [
  { id: 'rose',      color: '#C06078', label: 'Rose' },
  { id: 'lavender',  color: '#9D7BC4', label: 'Lavender' },
  { id: 'sage',      color: '#7E9A7D', label: 'Sage' },
  { id: 'champagne', color: '#B89968', label: 'Champagne' },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, mode, setTheme, toggleMode } = useTheme()

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Color swatches */}
      <div className="flex items-center gap-1.5">
        {THEMES.map(t => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            aria-label={`${t.label} theme`}
            className={cn(
              'size-4 rounded-full transition-all duration-200',
              theme === t.id
                ? 'ring-2 ring-offset-2 ring-offset-[var(--bp-bg)] scale-110'
                : 'opacity-60 hover:opacity-100 hover:scale-110'
            )}
            style={{
              backgroundColor: t.color,
              // @ts-expect-error CSS custom property
              '--tw-ring-color': t.color,
            }}
          />
        ))}
      </div>

      {/* Divider */}
      <span className="w-px h-4 bg-[var(--bp-border)]" />

      {/* Dark / light toggle */}
      <button
        onClick={toggleMode}
        aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        className="p-1 rounded-md text-[var(--bp-muted)] hover:text-[var(--bp-ink)] hover:bg-[var(--bp-blush)] transition-colors"
      >
        {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  )
}
