import { useState, type CSSProperties } from 'react'
import atlas from '../assets/illustration-atlas-v2.png'
import { illustrations, type IllustrationName } from '../data/illustrations'
import { characterMotion } from '../data/characterMotion'
import { useVisibleMotion } from '../state/useVisibleMotion'
import { CharacterRig } from './CharacterRig'

export function Illustration({ name, className = '' }: { name: IllustrationName; className?: string }) {
  const { cell, label } = illustrations[name]
  const sprite = Object.hasOwn(characterMotion, name)
  const [spriteStatus, setSpriteStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const { ref, motion } = useVisibleMotion<HTMLSpanElement>()
  // Inset each atlas cell by 1% so neighbouring artwork cannot bleed at its edge.
  const visibleCell = 0.98
  const style = {
    '--scene-size': `${400 / visibleCell}%`,
    '--scene-x': `${-((cell % 4) * 100 + 1) / visibleCell}%`,
    '--scene-y': `${-(Math.floor(cell / 4) * 100 + 1) / visibleCell}%`,
  } as CSSProperties
  return <span ref={ref} className={`illustration ${className}`} style={style} role="img" aria-label={label} data-illustration={name} data-motion={motion} data-sprite-status={sprite ? spriteStatus : undefined} draggable={false}>
    <img className="illustration-static" src={atlas} alt="" aria-hidden="true" width="1254" height="1254" draggable={false} />
    {sprite && <CharacterRig name={name} cell={cell} onLoad={() => setSpriteStatus('ready')} onError={() => setSpriteStatus('failed')} />}
  </span>
}
