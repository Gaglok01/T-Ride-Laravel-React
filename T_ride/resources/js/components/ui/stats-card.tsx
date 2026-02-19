import { DollarSign, Car, Navigation, AlertCircle } from "lucide-react"

type IconType = "dollar" | "car" | "trip" | "issue"

export function StatsCard({
  title,
  value,
  trend,
  icon,
}: { title: string; value: string; trend: string; icon: IconType }) {
  const iconConfig = {
    dollar: { component: <DollarSign size={20} />, color: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
    car: { component: <Car size={20} />, color: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20" },
    trip: { component: <Navigation size={20} />, color: "text-blue-400", bg: "bg-blue-400/10", ring: "ring-blue-400/20" },
    issue: { component: <AlertCircle size={20} />, color: "text-rose-400", bg: "bg-rose-400/10", ring: "ring-rose-400/20" },
  }

  const config = iconConfig[icon]
  const isNow = trend === "Now"
  const isPositive = trend.startsWith("+")

  return (
    <div className="group relative bg-tride-card border border-tride-border p-6 rounded-3xl overflow-hidden hover:border-tride-yellow/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(248,184,3,0.06)]">
      {/* Decorative gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-tride-yellow/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className={`w-11 h-11 ${config.bg} rounded-xl flex items-center justify-center ring-1 ${config.ring} group-hover:scale-110 transition-transform duration-300`}>
            <span className={config.color}>{config.component}</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg tracking-wide ${
              isNow
                ? "bg-blue-500/10 text-blue-400 animate-pulse"
                : isPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
            }`}
          >
            {trend}
          </span>
        </div>
        <p className="text-xs text-tride-text-muted font-medium mb-1.5 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-tride-text group-hover:text-tride-yellow transition-colors duration-300">{value}</h3>
      </div>
    </div>
  )
}
