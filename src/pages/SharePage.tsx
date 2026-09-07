import { Link, useParams } from 'react-router'
import { findResult, routeVersion } from '../data/quiz'
import { ManualCard } from '../components/ManualCard'
import { ShareActions } from '../components/ShareActions'
import { NotFoundPage } from './NotFoundPage'

export function SharePage() {
  const { version, resultId } = useParams()
  const result = findResult(version, resultId)
  if (!result) return <NotFoundPage />
  return <section className="share-page">
    <h1 tabIndex={-1}>分享這份說明書</h1>
    <ManualCard result={result} compact />
    <ShareActions key={result.id} resultId={result.id} />
    <Link className="text-link" to={`/result/${routeVersion}/${result.id}`}>返回完整說明書</Link>
  </section>
}
