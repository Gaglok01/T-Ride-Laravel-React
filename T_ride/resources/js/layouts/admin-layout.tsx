import { useState, useEffect } from "react"
import { Sidebar } from "../components/ui/sidebar"
import { Bell } from "lucide-react"
import { router } from "@inertiajs/react"
import authService from "@/services/authService"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      // User is not logged in, redirect to login
      router.visit("/admin/login")
      return
    }
    
    const currentUser = authService.getUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setIsLoading(false)
  }, [])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-tride-dark items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tride-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/50">Loading...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    authService.logout()
    router.visit("/admin/login")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-tride-dark font-bold text-xs cursor-default" title={user?.name || "Admin"}>
                {user ? getInitials(user.name) : "AD"}
              </div>
              {user && <span className="text-sm font-medium pr-1">{user.name}</span>}
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
