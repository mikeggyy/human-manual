import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { quiz, routeVersion } from '../data/quiz'
import { scoreQuiz } from '../domain/score'
import { useQuiz } from '../state/useQuiz'
import { AnswerOption } from '../components/AnswerOption'
import { QuizProgress } from '../components/QuizProgress'
import { Illustration } from '../components/Illustration'
import { illustrationFor } from '../data/illustrations'

export function QuizPage() {
  const { state, dispatch } = useQuiz()
  const navigate = useNavigate()
  const heading = useRef<HTMLHeadingElement>(null)
  const [error, setError] = useState('')
  const question = quiz.questions[state.index]!
  const isLast = state.index === quiz.questions.length - 1
  useEffect(() => { heading.current?.focus(); window.scrollTo({ top: 0, behavior: 'instant' }) }, [state.index])
  function next(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (!state.answers[state.index]) return
    if (!isLast) { dispatch({ type: 'next' }); return }
    try {
      const { resultId } = scoreQuiz(quiz, state.answers)
      navigate(`/result/${routeVersion}/${resultId}`, { state: { completed: true } })
    } catch (reason) { setError(reason instanceof Error ? reason.message : '請檢查你的作答。') }
  }
  return <div className="quiz-page">
    <QuizProgress index={state.index} total={quiz.questions.length} />
    <form onSubmit={next}>
      <div className="question-sheet" key={question.id}>
      <Illustration name={illustrationFor(question.id)} className="question-illustration" />
      <div className="question-content">
      <h1 ref={heading} id="question-title" tabIndex={-1}>{question.title.split(/(?<=，)/u).map((clause, index) => <span className="question-clause" key={index}>{clause}</span>)}</h1>
      <fieldset aria-labelledby="question-title" className="answer-options">
        <legend className="sr-only">請選擇一個答案</legend>
        {question.options.map((option, index) => <AnswerOption key={option.id} option={option} letter={String.fromCharCode(65 + index)} questionId={question.id} checked={state.answers[state.index] === option.id} onSelect={(optionId) => dispatch({ type: 'answer', optionId })} />)}
      </fieldset>
      <p className="question-hint">選最像你的直覺，沒有標準答案。</p>
      </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="quiz-navigation"><button type="button" className="button button-secondary" onClick={() => state.index ? dispatch({ type: 'previous' }) : navigate('/')}>{state.index ? '上一題' : '回到首頁'}</button><button className="button button-primary" disabled={!state.answers[state.index]}>{isLast ? '翻開我的說明書' : '下一題'}</button></div>
    </form>
  </div>
}
