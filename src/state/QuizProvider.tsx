import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { quizReducer } from './quizReducer'
import type { QuizAction } from './quizReducer'
import { QuizContext } from './useQuiz'
import { clearQuizProgress, loadQuizProgress, saveQuizProgress } from '../services/storage'

export function QuizProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => loadQuizProgress())
  const currentState = useRef(session.state)
  const dispatch = useCallback((action: QuizAction) => {
    const next = quizReducer(currentState.current, action)
    if (next === currentState.current) return
    currentState.current = next
    const storageMessage = action.type === 'reset' ? clearQuizProgress() : saveQuizProgress(next)
    setSession({ state: next, storageMessage })
  }, [])
  return <QuizContext value={{ ...session, dispatch }}>{children}</QuizContext>
}
