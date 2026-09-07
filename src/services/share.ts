import { findResult, routeVersion } from '../data/quiz'

export function makeShareUrl(origin: string, base: string, resultId: string): string {
  if (!findResult(routeVersion, resultId)) throw new TypeError('找不到這份說明書。')
  const url = new URL(base, origin)
  url.search = ''
  url.hash = `/result/${routeVersion}/${encodeURIComponent(resultId)}`
  return url.href
}
