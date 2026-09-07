import type { Option } from '../domain/types'

export function AnswerOption({ option, questionId, checked, onSelect }: {
  option: Option; questionId: string; checked: boolean; onSelect: (id: string) => void
}) {
  return <label className={`answer-option${checked ? ' is-selected' : ''}`}>
    <input type="radio" name={questionId} value={option.id} checked={checked} onChange={() => onSelect(option.id)} />
    <span>{option.label}</span>
  </label>
}
