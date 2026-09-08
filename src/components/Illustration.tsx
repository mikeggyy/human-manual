import { useState, type CSSProperties } from 'react'
import atlas from '../assets/illustration-atlas-v2.png'
import motionAtlas from '../assets/character-motion-v1.png'
import { illustrations, type IllustrationName } from '../data/illustrations'
import { characterMotion } from '../data/characterMotion'
import { useVisibleMotion } from '../state/useVisibleMotion'

export function Illustration({ name, className = '' }: { name: IllustrationName; className?: string }) {
  const { cell, label } = illustrations[name]
  const sprite = Object.hasOwn(characterMotion, name) ? characterMotion[name as keyof typeof characterMotion] : undefined
  const [spriteStatus, setSpriteStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const { ref, motion } = useVisibleMotion<HTMLSpanElement>()
  // Inset each atlas cell by 1% so neighbouring artwork cannot bleed at its edge.
  const visibleCell = 0.98
  const style = {
    '--scene-size': `${400 / visibleCell}%`,
    '--scene-x': `${-((cell % 4) * 100 + 1) / visibleCell}%`,
    '--scene-y': `${-(Math.floor(cell / 4) * 100 + 1) / visibleCell}%`,
    ...(sprite && {
      '--sprite-top': `${-sprite.top / sprite.height * 100}%`,
      '--sprite-window-height': `${sprite.height / 256 * 100}%`,
      '--sprite-window-offset': `${sprite.offset / 256 * 100}%`,
      '--sprite-duration': sprite.duration,
      '--sprite-delay': sprite.delay,
    }),
  } as CSSProperties
  return <span ref={ref} className={`illustration ${className}`} style={style} role="img" aria-label={label} data-illustration={name} data-motion={motion} data-sprite-status={sprite ? spriteStatus : undefined} draggable={false}>
    <img className="illustration-static" src={atlas} alt="" aria-hidden="true" width="1254" height="1254" draggable={false} />
    {sprite && <span className="character-window" aria-hidden="true"><img className="character-sprite" src={motionAtlas} alt="" width="1024" height="1536" loading="lazy" decoding="async" draggable={false} onLoad={() => setSpriteStatus('ready')} onError={() => setSpriteStatus('failed')} /></span>}
  </span>
}
