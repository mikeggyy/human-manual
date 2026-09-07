import { useEffect, useId, useRef, useState } from 'react'
import { findResult, routeVersion } from '../data/quiz'
import type { ResultType } from '../domain/types'
import { makeShareUrl } from '../services/share'
import { Icon } from './Icon'

export function ShareActions({ resultId }: { resultId: string }) {
  const result = findResult(routeVersion, resultId)
  return result ? <ResultShareActions key={resultId} result={result} /> : null
}

function ResultShareActions({ result }: { result: ResultType }) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'pending' | 'copied' | 'fallback'>('idle')
  const [shareStatus, setShareStatus] = useState<'idle' | 'pending' | 'shared' | 'failed'>('idle')
  const [imageStatus, setImageStatus] = useState<'idle' | 'pending' | 'ready' | 'failed'>('idle')
  const [imageError, setImageError] = useState('')
  const [preview, setPreview] = useState<{ url: string; filename: string }>()
  const active = useRef(true)
  const input = useRef<HTMLInputElement>(null)
  const inputId = useId()
  const url = makeShareUrl(window.location.origin, import.meta.env.BASE_URL, result.id)
  const [supportsShare] = useState(() => {
    try { return typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare({ url })) }
    catch { return false }
  })

  useEffect(() => {
    active.current = true
    return () => { active.current = false }
  }, [])
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url) }, [preview])
  useEffect(() => {
    if (copyStatus === 'fallback') { input.current?.focus(); input.current?.select() }
  }, [copyStatus])

  async function copy() {
    setCopyStatus('pending')
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(url)
      if (active.current) setCopyStatus('copied')
    } catch { if (active.current) setCopyStatus('fallback') }
  }
  async function share() {
    setShareStatus('pending')
    try {
      // Keep this call in the click event, before any await, to preserve user activation.
      await navigator.share({ title: `${result.name}｜人類使用說明書`, text: `這一頁是「${result.name}」。也來翻開你的說明書。`, url })
      if (active.current) setShareStatus('shared')
    } catch (error) {
      const cancelled = typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError'
      if (active.current) setShareStatus(cancelled ? 'idle' : 'failed')
    }
  }
  async function saveImage() {
    setImageStatus('pending')
    setImageError('')
    try {
      const { exportCard } = await import('../services/exportCard')
      const blob = await exportCard(result)
      if (!active.current) return
      const image = { url: URL.createObjectURL(blob), filename: `human-manual-${result.model}.png` }
      // Preserve the real image even when this browser blocks automatic downloads.
      setPreview(image)
      setImageStatus('ready')
      const link = document.createElement('a')
      link.href = image.url
      link.download = image.filename
      document.body.append(link)
      try { link.click() } catch { /* The visible preview and download link remain available. */ }
      finally { link.remove() }
    } catch (error) {
      if (!active.current) return
      setImageStatus('failed')
      setImageError(error instanceof Error ? error.message : '圖片產生失敗，請再試一次。')
    }
  }

  return <div className="share-actions">
    <div className="share-buttons">
      <button className="button button-primary" disabled={imageStatus === 'pending'} onClick={() => void saveImage()}>{imageStatus === 'pending' ? '正在製作圖片…' : imageStatus === 'failed' ? '重試儲存圖片' : '儲存圖片'}</button>
      {supportsShare && <button className="button button-secondary" disabled={shareStatus === 'pending'} onClick={() => void share()}>{shareStatus === 'pending' ? '分享視窗已開啟…' : shareStatus === 'failed' ? '重試分享' : '分享給朋友'}</button>}
      <button className="button button-secondary" disabled={copyStatus === 'pending'} onClick={() => void copy()}>{copyStatus === 'pending' ? '正在複製…' : '複製連結'}</button>
    </div>
    <div className="share-feedback" aria-live="polite">
      {imageStatus === 'ready' && <p className="feedback"><Icon name="check" />圖片已準備好。若沒有自動下載，可以長按下方圖片或再次下載。</p>}
      {imageStatus === 'failed' && <p className="feedback feedback-error">{imageError}</p>}
    </div>
    <div className="share-feedback" aria-live="polite">
      {shareStatus === 'shared' && <p className="feedback"><Icon name="check" />已交給系統分享。</p>}
      {shareStatus === 'failed' && <p className="feedback feedback-error">這次沒有開啟分享，請重試，或複製連結傳給朋友。</p>}
    </div>
    <div className="share-feedback" aria-live="polite">
      {copyStatus === 'copied' && <p className="feedback"><Icon name="check" />連結已複製</p>}
      {copyStatus === 'fallback' && <div className="copy-fallback"><label htmlFor={inputId}>請選取下方網址，手動複製分享。</label><input ref={input} id={inputId} readOnly value={url} onFocus={(event) => event.currentTarget.select()} /></div>}
    </div>
    {preview && <details className="export-preview" open>
      <summary>查看圖片／長按儲存</summary>
      <img src={preview.url} alt={`${result.name}的分享圖片：包含代表句、啟動方式、低電量訊號與相處須知`} width="1080" height="1350" style={{ maxWidth: '100%', height: 'auto' }} />
      <p>手機可長按圖片，再依瀏覽器選擇儲存。下載檔案的位置由你的裝置決定。</p>
      <a className="button button-secondary" href={preview.url} download={preview.filename}>再次下載 PNG</a>
    </details>}
  </div>
}
