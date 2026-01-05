export function LiveActivity() {
  const activities = [
    { id: "2041", time: "5m ago", price: "12.00", status: "started" },
    { id: "2042", time: "5m ago", price: "12.00", status: "started" },
    { id: "2043", time: "5m ago", price: "12.00", status: "started" },
    { id: "2044", time: "5m ago", price: "12.00", status: "started" },
    { id: "2045", time: "5m ago", price: "12.00", status: "started" },
  ]

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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-sm font-bold">Ride #{item.id}</p>
                <p className="text-[10px] text-white/40">Started {item.time}</p>
              </div>
            </div>
            <p className="text-sm font-bold text-tride-yellow">${item.price}</p>
          </div>
        ))}
      </div>

      <button className="w-full mt-6 py-4 rounded-2xl border border-white/10 text-xs font-bold text-white/50 hover:bg-white/5 hover:text-white transition-all">
        View All Live Trips
      </button>
    </div>
  )
}
