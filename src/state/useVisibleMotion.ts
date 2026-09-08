import { useCallback, useEffect, useState } from 'react'
import { useMotion } from './useMotion'
import type { MotionState } from './motionContext'

export function useVisibleMotion<T extends HTMLElement>() {
  const { motion: globalMotion } = useMotion()
  const [element, setElement] = useState<T | null>(null)
  const [visible, setVisible] = useState(true)
  const ref = useCallback((node: T | null) => { setElement(node) }, [])

  useEffect(() => {
    if (!element || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(Boolean(entry?.isIntersecting))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [element])

  const motion: MotionState | 'offscreen' = globalMotion === 'running' && !visible ? 'offscreen' : globalMotion
  return { ref, motion }
}
