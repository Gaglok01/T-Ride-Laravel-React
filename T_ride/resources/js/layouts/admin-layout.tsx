import type React from "react"
import { Sidebar } from "../components/ui/sidebar"
import { Bell } from "lucide-react"
import { router } from "@inertiajs/react"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const handleLogout = () => {
    router.visit("/") // Or whatever logic for logout
  }

  return (
    <div className="flex min-h-screen bg-tride-dark text-white font-sans">
      <Sidebar onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{title || "Dashboard"}</h1>
            {description && <p className="text-white/50 mt-1">{description}</p>}
          </div>
          
          <div className="flex items-center gap-4">
            {actions}
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell size={20} className="text-white/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-tride-dark"></span>
            </button>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-tride-dark font-bold text-xs">
                AD
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
