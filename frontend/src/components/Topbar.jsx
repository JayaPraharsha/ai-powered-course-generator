import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, MessageCircle } from 'lucide-react'
import { useUI } from '../context/UIContext'
import AccountMenu from './AccountMenu'
import MobileNav from './MobileNav'

function Topbar() {
  const { sidebarCollapsed, setSidebarCollapsed, setChatOpen } = useUI()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  function handleMenuToggle() {
    // Each half is naturally inert on the other breakpoint — MobileNav renders
    // sm:hidden, and Sidebar's collapsed state only has visible effect on sm:+.
    setMobileNavOpen(true)
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleMenuToggle}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white">
              L
            </span>
            <span className="font-display text-sm font-semibold text-slate-800">Learnify AI</span>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
            aria-label="Ask a doubt"
            title="Ask a doubt"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
          <AccountMenu />
        </div>
      </header>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
    </>
  )
}

export default Topbar
