import { findResult } from '../data/quiz'

const brand = '人類使用說明書'
const defaultDescription = '8 個日常選擇，翻開你的使用說明書。找到你的角色、相處提醒與充電提案，把這份小小的理解分享給在乎的人。'

export function pageMetadata(pathname: string) {
  if (pathname === '/') return { title: `${brand}｜出廠時沒附的那本，現在補給你。`, description: defaultDescription }
  if (pathname === '/quiz') return { title: `日常測驗｜${brand}`, description: '跟著 8 個日常情境，選出最像你的直覺。沒有標準答案，慢慢翻開你的說明書。' }
  if (pathname === '/about') return { title: `關於這份說明書｜${brand}`, description: '認識這份娛樂測驗、作答資料的處理方式，以及分享與隱私說明。' }
  const match = /^\/(result|share)\/([^/]+)\/([^/]+)\/?$/.exec(pathname)
  const role = match ? findResult(match[2], match[3]) : undefined
  if (role) return { title: `${match![1] === 'share' ? '分享・' : ''}${role.name}｜${brand}`, description: `${role.tagline} ${role.description}` }
  return { title: `找不到這一頁｜${brand}`, description: '這一頁暫時找不到，回到首頁重新翻開你的使用說明書。' }
}
