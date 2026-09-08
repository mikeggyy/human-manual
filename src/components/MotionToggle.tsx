import { useMotion } from '../state/useMotion'

export function MotionToggle() {
  const { paused, reduced, toggleMotion } = useMotion()
  const label = reduced ? '動態已減少' : paused ? '播放動態' : '暫停動態'

  return <button
    type="button"
    className="motion-toggle"
    onClick={toggleMotion}
    disabled={reduced}
    title={reduced ? '已依照裝置的減少動態效果設定，顯示靜態插圖。' : undefined}
  >
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {paused && !reduced ? <path d="m8 5 11 7-11 7Z" /> : <><path d="M8 5v14" /><path d="M16 5v14" /></>}
    </svg>
    <span>{label}</span>
  </button>
}
