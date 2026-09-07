import { Link, useLocation, useParams } from 'react-router'
import { findResult, routeVersion } from '../data/quiz'
import { ManualCard } from '../components/ManualCard'
import { ShareActions } from '../components/ShareActions'
import { NotFoundPage } from './NotFoundPage'

export function SharePage() {
  const { version, resultId } = useParams()
  const location = useLocation()
  const result = findResult(version, resultId)
  if (!result) return <NotFoundPage />
  return <section className="share-page">
    <header className="share-heading"><h1 tabIndex={-1}>把這份說明書帶走</h1><p>存一張角色小卡，或傳一份完整介紹。<br />留給自己，也分享給在乎你的人。</p></header>
    <div className="share-controls">
    <p className="share-context">圖片與連結只包含「{result.name}」的角色內容，不含你的作答紀錄。</p>
    <ShareActions key={result.id} resultId={result.id} />
    <Link className="text-link" to={`/result/${routeVersion}/${result.id}`} state={{ completed: Boolean(location.state?.completed) }}>返回完整說明書</Link>
    </div>
    <ManualCard result={result} compact />
  </section>
}
