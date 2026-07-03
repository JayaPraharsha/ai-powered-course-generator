import { useState } from 'react'
import MermaidDiagram from './MermaidDiagram'

function VisualAidPanel({ aids }) {
  const [failed, setFailed] = useState(() => new Set())

  if (!aids || aids.length === 0) return null
  const visibleAids = aids.filter((_, i) => !failed.has(i))
  if (visibleAids.length === 0) return null

  return (
    <section className="mt-12 border-t border-slate-200 pt-8 dark:border-white/10">
      <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
        Visual aids
      </h2>
      <div className="mt-4 flex flex-col gap-6">
        {aids.map(
          (aid, i) =>
            !failed.has(i) && (
              <div key={i} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{aid.title}</p>
                <div className="mt-3">
                  <MermaidDiagram
                    code={aid.data.mermaid}
                    onError={() => setFailed((prev) => new Set(prev).add(i))}
                  />
                </div>
              </div>
            ),
        )}
      </div>
    </section>
  )
}

export default VisualAidPanel
