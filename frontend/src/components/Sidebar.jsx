import { Link, NavLink } from 'react-router-dom'
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, PlusCircle } from 'lucide-react'
import { useUI } from '../context/UIContext'

const navItems = [
  { to: '/', label: 'New Course', icon: PlusCircle, end: true },
  { to: '/courses', label: 'Dashboard', icon: LayoutDashboard },
]

function Sidebar() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUI()

  return (
    <aside
      className={`hidden shrink-0 flex-col border-r border-slate-200 bg-white py-6 transition-[width] duration-200 sm:flex ${
        sidebarCollapsed ? 'w-16 px-2' : 'w-64 px-5'
      }`}
    >
      <div className={`flex items-center px-1 ${sidebarCollapsed ? 'flex-col gap-3' : 'justify-between'}`}>
        <Link to="/" className={`flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-glow">
            L
          </span>
          {!sidebarCollapsed && (
            <span className="font-display text-lg font-semibold text-slate-900">Learnify AI</span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="mt-8 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={sidebarCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-sm font-medium transition ${
                sidebarCollapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && label}
          </NavLink>
        ))}
      </nav>

      {!sidebarCollapsed && (
        <div className="mt-auto px-1 text-xs text-slate-400">Powered by Gemini &amp; CrewAI</div>
      )}
    </aside>
  )
}

export default Sidebar
