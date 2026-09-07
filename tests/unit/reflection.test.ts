import { describe, expect, it } from 'vitest'
import { quiz } from '../../src/data/quiz'
import { resultStories } from '../../src/data/resultStories'
import { reflectAnswers } from '../../src/domain/reflection'
import { scoreQuiz } from '../../src/domain/score'

describe('result reflection and editorial coverage', () => {
  it('only recalls actual answers and flags contributions from the current scoring data', () => {
    const answers = quiz.questions.map((question, index) => question.options[index % 3]!.id)
    const resultId = scoreQuiz(quiz, answers).resultId
    const memories = reflectAnswers(quiz, answers, resultId)
    expect(memories).toHaveLength(8)
    for (const [index, memory] of memories.entries()) {
      const question = quiz.questions[index]!
      const option = question.options.find(({ id }) => id === answers[index])!
      expect(memory).toEqual({ questionNumber: index + 1, question: question.title, answer: option.label, echoesResult: (option.weights[resultId] ?? 0) > 0 })
    }
    expect(reflectAnswers(quiz, answers, quiz.types.find(({ id }) => id !== resultId)!.id)).toEqual([])
    expect(() => reflectAnswers(quiz, [null], resultId)).toThrow()
  })
  it('every existing role has distinct complete stories, recharge suggestions and ending', () => {
    expect(Object.keys(resultStories).sort()).toEqual(quiz.types.map(({ id }) => id).sort())
    const letters = new Set<string>()
    for (const role of quiz.types) {
      const story = resultStories[role.id]!
      expect(story.scenes.map(({ context }) => context)).toEqual(['朋友之間', '一起做事', '一個人的時候'])
      expect(story.recharge).toHaveLength(3)
      expect(story.letter).toHaveLength(2)
      for (const item of [...story.scenes, ...story.recharge]) {
        expect(item.title.length).toBeGreaterThan(0)
        expect(item.body.length).toBeGreaterThan(0)
      }
      expect(story.friendNote.length).toBeGreaterThan(0)
      letters.add(story.letter.join(''))
    }
    expect(letters.size).toBe(6)
  })
})
