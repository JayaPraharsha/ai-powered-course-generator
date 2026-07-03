import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCourse } from '../utils/api'
import useFetch from '../hooks/useFetch'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'
import { fadeInUp, staggerContainer } from '../utils/motion'

function Course() {
  const { courseId } = useParams()
  const { data: course, status, error, reload } = useFetch(() => getCourse(courseId), [courseId])

  if (status === 'loading') return <LoadingSpinner label="Loading course…" />
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    )
  }

  return (
    <motion.div
      className="mx-auto max-w-3xl px-6 py-12"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
    >
      <div className="flex flex-wrap gap-2">
        {course.tags?.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
        {course.title}
      </h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{course.description}</p>

      <motion.div
        className="mt-10 flex flex-col gap-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {course.modules.map((module, mi) => (
          <motion.div key={module.id} variants={fadeInUp}>
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              Module {mi + 1} — {module.title}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {module.lessons.map((lesson, li) => (
                <li key={lesson.id}>
                  <Link
                    to={`/course/${course._id}/lesson/${lesson.id}`}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition hover:border-primary-300 hover:shadow-glow dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-primary-500/40"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        {li + 1}
                      </span>
                      <span className="text-slate-700 group-hover:text-primary-700 dark:text-slate-200 dark:group-hover:text-primary-300">
                        {lesson.title}
                      </span>
                    </span>
                    {lesson.is_enriched && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success-500" title="Ready" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Course
