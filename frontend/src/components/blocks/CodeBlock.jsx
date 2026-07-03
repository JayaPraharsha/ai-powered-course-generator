function CodeBlock({ block }) {
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
      {block.language && (
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-1.5 font-mono text-xs text-slate-400 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-500">
          {block.language}
        </div>
      )}
      <pre className="overflow-x-auto bg-slate-900 px-4 py-3 text-sm dark:bg-black/40">
        <code className="font-mono text-slate-100">{block.text}</code>
      </pre>
    </div>
  )
}

export default CodeBlock
