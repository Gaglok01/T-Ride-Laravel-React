import { useState, useEffect } from "react"
import { StatsCard } from "./stats-card"
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart"
import { ServiceDistributionChart } from "./service-distribution-chart"
import { TripVolumeChart } from "./trip-volume-chart"
import { LiveActivity } from "./live-activity"
import { CityPerformance } from "./city-performance"
import { SystemHealth } from "./system-health"
import { QuickActions } from "./quick-actions"
import axios from "@/lib/axios"

export function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    stats: any[],
    earningsChart: any[],
    liveActivity: any[]
  } | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard/stats')
      if (response.data.status) {
        setData(response.data.data)
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="relative">
          <div className="animate-spin h-10 w-10 border-2 border-tride-yellow/30 border-t-tride-yellow rounded-full"></div>
          <div className="absolute inset-0 animate-spin h-10 w-10 border-2 border-transparent border-b-tride-yellow/20 rounded-full" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data?.stats.map((stat, index) => (
          <div key={index} style={{ animationDelay: `${index * 100}ms` }} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both">
            <StatsCard 
              title={stat.title} 
              value={stat.value} 
              trend={stat.trend} 
              icon={stat.icon as any} 
            />
          </div>
        ))}
      </div>

      {/* Row 1: Revenue Overview & Service Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RevenueTrendChart 
            data={data?.earningsChart || []} 
            title="Revenue Overview" 
            dataKey="earnings"
            xAxisKey="name"
            height={400} 
            className="w-full shadow-sm"
          />
        </div>
        <div className="lg:col-span-1">
          <ServiceDistributionChart />
        </div>
      </div>

      {/* Row 2: Today's Trip Volume & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TripVolumeChart />
        </div>
        <div className="lg:col-span-1">
          <LiveActivity activities={data?.liveActivity || []} />
        </div>
      </div>

      {/* Row 3: City Performance & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <CityPerformance />
        </div>
        <div className="lg:col-span-1">
          <SystemHealth />
        </div>
      </div>

      {/* Row 4: Quick Actions */}
      <div>
        <QuickActions />
      </div>
    </div>
  )
}


