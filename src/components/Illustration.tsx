import type { CSSProperties } from 'react'
import atlas from '../assets/illustration-atlas-v2.png'
import { illustrations, type IllustrationName } from '../data/illustrations'

export function Illustration({ name, className = '' }: { name: IllustrationName; className?: string }) {
  const { cell, label } = illustrations[name]
  // Inset each atlas cell by 1% so neighbouring artwork cannot bleed at its edge.
  const visibleCell = 0.98
  const style = {
    '--scene-size': `${400 / visibleCell}%`,
    '--scene-x': `${-((cell % 4) * 100 + 1) / visibleCell}%`,
    '--scene-y': `${-(Math.floor(cell / 4) * 100 + 1) / visibleCell}%`,
  } as CSSProperties
  return <span className={`illustration ${className}`} style={style} role="img" aria-label={label} data-illustration={name} draggable={false}>
    <img src={atlas} alt="" aria-hidden="true" width="1254" height="1254" draggable={false} />
  </span>
}
