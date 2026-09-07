import { quiz } from '../data/quiz'
import { initialQuizState } from '../state/quizReducer'
import type { QuizState } from '../state/quizReducer'

export const QUIZ_STORAGE_KEY = 'human-manual:quiz-progress'

type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
type StorageAccess = () => ProgressStorage

export interface StoredQuizSession {
  state: QuizState
  storageMessage: string | null
}

const browserStorage: StorageAccess = () => window.localStorage
const unreadableMessage = '上次的作答資料已過期或無法辨識。你可以從第一題重新開始。'
const unavailableMessage = '瀏覽器目前無法讀取已存作答。你仍可完成這次測驗，但重新整理後可能無法保留進度。'

/** Only accept states that can be reached by answering in order and going back. */
export function validateQuizProgress(value: unknown): QuizState | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (Object.keys(record).length !== 3 || record.quizVersion !== quiz.version) return null
  if (typeof record.index !== 'number' || !Number.isInteger(record.index) || record.index < 0 || record.index >= quiz.questions.length) return null
  if (!Array.isArray(record.answers) || record.answers.length !== quiz.questions.length) return null

  const answers: (string | null)[] = []
  let unanswered = false
  let answeredCount = 0
  for (let index = 0; index < quiz.questions.length; index++) {
    const answer: unknown = record.answers[index]
    if (answer === null) {
      unanswered = true
    } else {
      if (unanswered || typeof answer !== 'string' || !quiz.questions[index]!.options.some(({ id }) => id === answer)) return null
      answeredCount++
    }
    answers.push(answer)
  }
  if (record.index > answeredCount) return null
  return { quizVersion: quiz.version, index: record.index, answers }
}

export function loadQuizProgress(getStorage: StorageAccess = browserStorage): StoredQuizSession {
  let stored: string | null
  try {
    stored = getStorage().getItem(QUIZ_STORAGE_KEY)
  } catch {
    return { state: initialQuizState(), storageMessage: unavailableMessage }
  }
  if (stored === null) return { state: initialQuizState(), storageMessage: null }
  try {
    const state = validateQuizProgress(JSON.parse(stored) as unknown)
    if (state) return { state, storageMessage: null }
  } catch {
    // Malformed JSON is handled like an incompatible stored version.
  }
  return { state: initialQuizState(), storageMessage: unreadableMessage }
}

/** Return a user-facing explanation on failure; a null message means success. */
export function saveQuizProgress(state: QuizState, getStorage: StorageAccess = browserStorage): string | null {
  const validState = validateQuizProgress(state)
  if (!validState) return '這次作答無法保存。請重新開始測驗。'
  try {
    getStorage().setItem(QUIZ_STORAGE_KEY, JSON.stringify(validState))
    return null
  } catch {
    return '瀏覽器暫時無法保存這次作答。你仍可完成測驗，但重新整理後可能無法保留目前進度。'
  }
}

export function clearQuizProgress(getStorage: StorageAccess = browserStorage): string | null {
  try {
    getStorage().removeItem(QUIZ_STORAGE_KEY)
    return null
  } catch {
    return '這次作答已重置，但瀏覽器未能清除已存資料；重新整理可能恢復舊作答。你可以在瀏覽器設定中清除此網站資料。'
  }
}
