import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const resultPath = './#/result/v1/low-battery-helper'

async function spriteSnapshot(sprite: Locator) {
  return sprite.evaluate((element) => {
    const animation = element.getAnimations().find((entry) => entry instanceof CSSAnimation && entry.animationName === 'character-frames')
    return {
      exists: Boolean(animation),
      time: typeof animation?.currentTime === 'number' ? animation.currentTime : null,
      playState: animation?.playState ?? null,
      pending: animation?.pending ?? false,
      transform: getComputedStyle(element).transform,
    }
  })
}

async function expectFramesAdvance(sprite: Locator) {
  await expect.poll(async () => (await spriteSnapshot(sprite)).playState).toBe('running')
  const before = await spriteSnapshot(sprite)
  expect(before.exists).toBe(true)
  expect(before.time).not.toBeNull()
  await expect.poll(async () => {
    const after = await spriteSnapshot(sprite)
    return after.time !== null && after.time > before.time! && after.transform !== before.transform
  }, { timeout: 10000, intervals: [100, 200, 300] }).toBe(true)
}

async function expectFramesFrozen(page: Page, sprite: Locator) {
  await expect.poll(async () => {
    const snapshot = await spriteSnapshot(sprite)
    return snapshot.playState === 'paused' && !snapshot.pending
  }).toBe(true)
  const before = await spriteSnapshot(sprite)
  // Observe the rendered frame over time, rather than trusting the data attribute.
  await page.waitForTimeout(450)
  const after = await spriteSnapshot(sprite)
  expect(after.time).toBe(before.time)
  expect(after.transform).toBe(before.transform)
}

async function openMovingResult(page: Page) {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(resultPath)
  const mascot = page.locator('.mascot')
  await mascot.scrollIntoViewIfNeeded()
  await expect(mascot).toHaveAttribute('data-sprite-status', 'ready')
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  return { mascot, sprite: mascot.locator('.character-sprite') }
}

test('角色影格真的變化；鍵盤可暫停與恢復，跨頁保留暫停', async ({ page }) => {
  const { mascot, sprite } = await openMovingResult(page)
  await expect(mascot.locator('.illustration-static')).toHaveCSS('visibility', 'hidden')
  await expectFramesAdvance(sprite)

  await page.getByRole('button', { name: '暫停動態', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: '播放動態', exact: true })).toBeFocused()
  await expect(mascot).toHaveAttribute('data-motion', 'paused')
  await expectFramesFrozen(page, sprite)

  await page.keyboard.press('Enter')
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  await expectFramesAdvance(sprite)

  await page.getByRole('button', { name: '暫停動態', exact: true }).click()
  await page.getByRole('link', { name: '人類使用說明書', exact: true }).click()
  await expect(page.locator('.site-shell')).toHaveAttribute('data-motion', 'paused')
  await expect(page.locator('.book-scene')).toHaveAttribute('data-motion', 'paused')
  await expect(page.locator('.book-float')).toHaveCSS('animation-play-state', 'paused')
  await expect(page.getByRole('button', { name: '播放動態', exact: true })).toBeVisible()
})

test('暫停後在站內切換關於、分享與錯誤頁，標題和插圖不凍結在透明進場', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('./')
  await page.getByRole('button', { name: '暫停動態', exact: true }).click()
  await page.getByRole('link', { name: '關於', exact: true }).click()
  await expect(page.locator('.about-illustration')).toBeVisible()
  await expect(page.locator('.about-illustration')).toHaveCSS('opacity', '1')

  // Hash navigation keeps the Shell and its manually paused state mounted.
  await page.evaluate(() => { window.location.hash = '#/share/v1/low-battery-helper' })
  await expect(page.locator('.share-heading')).toBeVisible()
  await expect(page.locator('.share-heading')).toHaveCSS('opacity', '1')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('.site-shell')).toHaveAttribute('data-motion', 'paused')

  await page.evaluate(() => { window.location.hash = '#/missing' })
  await expect(page.locator('.missing-illustration')).toBeVisible()
  await expect(page.locator('.missing-illustration')).toHaveCSS('opacity', '1')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('這一頁，暫時找不到。')
  await expect(page.locator('.site-shell')).toHaveAttribute('data-motion', 'paused')
})

test('初始與即時減少動態偏好都改用靜圖，頁面沒有持續或進場動畫', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(resultPath)
  const mascot = page.locator('.mascot')
  const reducedToggle = page.getByRole('button', { name: '動態已減少', exact: true })
  await expect(mascot).toHaveAttribute('data-motion', 'reduced')
  await expect(reducedToggle).toBeDisabled()
  await expect(reducedToggle).toHaveAttribute('title', /裝置.*減少動態/)
  await expect(mascot.locator('.illustration-static')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)

  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await expect(mascot).toHaveAttribute('data-sprite-status', 'ready')
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  await expectFramesAdvance(mascot.locator('.character-sprite'))

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(mascot).toHaveAttribute('data-motion', 'reduced')
  await expect(reducedToggle).toBeDisabled()
  await expect(mascot.locator('.illustration-static')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
})

test('角色離開視口後影格凍結，回來恢復；手動暫停不被捲動解除', async ({ page }) => {
  const { mascot, sprite } = await openMovingResult(page)
  await expectFramesAdvance(sprite)
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await expect(mascot).not.toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'offscreen')
  await expectFramesFrozen(page, sprite)

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(mascot).toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  await expectFramesAdvance(sprite)

  await page.getByRole('button', { name: '暫停動態', exact: true }).click()
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await expect(mascot).not.toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'paused')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(mascot).toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'paused')
  await expectFramesFrozen(page, sprite)
})

test('動態圖片載入失敗仍顯示已載入的原插圖與完整結果', async ({ page }) => {
  let blockedImages = 0
  await page.route(/\/character-motion-v1(?:-[^/?]*)?\.png(?:\?.*)?$/, async (route) => {
    blockedImages += 1
    await route.abort('failed')
  })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(resultPath)
  const mascot = page.locator('.mascot')
  await mascot.scrollIntoViewIfNeeded()
  await expect(mascot).toHaveAttribute('data-sprite-status', 'failed')
  expect(blockedImages).toBeGreaterThan(0)
  const fallback = mascot.locator('.illustration-static')
  await expect(fallback).toBeVisible()
  await expect.poll(() => fallback.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('省電型熱心人')
  await expect(page.getByRole('link', { name: '儲存／分享這份說明書', exact: true })).toBeVisible()
})

test('320px 手機的動態控制可觸及，各主要頁面無橫向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  for (const path of ['./', './#/quiz', resultPath, './#/share/v1/low-battery-helper']) {
    await page.goto(path)
    const toggle = page.getByRole('button', { name: '暫停動態', exact: true })
    await expect(toggle).toBeVisible()
    const bounds = (await toggle.boundingBox())!
    expect(bounds.width).toBeGreaterThanOrEqual(44)
    expect(bounds.height).toBeGreaterThanOrEqual(44)
    expect(bounds.x).toBeGreaterThanOrEqual(0)
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(320)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  }
})

test('模擬 visibilitychange：頁籤隱藏時影格停止，恢復可見後繼續', async ({ page }) => {
  const { mascot, sprite } = await openMovingResult(page)
  await expectFramesAdvance(sprite)
  // This verifies the visibility-event handler, not native background-tab behavior.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('.site-shell')).toHaveAttribute('data-motion', 'hidden')
  await expect(mascot).toHaveAttribute('data-motion', 'hidden')
  await expectFramesFrozen(page, sprite)

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  await expectFramesAdvance(sprite)
})
