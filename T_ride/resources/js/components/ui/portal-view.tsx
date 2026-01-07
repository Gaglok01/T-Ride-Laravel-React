"use client"

import type React from "react"

import { User, Car, LayoutGrid } from "lucide-react"

interface PortalViewProps {
  onSelectAdmin: () => void
}

export function PortalView({ onSelectAdmin }: PortalViewProps) {
  return (
    <div className="min-h-screen bg-tride-yellow flex flex-col items-center justify-center p-6 text-black">
      <div className="max-w-4xl w-full text-center space-y-8">
        <h1 className="text-7xl font-black tracking-tighter">
          T-RIDE <span className="inline-block w-4 h-4 bg-black rounded-full ml-1"></span>
        </h1>

        <p className="text-xl font-medium max-w-lg mx-auto leading-tight">
          The all-in-one platform for mobility, delivery, and logistics. Select a portal to explore the wireframes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <PortalCard
            icon={<User size={48} />}
            title="Rider App"
            description="Book rides, order food, and send packages."
          />
          <PortalCard
            icon={<Car size={48} />}
            title="Driver Portal"
            description="Accept requests, navigate, and track earnings."
          />
          <PortalCard
            icon={<LayoutGrid size={48} />}
            title="Admin Panel"
            description="Manage operations, users, and finances."
            onClick={onSelectAdmin}
            isPrimary
          />
        </div>
      </div>
    </div>
  )
}

function PortalCard({
  icon,
  title,
  description,
  onClick,
  isPrimary,
}: { icon: React.ReactNode; title: string; description: string; onClick?: () => void; isPrimary?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center p-10 rounded-[40px] transition-transform hover:scale-105 text-white ${isPrimary ? "bg-black" : "bg-black"}`}
    >
      <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mb-6">
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-sm opacity-70 leading-relaxed text-center">{description}</p>
    </button>
  )
}
