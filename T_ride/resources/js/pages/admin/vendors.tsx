import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Plus, Eye, Edit, Store, CheckCircle, Clock, DollarSign, Star } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"

export default function VendorsPage() {
  return (
    <AdminLayout
      title="Vendor Management"
      description="Restaurants, shops, and stores"
      actions={
        <div className="flex items-center gap-3">
            <Button>
                <Plus size={18} />
                Add Vendor
            </Button>
        </div>
      }
    >
      {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
          <TabButton label="All Vendors" active />
          <TabButton label="Restaurants" />
          <TabButton label="Shops" />
          <TabButton label="Grocery" />
          <TabButton label="Pharmacy" />
          <TabButton label="Pending" />
        </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
            label="Total Vendors" 
            value="1,234" 
            trend="+8.2%" 
            trendUp={true} 
            icon={<Store size={24} className="text-blue-500" />} 
            iconBg="bg-blue-500/10"
        />
        <StatsCard 
            label="Active" 
            value="1,089" 
            trend="+5.1%" 
            trendUp={true} 
            icon={<CheckCircle size={24} className="text-blue-500" />} // Design uses Blue check
            iconBg="bg-blue-500/10"
        />
        <StatsCard 
            label="Pending" 
            value="45" 
            trend="+12.5%" 
            trendUp={true} 
            icon={<Clock size={24} className="text-blue-500" />} 
            iconBg="bg-blue-500/10"
        />
        <StatsCard 
            label="Total Revenue" 
            value="$234,560" 
            trend="+15.8%" 
            trendUp={true} 
            icon={<DollarSign size={24} className="text-blue-500" />} 
            iconBg="bg-blue-500/10"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Revenue</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Commission</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                <VendorRow 
                    name="Vendor 1" 
                    address="123 Main St"
                    category="Grocery"
                    orders="143"
                    revenue="$6873.54"
                    rating="4.5"
                    commission="11%"
                />
                <VendorRow 
                    name="Vendor 2" 
                    address="123 Main St"
                    category="Pharmacy"
                    orders="743"
                    revenue="$8637.31"
                    rating="4.0"
                    commission="12%"
                />
                <VendorRow 
                    name="Vendor 3" 
                    address="123 Main St"
                    category="Shop"
                    orders="871"
                    revenue="$7822.46"
                    rating="4.3"
                    commission="13%"
                />
                <VendorRow 
                    name="Vendor 4" 
                    address="123 Main St"
                    category="Restaurant"
                    orders="443"
                    revenue="$7738.77"
                    rating="4.1"
                    commission="14%"
                />
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-start justify-between">
            <div>
                <p className="text-white/50 text-sm font-medium mb-1">{label}</p>
                <div className="text-3xl font-bold mb-2">{value}</div>
                <div className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                    <span className="text-lg">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}

function VendorRow({ name, address, category, orders, revenue, rating, commission }: any) {
    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-lg font-bold">
                        {/* Placeholder Icon or First Letter */}
                        <Store size={18} className="text-white/50" />
                    </div>
                    <div>
                        <div className="font-bold">{name}</div>
                        <div className="text-xs text-white/50">{address}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white/70">
                    {category}
                </span>
            </td>
            <td className="px-6 py-4 font-mono text-sm">{orders}</td>
            <td className="px-6 py-4 font-mono text-sm">{revenue}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                    <Star size={14} fill="currentColor" /> {rating}
                </div>
            </td>
            <td className="px-6 py-4 text-white/70">{commission}</td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    Open
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton tooltip="View">
                        <Eye size={16} />
                    </IconButton>
                    <IconButton tooltip="Edit">
                        <Edit size={16} />
                    </IconButton>
                </div>
            </td>
        </tr>
    )
}

function TabButton({ label, active }: { label: string, active?: boolean }) {
    return (
        <button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${active ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            {label}
        </button>
    )
}
