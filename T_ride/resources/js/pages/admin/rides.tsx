import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Filter, Calendar, Eye, CarFront, CheckCircle, Activity, XCircle, DollarSign, Search, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import axios from "@/lib/axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface RideStats {
    total_rides: number
    completed: number
    in_progress: number
    cancelled: number
    revenue: string
    trends: {
        total: string
        completed: string
        in_progress: string
        cancelled: string
        revenue: string
    }
}

interface Ride {
    id: number
    ride_custom_id: string
    rider: { name: string } | null
    driver: { name: string } | null
    pickup_address: string
    dropoff_address: string
    fare: number
    payment_method: string
    status: string
}

interface Pagination {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export default function RidesPage() {
    const [stats, setStats] = useState<RideStats | null>(null)
    const [rides, setRides] = useState<Ride[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("All Rides")
    const [searchTerm, setSearchTerm] = useState("")
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    useEffect(() => {
        fetchRides()
    }, [activeTab, currentPage, searchTerm]) // refetch when these change

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/admin/rides/stats')
            if (res.data.status) {
                setStats(res.data.data)
            }
        } catch (error) {
            console.error("Error fetching ride stats:", error)
        }
    }

    const fetchRides = async () => {
        setLoading(true)
        try {
            const params: any = {
                page: currentPage
            }

            if (searchTerm) {
                params.search = searchTerm
            }

            // Map activeTab to status param
            if (activeTab === "Completed") params.status = "completed"
            else if (activeTab === "In Progress") params.status = "in_progress"
            else if (activeTab === "Cancelled") params.status = "cancelled"
            // "All Rides" sends no status param (or status=all if controller defaults)

            const res = await axios.get('/api/admin/rides', { params })
            
            if (res.data.status) {
                setRides(res.data.data.data)
                setPagination({
                    current_page: res.data.data.current_page,
                    last_page: res.data.data.last_page,
                    per_page: res.data.data.per_page,
                    total: res.data.data.total
                })
            }
        } catch (error) {
            console.error("Error fetching rides:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        try {
            setIsExporting(true)
            const params: any = { 
                all: true,
                search: searchTerm
            }
            if (activeTab === "Completed") params.status = "completed"
            else if (activeTab === "In Progress") params.status = "in_progress"
            else if (activeTab === "Cancelled") params.status = "cancelled"

            const response = await axios.get("/api/admin/rides", { params })
            
            let exportData: Ride[] = []
            if (response.data.status && Array.isArray(response.data.data)) {
                 exportData = response.data.data
            } else if (response.data.data && Array.isArray(response.data.data.data)) {
                 exportData = response.data.data.data
            } else if (Array.isArray(response.data)) {
                 exportData = response.data
            }

            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text("T-RIDE", 14, 20)
            
            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text("Rides Report", 14, 28)
            
            doc.setFontSize(10)
            doc.setTextColor(150, 150, 150)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)

            const tableData = exportData.map(r => [
                r.ride_custom_id,
                r.rider?.name || '-',
                r.driver?.name || '-',
                r.pickup_address,
                r.dropoff_address,
                `$${r.fare}`,
                r.payment_method,
                r.status,
            ])

            autoTable(doc, {
                head: [["ID", "Rider", "Driver", "Pickup", "Dropoff", "Fare", "Payment", "Status"]],
                body: tableData,
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [245, 197, 24], textColor: [0, 0, 0] }
            })
            
            doc.save(`rides_export_${Date.now()}.pdf`)

        } catch (e) {
            console.error("Export failed:", e)
            alert("Failed to export rides.")
        } finally {
            setIsExporting(false)
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1) // Reset to page 1 on search
    }

    const handleTabChange = (tab: string) => {
        setActiveTab(tab)
        setCurrentPage(1) // Reset to page 1 on tab change
    }

    return (
        <AdminLayout
            title="Ride Management"
            description="Monitor and manage all rides"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                     <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search rides..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <Button variant="secondary" className="flex-1 sm:flex-none justify-center gap-2" disabled={isExporting} onClick={handleExport}>
                        <Download size={18} className={isExporting ? "animate-bounce" : ""} />
                        {isExporting ? "Exporting..." : "Export"}
                    </Button>
                    <Button variant="secondary" className="flex-1 sm:flex-none justify-center gap-2">
                        <Calendar size={18} />
                        Date Range
                    </Button>
                </div>
            }
        >
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                <StatsCard
                    label="Total Rides"
                    value={stats?.total_rides.toLocaleString() || "0"}
                    trend={stats?.trends.total || "0%"}
                    trendUp={!stats?.trends.total.startsWith('-')}
                    icon={<CarFront size={20} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                />
                <StatsCard
                    label="Completed"
                    value={stats?.completed.toLocaleString() || "0"}
                    trend={stats?.trends.completed || "0%"}
                    trendUp={!stats?.trends.completed.startsWith('-')}
                    icon={<CheckCircle size={20} className="text-green-500" />}
                    iconBg="bg-green-500/10"
                />
                <StatsCard
                    label="In Progress"
                    value={stats?.in_progress.toLocaleString() || "0"}
                    trend={stats?.trends.in_progress || "0%"}
                    trendUp={!stats?.trends.in_progress.startsWith('-')}
                    icon={<Activity size={20} className="text-blue-400" />}
                    iconBg="bg-blue-500/10"
                />
                <StatsCard
                    label="Cancelled"
                    value={stats?.cancelled.toLocaleString() || "0"}
                    trend={stats?.trends.cancelled || "0%"}
                    trendUp={!stats?.trends.cancelled.startsWith('-')}
                    icon={<XCircle size={20} className="text-red-500" />}
                    iconBg="bg-red-500/10"
                />
                <StatsCard
                    label="Revenue"
                    value={`$${stats?.revenue || "0"}`}
                    trend={stats?.trends.revenue || "0%"}
                    trendUp={!stats?.trends.revenue.startsWith('-')}
                    icon={<DollarSign size={20} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                />
            </div>

             {/* Tabs */}
             <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
                {["All Rides", "Completed", "In Progress", "Cancelled"].map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "secondary" : "ghost"}
                        className={activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white"}
                        onClick={() => handleTabChange(tab)}
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                <th className="px-6 py-4 font-medium">Ride ID</th>
                                <th className="px-6 py-4 font-medium">Rider</th>
                                <th className="px-6 py-4 font-medium">Driver</th>
                                <th className="px-6 py-4 font-medium">Route</th>
                                <th className="px-6 py-4 font-medium">Fare</th>
                                <th className="px-6 py-4 font-medium">Payment</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                             {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-white/40">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                                            Loading rides...
                                        </div>
                                    </td>
                                </tr>
                            ) : rides.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-white/40">No rides found.</td>
                                </tr>
                            ) : (
                                rides.map((ride) => (
                                    <RideRow
                                        key={ride.id}
                                        id={ride.ride_custom_id}
                                        rider={ride.rider?.name || 'Unknown'}
                                        driver={ride.driver?.name || 'Unknown'}
                                        from={ride.pickup_address}
                                        to={ride.dropoff_address}
                                        fare={`$${ride.fare}`}
                                        payment={ride.payment_method}
                                        status={ride.status}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
                        <div className="text-sm text-white/50">
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} rides
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={pagination.current_page === 1}
                                className="disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Previous
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                                disabled={pagination.current_page === pagination.last_page}
                                className="disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-start justify-between">
            <div>
                <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
                <div className="text-2xl font-bold mb-2">{value}</div>
                <div className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                    <span className="text-sm">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}

function RideRow({ id, rider, driver, from, to, fare, payment, status }: any) {
    let statusStyles = ""
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus === 'completed') statusStyles = "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
    else if (normalizedStatus === 'cancelled') statusStyles = "bg-red-500/20 text-red-500 border border-red-500/20"
    else if (normalizedStatus === 'in_progress') statusStyles = "bg-white/5 text-white/70 border border-white/10"
    else statusStyles = "bg-white/5 text-white/70 border border-white/10"

    const displayStatus = status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4 font-mono text-sm text-white/70">{id}</td>
            <td className="px-6 py-4 font-medium">{rider}</td>
            <td className="px-6 py-4 font-medium">{driver}</td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1 text-sm">
                    <span className="text-white/90">{from}</span>
                    <span className="text-xs text-white/40 flex items-center gap-1">
                        <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                        {to}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 font-medium">{fare}</td>
            <td className="px-6 py-4">
                <span className="capitalize px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white/60">
                    {payment}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles}`}>
                    {displayStatus}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <IconButton tooltip="View">
                    <Eye size={16} />
                </IconButton>
            </td>
        </tr>
    )
}
