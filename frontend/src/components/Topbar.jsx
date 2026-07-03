import { Link } from "react-router-dom"

function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center border-b border-slate-200 px-4 sm:hidden dark:border-white/10">
      <Link to="/" className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
          T
        </span>
        <span className="font-display text-sm font-semibold text-slate-800 dark:text-slate-100">
          Text-to-Learn
        </span>
      </Link>
    </header>
  )
}

export default Topbar
