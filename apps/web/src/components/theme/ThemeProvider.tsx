'use client'

import { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'rose' | 'lavender' | 'sage' | 'champagne'
export type Mode = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  mode: Mode
  setTheme: (t: Theme) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('rose')
  const [mode, setModeState] = useState<Mode>('light')

  // Load persisted preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('bp-theme') as Theme | null
    const savedMode = localStorage.getItem('bp-mode') as Mode | null
    if (savedTheme) setThemeState(savedTheme)
    if (savedMode) setModeState(savedMode)
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setModeState('dark')
    }
  }, [])

  // Apply to <html> element
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-theme', theme)
    if (mode === 'dark') html.classList.add('dark')
    else html.classList.remove('dark')
  }, [theme, mode])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem('bp-theme', t)
  }

  function toggleMode() {
    const next = mode === 'light' ? 'dark' : 'light'
    setModeState(next)
    localStorage.setItem('bp-mode', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
