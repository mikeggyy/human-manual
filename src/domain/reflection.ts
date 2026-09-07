import { scoreQuiz } from './score'
import type { Quiz } from './types'

export interface AnswerMemory {
  questionNumber: number
  question: string
  answer: string
  echoesResult: boolean
}

export function reflectAnswers(quiz: Quiz, answers: readonly (string | null)[], resultId: string): AnswerMemory[] {
  if (scoreQuiz(quiz, answers).resultId !== resultId) return []
  return quiz.questions.map((question, index) => {
    const option = question.options.find(({ id }) => id === answers[index])!
    return { questionNumber: index + 1, question: question.title, answer: option.label, echoesResult: (option.weights[resultId] ?? 0) > 0 }
  })
}
