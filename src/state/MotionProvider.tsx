import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { MotionContext } from './motionContext'
import type { MotionState } from './motionContext'

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const preference = window.matchMedia(reducedMotionQuery)
  preference.addEventListener('change', onChange)
  return () => preference.removeEventListener('change', onChange)
}

function getReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.(reducedMotionQuery).matches)
}

function subscribeVisibility(onChange: () => void) {
  if (typeof document === 'undefined') return () => {}
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

function getHidden() {
  return typeof document !== 'undefined' && document.visibilityState === 'hidden'
}

function getServerSnapshot() { return false }

export function MotionProvider({ children }: { children: ReactNode }) {
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, getServerSnapshot)
  const hidden = useSyncExternalStore(subscribeVisibility, getHidden, getServerSnapshot)
  const [paused, setPaused] = useState(false)
  const toggleMotion = useCallback(() => {
    if (!reduced) setPaused((previous) => !previous)
  }, [reduced])
  const motion: MotionState = reduced ? 'reduced' : hidden ? 'hidden' : paused ? 'paused' : 'running'
  const value = useMemo(() => ({ motion, paused, reduced, toggleMotion }), [motion, paused, reduced, toggleMotion])

  return <MotionContext value={value}>{children}</MotionContext>
}
