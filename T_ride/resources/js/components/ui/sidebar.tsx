"use client"

import type React from "react"

import { LayoutGrid, Map, Users, UserCheck, Wallet, Headphones, LogOut } from "lucide-react"

export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="w-64 border-r border-white/5 flex flex-col p-6 bg-tride-dark shrink-0">
      <div className="mb-12">
        <h2 className="text-2xl font-black tracking-tighter">
          T-RIDE <span className="inline-block w-2 h-2 bg-tride-yellow rounded-full ml-0.5"></span>
        </h2>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem icon={<LayoutGrid size={20} />} label="Dashboard" active />
        <NavItem icon={<Map size={20} />} label="Live Map" />
        <NavItem icon={<Users size={20} />} label="Drivers" />
        <NavItem icon={<UserCheck size={20} />} label="Riders" />
        <NavItem icon={<Wallet size={20} />} label="Finance" />
        <NavItem icon={<Headphones size={20} />} label="Support" />
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors p-3 mt-auto"
      >
        <LogOut size={20} />
        <span className="font-semibold">Logout</span>
      </button>
    </aside>
  )
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active ? "bg-tride-yellow text-black font-bold" : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
