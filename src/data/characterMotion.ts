type MotionPart = {
  id: string
  path: string
  origin: string
  motion: 'quiet-wave' | 'warm-wave' | 'reel-roll' | 'runner-pump' | 'brush-sweep' | 'umbrella-sway' | 'steam-curl'
  duration?: string
  delay?: string
  joint?: number
}
type Eye = { x: number; y: number; paper: string }
type CharacterMotion = { duration: string; delay: string; blink: string; parts: MotionPart[]; eyes: Eye[] }

// Each 313.5px cell is one original painting. Moving parts and fixed props always
// sample that same image, rather than switching to a differently drawn pose.
export const characterMotion: Record<string, CharacterMotion> = {
  'low-battery-helper': {
    duration: '8.6s', delay: '-1.1s', blink: '7.1s',
    parts: [{ id: 'hand', path: 'M197 134 L197 91 L249 91 L249 166 L198 169 Z', origin: '199px 157px', motion: 'quiet-wave', joint: 3 }],
    eyes: [{ x: 130.1, y: 148.6, paper: '#fbf1dd' }, { x: 161, y: 138.4, paper: '#f9ead0' }],
  },
  'social-heater': {
    duration: '7.8s', delay: '-2.4s', blink: '6.7s',
    parts: [
      { id: 'hand', path: 'M247 145 Q269 136 256 122 L252 103 L263 97 L276 96 L296 103 L304 119 L298 132 L277 143 L250 157 Z', origin: '249px 151px', motion: 'warm-wave', joint: 3 },
      { id: 'steam-left', path: 'M144 27 H167 V79 H144 Z', origin: '155px 79px', motion: 'steam-curl', duration: '4.6s', delay: '-1.4s' },
      { id: 'steam-middle', path: 'M169 27 H194 V79 H169 Z', origin: '180px 79px', motion: 'steam-curl', duration: '5.1s', delay: '-3s' },
      { id: 'steam-right', path: 'M196 27 H222 V79 H196 Z', origin: '208px 79px', motion: 'steam-curl', duration: '4.8s', delay: '-2.1s' },
    ],
    eyes: [{ x: 171.5, y: 158.5, paper: '#f26e1c' }, { x: 207, y: 155, paper: '#f77c28' }],
  },
  'inner-director': {
    duration: '12s', delay: '-3.2s', blink: '8.3s',
    parts: [
      { id: 'reel-left', path: 'M131 94.5 A32.5 32.5 0 1 1 66 94.5 A32.5 32.5 0 1 1 131 94.5 Z', origin: '98.5px 94.5px', motion: 'reel-roll' },
      { id: 'reel-right', path: 'M204.5 82 A33.5 33.5 0 1 1 137.5 82 A33.5 33.5 0 1 1 204.5 82 Z', origin: '171px 82px', motion: 'reel-roll' },
    ],
    eyes: [{ x: 138.5, y: 172.3, paper: '#fde5c5' }, { x: 172.5, y: 166.1, paper: '#fbe3bf' }],
  },
  'action-human': {
    duration: '6.9s', delay: '-1.6s', blink: '7.7s',
    parts: [
      { id: 'hand-left', path: 'M12 139 L26 130 L35 121 L62 111 L78 112 L78 127 L61 137 L60 158 L52 175 L19 175 L12 160 Z', origin: '78px 120px', motion: 'runner-pump', joint: 3.2 },
      { id: 'hand-right', path: 'M175 128 L195 121 L199 96 L215 87 L240 99 L247 119 L233 142 L208 157 L186 155 L175 145 Z', origin: '177px 139px', motion: 'runner-pump', delay: '-1.95s', joint: 3.2 },
    ],
    eyes: [{ x: 135.1, y: 127.8, paper: '#fcdcb4' }, { x: 158.5, y: 129.5, paper: '#fbdcb8' }],
  },
  'freeform-artist': {
    duration: '9.4s', delay: '-3.4s', blink: '8.9s',
    parts: [{ id: 'brush', path: 'M198 126 L214 113 L218 97 L239 69 L247 18 L274 15 L280 69 L262 93 L259 133 L238 145 L229 173 L212 173 L217 145 L198 147 Z', origin: '199px 136px', motion: 'brush-sweep', joint: 3.2 }],
    eyes: [{ x: 135.6, y: 137.4, paper: '#f7daad' }, { x: 168.1, y: 130.2, paper: '#f9dcb1' }],
  },
  'steady-keeper': {
    duration: '9.8s', delay: '-4.2s', blink: '9.1s',
    parts: [
      { id: 'umbrella', path: 'M135 25 L187 10 L226 15 L260 35 L294 70 L301 112 L261 108 L234 99 L207 94 L181 93 L152 65 L139 59 Z', origin: '204px 96px', motion: 'umbrella-sway' },
      { id: 'chimney', path: 'M65 49 L63 22 L75 8 L98 0 L137 3 L154 19 L145 42 L110 50 L81 55 Z', origin: '88px 50px', motion: 'steam-curl', duration: '6.2s', delay: '-2.7s' },
    ],
    eyes: [{ x: 115.6, y: 152.9, paper: '#fceccd' }, { x: 152.5, y: 150, paper: '#efe6cc' }],
  },
}
