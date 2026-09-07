import { expect, test } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { quiz } from '../../src/data/quiz'
import { scoreQuiz } from '../../src/domain/score'

for (const width of [375, 768, 1440]) {
  test(`${width}px：開始、作答、返回修改、結果、分享 fallback 與重測`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    const errors: string[] = []
    page.on('dialog', async (dialog) => { errors.push(`Unexpected browser dialog: ${dialog.message()}`); await dialog.dismiss() })
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    await page.addInitScript(() => { Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true }) })
    const screenshotDir = process.env.HM_SCREENSHOT_DIR
    if (screenshotDir) await mkdir(screenshotDir, { recursive: true })
    async function capture(name: string) {
      await expect(page.locator('vite-error-overlay')).toHaveCount(0)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
      if (screenshotDir) await page.screenshot({ path: join(screenshotDir, `${name}-${width}.png`), fullPage: true, animations: 'disabled' })
    }
    await page.goto('./')
    await expect(page).toHaveTitle('人類使用說明書')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('出廠時沒附的那本')
    await capture('home')
    await page.getByRole('button', { name: '開始翻開我的說明書' }).click()
    await expect(page.getByRole('button', { name: '下一題' })).toBeDisabled()
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await page.getByRole('radio').first().focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('radio').first()).toBeChecked()
    await capture('quiz')
    await page.getByRole('button', { name: '下一題' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await page.getByRole('button', { name: '上一題' }).click()
    await expect(page.getByRole('radio').first()).toBeChecked()
    await page.getByRole('radio').nth(1).check()
    const answers = quiz.questions.map((question, index) => question.options[index === 0 ? 1 : 0]!.id)
    await page.getByRole('button', { name: '下一題' }).click()
    for (let index = 1; index < 8; index++) {
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(quiz.questions[index]!.title)
      await page.getByRole('radio').first().check()
      await page.getByRole('button', { name: index === 7 ? '翻開我的說明書' : '下一題', exact: true }).click()
    }
    const result = scoreQuiz(quiz, answers)
    const type = quiz.types.find(({ id }) => id === result.resultId)!
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(type.name)
    await expect(page.getByText(type.description, { exact: true })).toBeVisible()
    await expect(page.getByText(type.hiddenSkill, { exact: true })).toBeVisible()
    await expect(page.locator('.shared-note')).toHaveCount(0)
    await capture('result')
    await page.getByRole('link', { name: '分享說明書', exact: true }).click()
    await page.getByRole('button', { name: '複製連結' }).click()
    const shareInput = page.getByLabel('請選取下方網址，手動複製分享。')
    await expect(shareInput).toBeVisible()
    const shareUrl = await shareInput.inputValue()
    expect(new URL(shareUrl).hash).toBe(`#/result/v1/${result.resultId}`)
    expect(new URL(shareUrl).search).toBe('')
    await capture('share')
    const visitor = await page.context().newPage()
    await visitor.goto(shareUrl)
    await expect(visitor.getByRole('heading', { level: 1 })).toHaveText(type.name)
    await expect(visitor.locator('.shared-note')).toBeVisible()
    await visitor.reload()
    await expect(visitor.getByRole('heading', { level: 1 })).toHaveText(type.name)
    await visitor.close()
    await page.getByRole('link', { name: '返回完整說明書' }).click()
    await page.getByRole('button', { name: /重新測驗|換我測測看/ }).click()
    const confirmation = page.getByRole('dialog', { name: '重新翻開一頁？' })
    await expect(confirmation).toBeVisible()
    await expect(confirmation.getByRole('button', { name: '先保留' })).toBeFocused()
    if (screenshotDir) await page.screenshot({ path: join(screenshotDir, `confirm-${width}.png`), animations: 'disabled' })
    await confirmation.getByRole('button', { name: '先保留' }).click()
    await expect(confirmation).not.toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(type.name)
    const restart = page.getByRole('button', { name: /重新測驗|換我測測看/ })
    await expect(restart).toBeFocused()
    await restart.click()
    await page.keyboard.press('Escape')
    await expect(confirmation).not.toBeVisible()
    await expect(restart).toBeFocused()
    await restart.click()
    await page.keyboard.press('Tab')
    await expect(confirmation.getByRole('button', { name: '重新測驗' })).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(confirmation.getByRole('button', { name: '先保留' })).toBeFocused()
    await confirmation.getByRole('button', { name: '重新測驗' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(quiz.questions[0]!.title)
    await expect(page.getByRole('radio', { checked: true })).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

test('所有角色有完整結果；未知版本或角色可以回首頁', async ({ page }) => {
  for (const result of quiz.types) {
    await page.goto(`./#/result/v1/${result.id}`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(result.name)
    await expect(page.getByText(result.warning, { exact: true })).toBeVisible()
    await expect(page.getByText(result.hiddenSkill, { exact: true })).toBeVisible()
  }
  for (const path of ['./#/result/v2/social-heater', './#/result/v1/missing', './#/missing']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('這一頁，暫時找不到。')
    await page.getByRole('link', { name: '回到首頁', exact: true }).click()
    await expect(page.getByRole('button', { name: '開始翻開我的說明書' })).toBeVisible()
  }
})
