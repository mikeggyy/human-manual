import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const resultPath = './#/result/v1/low-battery-helper'

async function motionSnapshot(rig: Locator) {
  return rig.evaluate((element) => {
    return Array.from(element.querySelectorAll('[data-motion-part]')).flatMap((part) => {
      const style = getComputedStyle(part)
      return part.getAnimations().map((animation) => ({
        part: part.getAttribute('data-motion-part'),
        time: typeof animation.currentTime === 'number' ? animation.currentTime : null,
        playState: animation.playState,
        pending: animation.pending,
        transform: style.transform,
        opacity: style.opacity,
      }))
    })
  })
}

async function expectMotionAdvance(rig: Locator) {
  await expect.poll(async () => {
    const snapshot = await motionSnapshot(rig)
    return snapshot.length > 0 && snapshot.every((animation) => animation.playState === 'running')
  }).toBe(true)
  const before = await motionSnapshot(rig)
  await expect.poll(async () => {
    const after = await motionSnapshot(rig)
    // A moving hand, reel or prop must actually change on screen. Eye opacity
    // alone cannot satisfy the check for continuously articulated movement.
    return after.some((animation, index) => {
      const previous = before[index]
      return !animation.part?.includes('eye') && previous !== undefined && previous.time !== null && animation.time !== null
        && animation.time > previous.time && animation.transform !== previous.transform
    })
  }, { timeout: 10000, intervals: [100, 200, 300] }).toBe(true)
}

async function expectMotionFrozen(page: Page, rig: Locator) {
  await expect.poll(async () => {
    const snapshot = await motionSnapshot(rig)
    return snapshot.length > 0 && snapshot.every((animation) => animation.playState === 'paused' && !animation.pending)
  }).toBe(true)
  const before = await motionSnapshot(rig)
  // Observe every articulated layer over time, rather than trusting a status flag.
  await page.waitForTimeout(450)
  expect(await motionSnapshot(rig)).toEqual(before)
}

async function fixedDrawingSnapshot(rig: Locator) {
  return rig.evaluate((element) => {
    const base = element.querySelector('.character-base')!
    const style = getComputedStyle(base)
    return {
      transform: style.transform,
      opacity: style.opacity,
      animations: base.getAnimations().length,
      sources: Array.from(element.querySelectorAll<SVGImageElement>('.character-source')).map((image) => image.href.baseVal),
    }
  })
}

async function expectContinuousMotion(rig: Locator) {
  const interpolation = await rig.evaluate(async (element) => {
    const parts = Array.from(element.querySelectorAll('[data-motion-part]'))
      .filter((part) => !part.getAttribute('data-motion-part')?.includes('eye'))
    for (const part of parts) {
      for (const animation of part.getAnimations()) {
        if (!(animation.effect instanceof KeyframeEffect)) continue
        const effect = animation.effect
        const frames = effect.getKeyframes()
        const timing = effect.getComputedTiming()
        if (typeof timing.duration !== 'number' || timing.duration <= 0) continue
        for (let index = 1; index < frames.length; index += 1) {
          const start = frames[index - 1]
          const end = frames[index]
          if (!start || !end || typeof start.transform !== 'string' || typeof end.transform !== 'string' || start.transform === end.transform
            || start.computedOffset === null || end.computedOffset === null || end.computedOffset <= start.computedOffset) continue
          const originalTime = animation.currentTime
          const wasRunning = animation.playState === 'running'
          animation.pause()
          await animation.ready
          const samples: string[] = []
          // Negative CSS delays stagger the characters. Seek a later complete
          // cycle so an early gesture cannot land in the animation's before phase.
          const cycle = Math.ceil(Math.max(0, -Number(timing.delay)) / timing.duration) + 1
          for (const fraction of [0, .25, .5, .75, 1]) {
            const offset = start.computedOffset + (end.computedOffset - start.computedOffset) * fraction
            animation.currentTime = Number(timing.delay) + timing.duration * (cycle + offset)
            samples.push(getComputedStyle(part).transform)
          }
          animation.currentTime = originalTime
          if (wasRunning) animation.play()
          return samples
        }
      }
    }
    return []
  })
  expect(interpolation, '角色局部動作應有起點、連續中間姿態和終點').toHaveLength(5)
  // A reel can finish a full turn at its original angle. Its intermediate
  // positions must still be distinct from each other and the resting position.
  expect(new Set(interpolation.slice(1, 4)).size, '動作不能只在兩幅姿態之間硬切').toBe(3)
  expect(new Set(interpolation).size).toBeGreaterThanOrEqual(4)
}

