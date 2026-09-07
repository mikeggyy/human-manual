import { expect, it } from 'vitest'
import { quiz } from '../../src/data/quiz'
import { initialQuizState, quizReducer } from '../../src/state/quizReducer'

it('未答無法前进、拒絕跨題 ID，前後換題保留答案，重測清空', () => {
  const initial = initialQuizState()
  expect(quizReducer(initial, { type: 'next' })).toBe(initial)
  expect(quizReducer(initial, { type: 'answer', optionId: quiz.questions[1]!.options[0]!.id })).toBe(initial)
  const answered = quizReducer(initial, { type: 'answer', optionId: quiz.questions[0]!.options[0]!.id })
  const second = quizReducer(answered, { type: 'next' })
  expect(second.index).toBe(1)
  const back = quizReducer(second, { type: 'previous' })
  expect(back.answers[0]).toBe(quiz.questions[0]!.options[0]!.id)
  expect(quizReducer(second, { type: 'reset' })).toEqual(initial)
  expect(initial.answers.every((answer) => answer === null)).toBe(true)
})
