import { useContext } from 'react'
import { MotionContext } from './motionContext'

export function useMotion() {
  const value = useContext(MotionContext)
  if (!value) throw new Error('動態設定未初始化。')
  return value
}
