import type { AnswerMemory } from '../domain/reflection'

export function AnswerReflection({ answers }: { answers: readonly AnswerMemory[] }) {
  const echoes = answers.filter(({ echoesResult }) => echoesResult).slice(0, 3)
  if (!echoes.length) return null
  return <section className="answer-reflection" aria-labelledby="reflection-title">
    <h2 id="reflection-title" tabIndex={-1}>這次選擇留下的線索</h2>
    <p className="chapter-intro">這些是你實際選過、呼應這個角色的答案。結果來自全部 8 題的組合，不是單一選擇的定論。</p>
    <ol className="answer-echoes">{echoes.map((answer) => <li key={answer.questionNumber}><span>第 {answer.questionNumber} 題</span><p>{answer.answer}</p></li>)}</ol>
    <details className="answer-recap">
      <summary>看完整作答<span aria-hidden="true">＋</span></summary>
      <p className="chapter-intro">每個選擇都可以有不同的理由。這份回顧只留在你的頁面中，不會放進分享連結。</p>
      <ol>{answers.map((answer) => <li key={answer.questionNumber}><h3>第 {answer.questionNumber} 題 · {answer.question}</h3><p>{answer.answer}</p></li>)}</ol>
    </details>
  </section>
}
