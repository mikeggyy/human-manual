import { expect, it } from 'vitest'
import { pageMetadata } from '../../src/services/pageMetadata'
import { quiz } from '../../src/data/quiz'

it('uses appropriate titles for each route and does not mislabel invalid result links', () => {
  expect(pageMetadata('/').title).toBe('人類使用說明書｜出廠時沒附的那本，現在補給你。')
  expect(pageMetadata('/quiz').title).toBe('日常測驗｜人類使用說明書')
  expect(pageMetadata('/about').title).toContain('關於')
  for (const role of quiz.types) {
    expect(pageMetadata(`/result/v1/${role.id}`)).toEqual({ title: `${role.name}｜人類使用說明書`, description: `${role.tagline} ${role.description}` })
    expect(pageMetadata(`/share/v1/${role.id}`).title).toBe(`分享・${role.name}｜人類使用說明書`)
  }
  for (const route of ['/result/v2/low-battery-helper', '/result/v1/missing', '/result/v1/steady-keeper/extra', '/unknown']) {
    expect(pageMetadata(route).title).toBe('找不到這一頁｜人類使用說明書')
  }
})
