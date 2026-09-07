export function QuizProgress({ index, total }: { index: number; total: number }) {
  return <div className="quiz-progress">
    <p>第 <strong>{index + 1}</strong> / {total} 題</p>
    <progress value={index + 1} max={total} aria-label={`目前第 ${index + 1} 題，共 ${total} 題`} />
  </div>
}
