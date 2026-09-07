import { useReducer } from 'react'
import type { ReactNode } from 'react'
import { initialQuizState, quizReducer } from './quizReducer'
import { QuizContext } from './useQuiz'

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, undefined, initialQuizState)
  return <QuizContext value={{ state, dispatch }}>{children}</QuizContext>
}
