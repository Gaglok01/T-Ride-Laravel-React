interface EarningsChartProps {
  data: any[];
  summary?: {
    this_week: number;
    week_change: number;
    this_month: number;
    month_change: number;
    this_quarter: number;
    quarter_change: number;
    all_time: number;
  };
}

export function EarningsChart({ data, summary }: EarningsChartProps) {
  // Find max value to scale the bars correctly
  const maxEarnings = Math.max(...data.map(item => item.earnings), 100);

  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl h-full">
      <h3 className="text-lg font-semibold mb-6 text-tride-text">Weekly Earnings Overview</h3>

      {/* Bar Chart - Referral Performance Style */}
      <div className="h-64 flex items-end justify-between gap-2 px-4 pb-4">
        {data.map((item, i) => {
          const heightPercent = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col justify-end group h-full">
              <div 
                className="w-full bg-tride-yellow/20 rounded-t-lg group-hover:bg-tride-yellow transition-colors relative"
                style={{ height: `${Math.max(heightPercent, 5)}%` }}
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-tride-text text-tride-card text-xs px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none z-10">
                  ${item.earnings.toLocaleString()}
                </div>
              </div>
              <div className="text-[10px] text-tride-text-muted text-center mt-1">
                {item.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Boxes - Referral Performance Style */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
          <div className="text-xs text-tride-text-muted mb-1">This Week</div>
          <div className="text-xl font-bold text-tride-text">${summary?.this_week?.toLocaleString() || 0}</div>
          <div className={`text-xs font-medium ${(summary?.week_change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(summary?.week_change || 0) >= 0 ? '+' : ''}{summary?.week_change || 0}%
          </div>
        </div>
        <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
          <div className="text-xs text-tride-text-muted mb-1">This Month</div>
          <div className="text-xl font-bold text-tride-text">${summary?.this_month?.toLocaleString() || 0}</div>
          <div className={`text-xs font-medium ${(summary?.month_change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(summary?.month_change || 0) >= 0 ? '+' : ''}{summary?.month_change || 0}%
          </div>
        </div>
        <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
          <div className="text-xs text-tride-text-muted mb-1">This Quarter</div>
          <div className="text-xl font-bold text-tride-text">${summary?.this_quarter?.toLocaleString() || 0}</div>
          <div className={`text-xs font-medium ${(summary?.quarter_change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {(summary?.quarter_change || 0) >= 0 ? '+' : ''}{summary?.quarter_change || 0}%
          </div>
        </div>
        <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
          <div className="text-xs text-tride-text-muted mb-1">All Time</div>
          <div className="text-xl font-bold text-tride-text">${summary?.all_time?.toLocaleString() || 0}</div>
          <div className="text-xs text-green-500 font-medium">Total</div>
        </div>
      </div>
    </div>
  )
}
