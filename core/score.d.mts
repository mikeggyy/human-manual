import type { Quiz, ScoreResult } from '../src/domain/types'
export function validateQuiz(quiz: Quiz): boolean
export function scoreQuiz(quiz: Quiz, answers: readonly string[]): ScoreResult
