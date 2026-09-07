import atlasUrl from '../assets/illustration-atlas-v2.png'
import { illustrationFor, illustrations } from '../data/illustrations'
import { quiz } from '../data/quiz'
import type { ResultType } from '../domain/types'

export const cardSize = { width: 1080, height: 1350 } as const
const bodyFont = '"PingFang TC", "Microsoft JhengHei", sans-serif'
const headingFont = '"Noto Serif TC", "Songti TC", "PMingLiU", serif'
const ink = '#342e26'
const accent = '#a84624'
const closingPunctuation = new Set(Array.from('、。，．？！：；）》」』】〕〉〗〙〛’”…％,.!?:;)]}'))
const openingPunctuation = new Set(Array.from('（《「『【〔〈〖〘〚‘“([{'))

function wrapParagraph(paragraph: string, maxWidth: number, measure: (text: string) => number): string[] {
  if (!paragraph) return ['']
  const characters = Array.from(paragraph)
  const useCjkRules = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(paragraph)
  const canBreak = (index: number, text: string[]) => !useCjkRules || (
    !closingPunctuation.has(text[index] ?? '') && !openingPunctuation.has(text[index - 1] ?? '')
  )
  const lines: string[] = []
  let start = 0
  while (start < characters.length) {
    let end = start
    while (end < characters.length && measure(characters.slice(start, end + 1).join('')) <= maxWidth) end++
    if (end < characters.length) while (end > start && !canBreak(end, characters)) end--
    if (end === start) throw new RangeError('圖片文字或標點無法完整換行，請重試。')
    lines.push(characters.slice(start, end).join(''))
    start = end
  }

  // Balance a very short final line within this paragraph, preserving explicit newlines.
  const last = lines.at(-1)!
  if (useCjkRules && lines.length > 1 && measure(last) < maxWidth * 0.3) {
    const previous = lines.at(-2)!
    const pair = Array.from(previous + last)
    let best = { before: previous, after: last, difference: Math.abs(measure(previous) - measure(last)) }
    for (let index = 1; index < pair.length; index++) {
      if (!canBreak(index, pair)) continue
      const before = pair.slice(0, index).join('')
      const after = pair.slice(index).join('')
      const beforeWidth = measure(before), afterWidth = measure(after)
      const difference = Math.abs(beforeWidth - afterWidth)
      if (beforeWidth <= maxWidth && afterWidth <= maxWidth && difference < best.difference) best = { before, after, difference }
    }
    lines.splice(-2, 2, best.before, best.after)
  }
  return lines
}

/** Wrap by Unicode character so Chinese text and long unbroken words are retained. */
export function wrapCardText(text: string, maxWidth: number, measure: (text: string) => number): string[] {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) throw new RangeError('文字寬度必須大於零。')
  return text.split('\n').flatMap((paragraph) => wrapParagraph(paragraph, maxWidth, measure))
}

async function prepareFonts(result: ResultType): Promise<void> {
  if (!document.fonts) return // The local system font stack also works without FontFaceSet.
  const sample = `${result.name}${result.quote}${result.startup}${result.lowBattery}${result.care}${quiz.disclaimer}`
  try {
    await Promise.all([
      document.fonts.load(`32px ${bodyFont}`, sample),
      document.fonts.load(`600 68px ${headingFont}`, sample),
      document.fonts.ready,
    ])
    if (!document.fonts.check(`32px ${bodyFont}`, sample) || !document.fonts.check(`600 68px ${headingFont}`, sample)) throw new Error('Font unavailable')
  } catch { throw new Error('圖片字型還沒準備好，請再試一次。') }
}

function loadAtlas(): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => image.naturalWidth && image.naturalHeight
      ? resolve(image)
      : reject(new Error('角色插畫無法讀取，請再試一次。'))
    image.onerror = () => reject(new Error('角色插畫載入失敗，請確認連線後再試一次。'))
    image.src = atlasUrl
  })
}

async function withTimeout<T>(promise: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([promise, new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('圖片準備時間較久，請確認連線後再試一次。')), 12000)
    })])
  } finally { clearTimeout(timer) }
}

