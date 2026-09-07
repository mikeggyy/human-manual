import { expect, it } from 'vitest'
import { findResult } from '../../src/data/quiz'
import { makeShareUrl } from '../../src/services/share'

it('根路徑和專案子路徑的分享 URL 只含版本與合法結果', () => {
  expect(makeShareUrl('https://example.com', '/', 'low-battery-helper')).toBe('https://example.com/#/result/v1/low-battery-helper')
  const url = new URL(makeShareUrl('https://example.com', '/human-manual/', 'social-heater'))
  expect(url.pathname).toBe('/human-manual/')
  expect(url.search).toBe('')
  expect(url.hash).toBe('#/result/v1/social-heater')
  expect(() => makeShareUrl('https://example.com', '/', 'unknown')).toThrow()
})

it('未知版本和角色不顯示其他角色當作替代結果', () => {
  expect(findResult('v2', 'social-heater')).toBeUndefined()
  expect(findResult('v1', 'unknown')).toBeUndefined()
})
