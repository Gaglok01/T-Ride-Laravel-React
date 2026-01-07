import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Filter, Plus, Eye, Edit, MoreVertical, Download, Users, UserCheck, UserX, TrendingUp } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"

export default function UsersPage() {
  return (
    <AdminLayout
      title="User Management"
      description="Manage riders and customers"
      actions={
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-64"
                />
            </div>
            <Button variant="secondary">
                <Filter size={18} />
                Filter
            </Button>
            <Button variant="secondary">
                <Download size={18} />
                Export
            </Button>
            <Button>
                <Plus size={18} />
                Add User
            </Button>
        </div>
      }
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
            label="Total Users" 
            value="45,678" 
            trend="+8.2%" 
            trendUp={true} 
            icon={<Users size={24} className="text-blue-400" />} 
            iconBg="bg-blue-500/10"
        />
        <StatsCard 
            label="Active Users" 
            value="32,456" 
            trend="+5.1%" 
            trendUp={true} 
            icon={<UserCheck size={24} className="text-green-400" />} 
            iconBg="bg-green-500/10"
        />
        <StatsCard 
            label="Suspended" 
            value="234" 
            trend="-2.3%" 
            trendUp={true} // Interpreting "down" in suspended as "good" (green) usually involved logic, but sticking to visual match where green usually means 'good trend' or just generic up/down. Image shows green up arrow usually. Wait, suspended decreasing is good. Let's assume standard formatting. 
            // Looking at the image provided in mind: "Suspended 234, -2.3% (Green arrow?)". Actually usually suspended going down is green. 
            icon={<UserX size={24} className="text-red-400" />} 
            iconBg="bg-red-500/10"
        />
        <StatsCard 
            label="New Today" 
            value="156" 
            trend="+15.8%" 
            trendUp={true} 
            icon={<TrendingUp size={24} className="text-tride-yellow" />} 
            iconBg="bg-yellow-500/10"
        />
      </div>

      {/* Main Content Area */}
      <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Phone</th>
                <th className="px-6 py-4 font-medium">Rides</th>
                <th className="px-6 py-4 font-medium">Wallet</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                <UserRow 
                    name="User 1" 
                    email="user1@email.com"
                    phone="+1 234 567 8901" 
                    rides="82" 
                    wallet="$260.53" 
                    status="Active" 
                    joined="2024-01-15" 
                />
                <UserRow 
                    name="User 2" 
                    email="user2@email.com"
                    phone="+1 234 567 8902" 
                    rides="33" 
                    wallet="$168.11" 
                    status="Active" 
                    joined="2024-02-15" 
                />
                 <UserRow 
                    name="User 3" 
                    email="user3@email.com"
                    phone="+1 234 567 8903" 
                    rides="64" 
                    wallet="$363.71" 
                    status="Suspended" 
                    joined="2024-03-15" 
                />
                 <UserRow 
                    name="User 4" 
                    email="user4@email.com"
                    phone="+1 234 567 8904" 
                    rides="7" 
                    wallet="$472.93" 
                    status="Active" 
                    joined="2024-04-15" 
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

function UserRow({ name, email, phone, rides, wallet, status, joined }: any) {
    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg font-bold">
                        {name.charAt(0)}
                    </div>
                    <div>
                        <div className="font-bold">{name}</div>
                        <div className="text-xs text-white/50">{email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-white/70">{phone}</td>
            <td className="px-6 py-4 font-mono text-sm">{rides}</td>
            <td className="px-6 py-4 font-mono text-sm">{wallet}</td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${status === 'Active' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-white/70">{joined}</td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton tooltip="View">
                        <Eye size={16} />
                    </IconButton>
                    <IconButton tooltip="Edit">
                        <Edit size={16} />
                    </IconButton>
                    <IconButton tooltip="More">
                        <MoreVertical size={16} />
                    </IconButton>
                </div>
            </td>
        </tr>
    )
}
