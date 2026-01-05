export function EarningsChart() {
  const data = [
    { day: "Mon", value: 25 },
    { day: "Tue", value: 15 },
    { day: "Wed", value: 100 },
    { day: "Thu", value: 40 },
    { day: "Fri", value: 50 },
    { day: "Sat", value: 38 },
    { day: "Sun", value: 45 },
  ]

  return (
    <div className="bg-tride-card border border-white/5 p-8 rounded-[32px] h-full">
      <h3 className="text-lg font-bold mb-10">Weekly Earnings Overview</h3>

      <div className="relative h-64">
        {/* Y-Axis labels & Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[1000, 750, 500, 250, 0].map((label) => (
            <div key={label} className="relative flex items-center w-full">
              <span className="absolute -left-2 text-[11px] text-white/40 font-medium w-10 text-right pr-3 -translate-y-px">
                ${label}
              </span>
              <div className="flex-1 border-t border-dashed border-white/10 ml-10"></div>
            </div>
          ))}
        </div>

        {/* Chart Bars */}
        <div className="absolute inset-0 left-10 flex items-end justify-between px-4">
          {data.map((item) => (
            <div key={item.day} className="flex-1 flex flex-col items-center group max-w-[50px]">
              <div
                className="w-full bg-tride-yellow transition-all duration-500 group-hover:opacity-80"
                style={{ height: `${item.value}%` }}
              ></div>
              <span className="absolute -bottom-8 text-[11px] text-white/40 font-medium">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