async function openMovingResult(page: Page) {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto(resultPath)
  const mascot = page.locator('.mascot')
  await mascot.scrollIntoViewIfNeeded()
  await expect(mascot).toHaveAttribute('data-sprite-status', 'ready')
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  return { mascot, rig: mascot.locator('.character-rig') }
}

test('角色局部動作真的變化；鍵盤可暫停與恢復，跨頁保留暫停', async ({ page }) => {
  const { mascot, rig } = await openMovingResult(page)
  await expect(mascot.locator('.illustration-static')).toHaveCSS('visibility', 'hidden')
  const base = await fixedDrawingSnapshot(rig)
  await expectMotionAdvance(rig)
  expect(await fixedDrawingSnapshot(rig)).toEqual(base)

  await page.getByRole('button', { name: '暫停動態', exact: true }).focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: '播放動態', exact: true })).toBeFocused()
  await expect(mascot).toHaveAttribute('data-motion', 'paused')
  await expectMotionFrozen(page, rig)

  await page.keyboard.press('Enter')
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  await expectMotionAdvance(rig)

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
  await expectMotionAdvance(mascot.locator('.character-rig'))

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(mascot).toHaveAttribute('data-motion', 'reduced')
  await expect(reducedToggle).toBeDisabled()
  await expect(mascot.locator('.illustration-static')).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0)
})

test('角色離開視口後所有局部動作凍結，回來恢復；手動暫停不被捲動解除', async ({ page }) => {
  const { mascot, rig } = await openMovingResult(page)
  await expectMotionAdvance(rig)
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await expect(mascot).not.toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'offscreen')
  await expectMotionFrozen(page, rig)

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(mascot).toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  await expectMotionAdvance(rig)

  await page.getByRole('button', { name: '暫停動態', exact: true }).click()
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
  await expect(mascot).not.toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'paused')
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
  await expect(mascot).toBeInViewport()
  await expect(mascot).toHaveAttribute('data-motion', 'paused')
  await expectMotionFrozen(page, rig)
})

test('模擬 SVG 圖片 error 事件後回退到已載入的原插圖與完整結果', async ({ page }) => {
  const { mascot, rig } = await openMovingResult(page)
  // Both renderers share one URL. Trigger the SVG image's error handler only;
  // this verifies renderer fallback, not a failed network request for the atlas.
  await rig.locator('.character-source').first().evaluate((source) => source.dispatchEvent(new Event('error')))
  await expect(mascot).toHaveAttribute('data-sprite-status', 'failed')
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

test('模擬 visibilitychange：頁籤隱藏時所有局部動作停止，恢復可見後繼續', async ({ page }) => {
  const { mascot, rig } = await openMovingResult(page)
  await expectMotionAdvance(rig)
  // This verifies the visibility-event handler, not native background-tab behavior.
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.locator('.site-shell')).toHaveAttribute('data-motion', 'hidden')
  await expect(mascot).toHaveAttribute('data-motion', 'hidden')
  await expectMotionFrozen(page, rig)

  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(mascot).toHaveAttribute('data-motion', 'running')
  await expectMotionAdvance(rig)
})

test('六角色使用同一原畫連續演出；底稿與道具不換圖、不漂移', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const roles = ['low-battery-helper', 'social-heater', 'inner-director', 'action-human', 'freeform-artist', 'steady-keeper']
  for (const role of roles) {
    await page.goto(`./#/result/v1/${role}`)
    const mascot = page.locator('.mascot')
    await mascot.scrollIntoViewIfNeeded()
    await expect(mascot).toHaveAttribute('data-sprite-status', 'ready')
    await expect(mascot).toHaveAttribute('data-motion', 'running')
    const rig = mascot.locator('.character-rig')
    const before = await fixedDrawingSnapshot(rig)
    expect(before.animations, `${role} 的完整底稿應固定`).toBe(0)
    expect(before.sources.length).toBeGreaterThan(0)
    const original = await mascot.locator('.illustration-static').getAttribute('src')
    expect(before.sources.every((source) => source === original), `${role} 不應在不同重畫姿勢之間切圖`).toBe(true)
    await expectContinuousMotion(rig)
    expect(await fixedDrawingSnapshot(rig), `${role} 的道具和底稿應保持一致`).toEqual(before)
  }
})
