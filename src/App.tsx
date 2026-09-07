import { HashRouter, Route, Routes } from 'react-router'
import { Shell } from './components/Shell'
import { QuizProvider } from './state/QuizProvider'
import { HomePage } from './pages/HomePage'
import { QuizPage } from './pages/QuizPage'
import { ResultPage } from './pages/ResultPage'
import { SharePage } from './pages/SharePage'
import { AboutPage } from './pages/AboutPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return <HashRouter><QuizProvider><Routes><Route element={<Shell />}>
    <Route index element={<HomePage />} />
    <Route path="quiz" element={<QuizPage />} />
    <Route path="result/:version/:resultId" element={<ResultPage />} />
    <Route path="share/:version/:resultId" element={<SharePage />} />
    <Route path="about" element={<AboutPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></QuizProvider></HashRouter>
}
