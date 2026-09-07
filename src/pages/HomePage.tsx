import { useState } from 'react'
import { useNavigate } from 'react-router'
import { ConfirmDialog } from '../components/ConfirmDialog'
import book from '../assets/storybook-ensemble.png'
import { useQuiz } from '../state/useQuiz'
import { Illustration } from '../components/Illustration'
import { illustrationFor } from '../data/illustrations'
import { quiz } from '../data/quiz'
import { Icon } from '../components/Icon'

export function HomePage() {
  const { state, dispatch } = useQuiz()
  const navigate = useNavigate()
  const hasProgress = state.answers.some(Boolean)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [coverStatus, setCoverStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  function start() {
    setConfirmOpen(false)
    dispatch({ type: 'reset' })
    navigate('/quiz')
  }
  return <section className="home-page">
    <div className="home-copy"><h1 tabIndex={-1}>出廠時沒附的那本，<br className="desktop-break" /><span>現在補給你。</span></h1><p className="home-subtitle">8 個日常選擇，翻開你的使用說明書。</p></div>
    <div className="book-scene" data-status={coverStatus}><img className="book-cover" src={book} alt="六個角色從橘色精裝的人類使用說明書中探出頭來" width="1254" height="1254" fetchPriority="high" draggable={false} onLoad={() => setCoverStatus('ready')} onError={() => setCoverStatus('failed')} />{coverStatus !== 'ready' && <p className="cover-status" role="status">{coverStatus === 'loading' ? '正在翻開書頁…' : '插圖暫時沒打開，先開始測驗吧。'}</p>}</div>
    <div className="home-actions">
      {hasProgress && <button className="button button-primary" onClick={() => navigate('/quiz')}>繼續這次測驗</button>}
      <button className={`button ${hasProgress ? 'button-secondary' : 'button-primary'}`} onClick={() => hasProgress ? setConfirmOpen(true) : start()}>{hasProgress ? '重新開始' : '開始翻開我的說明書'}<Icon name="arrow" /></button>
    </div>
    <div className="character-shelf" aria-hidden="true">{quiz.types.map((role) => <Illustration key={role.id} name={illustrationFor(role.id)} />)}</div>
    <ConfirmDialog open={confirmOpen} title="重新翻開一頁？" description="清除這次作答，從第一題重新開始。" confirmLabel="重新開始" onConfirm={start} onCancel={() => setConfirmOpen(false)} />
  </section>
}
