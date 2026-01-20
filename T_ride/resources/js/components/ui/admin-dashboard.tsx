import { useState, useEffect } from "react"
import { StatsCard } from "./stats-card"
import { EarningsChart } from "./earnings-chart"
import { LiveActivity } from "./live-activity"
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
        <div className="animate-spin h-8 w-8 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {data?.stats.map((stat, index) => (
          <StatsCard 
            key={index}
            title={stat.title} 
            value={stat.value} 
            trend={stat.trend} 
            icon={stat.icon as any} 
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EarningsChart data={data?.earningsChart || []} />
        </div>
        <div>
          <LiveActivity activities={data?.liveActivity || []} />
        </div>
      </div>
    </>
  )
}
