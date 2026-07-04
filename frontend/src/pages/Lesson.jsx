import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CircleCheck, Sparkles } from 'lucide-react'
import { getCourse, getLesson, setLessonCompleted } from '../utils/api'
import useFetch from '../hooks/useFetch'
import { useAuth } from '../context/AuthContext'
import { useForceSidebarCollapsed } from '../context/UIContext'
import LessonRenderer from '../components/LessonRenderer'
import VideoPanel from '../components/VideoPanel'
import HinglishPanel from '../components/HinglishPanel'
import VisualAidPanel from '../components/VisualAidPanel'
import AITutorPanel from '../components/AITutorPanel'
import CourseSidebar from '../components/CourseSidebar'
import RewardPopup from '../components/RewardPopup'
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
  const { courseId, lessonId } = useParams()
  const { data: lesson, status, error, reload } = useFetch(() => getLesson(lessonId), [lessonId])
  const { data: course, setData: setCourse } = useFetch(() => getCourse(courseId), [courseId])
  const { updateUser } = useAuth()
  const [tutorOpen, setTutorOpen] = useState(false)
  const [togglingComplete, setTogglingComplete] = useState(false)
  const [reward, setReward] = useState(null)
  useForceSidebarCollapsed()

  const completed = (course?.completed_lesson_ids ?? []).includes(lessonId)

  async function toggleComplete() {
    if (togglingComplete) return
    const next = !completed
    setTogglingComplete(true)
    try {
      const result = await setLessonCompleted(lessonId, next)
      setCourse((prev) => {
        if (!prev) return prev
        const ids = new Set(prev.completed_lesson_ids ?? [])
        if (next) ids.add(lessonId)
        else ids.delete(lessonId)
        return { ...prev, completed_lesson_ids: [...ids] }
      })
      if (result.xp_total !== undefined) {
        updateUser({
          xp: result.xp_total,
          gold: result.gold_total,
          level: result.level,
          xp_into_level: result.xp_into_level,
          xp_to_next: result.xp_to_next,
        })
        if (next) {
          setReward({
            xpAwarded: result.xp_awarded,
            goldAwarded: result.gold_awarded,
            level: result.level,
            leveledUp: result.leveled_up,
          })
        }
      }
    } catch {
      // non-critical — leave state unchanged on failure
    } finally {
      setTogglingComplete(false)
    }
  }

  if (status === 'loading') return <LessonSkeleton />
  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    )
  }

  return (
    <div className="flex">
      {course && <CourseSidebar course={course} activeLessonId={lessonId} />}

      <motion.div className="flex-1" initial="hidden" animate="visible" variants={fadeInUp}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-6 py-3 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              to={`/course/${courseId}`}
              className="shrink-0 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Back to course"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="truncate text-sm font-medium text-slate-700">{lesson.title}</span>
          </div>
          <button
            type="button"
            onClick={() => setTutorOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-500"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>
        </div>

        <div className="mx-auto max-w-3xl px-6 py-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="font-display text-3xl font-bold text-slate-900">{lesson.title}</h1>
            <button
              type="button"
              onClick={toggleComplete}
              disabled={togglingComplete}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
                completed
                  ? 'bg-success-500/10 text-success-600 hover:bg-success-500/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-700'
              }`}
            >
              <CircleCheck className="h-4 w-4" />
              {completed ? 'Completed' : 'Mark as Complete'}
            </button>
          </div>

          {lesson.objectives?.length > 0 && (
            <ul className="mt-4 flex flex-col gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
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
          <VideoPanel courseId={courseId} lessonId={lessonId} videos={lesson.videos} />
          <HinglishPanel lessonId={lessonId} initialHinglish={lesson.hinglish} />
        </div>

        <AITutorPanel lessonId={lessonId} open={tutorOpen} onClose={() => setTutorOpen(false)} />
      </motion.div>

      <RewardPopup reward={reward} onClose={() => setReward(null)} />
    </div>
  )
}

export default Lesson
