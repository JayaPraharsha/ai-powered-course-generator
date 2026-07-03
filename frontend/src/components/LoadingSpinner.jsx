import { motion } from "framer-motion"

function LoadingSpinner({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-500 dark:text-slate-400">
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-primary-200 border-t-primary-600 dark:border-primary-900 dark:border-t-primary-400"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}

export default LoadingSpinner
