import { expect, test } from '@playwright/test'
import { quiz } from '../../src/data/quiz'
import { scoreQuiz } from '../../src/domain/score'
import { QUIZ_STORAGE_KEY } from '../../src/services/storage'

const answers = quiz.questions.map((question) => question.options[0]!.id)
const completedProgress = { quizVersion: quiz.version, index: 7, answers }
const partialProgress = { quizVersion: quiz.version, index: 1, answers: [answers[0], ...Array<null>(7).fill(null)] }

test('重新整理後從首頁繼續上次測驗，已答題數、題號與修改答案皆保留', async ({ page }) => {
  await page.goto('./')
  await page.getByRole('button', { name: '開始翻開我的說明書' }).click()
  await page.getByRole('radio').first().check()
  await page.getByRole('button', { name: '下一題' }).click()
  await page.getByRole('radio').nth(1).check()
  await page.getByRole('link', { name: '人類使用說明書', exact: true }).click()
  await page.reload()
  await expect(page.locator('.home-progress')).toContainText('已答 2 / 8 題')
  await page.getByRole('button', { name: '繼續上次測驗' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(quiz.questions[1]!.title)
  await expect(page.getByRole('radio').nth(1)).toBeChecked()
  await page.getByRole('button', { name: '上一題' }).click()
  await page.getByRole('radio').last().check()
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(quiz.questions[0]!.title)
  await expect(page.getByRole('radio').last()).toBeChecked()
  await page.getByRole('button', { name: '下一題' }).click()
  await expect(page.getByRole('radio').nth(1)).toBeChecked()
})

test('完成後從首頁重看自己的說明書；同瀏覽器直接開分享頁仍是角色模板且保留作答', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)), { key: QUIZ_STORAGE_KEY, progress: completedProgress })
  await page.reload()
  await expect(page.getByRole('button', { name: '繼續上次測驗' })).toHaveCount(0)
  await page.getByRole('button', { name: '查看我的說明書' }).click()
  await expect(page.locator('.answer-reflection')).toBeVisible()
  await expect(page.locator('.shared-note')).toHaveCount(0)
  await page.reload()
  await expect(page.locator('.answer-reflection')).toBeVisible()
  const visitor = await page.context().newPage()
  await visitor.goto(page.url())
  await expect(visitor.locator('.shared-note')).toBeVisible()
  await expect(visitor.locator('.answer-reflection')).toHaveCount(0)
  expect(await visitor.evaluate((key) => JSON.parse(localStorage.getItem(key)!), QUIZ_STORAGE_KEY)).toEqual(completedProgress)
  await visitor.close()
})

for (const [name, raw] of [
  ['JSON 損壞', '{'],
  ['版本過期', JSON.stringify({ ...partialProgress, quizVersion: 'old' })],
  ['跨題答案', JSON.stringify({ ...partialProgress, answers: [answers[1], ...Array<null>(7).fill(null)] })],
  ['作答有缺口', JSON.stringify({ ...partialProgress, answers: [null, answers[1], ...Array<null>(6).fill(null)] })],
  ['跳過題目', JSON.stringify({ ...partialProgress, index: 5 })],
]) {
  test(`${name}時提示並可以重新作答`, async ({ page }) => {
    await page.goto('./')
    await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: QUIZ_STORAGE_KEY, value: raw! })
    await page.reload()
    await expect(page.locator('.storage-notice')).toContainText('過期或無法辨識')
    await page.getByRole('button', { name: '開始翻開我的說明書' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(quiz.questions[0]!.title)
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
    await page.getByRole('radio').first().check()
    await page.getByRole('button', { name: '下一題' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(quiz.questions[1]!.title)
    await expect(page.locator('.storage-notice')).toHaveCount(0)
  })
}

test('瀏覽器禁止本機儲存時如實提示，仍可完整作答與看個人線索', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new DOMException('Blocked', 'SecurityError') } })
  })
  await page.goto('./')
  await expect(page.locator('.storage-notice')).toContainText('無法讀取')
  await page.getByRole('button', { name: '開始翻開我的說明書' }).click()
  for (let index = 0; index < quiz.questions.length; index++) {
    await page.getByRole('radio').first().check()
    await page.getByRole('button', { name: index === 7 ? '翻開我的說明書' : '下一題', exact: true }).click()
  }
  await expect(page.locator('.storage-notice')).toContainText('無法保存')
  await expect(page.locator('.answer-reflection')).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`/result/v1/${scoreQuiz(quiz, answers).resultId}$`))
})

test('容量不足不假裝保存成功，當次仍能前進', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError') }
  })
  await page.goto('./')
  await page.getByRole('button', { name: '開始翻開我的說明書' }).click()
  await page.getByRole('radio').first().check()
  await expect(page.locator('.storage-notice')).toContainText('無法保存')
  await page.getByRole('button', { name: '下一題' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(quiz.questions[1]!.title)
})

test('關於頁清除只移除本測驗資料，其他網站功能的儲存保留', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(({ key, progress }) => {
    localStorage.setItem(key, JSON.stringify(progress))
    localStorage.setItem('unrelated-entry', 'keep')
  }, { key: QUIZ_STORAGE_KEY, progress: completedProgress })
  await page.goto('./#/about')
  await page.getByRole('button', { name: '清除這次作答' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '清除作答', exact: true }).click()
  await expect(page.getByRole('button', { name: '開始翻開我的說明書' })).toBeVisible()
  expect(await page.evaluate((key) => localStorage.getItem(key), QUIZ_STORAGE_KEY)).toBeNull()
  expect(await page.evaluate(() => localStorage.getItem('unrelated-entry'))).toBe('keep')
  await page.reload()
  await expect(page.getByRole('button', { name: '查看我的說明書' })).toHaveCount(0)
})

test('清除受阻時說明舊資料仍可能恢復，不誤報已刪除', async ({ page }) => {
  await page.goto('./')
  await page.evaluate(({ key, progress }) => localStorage.setItem(key, JSON.stringify(progress)), { key: QUIZ_STORAGE_KEY, progress: partialProgress })
  await page.reload()
  await page.getByRole('link', { name: '關於這份說明書', exact: true }).click()
  await page.evaluate(() => {
    Storage.prototype.removeItem = () => { throw new DOMException('Blocked', 'SecurityError') }
  })
  await page.getByRole('button', { name: '清除這次作答' }).click()
  await page.getByRole('dialog').getByRole('button', { name: '清除作答', exact: true }).click()
  await expect(page.getByRole('button', { name: '開始翻開我的說明書' })).toBeVisible()
  await expect(page.locator('.storage-notice')).toContainText('未能清除已存資料')
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), QUIZ_STORAGE_KEY)).toEqual(partialProgress)
})
