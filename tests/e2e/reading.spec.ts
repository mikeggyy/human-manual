import { expect, test } from '@playwright/test'

test('角色介紹的基本設定在前，章節捷徑可用，提前分享不誤認訪客', async ({ page }) => {
  await page.goto('./#/result/v1/low-battery-helper')
  await expect(page.locator('.shared-note')).toBeVisible()
  await expect(page.locator('.answer-reflection')).toHaveCount(0)
  await expect(page.getByRole('button', { name: '作答線索', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: '基本設定', exact: true }).click()
  await expect(page.getByRole('heading', { name: '這份角色的基本設定' })).toBeFocused()
  await page.getByRole('link', { name: '儲存／分享這份說明書', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('把這份說明書帶走')
  await page.getByRole('link', { name: '返回完整說明書' }).click()
  await expect(page.locator('.shared-note')).toBeVisible()
  await expect(page.getByRole('heading', { name: '角色手冊的最後一頁' })).toBeVisible()
})

for (const width of [320, 375]) {
  test(`${width}px：分享按鈕在卡片前且首屏可觸及`, async ({ page }) => {
    await page.setViewportSize({ width, height: 740 })
    await page.goto('./#/share/v1/inner-director')
    const save = page.getByRole('button', { name: '儲存圖片', exact: true })
    await expect(save).toBeVisible()
    const saveBounds = (await save.boundingBox())!
    const cardBounds = (await page.locator('.is-compact').boundingBox())!
    expect(saveBounds.y + saveBounds.height).toBeLessThan(740)
    expect(saveBounds.y).toBeLessThan(cardBounds.y)
    expect(saveBounds.height).toBeGreaterThanOrEqual(44)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}
