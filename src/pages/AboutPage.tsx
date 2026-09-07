import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useQuiz } from '../state/useQuiz'

export function AboutPage() {
  const { dispatch } = useQuiz()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  return <article className="text-page">
    <h1 tabIndex={-1}>關於這份說明書</h1>
    <p>人沒有標準的使用方式。不過，從幾個日常選擇開始，也許能找到一句「啊，這很像我」。</p>
    <h2>一點好玩，一點理解</h2><p>8 題日常選擇，對應 6 種娛樂角色。這不是心理評估或醫療診斷，也不代表人格定論。你可以是很多種樣子。</p>
    <h2>你的答案，留在這裡</h2><p>應用程式只在這個瀏覽器計算結果，不會上傳答案。這次作答目前保留在開啟的頁面中，重新整理後會重置。</p><p>分享連結只帶測驗版本與角色類型，朋友看到的是角色介紹。未來公開託管時，主機服務商仍可能依其政策保留訪問紀錄。</p>
    <button className="button button-secondary" onClick={() => setConfirmOpen(true)}>清除這次作答</button>
    <Link className="text-link" to="/">回到首頁</Link>
    <ConfirmDialog open={confirmOpen} title="把這一頁留白？" description="這次的作答會清除，並回到首頁。" confirmLabel="清除作答" onConfirm={() => { setConfirmOpen(false); dispatch({ type: 'reset' }); navigate('/') }} onCancel={() => setConfirmOpen(false)} />
  </article>
}
