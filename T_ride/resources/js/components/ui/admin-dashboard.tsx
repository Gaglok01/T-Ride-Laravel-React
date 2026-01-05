import { StatsCard } from "./stats-card"
import { EarningsChart } from "./earnings-chart"
import { LiveActivity } from "./live-activity"

export function AdminDashboard() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Revenue" value="$12,450" trend="+12%" icon="dollar" />
        <StatsCard title="Active Drivers" value="142" trend="+5%" icon="car" />
        <StatsCard title="Active Trips" value="38" trend="Now" icon="trip" />
        <StatsCard title="Pending Issues" value="4" trend="-2" icon="issue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <EarningsChart />
        </div>
        <div>
          <LiveActivity />
        </div>
      </div>
    </>
  )
}
