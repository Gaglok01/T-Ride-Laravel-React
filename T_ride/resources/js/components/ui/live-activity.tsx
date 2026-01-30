export function LiveActivity({ activities }: { activities: any[] }) {
  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-6 text-tride-text">Live Activity</h3>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {activities.length > 0 ? activities.map((item) => (
          <div
            key={item.id}
            className="bg-tride-hover/50 p-4 rounded-2xl flex items-center justify-between hover:bg-tride-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${
                item.status === 'completed' ? 'bg-green-500' : 
                item.status === 'in_progress' ? 'bg-blue-500' : 
                item.status === 'ongoing' ? 'bg-blue-500' : 'bg-tride-yellow'
              }`}></div>
              <div>
                <p className="text-sm font-medium text-tride-text">{item.type}: {item.user}</p>
                <p className="text-xs text-tride-text-muted">{item.driver} • {item.time}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase ${
              item.status === 'completed' ? 'bg-green-500/10 text-green-500' :
              item.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
              item.status === 'ongoing' ? 'bg-blue-500/10 text-blue-500' :
              'bg-tride-yellow/10 text-tride-yellow'
            }`}>
               {item.status?.replace('_', ' ')}
            </span>
          </div>
        )) : (
          <div className="text-center py-8 text-tride-text-muted">
            <p className="text-sm">No live activity at the moment</p>
          </div>
        )}
      </div>

      <button className="w-full mt-6 py-3.5 rounded-2xl border border-tride-border text-xs font-semibold text-tride-text hover:bg-tride-hover transition-colors">
        View All Live Trips
      </button>
    </div>
  )
}
