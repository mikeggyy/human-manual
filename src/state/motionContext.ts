import { createContext } from 'react'

export type MotionState = 'running' | 'paused' | 'reduced' | 'hidden'

export interface MotionContextValue {
  motion: MotionState
  paused: boolean
  reduced: boolean
  toggleMotion: () => void
}

export const MotionContext = createContext<MotionContextValue | null>(null)
