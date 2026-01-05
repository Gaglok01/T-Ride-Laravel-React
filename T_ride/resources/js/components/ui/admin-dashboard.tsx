import { Sidebar } from "./sidebar"
import { StatsCard } from "./stats-card"
import { EarningsChart } from "./earnings-chart"
import { LiveActivity } from "./live-activity"
import { Bell } from "lucide-react"

export function AdminDashboard({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen bg-tride-dark text-white font-sans">
      <Sidebar onLogout={onBack} />

      <main className="flex-1 p-8 overflow-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Operations Overview</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell size={20} className="text-white/60" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-tride-dark"></span>
            </button>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center text-tride-dark font-bold text-xs">
                AD
              </div>
            </div>
          </div>
        </header>

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
      </main>
    </div>
  )
}
