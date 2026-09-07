import { describe, expect, it } from 'vitest'
import { scoreQuiz as referenceScore, validateQuiz } from '../../core/score.mjs'
import { quiz } from '../../src/data/quiz'
import { scoreQuiz } from '../../src/domain/score'

describe('TypeScript 與提供的參考核心一致', () => {
  it('題庫有效；6,561 條路徑的分數和結果完全一致，六種角色皆可到達', () => {
    expect(validateQuiz(quiz)).toBe(true)
    const reached = new Set<string>()
    let ties = 0
    for (let path = 0; path < 3 ** 8; path++) {
      let seed = path
      const answers = quiz.questions.map((question) => {
        const id = question.options[seed % 3]!.id
        seed = Math.floor(seed / 3)
        return id
      })
      const result = scoreQuiz(quiz, answers)
      expect(result).toEqual(referenceScore(quiz, answers))
      expect(Object.values(result.scores).reduce((sum, score) => sum + score, 0)).toBe(32)
      reached.add(result.resultId)
      const highest = Math.max(...Object.values(result.scores))
      if (Object.values(result.scores).filter((value) => value === highest).length > 1) ties++
      expect(scoreQuiz({ ...quiz, types: [...quiz.types].reverse() }, answers)).toEqual(result)
    }
    expect(reached.size).toBe(6)
    expect(ties).toBeGreaterThan(0)
  })
  it('拒絕未完成、跨題或未知答案', () => {
    const answers = quiz.questions.map((question) => question.options[0]!.id)
    expect(() => scoreQuiz(quiz, [])).toThrow()
    expect(() => scoreQuiz(quiz, [null, ...answers.slice(1)])).toThrow()
    expect(() => scoreQuiz(quiz, [answers[1]!, ...answers.slice(1)])).toThrow()
    expect(() => scoreQuiz(quiz, ['unknown', ...answers.slice(1)])).toThrow()
  })
  it('修改答案後不累加舊分數或修改輸入', () => {
    const answers = quiz.questions.map((question) => question.options[0]!.id)
    const before = JSON.stringify(quiz)
    const changed = [quiz.questions[0]!.options[1]!.id, ...answers.slice(1)]
    expect(scoreQuiz(quiz, changed)).toEqual(referenceScore(quiz, changed))
    expect(scoreQuiz(quiz, changed).scores).not.toEqual(scoreQuiz(quiz, answers).scores)
    expect(JSON.stringify(quiz)).toBe(before)
  })
})
