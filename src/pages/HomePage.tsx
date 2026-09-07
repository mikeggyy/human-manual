import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ConfirmDialog } from '../components/ConfirmDialog'
import book from '../assets/manual-book.png'
import { useQuiz } from '../state/useQuiz'

export function HomePage() {
  const { state, dispatch } = useQuiz()
  const navigate = useNavigate()
  const hasProgress = state.answers.some(Boolean)
  const [confirmOpen, setConfirmOpen] = useState(false)
  function start() {
    setConfirmOpen(false)
    dispatch({ type: 'reset' })
    navigate('/quiz')
  }
  return <section className="home-page">
    <div className="home-copy"><h1 tabIndex={-1}>出廠時沒附的那本，<br className="desktop-break" />現在補給你。</h1><p className="home-subtitle">8 個日常選擇，翻開你的使用說明書。</p></div>
    <img className="book-cover" src={book} alt="人類使用說明書的紙本封面，上面有一個微笑的電池角色" width="1024" height="1536" fetchPriority="high" draggable={false} />
    <div className="home-actions">
      {hasProgress && <button className="button button-primary" onClick={() => navigate('/quiz')}>繼續這次測驗</button>}
      <button className={`button ${hasProgress ? 'button-secondary' : 'button-primary'}`} onClick={() => hasProgress ? setConfirmOpen(true) : start()}>{hasProgress ? '重新開始' : '開始翻開我的說明書'}</button>
    </div>
    <ConfirmDialog open={confirmOpen} title="重新翻開一頁？" description="清除這次作答，從第一題重新開始。" confirmLabel="重新開始" onConfirm={start} onCancel={() => setConfirmOpen(false)} />
  </section>
}
