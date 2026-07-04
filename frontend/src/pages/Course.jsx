import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Layers } from 'lucide-react'
import { getCourse } from '../utils/api'
import useFetch from '../hooks/useFetch'
import { useForceSidebarCollapsed } from '../context/UIContext'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import QuizPanel from '../components/QuizPanel'
import CourseSidebar from '../components/CourseSidebar'
import { fadeInUp, staggerContainer } from '../utils/motion'
import { courseProgress, courseModuleStats, moduleProgress } from '../utils/progress'

function Course() {
  const { courseId } = useParams()
  const {
    data: course,
    status,
    error,
    reload,
    setData: setCourse,
  } = useFetch(() => getCourse(courseId), [courseId])
  useForceSidebarCollapsed()

  if (status === 'loading') return <LoadingSpinner label="Loading course…" />
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    )
  }

  // Patch the module in place rather than refetching the whole course — a full
  // reload() flips this page back to its loading state, unmounting QuizPanel and
  // wiping the just-submitted score/feedback before the learner can see it.
  function handleQuizResult(moduleId, res) {
    setCourse((prev) => ({
      ...prev,
      modules: prev.modules.map((m) =>
        m.id === moduleId
          ? { ...m, quiz_completed: res.passed, quiz_score: res.score, quiz_total: res.total }
          : m,
      ),
    }))
  }

  const completedSet = new Set(course.completed_lesson_ids ?? [])
  const { percent, lessonsCompleted, lessonsTotal } = courseProgress(course)
  const { completedModules, totalModules } = courseModuleStats(course)

  return (
    <div className="flex">
      <CourseSidebar course={course} />

      <motion.div
        className="mx-auto max-w-3xl flex-1 px-6 py-10"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <Link to="/courses" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Dashboard
        </Link>

        <div className="mt-3 flex flex-wrap gap-2">
          {course.level && (
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium capitalize text-primary-700">
              {course.level}
            </span>
          )}
          {course.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <h1 className="mt-3 font-display text-3xl font-bold text-slate-900">{course.title}</h1>
        <p className="mt-2 text-slate-500">{course.description}</p>

        <div className="mt-5 flex items-center gap-5 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            {course.modules.length} modules
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4" />
            {lessonsTotal} lessons
          </span>
        </div>

        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-primary-600 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {percent}% complete · {lessonsCompleted}/{lessonsTotal} lessons ·{' '}
            {completedModules}/{totalModules} modules
          </p>
        </div>

        <motion.div
          className="mt-8 flex flex-col gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {course.modules.map((module) => {
            const { allLessonsComplete } = moduleProgress(module, completedSet)
            return (
              <motion.div key={module.id} variants={fadeInUp}>
                <h2 className="font-display text-sm font-semibold text-slate-500">
                  {module.title}
                </h2>
                <QuizPanel
                  courseId={course._id}
                  module={module}
                  allLessonsComplete={allLessonsComplete}
                  onResult={(res) => handleQuizResult(module.id, res)}
                />
              </motion.div>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Course
