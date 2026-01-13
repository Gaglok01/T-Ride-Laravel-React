"use client"

import type React from "react"
import { Link, usePage } from "@inertiajs/react"
import { LayoutGrid, Users, LogOut, Settings, Car, Store, Shield, Package, Layers } from "lucide-react"

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
        <NavItem href="/admin/roles" icon={<Shield size={20} />} label="Roles & Permissions" active={isActive("/admin/roles")} />
        <NavItem href="/admin/drivers" icon={<Users size={20} />} label="Drivers" active={isActive("/admin/drivers")} />
        <NavItem href="/admin/rides" icon={<Car size={20} />} label="Riders" active={isActive("/admin/rides")} />
        <NavItem href="/admin/vendors" icon={<Store size={20} />} label="Vendor" active={isActive("/admin/vendors")} />
        <NavItem href="/admin/types" icon={<Car size={20} />} label="Types" active={isActive("/admin/types")} />
        <NavItem href="/admin/categories" icon={<Layers size={20} />} label="Categories" active={isActive("/admin/categories")} />
        <NavItem href="/admin/orders" icon={<Package size={20} />} label="Courier Orders" active={isActive("/admin/orders")} />
        <NavItem href="/admin/settings" icon={<Settings size={20} />} label="Settings" active={isActive("/admin/settings")} />
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={onLogout}
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
