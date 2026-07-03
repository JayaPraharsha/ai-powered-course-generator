import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { getLesson } from '../utils/api'
import useFetch from '../hooks/useFetch'
import LessonRenderer from '../components/LessonRenderer'
import QuizPanel from '../components/QuizPanel'
import VideoPanel from '../components/VideoPanel'
import HinglishPanel from '../components/HinglishPanel'
import VisualAidPanel from '../components/VisualAidPanel'
import AITutorPanel from '../components/AITutorPanel'
import ErrorMessage from '../components/ErrorMessage'
import Skeleton from '../components/Skeleton'
import { fadeInUp } from '../utils/motion'

function LessonSkeleton() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="mt-4 h-16 w-full" />
      <div className="mt-10 flex flex-col gap-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    </div>
  )
}

function Lesson() {
  const { lessonId } = useParams()
  const { data: lesson, status, error, reload } = useFetch(() => getLesson(lessonId), [lessonId])
  const [tutorOpen, setTutorOpen] = useState(false)

  if (status === 'loading') return <LessonSkeleton />
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="relative">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-100">
          {lesson.title}
        </h1>

        {lesson.objectives?.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300">
            {lesson.objectives.map((o, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary-500">•</span>
                {o}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <LessonRenderer content={lesson.content} />
        </div>

        <VisualAidPanel aids={lesson.visual_aids} />
        <VideoPanel lessonId={lessonId} videos={lesson.videos} />
        <QuizPanel lessonId={lessonId} quiz={lesson.quiz} />
        <HinglishPanel lessonId={lessonId} initialHinglish={lesson.hinglish} />
      </div>

      <button
        type="button"
        onClick={() => setTutorOpen(true)}
        className="fixed right-6 bottom-6 z-10 flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-500"
      >
        🤖 Ask AI Tutor
      </button>

      <AITutorPanel lessonId={lessonId} open={tutorOpen} onClose={() => setTutorOpen(false)} />
    </motion.div>
  )
}

export default Lesson
