import type { Quiz, ScoreResult } from './types'

export function scoreQuiz(quiz: Quiz, answers: readonly (string | null)[]): ScoreResult {
  if (answers.length !== quiz.questions.length) throw new TypeError('請完成全部題目。')
  const scores: Record<string, number> = Object.fromEntries(quiz.types.map(({ id }) => [id, 0]))
  const selections = quiz.questions.map((question, index) => {
    const option = question.options.find(({ id }) => id === answers[index])
    if (!option) throw new TypeError(`第 ${index + 1} 題的答案不合法。`)
    for (const [id, weight] of Object.entries(option.weights)) {
      if (!(id in scores) || typeof weight !== 'number' || !Number.isFinite(weight)) {
        throw new TypeError('題庫權重不合法。')
      }
      scores[id] = (scores[id] ?? 0) + weight
    }
    return option
  })
  const highest = Math.max(...Object.values(scores))
  let candidates = quiz.types.map(({ id }) => id).filter((id) => scores[id] === highest)
  for (let index = selections.length - 1; index >= 0 && candidates.length > 1; index--) {
    const weights = selections[index]!.weights
    const best = Math.max(...candidates.map((id) => weights[id] ?? 0))
    candidates = candidates.filter((id) => (weights[id] ?? 0) === best)
  }
  if (candidates.length !== 1) throw new Error('暫時無法決定結果，請重新開始。')
  return { version: quiz.version, resultId: candidates[0]!, scores }
}
