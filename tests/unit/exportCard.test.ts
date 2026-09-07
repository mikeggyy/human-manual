import { expect, it } from 'vitest'
import { wrapCardText } from '../../src/services/exportCard'

const measure = (value: string) => Array.from(value).length * 10

it('長中文字與沒有空白的英文字完整換行，不省略任何字元', () => {
  for (const text of ['邀你出門時，請一併提供預計回家時間。', 'averylongwordwithoutanyspaces']) {
    const lines = wrapCardText(text, 60, measure)
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join('')).toBe(text)
    expect(lines.every((line) => measure(line) <= 60)).toBe(true)
  }
})

it('保留手動換行與完整 Unicode 字元，剛好等寬時不多換行', () => {
  expect(wrapCardText('一句話\n\n另一頁', 30, measure)).toEqual(['一句話', '', '另一頁'])
  expect(wrapCardText('你好🌱再見', 30, measure)).toEqual(['你好🌱', '再見'])
})

it('不能容納單一字元或非法寬度時報錯，避免靜默裁切', () => {
  for (const width of [0, -1, NaN, Infinity]) expect(() => wrapCardText('字', width, measure)).toThrow(RangeError)
  expect(() => wrapCardText('字', 9, measure)).toThrow(RangeError)
  expect(() => wrapCardText('字。', 10, measure)).toThrow(RangeError)
})

it('中日文自動換行不把閉合標點放行首，也不把開括號留行尾', () => {
  const samples = ['有人接話、有人一起笑，還有人願意說「走啊」。', '請說「今天辛苦了」。', '今日は「ありがとう」と伝えたい。']
  const variableWidth = (value: string) => Array.from(value).reduce((sum, character) => sum + ('、，。「」'.includes(character) ? 4 : 10), 0)
  for (const sample of samples) {
    for (const width of [50, 65, 95, 115, 160, 210]) {
      const lines = wrapCardText(sample, width, variableWidth)
      expect(lines.join('')).toBe(sample)
      expect(lines.every((line) => variableWidth(line) <= width)).toBe(true)
      expect(lines.slice(1).every((line) => !/^[、，。」』】）》]/u.test(line))).toBe(true)
      expect(lines.slice(0, -1).every((line) => !/[「（]$/u.test(line))).toBe(true)
    }
  }
})

it('平衡中日文過短末行，保留所有字元且兩行不超出寬度', () => {
  const text = '下班以後就好好休息。'
  const lines = wrapCardText(text, 90, measure)
  expect(lines).toHaveLength(2)
  expect(lines.join('')).toBe(text)
  const widths = lines.map(measure)
  expect(Math.max(...widths)).toBeLessThanOrEqual(90)
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(10)
})

it('末行平衡不跨越手動換行，不改寫純英文的長字換行', () => {
  expect(wrapCardText('先說到這\n」。保留原本換行', 90, measure)).toEqual(['先說到這', '」。保留原本換行'])
  expect(wrapCardText('abcdefghijk', 100, measure)).toEqual(['abcdefghij', 'k'])
})
