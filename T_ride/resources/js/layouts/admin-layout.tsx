import { useState, useEffect } from "react"
import { Sidebar } from "../components/ui/sidebar"
import { Bell, Menu } from "lucide-react"
import { router } from "@inertiajs/react"
import authService from "@/services/authService"
import { ThemeToggle } from "@/components/theme-toggle"
import { initializeTheme } from "@/hooks/use-appearance"

interface AdminLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

// Initialize theme on module load
if (typeof window !== "undefined") {
  initializeTheme()
}

export function AdminLayout({ children, title, description, actions }: AdminLayoutProps) {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      <div className="flex min-h-screen bg-tride-dark items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-tride-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-tride-text-muted">Loading...</p>
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
    <div className="flex min-h-screen bg-tride-dark text-tride-text font-sans transition-colors duration-300">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        onLogout={handleLogout} 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <main className="flex-1 p-4 md:p-8 overflow-auto w-full transition-all duration-300">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 md:mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-tride-text-muted hover:text-tride-text hover:bg-tride-hover rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{title || "Dashboard"}</h1>
              {description && <p className="text-sm md:text-base text-tride-text-muted mt-1">{description}</p>}
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4">
            {actions}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              <button className="p-2 hover:bg-tride-hover rounded-full relative transition-colors">
                <Bell size={20} className="text-tride-text-muted" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-tride-dark"></span>
              </button>
              <div className="flex items-center gap-2 bg-tride-card px-3 py-1.5 rounded-full border border-tride-border">
                <div className="w-7 h-7 bg-tride-yellow rounded-full flex items-center justify-center text-black font-bold text-xs cursor-default" title={user?.name || "Admin"}>
                  {user ? getInitials(user.name) : "AD"}
                </div>
                {user && <span className="text-sm font-medium pr-1 hidden sm:inline-block">{user.name}</span>}
              </div>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
