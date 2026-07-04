import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PromptForm from '../components/PromptForm'
import { fadeInUp } from '../utils/motion'

function Home() {
  const navigate = useNavigate()

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60%_60%_at_50%_0%,theme(colors.primary.100),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 -left-24 -z-10 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 -right-24 -z-10 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl"
      />

      <motion.div
        className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center"
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
      >
        <span className="mb-4 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
          AI-powered course builder
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Learnify <span className="text-primary-600">AI</span>
        </h1>
        <p className="mt-3 max-w-md text-slate-500">
          Describe a topic. A crew of AI agents builds you a full course.
        </p>

        <div className="mt-10 w-full rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-glow backdrop-blur-sm">
          <PromptForm onGenerated={(course) => navigate(`/course/${course._id}`)} />
        </div>
      </motion.div>
    </div>
  )
}

export default Home
