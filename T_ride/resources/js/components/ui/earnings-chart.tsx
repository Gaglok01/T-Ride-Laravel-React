export function EarningsChart({ data }: { data: any[] }) {
  // Find max value to scale the bars correctly
  const maxEarnings = Math.max(...data.map(item => item.earnings), 100);
  
  // Create labels based on max value
  const gridLabels = [
    maxEarnings,
    maxEarnings * 0.75,
    maxEarnings * 0.5,
    maxEarnings * 0.25,
    0
  ];

  return (
    <div className="bg-tride-card border border-white/5 p-8 rounded-[32px] h-full">
      <h3 className="text-lg font-bold mb-10">Weekly Earnings Overview</h3>

      <div className="relative h-64">
        {/* Y-Axis labels & Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {gridLabels.map((label) => (
            <div key={label} className="relative flex items-center w-full">
              <span className="absolute -left-2 text-[11px] text-white/40 font-medium w-12 text-right pr-3 -translate-y-px">
                ${Math.round(label)}
              </span>
              <div className="flex-1 border-t border-dashed border-white/10 ml-12"></div>
            </div>
          ))}
        </div>
 
        {/* Chart Bars */}
        <div className="absolute inset-0 left-12 flex items-end justify-between px-4">
          {data.map((item) => (
            <div key={item.name} className="flex-1 flex flex-col items-center group max-w-[50px] relative h-full justify-end">
              <div
                className="w-full bg-tride-yellow transition-all duration-500 group-hover:opacity-80"
                style={{ height: `${(item.earnings / maxEarnings) * 100}%` }}
              ></div>
              <span className="absolute -bottom-8 text-[11px] text-white/40 font-medium">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
