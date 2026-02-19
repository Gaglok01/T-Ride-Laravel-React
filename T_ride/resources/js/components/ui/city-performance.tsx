import { MapPin, TrendingUp, Star, Globe } from "lucide-react"

const cities = [
  { name: 'Lagos', drivers: 312, rides: '4,520', revenue: '$45,200', trend: '+18%', rating: '4.7' },
  { name: 'Accra', drivers: 198, rides: '3,210', revenue: '$32,100', trend: '+22%', rating: '4.8' },
  { name: 'Nairobi', drivers: 167, rides: '2,890', revenue: '$28,900', trend: '+15%', rating: '4.6' },
  { name: 'Kampala', drivers: 89, rides: '1,840', revenue: '$18,400', trend: '+28%', rating: '4.5' },
]

export function CityPerformance() {
  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-bold text-tride-text">City Performance</h3>
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-tride-border text-sm font-medium text-tride-text-muted hover:bg-tride-hover transition-colors">
          <Globe size={16} />
          All Cities
        </button>
      </div>

      <div className="space-y-4">
        {cities.map((city, idx) => (
          <div key={idx} className="group p-4 bg-tride-hover/30 rounded-2xl border border-tride-border/50 hover:bg-tride-hover/60 transition-all flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 ring-1 ring-blue-500/20">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-tride-text">{city.name}</h4>
                <p className="text-sm text-tride-text-muted">{city.drivers} active drivers</p>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-right">
                <p className="text-sm font-bold text-tride-text">{city.rides}</p>
                <p className="text-[10px] text-tride-text-muted uppercase font-bold tracking-wider">Rides</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-tride-text">{city.revenue}</p>
                <p className="text-[10px] text-tride-text-muted uppercase font-bold tracking-wider">Revenue</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                  {city.trend}
                </span>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star size={14} fill="currentColor" />
                  {city.rating}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
