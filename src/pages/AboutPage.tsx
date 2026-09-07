import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useQuiz } from '../state/useQuiz'
import { Illustration } from '../components/Illustration'

export function AboutPage() {
  const { dispatch } = useQuiz()
  const navigate = useNavigate()
  const [confirmOpen, setConfirmOpen] = useState(false)
  return <article className="text-page">
    <Illustration name="about" className="about-illustration" />
    <h1 tabIndex={-1}>關於這份說明書</h1>
    <p>人沒有標準的使用方式。不過，從幾個日常選擇開始，也許能找到一句「啊，這很像我」。</p>
    <h2>一點好玩，一點理解</h2><p>8 題日常選擇，對應 6 種娛樂角色。這不是心理評估或醫療診斷，也不代表人格定論。你可以是很多種樣子。</p>
    <h2>怎麼讀這份說明書？</h2><p>每次結果都來自你這次的 8 個選擇。有共鳴的句子可以留下，不像你的部分也可以跳過；心情與生活會變，你不用一直符合某一種角色。</p>
    <h2>你的答案，留在這個瀏覽器</h2><p>應用程式只在這個瀏覽器計算結果，不會上傳答案。作答會儲存在此瀏覽器的本機儲存空間，重新整理或下次回來可以繼續，也可以重看完成的說明書。</p><p>這些資料不會跨裝置同步；共用裝置上的其他使用者也可能看見。你可以用下方按鈕清除作答。若瀏覽器阻擋儲存，仍可完成當次測驗，但離開或重新整理後可能無法保留進度。</p>
    <h2>分享的是角色，不是私人答案</h2><p>分享連結只帶測驗版本與角色類型，朋友看到的是角色介紹，不包含你的作答回顧。網站由 GitHub Pages 託管，主機服務商仍可能依其政策保留訪問紀錄。</p>
    <button className="button button-secondary" onClick={() => setConfirmOpen(true)}>清除這次作答</button>
    <Link className="text-link" to="/">回到首頁</Link>
    <ConfirmDialog open={confirmOpen} title="把這一頁留白？" description="清除此瀏覽器已存的作答與結果，並回到首頁。" confirmLabel="清除作答" onConfirm={() => { setConfirmOpen(false); dispatch({ type: 'reset' }); navigate('/') }} onCancel={() => setConfirmOpen(false)} />
  </article>
}
