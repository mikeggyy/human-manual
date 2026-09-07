import { Illustration } from './Illustration'
import { illustrationFor } from '../data/illustrations'
import type { ResultType } from '../domain/types'
import { Icon } from './Icon'

const sections = [
  { key: 'startup', label: '啟動方式', icon: 'plug' },
  { key: 'lowBattery', label: '低電量訊號', icon: 'battery' },
  { key: 'care', label: '相處須知', icon: 'clock' },
  { key: 'warning', label: '注意事項', icon: 'warning' },
  { key: 'hiddenSkill', label: '隱藏技能', icon: 'star' },
] as const

export function ManualCard({ result, compact = false }: { result: ResultType; compact?: boolean }) {
  const Heading = compact ? 'h2' : 'h1'
  return <article className={`manual-card${compact ? ' is-compact' : ''}`}>
    <div className="manual-intro">
      <div className="manual-heading">
      <p className="model">{result.model}</p>
      <Heading tabIndex={-1}>{result.name}</Heading>
      {!compact && <p className="manual-tagline">{result.tagline}</p>}
      </div>
      <Illustration name={illustrationFor(result.id)} className="mascot" />
      {compact ? <blockquote>{result.quote}</blockquote> : <p className="description">{result.description}</p>}
    </div>
    <dl className="manual-sections">
      {(compact ? sections.slice(0, 3) : sections).map(({ key, label, icon }) => <div className="manual-section" key={key}>
        <div className="section-icon"><Icon name={icon} /></div>
        <div><dt>{label}</dt><dd>{result[key]}</dd></div>
      </div>)}
    </dl>
    {!compact && <blockquote>{result.quote}</blockquote>}
    {compact && <p className="card-brand">人類使用說明書</p>}
    {compact && <p className="card-disclaimer">娛樂測驗，非心理評估。</p>}
  </article>
}
