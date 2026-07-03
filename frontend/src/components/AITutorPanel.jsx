import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { askTutor } from '../utils/api'

function AITutorPanel({ lessonId, open, onClose }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [pending, setPending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  async function handleSend(e) {
    e.preventDefault()
    const q = question.trim()
    if (!q || pending) return
    setQuestion('')
    setMessages((m) => [...m, { role: 'user', text: q }])
    setPending(true)
    try {
      const { answer } = await askTutor(lessonId, q)
      setMessages((m) => [...m, { role: 'tutor', text: answer }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'tutor', text: `Sorry — ${err.message}`, isError: true }])
    } finally {
      setPending(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
          className="fixed top-0 right-0 z-20 flex h-full w-full flex-col border-l border-slate-200 bg-white shadow-2xl sm:w-96 dark:border-white/10 dark:bg-[#0f0e17]"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
            <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
              🤖 AI Tutor
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200"
              aria-label="Close tutor"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500">
                Ask anything about this lesson — I'll answer grounded in what you're reading.
              </p>
            )}
            <div className="flex flex-col gap-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === 'user'
                      ? 'ml-auto bg-primary-600 text-white'
                      : m.isError
                        ? 'bg-danger-500/10 text-danger-600 dark:text-red-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              ))}
              {pending && (
                <div className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-2 text-sm dark:bg-white/[0.06]">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSend}
            className="flex gap-2 border-t border-slate-200 p-3 dark:border-white/10"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question…"
              disabled={pending}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-primary-400 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={pending || !question.trim()}
              className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

export default AITutorPanel
