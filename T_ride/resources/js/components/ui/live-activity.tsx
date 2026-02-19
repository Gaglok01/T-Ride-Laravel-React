import { Activity } from "lucide-react"

export function LiveActivity({ activities }: { activities: any[] }) {
  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl h-[400px] flex flex-col shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-tride-text">Live Activity</h3>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-tride-text-muted">Live</span>
        </div>
      </div>

      <div className="space-y-0 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-tride-border scrollbar-track-transparent">
        {activities.length > 0 ? (
          <div className="divide-y divide-tride-border/50">
            {activities.map((item) => (
              <div
                key={item.id}
                className="py-4 first:pt-0 last:pb-0 group transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-lg ${
                    item.type === 'Ride' ? 'bg-blue-500/10 text-blue-500' :
                    item.type === 'Delivery' ? 'bg-green-500/10 text-green-500' :
                    item.type === 'Issue' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <Activity size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-tride-text line-clamp-1">
                      {item.type === 'Ride' ? `New ride ${item.id.split('-')[1]} started in Lagos` : 
                       item.type === 'Delivery' ? `Order ${item.id.split('-')[1]} delivered successfully` :
                       `${item.type}: ${item.user}`}
                    </p>
                    <p className="text-xs text-tride-text-muted mt-0.5">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-tride-text-muted opacity-50">
            <Activity size={32} className="mb-2" />
            <p className="text-sm">No live activity</p>
          </div>
        )}
      </div>
    </div>
  )
}

