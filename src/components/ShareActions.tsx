import { useState } from 'react'
import { makeShareUrl } from '../services/share'
import { Icon } from './Icon'

export function ShareActions({ resultId }: { resultId: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'fallback'>('idle')
  const url = makeShareUrl(window.location.origin, import.meta.env.BASE_URL, resultId)
  async function copy() {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(url)
      setStatus('copied')
    } catch { setStatus('fallback') }
  }
  return <div className="share-actions">
    <button className="button button-primary" onClick={() => void copy()}>複製連結</button>
    <div aria-live="polite">
      {status === 'copied' && <p className="feedback"><Icon name="check" />連結已複製</p>}
      {status === 'fallback' && <div className="copy-fallback"><label htmlFor="share-url">請選取下方網址，手動複製分享。</label><input id="share-url" readOnly value={url} onFocus={(event) => event.currentTarget.select()} /></div>}
    </div>
  </div>
}
