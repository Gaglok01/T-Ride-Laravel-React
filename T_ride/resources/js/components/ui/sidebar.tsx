"use client"

import type React from "react"
import { Link, usePage } from "@inertiajs/react"
import { LayoutGrid, Map, Users, Wallet, Headphones, LogOut, Settings, Car, Store } from "lucide-react"

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  const { url } = usePage()

  const isActive = (path: string) => {
    if (path === "/admin" && url === "/admin") return true
    if (path !== "/admin" && url.startsWith(path)) return true
    return false
  }

  return (
    <aside className="w-64 border-r border-white/5 flex flex-col p-6 bg-tride-dark shrink-0">
      <div className="mb-12">
        <h2 className="text-2xl font-black tracking-tighter">
          T-RIDE <span className="inline-block w-2 h-2 bg-tride-yellow rounded-full ml-0.5"></span>
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem href="/admin" icon={<LayoutGrid size={20} />} label="Dashboard" active={isActive("/admin")} />
        <NavItem href="/admin/users" icon={<Users size={20} />} label="User Management" active={isActive("/admin/users")} />
        <NavItem href="/admin/drivers" icon={<Users size={20} />} label="Drivers" active={isActive("/admin/drivers")} />
        <NavItem href="/admin/rides" icon={<Car size={20} />} label="Riders" active={isActive("/admin/rides")} />
        <NavItem href="/admin/vendors" icon={<Store size={20} />} label="Vendor" active={isActive("/admin/vendors")} />
        <NavItem href="#" icon={<Map size={20} />} label="Live Map" />
        <NavItem href="#" icon={<Wallet size={20} />} label="Finance" />
        <NavItem href="#" icon={<Headphones size={20} />} label="Support" />
        <NavItem href="/admin/settings" icon={<Settings size={20} />} label="Settings" active={isActive("/admin/settings")} />
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors p-3 mt-auto w-full"
      >
        <LogOut size={20} />
        <span className="font-semibold">Logout</span>
      </button>
    </aside>
  )
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active ? "bg-tride-yellow text-black font-bold" : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
