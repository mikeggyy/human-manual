import { useId, type CSSProperties } from 'react'
import atlas from '../assets/illustration-atlas-v2.png'
import { characterMotion } from '../data/characterMotion'

export function CharacterRig({ name, cell, onLoad, onError }: {
  name: string
  cell: number
  onLoad: () => void
  onError: () => void
}) {
  const id = useId()
  const rig = characterMotion[name]!
  const source = { href: atlas, x: -(cell % 4) * 313.5, y: -Math.floor(cell / 4) * 313.5, width: 1254, height: 1254 }
  const style = { '--gesture-cycle': rig.duration, '--gesture-delay': rig.delay, '--blink-cycle': rig.blink } as CSSProperties
  return <svg className="character-rig" viewBox="0 0 313.5 313.5" aria-hidden="true" focusable="false" style={style}>
    <defs>
      <clipPath id={`${id}-frame`}><rect x="3.135" y="3.135" width="307.23" height="307.23" /></clipPath>
      <mask id={`${id}-body`} maskUnits="userSpaceOnUse" x="0" y="0" width="313.5" height="313.5" style={{ maskType: 'luminance' }}>
        <rect width="313.5" height="313.5" fill="white" />
        {rig.parts.map((part) => <path key={part.id} d={part.path} fill="black" />)}
        {rig.parts.filter((part) => part.joint).map((part) => {
          const [x, y] = part.origin.split(' ').map(Number.parseFloat)
          return <circle key={part.id} cx={x} cy={y} r={part.joint} fill="white" />
        })}
      </mask>
      {rig.parts.map((part) => <clipPath key={part.id} id={`${id}-${part.id}`}><path d={part.path} /></clipPath>)}
    </defs>
    <g clipPath={`url(#${id}-frame)`}>
      <g className="character-base" mask={`url(#${id}-body)`}>
        <image className="character-source" {...source} onLoad={onLoad} onError={onError} />
      </g>
      {rig.parts.map((part) => <g key={part.id} data-motion-part={part.id} className={`character-part motion-${part.motion}`} style={{
        '--part-origin': part.origin,
        '--part-cycle': part.duration ?? rig.duration,
        '--part-delay': part.delay ?? rig.delay,
      } as CSSProperties}>
        <g clipPath={`url(#${id}-${part.id})`}><image className="character-source" {...source} /></g>
      </g>)}
      <g className="character-blink" data-motion-part="eyes">
        {rig.eyes.map((eye, index) => <g key={index}>
          <ellipse cx={eye.x} cy={eye.y} rx="4.8" ry="6.4" fill={eye.paper} />
          <path d={`M${eye.x - 3.1} ${eye.y + .5} q3.1 3.1 6.2 -.1`} fill="none" stroke="#332c22" strokeWidth="1.6" strokeLinecap="round" />
        </g>)}
      </g>
    </g>
  </svg>
}
