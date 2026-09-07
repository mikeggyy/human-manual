import { expect, test } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { quiz } from '../../src/data/quiz'

declare global {
  interface Window {
    __cardText: { text: string; left: number; right: number; top: number; bottom: number }[]
    __nativeShares: { data: ShareData; active: boolean }[]
  }
}

test('六角色真正下載不同的 1080×1350 PNG，完整文字、插畫與紙色均存在', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.addInitScript(() => {
    window.__cardText = []
    const drawText = CanvasRenderingContext2D.prototype.fillText
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      if (this.canvas.width === 1080 && this.canvas.height === 1350) {
        const width = this.measureText(text).width
        const left = this.textAlign === 'center' ? x - width / 2 : this.textAlign === 'right' ? x - width : x
        window.__cardText.push({ text, left, right: left + width, top: y, bottom: y + Number(this.font.match(/([\d.]+)px/)?.[1] ?? 0) })
      }
      if (maxWidth === undefined) drawText.call(this, text, x, y)
      else drawText.call(this, text, x, y, maxWidth)
    }
  })
  const hashes = new Set<string>()
  for (const result of quiz.types) {
    await page.goto(`./#/share/v1/${result.id}`)
    const downloaded = page.waitForEvent('download')
    await page.getByRole('button', { name: '儲存圖片', exact: true }).click()
    const download = await downloaded
    expect(download.suggestedFilename()).toBe(`human-manual-${result.model}.png`)
    expect(await download.failure()).toBeNull()
    const bytes = await readFile((await download.path())!)
    expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
    expect(bytes.readUInt32BE(16)).toBe(1080)
    expect(bytes.readUInt32BE(20)).toBe(1350)
    expect(bytes.length).toBeGreaterThan(25000)
    hashes.add(createHash('sha256').update(bytes).digest('hex'))
    await testInfo.attach(`export-${result.model}`, { body: bytes, contentType: 'image/png' })
    if (process.env.HM_SCREENSHOT_DIR) {
      await mkdir(process.env.HM_SCREENSHOT_DIR, { recursive: true })
      await writeFile(join(process.env.HM_SCREENSHOT_DIR, `export-${result.model}.png`), bytes)
    }
    const preview = page.locator('.export-preview img')
    await expect(preview).toBeVisible()
    await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth === 1080 && image.naturalHeight === 1350)).toBe(true)
    const draws = await page.evaluate(() => window.__cardText)
    const writtenText = draws.map((draw) => draw.text).join('')
    for (const expected of [result.name, result.model, result.quote, result.startup, result.lowBattery, result.care, quiz.title, quiz.disclaimer]) expect(writtenText).toContain(expected)
    for (const draw of draws) {
      expect(draw.left, draw.text).toBeGreaterThanOrEqual(40)
      expect(draw.right, draw.text).toBeLessThanOrEqual(1040)
      expect(draw.top, draw.text).toBeGreaterThanOrEqual(40)
      expect(draw.bottom, draw.text).toBeLessThanOrEqual(1310)
    }
    const pixels = await preview.evaluate((image: HTMLImageElement) => {
      const canvas = document.createElement('canvas')
      canvas.width = 1080; canvas.height = 1350
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0)
      const background = [...context.getImageData(10, 10, 1, 1).data]
      const illustration = context.getImageData(375, 421, 330, 330).data
      let orange = 0
      let dark = 0
      for (let i = 0; i < illustration.length; i += 4) {
        const red = illustration[i]!, green = illustration[i + 1]!, blue = illustration[i + 2]!
        if (red > 140 && green < 150 && blue < 100 && red > green * 1.25) orange++
        if (red < 100 && green < 100 && blue < 100) dark++
      }
      return { background, orange, dark }
    })
    expect(pixels.background).toEqual([245, 237, 219, 255])
    expect(pixels.orange).toBeGreaterThan(300)
    expect(pixels.dark).toBeGreaterThan(300)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375)
  }
  expect(hashes.size).toBe(6)
})

test('PNG 編碼失敗可重試，圖片和複製各自保留回饋', async ({ page }) => {
  await page.addInitScript(() => {
    let first = true
    const encode = HTMLCanvasElement.prototype.toBlob
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      if (first) { first = false; callback(null) }
      else encode.call(this, callback, type, quality)
    }
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true })
  })
  await page.goto('./#/share/v1/inner-director')
  await page.getByRole('button', { name: '複製連結' }).click()
  await expect(page.getByText('連結已複製', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '儲存圖片', exact: true }).click()
  await expect(page.getByText('圖片輸出失敗，請再試一次。', { exact: true })).toBeVisible()
  await expect(page.locator('.export-preview')).toHaveCount(0)
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '重試儲存圖片' }).click()
  await download
  await expect(page.locator('.export-preview img')).toBeVisible()
  await expect(page.getByText('連結已複製', { exact: true })).toBeVisible()
  await expect(page.getByText('圖片輸出失敗，請再試一次。', { exact: true })).toHaveCount(0)
})

