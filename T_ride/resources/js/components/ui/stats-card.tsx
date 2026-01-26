import { DollarSign, Car, Navigation, AlertCircle } from "lucide-react"

type IconType = "dollar" | "car" | "trip" | "issue"

export function StatsCard({
  title,
  value,
  trend,
  icon,
}: { title: string; value: string; trend: string; icon: IconType }) {
  const icons = {
    dollar: <DollarSign className="text-tride-yellow" size={20} />,
    car: <Car className="text-green-500" size={20} />,
    trip: <Navigation className="text-blue-500" size={20} />,
    issue: <AlertCircle className="text-red-500" size={20} />,
  }

  return (
    <div className="bg-tride-card border border-white/5 p-6 rounded-3xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">{icons[icon]}</div>
        <span
          className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
            trend === "Now"
              ? "bg-blue-500/10 text-blue-500"
              : trend.startsWith("+")
                ? "bg-white/5 text-tride-text"
                : "bg-red-500/10 text-red-500"
          }`}
        >
          {trend}
        </span>
      </div>
      <p className="text-xs text-tride-text font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  )
}
