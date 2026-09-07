import { Link } from 'react-router'
import { Illustration } from '../components/Illustration'

export function NotFoundPage() {
  return <section className="text-page missing-page"><Illustration name="missing" className="missing-illustration" /><h1 tabIndex={-1}>這一頁，暫時找不到。</h1><p>這份說明書的版本或角色不存在，也可能是連結不完整。</p><Link to="/" className="button button-primary">回到首頁</Link></section>
}
