import { Link } from "react-router-dom"

function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white/60 px-5 py-6 backdrop-blur-sm sm:flex dark:border-white/10 dark:bg-white/[0.02]">
      <Link to="/" className="flex items-center gap-2 px-1">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-glow">
          T
        </span>
        <span className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
          Text-to-Learn
        </span>
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        <Link
          to="/"
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-primary-50 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-primary-500/10 dark:hover:text-primary-300"
        >
          New Course
        </Link>
      </nav>

      <div className="mt-auto px-1 text-xs text-slate-400 dark:text-slate-500">
        Powered by Gemini &amp; CrewAI
      </div>
    </aside>
  )
}

export default Sidebar
