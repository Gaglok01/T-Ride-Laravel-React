import { AdminLayout } from "@/layouts/admin-layout"
import { Settings, Shield, Bell, CreditCard, MapPin, Globe, Building2, Activity } from "lucide-react"

export default function SettingsPage() {
  return (
    <AdminLayout
      title="Settings"
      description="Platform configuration"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SettingCard 
          icon={<Settings size={28} />}
          title="General"
          description="Basic platform settings"
        />
        <SettingCard 
          icon={<Shield size={28} />}
          title="Users & Roles"
          description="Admin permissions"
        />
        <SettingCard 
          icon={<Bell size={28} />}
          title="Notifications"
          description="SMS, Push, Email settings"
        />
        <SettingCard 
          icon={<CreditCard size={28} />}
          title="Payments"
          description="Payment gateway config"
        />
        <SettingCard 
          icon={<MapPin size={28} />}
          title="Maps & Location"
          description="Map provider settings"
        />
        <SettingCard 
          icon={<Globe size={28} />}
          title="Languages"
          description="Multi-language support"
        />
        <SettingCard 
          icon={<Building2 size={28} />}
          title="Cities"
          description="Service area management"
        />
        <SettingCard 
          icon={<Activity size={28} />}
          title="Integrations"
          description="Third-party services"
        />
      </div>
    </AdminLayout>
  )
}

function SettingCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
    return (
        <button className="bg-tride-card border border-tride-border p-8 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-tride-hover transition-all hover:scale-[1.02] group shadow-sm">
            <div className="w-16 h-16 bg-tride-hover rounded-2xl flex items-center justify-center mb-6 text-tride-text group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <h3 className="text-lg font-bold mb-2 text-tride-text">{title}</h3>
            <p className="text-sm text-tride-text-muted">{description}</p>
        </button>
    )
}
