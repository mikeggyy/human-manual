import { quiz } from '../data/quiz'

export interface QuizState {
  quizVersion: string
  index: number
  answers: (string | null)[]
}

export type QuizAction =
  | { type: 'answer'; optionId: string }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'reset' }

export function initialQuizState(): QuizState {
  return { quizVersion: quiz.version, index: 0, answers: quiz.questions.map(() => null) }
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'answer': {
      if (!quiz.questions[state.index]?.options.some(({ id }) => id === action.optionId)) return state
      return { ...state, answers: state.answers.map((id, index) => index === state.index ? action.optionId : id) }
    }
    case 'next':
      return state.answers[state.index] && state.index < quiz.questions.length - 1
        ? { ...state, index: state.index + 1 } : state
    case 'previous':
      return { ...state, index: Math.max(0, state.index - 1) }
    case 'reset':
      return initialQuizState()
  }
}
