export function ResultContents({ isOwnResult }: { isOwnResult: boolean }) {
  function visit(id: string) {
    const target = document.getElementById(id)
    target?.focus({ preventScroll: true })
    target?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  return <nav className="result-contents" aria-label="結果章節">
    <button onClick={() => visit('basics-title')}>基本設定</button>
    {isOwnResult && <button onClick={() => visit('reflection-title')}>作答線索</button>}
    <button onClick={() => visit('life-title')}>生活場景</button>
    <button onClick={() => visit('misreading-title')}>相處提醒</button>
    <button onClick={() => visit('recharge-title')}>充電提案</button>
  </nav>
}
