'use client'

import { useEffect } from 'react'

export function LandingSnapEffect() {
  useEffect(() => {
    const html = document.documentElement
    html.style.scrollSnapType = 'y mandatory'
    return () => {
      html.style.scrollSnapType = ''
    }
  }, [])
  return null
}
