import { useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { Icon } from './Icon'

export function Shell() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true })
  }, [pathname])
  return <div className="site-shell">
    <a className="skip-link" href="#main" onClick={(event) => {
      event.preventDefault()
      document.getElementById('main')?.focus()
    }}>跳到主要內容</a>
    <header className="site-header"><Link to="/" className="brand">人類使用說明書</Link><div className="ornament" aria-hidden="true"><span>✽</span></div></header>
    <main id="main" tabIndex={-1}><Outlet /></main>
    <footer className="site-footer"><div className="ornament" aria-hidden="true"><span>✽</span></div><Link to="/about">關於這份說明書 <Icon name="arrow" /></Link></footer>
  </div>
}
