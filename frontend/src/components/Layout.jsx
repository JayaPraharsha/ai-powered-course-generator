import { Outlet } from "react-router-dom"
import { UIProvider } from "../context/UIContext"
import GlobalChatPanel from "./GlobalChatPanel"
import StreakMilestoneToast from "./StreakMilestoneToast"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

function Layout() {
  return (
    <UIProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
      <GlobalChatPanel />
      <StreakMilestoneToast />
    </UIProvider>
  )
}

export default Layout
