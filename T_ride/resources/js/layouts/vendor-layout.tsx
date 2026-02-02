import { useState, useEffect } from "react"
import { Link, usePage, router } from "@inertiajs/react"
import { LayoutGrid, Package, Settings, LogOut, X, Menu, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import authService from "@/services/authService"
import { ThemeToggle } from "@/components/theme-toggle"
import { initializeTheme } from "@/hooks/use-appearance"

interface VendorLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
  actions?: React.ReactNode
}

// Initialize theme on module load
if (typeof window !== "undefined") {
  initializeTheme()
}

export function VendorLayout({ children, title, description, actions }: VendorLayoutProps) {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { url } = usePage()

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

  const isActive = (path: string) => {
    if (path === "/vendor" && url === "/vendor") return true
    if (path !== "/vendor" && url.startsWith(path)) return true
    return false
  }

  const handleNavClick = () => {
    setSidebarOpen(false)
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

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-tride-dark border-r border-tride-border flex flex-col p-6 transition-all duration-300 lg:translate-x-0 lg:static lg:shrink-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mb-12 flex justify-between items-center">
          <h2 className="text-2xl font-black tracking-tighter text-tride-text">
            T-RIDE <span className="inline-block w-2 h-2 bg-tride-yellow rounded-full ml-0.5"></span>
          </h2>
          
          {/* Mobile Close Button */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-tride-text-muted hover:text-tride-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 px-4 py-2 bg-tride-yellow/10 rounded-xl border border-tride-yellow/20">
          <span className="text-xs font-bold text-tride-yellow uppercase tracking-wider">Vendor Portal</span>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
          <NavItem onClick={handleNavClick} href="/vendor" icon={<LayoutGrid size={20} />} label="Dashboard" active={isActive("/vendor")} />
          <NavItem onClick={handleNavClick} href="/vendor/products" icon={<Package size={20} />} label="Products" active={isActive("/vendor/products")} />
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-6 border-t border-tride-border">
          <button
            onClick={handleLogout}
            className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/20 group-hover:bg-white/20 flex items-center justify-center transition-colors">
              <LogOut size={18} />
            </div>
            <div className="flex-1 text-left">
              <span className="font-semibold text-sm">Logout</span>
              <p className="text-xs text-red-400/60 group-hover:text-white/60">End your session</p>
            </div>
          </button>
        </div>
      </aside>

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
                <div className="w-7 h-7 bg-tride-yellow rounded-full flex items-center justify-center text-black font-bold text-xs cursor-default" title={user?.name || "Vendor"}>
                  {user ? getInitials(user.name) : "VN"}
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

function NavItem({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active ? "bg-tride-yellow text-black font-bold" : "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
