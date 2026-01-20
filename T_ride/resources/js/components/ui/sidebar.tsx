"use client"

import type React from "react"
import { Link, usePage } from "@inertiajs/react"
import { LayoutGrid, Users, LogOut, Settings, Car, Store, Shield, Package, Layers, Key, ShoppingBag, Ticket, DollarSign, Radio, CreditCard, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  onLogout: () => void
  isOpen?: boolean
  onClose?: () => void
  className?: string
}

export function Sidebar({ onLogout, isOpen, onClose, className }: SidebarProps) {
  const { url } = usePage()

  const isActive = (path: string) => {
    if (path === "/admin" && url === "/admin") return true
    if (path !== "/admin" && url.startsWith(path)) return true
    return false
  }

  const handleNavClick = () => {
    if (onClose) onClose()
  }

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-tride-dark border-r border-white/5 flex flex-col p-6 transition-transform duration-300 lg:translate-x-0 lg:static lg:shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="mb-12 flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tighter text-white">
          T-RIDE <span className="inline-block w-2 h-2 bg-tride-yellow rounded-full ml-0.5"></span>
        </h2>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-white/50 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        <NavItem onClick={handleNavClick} href="/admin" icon={<LayoutGrid size={20} />} label="Dashboard" active={isActive("/admin")} />
        <NavItem onClick={handleNavClick} href="/admin/users" icon={<Users size={20} />} label="User Management" active={isActive("/admin/users")} />
        <NavItem onClick={handleNavClick} href="/admin/drivers" icon={<Users size={20} />} label="Drivers" active={isActive("/admin/drivers")} />
        <NavItem onClick={handleNavClick} href="/admin/rides" icon={<Car size={20} />} label="Rides" active={isActive("/admin/rides")} />
        <NavItem onClick={handleNavClick} href="/admin/orders" icon={<Package size={20} />} label="Courier Orders" active={isActive("/admin/orders")} />
        <NavItem onClick={handleNavClick} href="/admin/delivery-orders" icon={<ShoppingBag size={20} />} label="Delivery Orders" active={isActive("/admin/delivery-orders")} />
        <NavItem onClick={handleNavClick} href="/admin/vendors" icon={<Store size={20} />} label="Vendor" active={isActive("/admin/vendors")} />
        <NavItem onClick={handleNavClick} href="/admin/rents" icon={<Key size={20} />} label="Rent Management" active={isActive("/admin/rents")} />
        <NavItem onClick={handleNavClick} href="/admin/promotions" icon={<Ticket size={20} />} label="Promotions" active={isActive("/admin/promotions")} />
        <NavItem onClick={handleNavClick} href="/admin/roles" icon={<Shield size={20} />} label="Roles & Permissions" active={isActive("/admin/roles")} />
        <NavItem onClick={handleNavClick} href="/admin/categories" icon={<Layers size={20} />} label="Categories" active={isActive("/admin/categories")} />
        <NavItem onClick={handleNavClick} href="/admin/types" icon={<Users size={20} />} label="Driver Types" active={isActive("/admin/types")} />
        <NavItem onClick={handleNavClick} href="/admin/payment-gateway" icon={<CreditCard size={20} />} label="Payment Gateway" active={isActive("/admin/payment-gateway")} />
        <NavItem onClick={handleNavClick} href="/admin/pricing" icon={<DollarSign size={20} />} label="Pricing" active={isActive("/admin/pricing")} />
        <NavItem onClick={handleNavClick} href="/admin/dispatch" icon={<Radio size={20} />} label="Dispatch" active={isActive("/admin/dispatch")} />
        <NavItem onClick={handleNavClick} href="/admin/settings" icon={<Settings size={20} />} label="Settings" active={isActive("/admin/settings")} />
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

function NavItem({ href, icon, label, active, onClick }: { href: string; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
        active ? "bg-tride-yellow text-black font-bold" : "text-white/50 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
