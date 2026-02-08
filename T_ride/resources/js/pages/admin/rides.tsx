import { useEffect, useState } from "react"
import { Link } from "@inertiajs/react"
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
            const res = await axios.get('/admin/rides/stats')
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

            const res = await axios.get('/admin/rides', { params })

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

            const response = await axios.get("/admin/rides", { params })

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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search rides..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="bg-tride-card border border-tride-border rounded-full pl-10 pr-4 py-2 text-sm text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
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

            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                <div className="flex gap-1 p-4 border-tride-border">
                    {["All Rides", "Completed", "In Progress", "Cancelled"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "ghost"}
                            className={activeTab === tab ? "" : ""}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
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
                            <tbody className="divide-y divide-tride-border">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-tride-text-muted">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin h-4 w-4 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                                                Loading rides...
                                            </div>
                                        </td>
                                    </tr>
                                ) : rides.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-tride-text-muted">No rides found.</td>
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
                        <div className="px-6 py-4 border-t border-tride-border flex items-center justify-between">
                            <div className="text-sm text-tride-text-muted">
                                Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} rides
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={pagination.current_page === 1}
                                    className="disabled:opacity-30 disabled:cursor-not-allowed text-tride-text"
                                >
                                    <ChevronLeft size={16} className="mr-1" /> Previous
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className="disabled:opacity-30 disabled:cursor-not-allowed text-tride-text"
                                >
                                    Next <ChevronRight size={16} className="ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-sm font-medium mb-1">{label}</p>
                <div className="text-3xl font-bold text-tride-text mb-2">{value}</div>
                <div className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-lg">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}

function RideRow({ id, rider, driver, from, to, fare, payment, status }: any) {
    let statusStyles = ""
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus === 'completed') statusStyles = "bg-green-500/20 text-green-400 border border-green-500/20"
    else if (normalizedStatus === 'cancelled') statusStyles = "bg-red-500/20 text-red-400 border border-red-500/20"
    else if (normalizedStatus === 'in_progress') statusStyles = "bg-blue-500/20 text-blue-400 border border-blue-500/20"
    else statusStyles = "bg-tride-hover text-tride-text-muted border border-tride-border"

    const displayStatus = status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    return (
        <tr className="hover:bg-tride-hover transition-colors group">
            <td className="px-6 py-4 font-mono text-sm text-tride-text-muted">{id}</td>
            <td className="px-6 py-4 font-medium text-tride-text">{rider}</td>
            <td className="px-6 py-4 font-medium text-tride-text">{driver}</td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1 text-sm">
                    <span className="text-tride-text">{from}</span>
                    <span className="text-xs text-tride-text-muted flex items-center gap-1">
                        <span className="w-1 h-1 bg-tride-text-muted rounded-full"></span>
                        {to}
                    </span>
                </div>
            </td>
            <td className="px-6 py-4 font-medium text-tride-text">{fare}</td>
            <td className="px-6 py-4">
                <span className="capitalize px-3 py-1 rounded-full border border-tride-border text-xs font-medium text-tride-text-muted">
                    {payment}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap inline-block ${statusStyles}`}>
                    {displayStatus}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <Link href={`/admin/rides/${id}`}>
                    <IconButton tooltip="View">
                        <Eye size={16} />
                    </IconButton>
                </Link>
            </td>
        </tr>
    )
}
