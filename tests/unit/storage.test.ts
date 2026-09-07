import { describe, expect, it, vi } from 'vitest'
import { quiz } from '../../src/data/quiz'
import { initialQuizState } from '../../src/state/quizReducer'
import { clearQuizProgress, loadQuizProgress, QUIZ_STORAGE_KEY, saveQuizProgress, validateQuizProgress } from '../../src/services/storage'

const firstAnswers = quiz.questions.map((question) => question.options[0]!.id)

function partialProgress() {
  return { quizVersion: quiz.version, index: 2, answers: [...firstAnswers.slice(0, 2), ...Array<null>(6).fill(null)] }
}

function storageWith(progress: string | null = null) {
  const values = new Map<string, string>([['other-application', 'keep me']])
  if (progress !== null) values.set(QUIZ_STORAGE_KEY, progress)
  return {
    values,
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value) }),
    removeItem: vi.fn((key: string) => { values.delete(key) }),
  }
}

describe('儲存資料驗證', () => {
  it('接受合法的空白、部分、返回修改與完成狀態，還原時不共用答案陣列', () => {
    const progress = partialProgress()
    for (const state of [initialQuizState(), progress, { ...progress, index: 0 }, { ...progress, index: 7, answers: firstAnswers }]) {
      expect(validateQuizProgress(state)).toEqual(state)
      expect(validateQuizProgress(state)?.answers).not.toBe(state.answers)
    }
  })

  const invalidCases: [string, unknown][] = [
    ['null', null],
    ['陣列', []],
    ['字串', 'progress'],
    ['缺少欄位', {}],
    ['額外欄位', { ...partialProgress(), resultId: 'social-heater' }],
    ['過期版本', { ...partialProgress(), quizVersion: '0.9.0' }],
    ['版本型別錯誤', { ...partialProgress(), quizVersion: 1 }],
    ['答案不是陣列', { ...partialProgress(), answers: {} }],
    ['答案太少', { ...partialProgress(), answers: firstAnswers.slice(0, 7) }],
    ['答案太多', { ...partialProgress(), answers: [...firstAnswers, null] }],
    ['答案跨題', { ...partialProgress(), answers: [firstAnswers[1], ...partialProgress().answers.slice(1)] }],
    ['答案型別錯誤', { ...partialProgress(), answers: [false, ...partialProgress().answers.slice(1)] }],
    ['稀疏陣列', { ...partialProgress(), answers: new Array(8) }],
    ['作答有缺口', { ...partialProgress(), answers: [null, firstAnswers[1], ...Array<null>(6).fill(null)] }],
    ['題號不是數字', { ...partialProgress(), index: '2' }],
    ['題號不是整數', { ...partialProgress(), index: 1.5 }],
    ['負數題號', { ...partialProgress(), index: -1 }],
    ['題號超出範圍', { ...partialProgress(), index: 8 }],
    ['跳過未答題目', { ...partialProgress(), index: 3 }],
  ]
  it.each(invalidCases)('拒絕%s', (_name, value) => {
    expect(validateQuizProgress(value)).toBeNull()
  })
})

describe('儲存失敗安全降級', () => {
  it('空儲存與合法資料分別回傳空白及還原狀態，讀取不寫入', () => {
    const empty = storageWith()
    expect(loadQuizProgress(() => empty)).toEqual({ state: initialQuizState(), storageMessage: null })
    const saved = storageWith(JSON.stringify(partialProgress()))
    expect(loadQuizProgress(() => saved)).toEqual({ state: partialProgress(), storageMessage: null })
    expect(saved.setItem).not.toHaveBeenCalled()
    expect(saved.removeItem).not.toHaveBeenCalled()
  })

  it.each(['{', 'null', '[]', JSON.stringify({ ...partialProgress(), quizVersion: 'old' })])('損壞或舊資料 %s 會提示並安全開啟空白狀態', (raw) => {
    const result = loadQuizProgress(() => storageWith(raw))
    expect(result.state).toEqual(initialQuizState())
    expect(result.storageMessage).toContain('過期或無法辨識')
  })

  it('localStorage getter 被阻擋與 getItem 失敗都不會中斷流程', () => {
    const blocked = () => { throw new Error('SecurityError') }
    for (const getStorage of [blocked, () => ({ ...storageWith(), getItem: blocked })]) {
      const result = loadQuizProgress(getStorage)
      expect(result.state).toEqual(initialQuizState())
      expect(result.storageMessage).toContain('無法讀取')
    }
  })

  it('保存只包含版本、題号和答案，可重新讀取並保留其他資料', () => {
    const storage = storageWith()
    const state = partialProgress()
    expect(saveQuizProgress(state, () => storage)).toBeNull()
    expect(storage.setItem).toHaveBeenCalledExactlyOnceWith(QUIZ_STORAGE_KEY, JSON.stringify(state))
    expect(loadQuizProgress(() => storage).state).toEqual(state)
    expect(storage.values.get('other-application')).toBe('keep me')
  })

  it('容量不足及禁止寫入時保留原資料並回報未保存，非法狀態不寫入', () => {
    const existing = JSON.stringify(partialProgress())
    const storage = storageWith(existing)
    storage.setItem.mockImplementation(() => { throw new Error('QuotaExceededError') })
    expect(saveQuizProgress(initialQuizState(), () => storage)).toContain('無法保存')
    expect(storage.values.get(QUIZ_STORAGE_KEY)).toBe(existing)
    expect(saveQuizProgress(initialQuizState(), () => { throw new Error('SecurityError') })).toContain('無法保存')
    storage.setItem.mockClear()
    expect(saveQuizProgress({ ...initialQuizState(), index: 7 }, () => storage)).toContain('無法保存')
    expect(storage.setItem).not.toHaveBeenCalled()
  })

  it('清除只刪自己的 key；清除失败如實提示並保留資料', () => {
    const storage = storageWith(JSON.stringify(partialProgress()))
    expect(clearQuizProgress(() => storage)).toBeNull()
    expect(storage.removeItem).toHaveBeenCalledExactlyOnceWith(QUIZ_STORAGE_KEY)
    expect(storage.values.get(QUIZ_STORAGE_KEY)).toBeUndefined()
    expect(storage.values.get('other-application')).toBe('keep me')
    storage.values.set(QUIZ_STORAGE_KEY, 'retained')
    storage.removeItem.mockImplementation(() => { throw new Error('SecurityError') })
    expect(clearQuizProgress(() => storage)).toContain('未能清除已存資料')
    expect(clearQuizProgress(() => { throw new Error('SecurityError') })).toContain('未能清除已存資料')
    expect(storage.values.get(QUIZ_STORAGE_KEY)).toBe('retained')
  })
})
