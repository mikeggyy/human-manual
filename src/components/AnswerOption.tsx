import type { Option } from '../domain/types'

export function AnswerOption({ option, questionId, checked, onSelect, letter }: {
  option: Option; questionId: string; checked: boolean; onSelect: (id: string) => void; letter?: string
}) {
  return <label className={`answer-option${checked ? ' is-selected' : ''}`}>
    <input type="radio" name={questionId} value={option.id} checked={checked} onChange={() => onSelect(option.id)} />
    <span className="answer-letter" aria-hidden="true">{letter}</span><span className="answer-text">{option.label}</span>
  </label>
}