test('字型載入失敗可重試；自動下載遭阻擋仍可查看和另存圖片', async ({ page }) => {
  await page.addInitScript(() => {
    let first = true
    const loadFont = document.fonts.load.bind(document.fonts)
    document.fonts.load = (font, text) => {
      if (first) { first = false; return Promise.reject(new Error('Font loading failed')) }
      return loadFont(font, text)
    }
    HTMLAnchorElement.prototype.click = function () { throw new DOMException('Download blocked', 'NotAllowedError') }
  })
  await page.goto('./#/share/v1/steady-keeper')
  await page.getByRole('button', { name: '儲存圖片', exact: true }).click()
  await expect(page.getByText('圖片字型還沒準備好，請再試一次。', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '重試儲存圖片' }).click()
  await expect(page.locator('.export-preview img')).toBeVisible()
  await expect(page.getByRole('link', { name: '再次下載 PNG' })).toHaveAttribute('download', 'human-manual-HM-06.png')
  await expect(page.locator('.share-actions')).not.toContainText('已存入相簿')
})

test('插畫載入失敗可重試，不輸出缺圖的 PNG', async ({ page }) => {
  await page.route('**/*illustration-atlas*', (route) => route.abort())
  await page.goto('./#/share/v1/action-human')
  await page.getByRole('button', { name: '儲存圖片', exact: true }).click()
  await expect(page.getByText('角色插畫載入失敗，請確認連線後再試一次。', { exact: true })).toBeVisible()
  await expect(page.locator('.export-preview')).toHaveCount(0)
  await page.unroute('**/*illustration-atlas*')
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: '重試儲存圖片' }).click()
  await download
  await expect(page.locator('.export-preview img')).toBeVisible()
})

test('原生分享在點擊時執行，取消安靜返回；失敗可以重試且只分享角色連結', async ({ page }) => {
  await page.addInitScript(() => {
    window.__nativeShares = []
    Object.defineProperty(navigator, 'canShare', { value: () => true, configurable: true })
    Object.defineProperty(navigator, 'share', { configurable: true, value: (data: ShareData) => {
      window.__nativeShares.push({ data, active: navigator.userActivation.isActive })
      if (window.__nativeShares.length === 1) return Promise.reject(new DOMException('Cancelled', 'AbortError'))
      if (window.__nativeShares.length === 2) return Promise.reject(new DOMException('Unavailable', 'NotAllowedError'))
      return Promise.resolve()
    } })
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() }, configurable: true })
  })
  await page.goto('./#/share/v1/social-heater')
  await page.getByRole('button', { name: '複製連結' }).click()
  await page.getByRole('button', { name: '分享給朋友' }).click()
  await expect(page.getByRole('button', { name: '分享給朋友' })).toBeEnabled()
  await expect(page.locator('.feedback-error')).toHaveCount(0)
  await expect(page.getByText('連結已複製', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: '分享給朋友' }).click()
  await expect(page.getByRole('button', { name: '重試分享' })).toBeVisible()
  await page.getByRole('button', { name: '重試分享' }).click()
  await expect(page.getByText('已交給系統分享。', { exact: true })).toBeVisible()
  const requests = await page.evaluate(() => window.__nativeShares)
  expect(requests).toHaveLength(3)
  for (const { data, active } of requests) {
    expect(active).toBe(true)
    expect(data.title).toBe('氣氛組暖爐｜人類使用說明書')
    expect(Object.keys(data).sort()).toEqual(['text', 'title', 'url'])
    const url = new URL(data.url!)
    expect(url.hash).toBe('#/result/v1/social-heater')
    expect(url.search).toBe('')
  }
})

test('不支援原生分享時保留圖片與可選取的完整分享網址', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true })
  })
  await page.goto('./#/share/v1/freeform-artist')
  await expect(page.getByRole('button', { name: '分享給朋友' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: '儲存圖片', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: '複製連結' }).click()
  const input = page.getByLabel('請選取下方網址，手動複製分享。')
  await expect(input).toBeFocused()
  const url = await input.inputValue()
  expect(new URL(url).hash).toBe('#/result/v1/freeform-artist')
  expect(new URL(url).search).toBe('')
  expect(await input.evaluate((element: HTMLInputElement) => element.selectionEnd! - element.selectionStart!)).toBe(url.length)
})
