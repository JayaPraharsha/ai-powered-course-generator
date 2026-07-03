import renderInline from '../../utils/renderInline'

function ExerciseBlock({ block }) {
  return (
    <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50/60 px-4 py-3 dark:border-primary-500/20 dark:bg-primary-500/[0.06]">
      <p className="text-xs font-semibold tracking-wide text-primary-700 uppercase dark:text-primary-300">
        Try it
      </p>
      <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{renderInline(block.text)}</p>
    </div>
  )
}

export default ExerciseBlock
