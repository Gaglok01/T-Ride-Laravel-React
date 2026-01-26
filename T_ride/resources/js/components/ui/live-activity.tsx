export function LiveActivity({ activities }: { activities: any[] }) {
  return (
    <div className="bg-tride-card border border-white/5 p-6 rounded-[32px] h-full flex flex-col">
      <h3 className="text-lg font-bold mb-6">Live Activity</h3>

      <div className="space-y-4 flex-1">
        {activities.map((item) => (
          <div
            key={item.id}
            className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                item.status === 'completed' ? 'bg-green-500' : 
                item.status === 'ongoing' ? 'bg-blue-500' : 'bg-tride-yellow'
              }`}></div>
              <div>
                <p className="text-sm font-bold">{item.type}: {item.user}</p>
                <p className="text-[10px] text-white/40">{item.status} • {item.time}</p>
              </div>
            </div>
            <p className="text-[10px] font-bold text-tride-yellow bg-tride-yellow/10 px-2 py-1 rounded-lg uppercase">
               {item.status}
            </p>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-4 rounded-2xl border border-tride-hover text-xs font-bold text-tride-text hover:bg-tride-hover hover:text-tride-text transition-all">
        View All Live Trips
      </button>
    </div>
  )
}
