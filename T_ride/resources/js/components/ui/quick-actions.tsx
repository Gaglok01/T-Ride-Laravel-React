import { Car, UserPlus, Zap, Bell, BarChart, ShieldCheck } from "lucide-react"

const actions = [
  { label: 'Create Ride', icon: <Car size={20} /> },
  { label: 'Add Driver', icon: <UserPlus size={20} /> },
  { label: 'New Promotion', icon: <Zap size={20} /> },
  { label: 'Send Notification', icon: <Bell size={20} /> },
  { label: 'Generate Report', icon: <BarChart size={20} /> },
  { label: 'Security Audit', icon: <ShieldCheck size={20} /> },
]

export function QuickActions() {
  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
      <h3 className="text-xl font-bold text-tride-text mb-6">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, idx) => (
          <button key={idx} className="flex flex-col items-center justify-center gap-3 p-6 bg-tride-hover/30 rounded-2xl border border-tride-border/50 hover:bg-tride-yellow hover:border-tride-yellow hover:text-black transition-all group">
            <div className="group-hover:scale-110 transition-transform">
              {action.icon}
            </div>
            <span className="text-xs font-bold whitespace-nowrap">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
