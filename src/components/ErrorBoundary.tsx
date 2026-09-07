import { Component, type ReactNode } from 'react'
import { Icon } from './Icon'

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { document.title = '暫時無法翻開｜人類使用說明書' }
  render() {
    if (!this.state.failed) return this.props.children
    return <main className="site-shell recovery-page"><Icon name="book" /><h1>這一頁，先歇一下。</h1><p>頁面暫時沒有順利打開。重新翻開後，這次作答會從頭開始。</p><a className="button button-primary" href={import.meta.env.BASE_URL}>重新翻開說明書</a></main>
  }
}
