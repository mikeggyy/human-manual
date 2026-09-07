import { resultStories } from '../data/resultStories'

export function ResultChapters({ resultId, isOwnResult = false }: { resultId: string; isOwnResult?: boolean }) {
  const story = resultStories[resultId]
  if (!story) return null
  return <div className="result-chapters">
    <section className="life-chapter" aria-labelledby="life-title">
      <h2 id="life-title" tabIndex={-1}>把說明書放進生活裡</h2>
      <p className="chapter-intro">{isOwnResult ? '三個日常片段，看看哪些像你，哪些想換個寫法。' : '以下是這個角色的日常想像，讓你更認識這份說明書。'}</p>
      <div className="life-scenes">{story.scenes.map((scene) => <article key={scene.context} className="life-scene"><p className="scene-context">{scene.context}</p><div><h3>{scene.title}</h3><p>{scene.body}</p></div></article>)}</div>
    </section>
    <div className="care-chapters">
      <section className="misreading-chapter" aria-labelledby="misreading-title">
        <h2 id="misreading-title" tabIndex={-1}>容易被誤讀的一頁</h2>
        <h3 className="misreading-label">別人可能以為</h3><p>{story.misunderstanding}</p>
        <h3 className="reframe-label">換個角度理解</h3><p>{story.reframe}</p>
        <div className="friend-note"><h3>{isOwnResult ? '可以這樣告訴朋友' : '角色的相處留言'}</h3><p>「{story.friendNote}」</p></div>
      </section>
      <section className="recharge-chapter" aria-labelledby="recharge-title">
        <h2 id="recharge-title" tabIndex={-1}>今天的小小充電提案</h2>
        <p className="chapter-intro">挑一個想試的就好，不必把休息也變成待辦清單。</p>
        <ol>{story.recharge.map((tip, index) => <li key={tip.title}><span aria-hidden="true">0{index + 1}</span><div><h3>{tip.title}</h3><p>{tip.body}</p></div></li>)}</ol>
      </section>
    </div>
    <section className="closing-letter" aria-labelledby="letter-title"><h2 id="letter-title">{isOwnResult ? '給你的最後一頁' : '角色手冊的最後一頁'}</h2><div>{story.letter.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<p className="letter-signoff">{isOwnResult ? '把喜歡的那句留下，其他的不用勉強對號入座。' : '這是角色模板。你自己的說明書，從 8 題日常選擇開始。'}</p></div></section>
  </div>
}
