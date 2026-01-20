import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ShoppingBag, Clock, Truck, CheckSquare, DollarSign, RefreshCw, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import axios from "@/lib/axios"

interface DeliveryStats {
    total_orders: number
    preparing: number
    out_for_delivery: number
    delivered: number
    revenue: string
    trends: {
        total_trend: string
        preparing_trend: string
        delivery_trend: string
        delivered_trend: string
        revenue_trend: string
    }
}

interface DeliveryOrder {
    id: number
    order_code: string
    customer: { name: string } | null
    vendor: { name: string } | null
    driver: { name: string } | null
    total_items: number
    total_amount: number
    status: string
}

interface Pagination {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface Category {
    id: number
    name: string
}

export default function DeliveryOrdersPage() {
    const [stats, setStats] = useState<DeliveryStats | null>(null)
    const [orders, setOrders] = useState<DeliveryOrder[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<number | 'all'>('all')
    const [categories, setCategories] = useState<Category[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        fetchCategories()
        fetchStats()
    }, [])

    useEffect(() => {
        fetchOrders()
    }, [activeTab, currentPage, searchTerm])

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/admin/categories')
            if (res.data.status) {
                setCategories(res.data.data)
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/admin/delivery-orders/stats')
            if (res.data.status) {
                setStats(res.data.data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const params: any = {
                page: currentPage
            }

            if (searchTerm) {
                params.search = searchTerm
            }

            if (activeTab !== 'all') {
                params.category_id = activeTab
            }

            const res = await axios.get('/api/admin/delivery-orders', { params })
            
            if (res.data.status) {
                setOrders(res.data.data.data)
                setPagination({
                    current_page: res.data.data.current_page,
                    last_page: res.data.data.last_page,
                    per_page: res.data.data.per_page,
                    total: res.data.data.total
                })
            }
        } catch (error) {
            console.error("Error fetching delivery orders:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleTabChange = (tab: number | 'all') => {
        setActiveTab(tab)
        setCurrentPage(1)
    }

    const handleRefresh = () => {
        fetchStats()
        fetchOrders()
    }

    return (
        <AdminLayout
            title="Delivery Orders"
            description="Food & shop delivery management"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <Button onClick={handleRefresh} variant="default" className="flex-1 sm:flex-none justify-center">
                        <RefreshCw size={18} className="mr-2" />
                        Refresh
                    </Button>
                </div>
            }
        >
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                <StatsCard
                    label="Total Orders"
                    value={stats?.total_orders.toLocaleString() || "0"}
                    trend={stats?.trends.total_trend || "0%"}
                    trendUp={!stats?.trends.total_trend.startsWith('-')}
                    icon={<ShoppingBag size={20} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                />
                <StatsCard
                    label="Preparing"
                    value={stats?.preparing.toLocaleString() || "0"}
                    trend={stats?.trends.preparing_trend || "0%"}
                    trendUp={!stats?.trends.preparing_trend.startsWith('-')}
                    icon={<Clock size={20} className="text-orange-500" />}
                    iconBg="bg-orange-500/10"
                />
                <StatsCard
                    label="Out for Delivery"
                    value={stats?.out_for_delivery.toLocaleString() || "0"}
                    trend={stats?.trends.delivery_trend || "0%"}
                    trendUp={!stats?.trends.delivery_trend.startsWith('-')}
                    icon={<Truck size={20} className="text-blue-400" />}
                    iconBg="bg-blue-500/10"
                />
                <StatsCard
                    label="Delivered"
                    value={stats?.delivered.toLocaleString() || "0"}
                    trend={stats?.trends.delivered_trend || "0%"}
                    trendUp={!stats?.trends.delivered_trend.startsWith('-')}
                    icon={<CheckSquare size={20} className="text-green-500" />}
                    iconBg="bg-green-500/10"
                />
                <StatsCard
                    label="Revenue"
                    value={`$${stats?.revenue || "0"}`}
                    trend={stats?.trends.revenue_trend || "0%"}
                    trendUp={!stats?.trends.revenue_trend.startsWith('-')}
                    icon={<DollarSign size={20} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                />
            </div>

            {/* Filter Tabs - Dynamic Categories */}
            <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit overflow-x-auto scrollbar-hide max-w-full">
                <Button
                    variant={activeTab === 'all' ? "secondary" : "ghost"}
                    className={activeTab === 'all' ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white"}
                    onClick={() => handleTabChange('all')}
                >
                    All Orders
                </Button>
                {categories.map((category) => (
                    <Button
                        key={category.id}
                        variant={activeTab === category.id ? "secondary" : "ghost"}
                        className={activeTab === category.id ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white"}
                        onClick={() => handleTabChange(category.id)}
                    >
                        {category.name}
                    </Button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Vendor</th>
                                <th className="px-6 py-4 font-medium">Items</th>
                                <th className="px-6 py-4 font-medium">Driver</th>
                                <th className="px-6 py-4 font-medium">Total</th>
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
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-white/40">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        id={order.order_code}
                                        customer={order.customer?.name || 'Unknown'}
                                        vendor={order.vendor?.name || 'Unknown'}
                                        items={`${order.total_items} items`}
                                        driver={order.driver?.name || 'Assigned soon'}
                                        total={`$${order.total_amount}`}
                                        status={order.status}
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
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} orders
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

function OrderRow({ id, customer, vendor, items, driver, total, status }: any) {
    let statusStyles = ""
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus === 'on_the_way') statusStyles = "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
    else if (normalizedStatus === 'delivered') statusStyles = "bg-green-600 text-white shadow-lg shadow-green-600/20"
    else if (normalizedStatus === 'preparing') statusStyles = "bg-orange-500/20 text-orange-500 border border-orange-500/20"
    else if (normalizedStatus === 'cancelled') statusStyles = "bg-red-500/20 text-red-500 border border-red-500/20"
    else statusStyles = "bg-white/5 text-white/70 border border-white/10"

    const displayStatus = status.split('_').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4 font-mono text-sm text-white/70">{id}</td>
            <td className="px-6 py-4 font-medium">{customer}</td>
            <td className="px-6 py-4 font-medium">{vendor}</td>
            <td className="px-6 py-4 text-white/60">{items}</td>
            <td className="px-6 py-4 font-medium">{driver}</td>
            <td className="px-6 py-4 font-medium text-white/90">{total}</td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles}`}>
                    {displayStatus}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <IconButton tooltip="View Details">
                    <Eye size={16} />
                </IconButton>
            </td>
        </tr>
    )
}
