import { useState } from 'react'
import { motion } from 'framer-motion'
import { submitQuiz } from '../utils/api'
import ErrorMessage from './ErrorMessage'

function QuestionInput({ question, value, onChange, disabled }) {
  if (question.type === 'mcq' || question.type === 'true_false') {
    return (
      <div className="mt-3 flex flex-col gap-2">
        {question.options?.map((option) => (
          <label
            key={option}
            className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition ${
              value === option
                ? 'border-primary-400 bg-primary-50 dark:border-primary-500/50 dark:bg-primary-500/10'
                : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'
            }`}
          >
            <input
              type="radio"
              name={question.id}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              disabled={disabled}
              className="accent-primary-600"
            />
            <span className="text-slate-700 dark:text-slate-200">{option}</span>
          </label>
        ))}
      </div>
    )
  }

  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      placeholder="Your answer"
      className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 disabled:opacity-70 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
    />
  )
}

function QuizPanel({ lessonId, quiz }) {
  const [answers, setAnswers] = useState({})
  const [result, setResult] = useState(null)
  const [status, setStatus] = useState('idle') // idle | submitting | error
  const [error, setError] = useState(null)

  if (!quiz || quiz.length === 0) return null

  const resultsByQuestion = Object.fromEntries(
    (result?.results || []).map((r) => [r.question_id, r]),
  )

  async function handleSubmit() {
    setStatus('submitting')
    setError(null)
    try {
      const res = await submitQuiz(lessonId, answers)
      setResult(res)
      setStatus('idle')
    } catch (err) {
      setError(err.message)
      setStatus('error')
    }
  }

  function handleRetake() {
    setAnswers({})
    setResult(null)
  }

  return (
    <section className="mt-12 border-t border-slate-200 pt-8 dark:border-white/10">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
          Quiz
        </h2>
        {result && (
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
          >
            {result.score} / {result.total}
          </motion.span>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-6">
        {quiz.map((question, i) => {
          const qResult = resultsByQuestion[question.id]
          return (
            <div key={question.id}>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {i + 1}. {question.question}
              </p>
              <QuestionInput
                question={question}
                value={answers[question.id]}
                onChange={(val) => setAnswers((a) => ({ ...a, [question.id]: val }))}
                disabled={!!result}
              />
              {qResult && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 rounded-lg px-3 py-2 text-xs ${
                    qResult.correct
                      ? 'bg-success-500/10 text-success-600 dark:text-green-400'
                      : 'bg-danger-500/10 text-danger-600 dark:text-red-400'
                  }`}
                >
                  <p className="font-semibold">
                    {qResult.correct ? 'Correct' : `Correct answer: ${qResult.correct_answer}`}
                  </p>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">{qResult.explanation}</p>
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {status === 'error' && (
        <div className="mt-4">
          <ErrorMessage message={error} onRetry={handleSubmit} />
        </div>
      )}

      <div className="mt-6">
        {!result ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={status === 'submitting' || Object.keys(answers).length === 0}
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'submitting' ? 'Grading…' : 'Submit answers'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleRetake}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-primary-300 hover:text-primary-700 dark:border-white/10 dark:text-slate-300"
          >
            Retake quiz
          </button>
        )}
      </div>
    </section>
  )
}

export default QuizPanel
