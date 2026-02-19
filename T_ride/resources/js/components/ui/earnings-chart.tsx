import { useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

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
  const maxEarnings = useMemo(() => Math.max(...data.map(item => item.earnings), 100), [data]);

  // Generate Y-axis labels
  const yAxisLabels = useMemo(() => {
    const steps = 4;
    const labels = [];
    for (let i = steps; i >= 0; i--) {
      const value = Math.round((maxEarnings / steps) * i);
      if (value >= 1000) {
        labels.push(`$${(value / 1000).toFixed(1)}k`);
      } else {
        labels.push(`$${value}`);
      }
    }
    return labels;
  }, [maxEarnings]);

  // Find current day (last item or lowest index with name matching today)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-tride-yellow/15 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-tride-yellow" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-tride-text">Revenue Overview</h3>
            <p className="text-xs text-tride-text-muted">Last 7 days revenue</p>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="px-6 pb-3 flex-1 min-h-0">
        <div className="flex h-full" style={{ minHeight: '180px' }}>
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between pr-3 py-1" style={{ minWidth: '40px' }}>
            {yAxisLabels.map((label, i) => (
              <span key={i} className="text-[10px] text-tride-text-muted text-right leading-none">
                {label}
              </span>
            ))}
          </div>

          {/* Bars Container */}
          <div className="flex-1 flex flex-col">
            {/* Grid + Bars */}
            <div className="relative flex-1 flex items-end gap-2">
              {/* Horizontal grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={`grid-${i}`}
                  className="absolute left-0 right-0 border-t border-tride-border/50"
                  style={{ bottom: `${(i / 4) * 100}%` }}
                />
              ))}

              {/* Bars */}
              {data.map((item, i) => {
                const heightPercent = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0;
                const isToday = item.name === today;
                const isLastItem = i === data.length - 1;
                const isActive = isToday || isLastItem;

                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group h-full relative z-10">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-9 left-1/2 -translate-x-1/2 z-20 transition-all duration-200 pointer-events-none">
                      <div className="bg-tride-text text-tride-card text-xs font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap">
                        ${item.earnings.toLocaleString()}
                      </div>
                      <div className="w-2 h-2 bg-tride-text rotate-45 mx-auto -mt-1"></div>
                    </div>

                    {/* Bar */}
                    <div
                      className={`
                        w-full rounded-t-xl transition-all duration-500 ease-out relative overflow-hidden cursor-pointer
                        ${isActive
                          ? 'shadow-[0_0_20px_rgba(248,184,3,0.3)]'
                          : 'group-hover:shadow-[0_0_15px_rgba(248,184,3,0.2)]'
                        }
                      `}
                      style={{
                        height: `${Math.max(heightPercent, 4)}%`,
                        animationDelay: `${i * 80}ms`,
                      }}
                    >
                      {/* Gradient fill */}
                      <div
                        className={`
                          absolute inset-0 transition-all duration-300
                          ${isActive
                            ? 'bg-gradient-to-t from-tride-yellow via-tride-yellow/90 to-tride-yellow/70'
                            : 'bg-gradient-to-t from-tride-yellow/40 via-tride-yellow/25 to-tride-yellow/15 group-hover:from-tride-yellow/70 group-hover:via-tride-yellow/50 group-hover:to-tride-yellow/35'
                          }
                        `}
                      />

                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      </div>

                      {/* Top glow line for active */}
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-tride-yellow to-transparent" />
                      )}
                    </div>

                    {/* Day Label */}
                    <div className={`text-[11px] text-center mt-2 font-medium transition-colors duration-200 ${isActive ? 'text-tride-yellow' : 'text-tride-text-muted group-hover:text-tride-text'}`}>
                      {item.name}
                    </div>

                    {/* Active day dot indicator */}
                    {isActive && (
                      <div className="flex justify-center mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-tride-yellow shadow-[0_0_6px_rgba(248,184,3,0.6)]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Boxes */}
      <div className="grid grid-cols-4 gap-[1px] bg-tride-border/30 border-t border-tride-border/50">
        {[
          { label: 'THIS WEEK', value: summary?.this_week, change: summary?.week_change, showChange: true },
          { label: 'THIS MONTH', value: summary?.this_month, change: summary?.month_change, showChange: true },
          { label: 'THIS QUARTER', value: summary?.this_quarter, change: summary?.quarter_change, showChange: true },
          { label: 'ALL TIME', value: summary?.all_time, change: null, showChange: false },
        ].map((item, i) => {
          const isPositive = (item.change || 0) >= 0;
          return (
            <div
              key={i}
              className="bg-tride-card px-3 py-4 text-center hover:bg-tride-hover/50 transition-all duration-200 group cursor-default"
            >
              <div className="text-[10px] uppercase tracking-wider text-tride-text-muted font-medium mb-1.5">
                {item.label}
              </div>
              <div className="text-lg font-bold text-tride-text group-hover:text-tride-yellow transition-colors duration-200">
                ${(item.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {item.showChange ? (
                <div className={`text-[11px] font-semibold mt-1 flex items-center justify-center gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? '+' : ''}{item.change || 0}%
                </div>
              ) : (
                <div className="text-[11px] font-semibold mt-1 text-tride-yellow flex items-center justify-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-tride-yellow" />
                  Total
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