function drawCard(context: CanvasRenderingContext2D, result: ResultType, atlas: HTMLImageElement) {
  const { width, height } = cardSize
  context.fillStyle = '#f5eddb'
  context.fillRect(0, 0, width, height)
  context.fillStyle = '#fffaf0'
  context.fillRect(40, 40, width - 80, height - 80)
  context.strokeStyle = '#c7b391'
  context.lineWidth = 2
  context.strokeRect(40, 40, width - 80, height - 80)
  context.fillStyle = accent
  context.fillRect(65, 40, 12, 110)
  context.textBaseline = 'top'

  function text(value: string, x: number, y: number, size: number, options: { color?: string; heading?: boolean; align?: CanvasTextAlign } = {}) {
    context.font = `${options.heading ? '600' : '400'} ${size}px ${options.heading ? headingFont : bodyFont}`
    context.fillStyle = options.color ?? ink
    context.textAlign = options.align ?? 'left'
    context.fillText(value, x, y)
  }
  function rule(y: number) {
    context.strokeStyle = '#d8c8ac'
    context.lineWidth = 2
    context.beginPath()
    context.moveTo(92, y)
    context.lineTo(988, y)
    context.stroke()
  }

  text('人類使用說明書', 104, 86, 30, { heading: true })
  text(`${result.model} / VOL. 01`, 980, 89, 25, { color: accent, align: 'right' })
  rule(145)
  text('本次翻到的角色', 540, 178, 25, { color: accent, align: 'center' })
  let titleSize = 68
  context.font = `600 ${titleSize}px ${headingFont}`
  while (context.measureText(result.name).width > 890 && titleSize > 36) {
    titleSize -= 2
    context.font = `600 ${titleSize}px ${headingFont}`
  }
  if (context.measureText(result.name).width > 890) throw new Error('角色名稱太長，暫時無法排成圖片。')
  text(result.name, 540, 229, titleSize, { heading: true, align: 'center' })

  context.font = `400 36px ${bodyFont}`
  const quoteLines = wrapCardText(`「${result.quote}」`, 850, (value) => context.measureText(value).width)
  if (quoteLines.length > 2) throw new Error('代表句太長，暫時無法排成圖片。')
  quoteLines.forEach((line, index) => text(line, 540, 326 + index * 49, 36, { align: 'center' }))

  context.fillStyle = '#eee6d3'
  context.beginPath()
  context.ellipse(540, 579, 183, 158, 0, 0, Math.PI * 2)
  context.fill()
  const { cell } = illustrations[illustrationFor(result.id)]
  const cellWidth = atlas.naturalWidth / 4
  const cellHeight = atlas.naturalHeight / 4
  // Exclude the atlas border so neighbouring cells cannot bleed into the card.
  const insetX = cellWidth * 0.01, insetY = cellHeight * 0.01
  context.drawImage(atlas, (cell % 4) * cellWidth + insetX, Math.floor(cell / 4) * cellHeight + insetY, cellWidth - insetX * 2, cellHeight - insetY * 2, 375, 421, 330, 330)

  const entries = [['啟動方式', result.startup], ['低電量訊號', result.lowBattery], ['相處須知', result.care]] as const
  let bodySize = 32
  let rows: { label: string; lines: string[]; height: number }[]
  // Fit complete text, never truncate it or overlap the next row/footer.
  do {
    context.font = `400 ${bodySize}px ${bodyFont}`
    rows = entries.map(([label, value]) => {
      const lines = wrapCardText(value, 666, (line) => context.measureText(line).width)
      return { label, lines, height: Math.max(64, lines.length * (bodySize + 12)) + 28 }
    })
    if (rows.reduce((sum, row) => sum + row.height, 0) <= 360) break
    bodySize -= 1
  } while (bodySize >= 26)
  if (bodySize < 26) throw new Error('說明文字太長，暫時無法排成圖片。')
  let rowY = 796
  for (const row of rows) {
    rule(rowY - 20)
    text(row.label, 100, rowY + 3, 28, { heading: true, color: accent })
    row.lines.forEach((line, index) => text(line, 314, rowY + index * (bodySize + 12), bodySize))
    rowY += row.height
  }

  rule(1167)
  text('每次選擇，都是當下的一頁。', 540, 1192, 26, { heading: true, align: 'center', color: accent })
  context.font = `400 23px ${bodyFont}`
  const disclaimer = wrapCardText(quiz.disclaimer, 888, (line) => context.measureText(line).width)
  if (disclaimer.length > 2) throw new Error('聲明文字太長，暫時無法排成圖片。')
  disclaimer.forEach((line, index) => text(line, 540, 1244 + index * 32, 23, { align: 'center', color: '#685e4e' }))
}

export async function exportCard(result: ResultType): Promise<Blob> {
  const [, atlas] = await withTimeout(Promise.all([prepareFonts(result), loadAtlas()]))
  const canvas = document.createElement('canvas')
  canvas.width = cardSize.width
  canvas.height = cardSize.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('這個瀏覽器暫時無法產生圖片，請改用複製連結。')
  drawCard(context, result, atlas)
  try {
    return await withTimeout(new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => blob?.size ? resolve(blob) : reject(new Error('圖片輸出失敗，請再試一次。')), 'image/png')
    }))
  } catch (error) {
    if (error instanceof Error && error.name !== 'SecurityError') throw error
    throw new Error('圖片暫時無法匯出，請重新整理後再試一次，或改用複製連結。', { cause: error })
  }
}
