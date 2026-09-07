export function QuizProgress({ index, total }: { index: number; total: number }) {
  return <div className="quiz-progress">
    <p>第 <strong>{index + 1}</strong> / {total} 題</p>
    <progress className="sr-only" value={index + 1} max={total} aria-label={`目前第 ${index + 1} 題，共 ${total} 題`} />
    <div className="progress-segments" aria-hidden="true">{Array.from({ length: total }, (_, step) => <span key={step} className={step < index ? 'is-complete' : step === index ? 'is-current' : ''} />)}</div>
  </div>
}
