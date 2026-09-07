import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { Icon } from './Icon'
import { pageMetadata } from '../services/pageMetadata'
import { StorageNotice } from './StorageNotice'

export function Shell() {
  const { pathname } = useLocation()
  useEffect(() => {
    const metadata = pageMetadata(pathname)
    document.title = metadata.title
    document.querySelector('meta[name="description"]')?.setAttribute('content', metadata.description)
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [pathname])
  return <div className="site-shell">
    <a className="skip-link" href="#main" onClick={(event) => {
      event.preventDefault()
      document.getElementById('main')?.focus()
    }}>跳到主要內容</a>
    <header className="site-header"><div className="header-row"><Link to="/" className="brand"><Icon name="book" />人類使用說明書</Link><Link to="/about" className="header-about">關於</Link></div><div className="ornament" aria-hidden="true"><span>✦</span></div></header>
    <main id="main" tabIndex={-1}><StorageNotice /><Outlet /></main>
    <footer className="site-footer"><div className="ornament" aria-hidden="true"><span>✦</span></div><div className="footer-row"><small>© {new Date().getFullYear()} 人類使用說明書</small><Link to="/about">關於這份說明書 <Icon name="arrow" /></Link><small>每一種樣子，都有自己的可愛。</small></div></footer>
  </div>
}
