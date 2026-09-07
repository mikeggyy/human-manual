// Positions in the original 4 × 4 illustration atlas; independent of quiz scoring.
export const illustrations = {
  'plans-cancelled': { cell: 0, label: '坐在餐桌前，看著手機等待朋友的人' },
  'weekend-trip': { cell: 1, label: '帶著行李與地圖，準備旅行的人' },
  'friend-tired': { cell: 2, label: '坐在長椅上，端著茶陪伴疲累朋友的人' },
  'early-arrival': { cell: 3, label: '在咖啡店與時鐘旁等待的人' },
  'one-word-reply': { cell: 4, label: '看著簡短訊息，思考如何回應的人' },
  'group-lost': { cell: 5, label: '在路標前一起研究地圖的三個朋友' },
  'free-evening': { cell: 6, label: '月光下自在讀書、喝茶的人' },
  'ideal-gift': { cell: 7, label: '拆開橘色緞帶驚喜禮物的人' },
  'low-battery-helper': { cell: 8, label: '靠著抱枕休息、舉手示意的電池角色' },
  'social-heater': { cell: 9, label: '圍著圍巾、熱情揮手的暖爐角色' },
  'inner-director': { cell: 10, label: '拿著場記板、充滿想像的攝影機角色' },
  'action-human': { cell: 11, label: '朝小旗子邁步前進的運動鞋角色' },
  'freeform-artist': { cell: 12, label: '拿著畫筆、自在創作的調色盤角色' },
  'steady-keeper': { cell: 13, label: '撐著傘、溫柔守護的房子角色' },
  about: { cell: 14, label: '兩個朋友一起閱讀同一本說明書' },
  missing: { cell: 15, label: '拿著放大鏡，在書本旁尋找散落書頁的探險家' },
} as const

export type IllustrationName = keyof typeof illustrations

export function illustrationFor(id: string): IllustrationName {
  return Object.hasOwn(illustrations, id) ? id as IllustrationName : 'missing'
}
