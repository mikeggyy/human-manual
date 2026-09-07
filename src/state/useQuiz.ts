import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { QuizAction, QuizState } from './quizReducer'

export const QuizContext = createContext<{ state: QuizState; dispatch: Dispatch<QuizAction>; storageMessage: string | null } | null>(null)

export function useQuiz() {
  const value = useContext(QuizContext)
  if (!value) throw new Error('作答狀態未初始化。')
  return value
}
