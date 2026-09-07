import rawQuiz from '../../core/quiz.v1.json' with { type: 'json' }
import type { Quiz } from '../domain/types'

export const quiz: Quiz = rawQuiz
export const routeVersion = 'v1'

export function findResult(version: string | undefined, id: string | undefined) {
  return version === routeVersion ? quiz.types.find((type) => type.id === id) : undefined
}
