// Source rectangles keep the hand-drawn rows separate, including raised hands and steam.
// The 256px-wide frame windows share the same scale; white margins blend into the paper.
export const characterMotion = {
  'low-battery-helper': { top: 0, height: 260, offset: -4, duration: '5.6s', delay: '-.8s' },
  'social-heater': { top: 270, height: 256, offset: 0, duration: '4.8s', delay: '-1.7s' },
  'inner-director': { top: 543, height: 247, offset: 9, duration: '4.4s', delay: '-2.6s' },
  'action-human': { top: 795, height: 220, offset: 28, duration: '3.8s', delay: '-1.3s' },
  'freeform-artist': { top: 1027, height: 231, offset: 20, duration: '5s', delay: '-3.2s' },
  'steady-keeper': { top: 1260, height: 255, offset: 0, duration: '6s', delay: '-2.1s' },
} as const
