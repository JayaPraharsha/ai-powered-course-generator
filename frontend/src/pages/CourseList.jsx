import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Circle, ListChecks, Plus } from 'lucide-react'
import { listCourses, listQuizzes } from '../utils/api'
import useFetch from '../hooks/useFetch'
import ErrorMessage from '../components/ErrorMessage'
import Skeleton from '../components/Skeleton'
import CourseCard from '../components/CourseCard'
import { fadeInUp, staggerContainer } from '../utils/motion'

const TABS = [
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'quizzes', label: 'Quizzes', icon: ListChecks },
]

function QuizzesTab() {
  const [quizzes, setQuizzes] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState(null)

  useEffect(() => {
    listQuizzes()
      .then((data) => {
        setQuizzes(data)
        setStatus('success')
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  if (status === 'loading') {
    return (
      <div className="mt-8 flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="mt-8">
        <ErrorMessage message={error} />
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <p className="text-slate-500">No module quizzes yet.</p>
        <p className="text-xs text-slate-400">
          Complete every lesson in a module to unlock its quiz.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      className="mt-8 flex flex-col gap-3"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {quizzes.map((quiz) => (
        <motion.div key={`${quiz.course_id}-${quiz.module_id}`} variants={fadeInUp}>
          <Link
            to={`/course/${quiz.course_id}`}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">{quiz.module_title}</p>
              <p className="truncate text-xs text-slate-400">{quiz.course_title}</p>
            </div>
            {quiz.quiz_completed ? (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-success-500/10 px-2.5 py-1 text-xs font-semibold text-success-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Passed · {quiz.quiz_score}/{quiz.quiz_total}
              </span>
            ) : (
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                <Circle className="h-3.5 w-3.5" />
                Available
              </span>
            )}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}

function CardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <Skeleton className="h-32 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-2 h-1.5 w-full" />
      </div>
    </div>
  )
}

function CourseList() {
  const { data: courses, status, error, reload } = useFetch(() => listCourses(), [])
  const [tab, setTab] = useState('courses')

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Your generated courses, all in one place.</p>
        </div>
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
        >
          <Plus className="h-4 w-4" />
          New Course
        </Link>
      </div>

      <div className="mt-6 inline-flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
              tab === id
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'quizzes' && <QuizzesTab />}

      {tab === 'courses' && status === 'loading' && (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {tab === 'courses' && status === 'error' && (
        <div className="mt-8">
          <ErrorMessage message={error} onRetry={reload} />
        </div>
      )}

      {tab === 'courses' && status === 'success' && courses.length === 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"
        >
          <p className="text-slate-500">No courses yet.</p>
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
          >
            <Plus className="h-4 w-4" />
            Generate your first course
          </Link>
        </motion.div>
      )}

      {tab === 'courses' && status === 'success' && courses.length > 0 && (
        <motion.div
          className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default CourseList
