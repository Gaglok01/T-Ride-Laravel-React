import { Server, Database, CreditCard, Map, Bell, Wifi } from "lucide-react"

const systems = [
  { name: 'API Gateway', status: '99.98%', icon: <Server size={18} />, color: 'green' },
  { name: 'Database', status: '99.99%', icon: <Database size={18} />, color: 'green' },
  { name: 'Payment Services', status: '99.95%', icon: <CreditCard size={18} />, color: 'green' },
  { name: 'Maps & Location', status: '98.5%', icon: <Map size={18} />, color: 'amber' },
  { name: 'Push Notifications', status: '99.9%', icon: <Bell size={18} />, color: 'green' },
  { name: 'Real-time Tracking', status: '99.97%', icon: <Wifi size={18} />, color: 'green' },
]

export function SystemHealth() {
  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm h-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-tride-text">System Health</h3>
        <p className="text-sm text-tride-text-muted">Infrastructure status</p>
      </div>

      <div className="space-y-4">
        {systems.map((system, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="text-tride-text-muted group-hover:text-tride-yellow transition-colors">
                {system.icon}
              </div>
              <span className="text-sm font-medium text-tride-text">{system.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-tride-text">{system.status}</span>
              <div className={`w-2 h-2 rounded-full ${system.color === 'green' ? 'bg-green-500' : 'bg-amber-500'}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-tride-border/50">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-tride-text-muted">Overall Uptime</span>
          <span className="text-sm font-bold text-tride-text">99.72%</span>
        </div>
        <div className="w-full bg-tride-hover h-2 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full w-[99.72%] rounded-full" />
        </div>
      </div>
    </div>
  )
}
