import { Link } from 'react-router'
import { routeVersion } from '../data/quiz'

export function ResultContents({ resultId, isOwnResult }: { resultId: string; isOwnResult: boolean }) {
  function visit(id: string) {
    const target = document.getElementById(id)
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <nav className="result-contents" aria-label="結果章節">
    <button onClick={() => visit('life-title')}>生活場景</button>
    <button onClick={() => visit('misreading-title')}>相處提醒</button>
    <button onClick={() => visit('recharge-title')}>充電提案</button>
    <Link to={`/share/${routeVersion}/${resultId}`} state={{ completed: isOwnResult }}>先分享這份結果 <span aria-hidden="true">↗</span></Link>
  </nav>
}
