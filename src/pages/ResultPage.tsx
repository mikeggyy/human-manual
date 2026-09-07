import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { findResult, quiz, routeVersion } from '../data/quiz'
import { scoreQuiz } from '../domain/score'
import { ManualCard } from '../components/ManualCard'
import { useQuiz } from '../state/useQuiz'
import { NotFoundPage } from './NotFoundPage'

export function ResultPage() {
  const { version, resultId } = useParams()
  const result = findResult(version, resultId)
  const { state, dispatch } = useQuiz()
  const location = useLocation()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  if (!result) return <NotFoundPage />
  const isOwnResult = Boolean(location.state?.completed) && state.answers.every(Boolean) && scoreQuiz(quiz, state.answers).resultId === result.id
  function restart() {
    setConfirmOpen(false)
    dispatch({ type: 'reset' }); navigate('/quiz')
  }
  return <div className="result-page">
    {!isOwnResult && <p className="shared-note">這是一份被分享的角色介紹。你的說明書，等你自己翻開。</p>}
    <ManualCard result={result} />
    <div className="result-actions"><Link className="button button-primary" to={`/share/${routeVersion}/${result.id}`}>分享說明書</Link><button className="button button-secondary" onClick={() => state.answers.some(Boolean) ? setConfirmOpen(true) : restart()}>{isOwnResult ? '重新測驗' : '換我測測看'}</button></div>
    <p className="disclaimer">{quiz.disclaimer}</p>
    <ConfirmDialog open={confirmOpen} title="重新翻開一頁？" description="清除這次作答，從第一題重新開始。" confirmLabel="重新測驗" onConfirm={restart} onCancel={() => setConfirmOpen(false)} />
  </div>
}
