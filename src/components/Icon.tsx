type IconName = 'arrow' | 'plug' | 'battery' | 'clock' | 'warning' | 'star' | 'check'
const paths: Record<IconName, string> = {
  arrow: 'M9 5l7 7-7 7',
  plug: 'M8 2v6m8-6v6M6 8h12v3a6 6 0 0 1-6 6v5m0-5a6 6 0 0 1-6-6',
  battery: 'M9 3V1h6v2M7 3h10v19H7zM9 7h6m-6 3h6',
  clock: 'M12 7v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  warning: 'M12 3 2 21h20L12 3Zm0 6v5m0 3v1',
  star: 'm12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8-6.2-3.2L5.8 21 7 14.2 2 9.3l6.9-1L12 2Z',
  check: 'm5 12 4 4L19 6',
}
export function Icon({ name }: { name: IconName }) {
  return <svg viewBox="0 0 24 24" fill={name === 'star' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
