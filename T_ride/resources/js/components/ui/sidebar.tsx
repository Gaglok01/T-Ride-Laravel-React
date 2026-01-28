"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"
import { Link, usePage } from "@inertiajs/react"
import { LayoutGrid, Users, LogOut, Settings, Car, Store, Shield, Package, Layers, Key, ShoppingBag, Ticket, DollarSign, Radio, CreditCard, X, Map, Percent, Menu, Gift } from "lucide-react"
import { cn } from "@/lib/utils"

// Sidebar Context for useSidebar hook
interface SidebarContextValue {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    // Return default values if not within a SidebarProvider
    return {
      state: "expanded" as const,
      open: true,
      setOpen: () => {},
      toggleSidebar: () => {}
    }
  }
  return context
}

// SidebarProvider component
interface SidebarProviderProps {
  children: React.ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [open, setOpen] = useState(defaultOpen)
  
  const value: SidebarContextValue = {
    state: open ? "expanded" : "collapsed",
    open,
    setOpen,
    toggleSidebar: () => setOpen(!open)
  }

  return (
    <SidebarContext.Provider value={value}>
      <div className="group/sidebar-wrapper flex min-h-svh w-full" data-sidebar-state={value.state}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// Main Sidebar component - supports both admin panel style and generic component style
interface SidebarProps {
  children?: React.ReactNode
  onLogout?: () => void
  isOpen?: boolean
  onClose?: () => void
  className?: string
  collapsible?: "icon" | "offcanvas" | "none"
  variant?: "default" | "inset" | "floating"
}

export function Sidebar({ 
  children,
  onLogout, 
  isOpen, 
  onClose, 
  className,
  collapsible,
  variant = "default"
}: SidebarProps) {
  const { url } = usePage()

  // If children are provided, use the generic sidebar component style
  if (children) {
    return (
      <aside 
        className={cn(
          "flex flex-col h-full bg-sidebar text-sidebar-foreground",
          variant === "inset" && "rounded-lg border border-sidebar-border",
          className
        )}
        data-collapsible={collapsible}
        data-variant={variant}
      >
        {children}
      </aside>
    )
  }

  // Otherwise, use the admin panel sidebar style
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
        "fixed inset-y-0 left-0 z-50 w-64 bg-tride-dark border-r border-tride-border flex flex-col p-6 transition-all duration-300 lg:translate-x-0 lg:static lg:shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      <div className="mb-12 flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tighter text-tride-text">
          T-RIDE <span className="inline-block w-2 h-2 bg-tride-yellow rounded-full ml-0.5"></span>
        </h2>
        
        {/* Mobile Close Button */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-tride-text-muted hover:text-tride-text transition-colors"
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
        <NavItem onClick={handleNavClick} href="/admin/cities-zones" icon={<Map size={20} />} label="Cities & Zones" active={isActive("/admin/cities-zones")} />
        <NavItem onClick={handleNavClick} href="/admin/commission-management" icon={<Percent size={20} />} label="Commissions" active={isActive("/admin/commission-management")} />
        <NavItem onClick={handleNavClick} href="/admin/promotions" icon={<Ticket size={20} />} label="Promotions" active={isActive("/admin/promotions")} />
        <NavItem onClick={handleNavClick} href="/admin/referral-program" icon={<Gift size={20} />} label="Referral Program" active={isActive("/admin/referral-program")} />
        <NavItem onClick={handleNavClick} href="/admin/roles" icon={<Shield size={20} />} label="Roles & Permissions" active={isActive("/admin/roles")} />
        <NavItem onClick={handleNavClick} href="/admin/categories" icon={<Layers size={20} />} label="Categories" active={isActive("/admin/categories")} />
        <NavItem onClick={handleNavClick} href="/admin/types" icon={<Users size={20} />} label="Driver Types" active={isActive("/admin/types")} />
        <NavItem onClick={handleNavClick} href="/admin/payment-gateway" icon={<CreditCard size={20} />} label="Payment Gateway" active={isActive("/admin/payment-gateway")} />
        <NavItem onClick={handleNavClick} href="/admin/pricing" icon={<DollarSign size={20} />} label="Pricing" active={isActive("/admin/pricing")} />
        <NavItem onClick={handleNavClick} href="/admin/dispatch" icon={<Radio size={20} />} label="Dispatch" active={isActive("/admin/dispatch")} />
        <NavItem onClick={handleNavClick} href="/admin/settings" icon={<Settings size={20} />} label="Settings" active={isActive("/admin/settings")} />
      </nav>

      {/* Logout Button */}
      <div className="mt-auto pt-6 border-t border-tride-border">
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
        active ? "bg-tride-yellow text-black font-bold" : "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}

// SidebarInset component for content area next to sidebar
interface SidebarInsetProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export function SidebarInset({ children, className, ...props }: SidebarInsetProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-auto lg:ml-64",
        className
      )}
      {...props}
    >
      {children}
    </main>
  )
}

// SidebarGroup component
interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarGroup({ children, className, ...props }: SidebarGroupProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  )
}

// SidebarGroupContent component
interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarGroupContent({ children, className, ...props }: SidebarGroupContentProps) {
  return (
    <div className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  )
}

// SidebarGroupLabel component
interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarGroupLabel({ children, className, ...props }: SidebarGroupLabelProps) {
  return (
    <div 
      className={cn(
        "px-3 py-2 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

// SidebarMenu component
interface SidebarMenuProps extends React.HTMLAttributes<HTMLUListElement> {
  children?: React.ReactNode
}

export function SidebarMenu({ children, className, ...props }: SidebarMenuProps) {
  return (
    <ul className={cn("flex flex-col gap-1", className)} {...props}>
      {children}
    </ul>
  )
}

// SidebarMenuItem component
interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode
}

export function SidebarMenuItem({ children, className, ...props }: SidebarMenuItemProps) {
  return (
    <li className={cn("", className)} {...props}>
      {children}
    </li>
  )
}

// SidebarMenuButton component
interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  asChild?: boolean
  size?: "default" | "sm" | "lg"
  isActive?: boolean
  tooltip?: { children: React.ReactNode } | React.ReactNode
}

export function SidebarMenuButton({ 
  children, 
  className, 
  asChild, 
  size = "default",
  isActive,
  tooltip,
  ...props 
}: SidebarMenuButtonProps) {
  const sizeClasses = {
    default: "px-3 py-2",
    sm: "px-2 py-1 text-sm",
    lg: "px-4 py-3"
  }

  const baseClasses = cn(
    "flex items-center gap-2 rounded-lg transition-colors w-full text-left",
    sizeClasses[size],
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground" 
      : "hover:bg-white/5",
    className
  )

  if (asChild) {
    return (
      <div className={baseClasses}>
        {children}
      </div>
    )
  }
  
  return (
    <button className={baseClasses} {...props}>
      {children}
    </button>
  )
}

// SidebarHeader component
interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarHeader({ children, className, ...props }: SidebarHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2 p-2", className)} {...props}>
      {children}
    </div>
  )
}

// SidebarContent component
interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarContent({ children, className, ...props }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-auto", className)} {...props}>
      {children}
    </div>
  )
}

// SidebarFooter component
interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode
}

export function SidebarFooter({ children, className, ...props }: SidebarFooterProps) {
  return (
    <div className={cn("flex flex-col gap-2 p-2", className)} {...props}>
      {children}
    </div>
  )
}

// SidebarTrigger component
interface SidebarTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function SidebarTrigger({ className, ...props }: SidebarTriggerProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
        className
      )}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </button>
  )
}
