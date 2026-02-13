import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Car, Package, Truck, Users, Clock, Plus, RefreshCw, MapPin, Phone, User, Router, TrendingUp, AlertTriangle, Search, Star, Eye, Shield, Zap, Globe, History, Signal, Navigation, Lock, Activity, Settings, BarChart3, Radio, Target, Gauge, Timer, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import axios from "@/lib/axios"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api"
import { useGoogleMaps } from "@/providers/GoogleMapsProvider"
import { Switch } from "@headlessui/react"

// ==================== INTERFACES ====================

interface DispatchStats {
    active_rides: number
    active_deliveries: number
    active_couriers: number
    online_drivers: number
    pending_assignment: number
    trends: {
        rides_trend: string
        deliveries_trend: string
        couriers_trend: string
        drivers_trend: string
        pending_trend: string
    }
    zone_stats?: Record<string, number>
}

interface PendingOrder {
    id: number
    order_id: string
    type: string
    status: string
    time_ago: string
    pickup: string
    dropoff: string
    source_type: string
    source_id: number
    fare: string
}

interface ActiveOrder {
    id: number
    order_id: string
    type: string
    driver: string
    status: string
    eta: string
    dist: string
    dur: string
    fare: string
}

interface AvailableDriver {
    id: number
    name: string
    phone: string
    vehicle_type: string
    service_type: string
    rating: number
    photo: string | null
    location: string
    trips_count: number
}

// ==================== MAIN COMPONENT ====================

export default function DispatchPage() {
    const [stats, setStats] = useState<DispatchStats | null>(null)
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
    const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([])
    const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Modal states
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null)
    const [isAssigning, setIsAssigning] = useState(false)

    const [activeTab, setActiveTab] = useState("Pending Assignment")
    const [driverSearch, setDriverSearch] = useState("")

    const { isLoaded } = useGoogleMaps()

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
        borderRadius: '1.5rem'
    }

    const center = {
        lat: 31.5204, // Default to Lahore
        lng: 74.3587
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [statsRes, ordersRes, activeRes, driversRes] = await Promise.all([
                axios.get('/admin/dispatch/stats'),
                axios.get('/admin/dispatch/pending-orders'),
                axios.get('/admin/dispatch/active-orders'),
                axios.get('/admin/dispatch/available-drivers')
            ])

            if (statsRes.data.status) setStats(statsRes.data.data)
            if (ordersRes.data.status) setPendingOrders(ordersRes.data.data)
            if (activeRes.data.status) setActiveOrders(activeRes.data.data)
            if (driversRes.data.status) setAvailableDrivers(driversRes.data.data)
        } catch (error) {
            console.error("Failed to fetch dispatch data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchAllData()
        setRefreshing(false)
    }

    const openAssignModal = (order: PendingOrder) => {
        setSelectedOrder(order)
        setIsAssignModalOpen(true)
    }

    const handleAssignDriver = async (driverId: number) => {
        if (!selectedOrder) return
        
        setIsAssigning(true)
        try {
            await axios.post('/admin/dispatch/assign-driver', {
                order_type: selectedOrder.source_type,
                order_id: selectedOrder.source_id,
                driver_id: driverId
            })
            setIsAssignModalOpen(false)
            setSelectedOrder(null)
            fetchAllData()
        } catch (error) {
            console.error("Failed to assign driver:", error)
        } finally {
            setIsAssigning(false)
        }
    }

    return (
        <AdminLayout
            title="Dispatch Command Center"
            description="AI-powered dispatch, geo-fencing, and real-time fleet management"
            actions={
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                    <Button onClick={() => setIsBookingModalOpen(true)}>
                        <Plus size={18} />
                        Manual Booking
                    </Button>
                </div>
            }
        >
            {/* Stats Overview - Referral Program Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <StatsCard label="Pending" value={String(stats?.pending_assignment || 0)} trend={stats?.trends?.pending_trend || "+0"} trendUp={!stats?.trends?.pending_trend?.startsWith('-')} icon={<Clock size={20} className="text-blue-500" />} iconBg="bg-blue-500/10" />
                <StatsCard label="Active Drivers" value={String(stats?.online_drivers || 0)} trend={stats?.trends?.drivers_trend || "+0"} trendUp={true} icon={<Users size={20} className="text-blue-500" />} iconBg="bg-blue-500/10" />
                <StatsCard label="In Progress" value={String(stats?.active_rides || 0)} trend={stats?.trends?.rides_trend || "+0"} trendUp={true} icon={<Car size={20} className="text-blue-500" />} iconBg="bg-blue-500/10" />
                <StatsCard label="Avg Wait" value="3.2min" trend="-0.5" trendUp={true} icon={<Timer size={20} className="text-blue-500" />} iconBg="bg-blue-500/10" />
                <StatsCard label="Auto-Assigned" value="92%" trend="+3%" trendUp={true} icon={<Target size={20} className="text-blue-500" />} iconBg="bg-blue-500/10" />
                <StatsCard label="ETA Accuracy" value="94%" trend="+1.2%" trendUp={true} icon={<Gauge size={20} className="text-blue-500" />} iconBg="bg-blue-500/10" />
            </div>

            {/* Map & Zone Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Live Dispatch Map (2/3) */}
                <div className="lg:col-span-2 bg-tride-card border border-tride-border rounded-3xl p-6 h-[720px] flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-tride-text">Live Dispatch Map</h3>
                        <div className="flex gap-2">
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {stats?.online_drivers || 0} Online
                             </div>
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-400">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                {stats?.pending_assignment || 0} Pending
                             </div>
                             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                {stats?.active_rides || 0} Active
                             </div>
                        </div>
                    </div>
                    <div className="bg-tride-hover rounded-2xl flex-1 overflow-hidden relative">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={12}
                                options={{
                                    styles: darkMapStyles,
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                }}
                            >
                                {/* We can add markers for active drivers/rides here */}
                            </GoogleMap>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-tride-text-muted">
                                <MapPin size={48} className="mx-auto mb-3" />
                                <p>Loading map...</p>
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 bg-tride-card/90 backdrop-blur border border-tride-border p-3 rounded-xl text-xs space-y-1">
                            <h4 className="font-semibold mb-1">Legend</h4>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Available Drivers</div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> On Trip</div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500" /> Pending Orders</div>
                        </div>
                    </div>
                </div>

                {/* Dispatch Controls & Zone Status (1/3) */}
                <div className="space-y-6">
                    {/* Controls */}
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-tride-text mb-4">Dispatch Controls</h3>
                        
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold text-emerald-400">Auto-Dispatch</span>
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-[10px] uppercase font-bold rounded-full">Active</span>
                            </div>
                            <p className="text-xs text-emerald-400/80 mb-3">AI-powered order assignment is running</p>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-white/10 w-full h-8 text-xs">
                                   Pause
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-white/10 hover:bg-white/20 border-white/10 w-full h-8 text-xs">
                                   Config
                                </Button>
                            </div>
                        </div>

                         <div className="space-y-2">
                            <div className="p-3 bg-tride-hover border border-tride-border rounded-xl flex items-center gap-3 cursor-pointer hover:border-tride-yellow/50 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-tride-card flex items-center justify-center">
                                    <Router size={16} />
                                </div>
                                <span className="text-sm font-medium">Broadcast to All Drivers</span>
                            </div>
                             <div className="p-3 bg-tride-hover border border-tride-border rounded-xl flex items-center gap-3 cursor-pointer hover:border-tride-yellow/50 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-tride-card flex items-center justify-center">
                                    <RefreshCw size={16} />
                                </div>
                                <span className="text-sm font-medium">Re-assign Stale Orders</span>
                            </div>
                            <div className="p-3 bg-tride-hover border border-tride-border rounded-xl flex items-center gap-3 cursor-pointer hover:border-tride-yellow/50 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-tride-card flex items-center justify-center">
                                    <TrendingUp size={16} />
                                </div>
                                <span className="text-sm font-medium">Surge Pricing Mode</span>
                            </div>
                             <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-red-500/20 transition-colors">
                                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                                    <AlertTriangle size={16} />
                                </div>
                                <span className="text-sm font-medium text-red-400">Emergency Stop</span>
                            </div>
                        </div>
                    </div>

                    {/* Zone Status */}
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-tride-text mb-4">Zone Status</h3>
                        <div className="space-y-3">
                            {['North', 'South', 'East', 'West', 'Central'].map((zone) => {
                                const driversInZoneCount = stats?.zone_stats?.[zone] || 0
                                const status = driversInZoneCount > 5 ? 'Normal' : driversInZoneCount > 0 ? 'Busy' : 'High Demand'
                                const statusColor = driversInZoneCount > 5 ? 'bg-emerald-500' : driversInZoneCount > 0 ? 'bg-amber-500' : 'bg-red-500'
                                
                                return (
                                    <div key={zone} className="flex items-center justify-between text-sm p-2 hover:bg-white/5 rounded-lg transition-colors">
                                        <span className="text-tride-text-muted font-medium">{zone} Zone</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-tride-text font-mono font-bold">{driversInZoneCount} drivers</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-white shadow-sm ${statusColor}`}>
                                                {status}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs - Referral Program Style */}
            <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit border border-tride-border overflow-x-auto">
                {[
                    `Pending Assignment (${pendingOrders.length})`, 
                    `Active Orders (${stats?.active_rides || 0})`, 
                    `Online Drivers (${availableDrivers.length})`, 
                    "Geo-Fencing Rules",
                    "AI Routing Config",
                    "Demand Heatmap",
                    "Assignment History"
                ].map((tab) => {
                    const tabKey = tab.replace(/\s*\(.*\)/, '')
                    return (
                        <Button
                            key={tab}
                            variant={activeTab === tabKey ? "default" : "ghost"}
                            onClick={() => setActiveTab(tabKey)}
                            className="rounded-xl whitespace-nowrap"
                        >
                            {tab}
                        </Button>
                    )
                })}
            </div>

            {/* Content Area */}
            <div className="space-y-6 animate-in fade-in duration-300">
                {activeTab === "Pending Assignment" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-tride-text">Orders Awaiting Assignment</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm">
                                    <RefreshCw size={14} className="mr-2" /> Refresh
                                </Button>
                                <Button size="sm">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse mr-2" />
                                    Auto-Assign All
                                </Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-tride-text-muted uppercase border-b border-tride-border bg-tride-hover/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-xl">Order ID</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Customer</th>
                                        <th className="px-4 py-3">Pickup</th>
                                        <th className="px-4 py-3">Destination</th>
                                        <th className="px-4 py-3">Wait Time</th>
                                        <th className="px-4 py-3">Nearby Drivers</th>
                                        <th className="px-4 py-3">Priority</th>
                                        <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan={9} className="text-center py-8">Loading...</td></tr>
                                    ) : pendingOrders.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-8 text-tride-text-muted">No pending orders</td></tr>
                                    ) : (
                                        pendingOrders.map(order => (
                                            <tr key={`${order.source_type}-${order.source_id}`} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors group">
                                                <td className="px-4 py-4 font-mono font-medium">
                                                    {order.order_id}
                                                </td>
                                                <td className="px-4 py-4">
                                                     <span className={`px-2 py-1 rounded-full text-xs font-bold border flex w-fit items-center gap-1 ${
                                                        order.type === 'Ride' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        order.type === 'Delivery' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                        'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                                    }`}>
                                                        {order.type === 'Ride' ? <Car size={10} /> : order.type === 'Delivery' ? <Truck size={10} /> : <Package size={10} />}
                                                        {order.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-tride-text">John Doe</td>
                                                <td className="px-4 py-4 text-tride-text-muted text-xs truncate max-w-[150px]" title={order.pickup}>
                                                    {order.pickup}
                                                </td>
                                                <td className="px-4 py-4 text-tride-text-muted text-xs truncate max-w-[150px]" title={order.dropoff}>
                                                    {order.dropoff}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="px-2 py-0.5 bg-tride-hover rounded text-xs text-tride-text font-mono">{order.time_ago}</span>
                                                </td>
                                                <td className="px-4 py-4 text-tride-text-muted text-xs">
                                                    <div className="flex items-center gap-1"><Users size={12} /> {Math.floor(Math.random() * 10)} available</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">High</span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="secondary" size="sm" className="h-7 text-xs">View Drivers</Button>
                                                        <Button size="sm" className="h-7 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => openAssignModal(order)}>Assign</Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "Active Orders" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-tride-text">Active Orders — Live Tracking</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-tride-text-muted uppercase bg-tride-hover/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-xl">Order</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Driver</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">ETA</th>
                                        <th className="px-4 py-3">Distance Left</th>
                                        <th className="px-4 py-3">Duration</th>
                                        <th className="px-4 py-3">Fare</th>
                                        <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeOrders.length === 0 ? (
                                        <tr><td colSpan={9} className="text-center py-8 text-tride-text-muted">No active orders</td></tr>
                                    ) : (
                                        activeOrders.map(o => (
                                            <tr key={o.order_id} className="border-b border-tride-border/50 last:border-0 hover:bg-tride-hover/30 transition-colors">
                                                <td className="px-4 py-4 font-mono font-medium text-tride-text">{o.order_id}</td>
                                                <td className="px-4 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${o.type==='Ride'?'bg-blue-500/10 text-blue-400 border-blue-500/20':o.type==='Delivery'?'bg-green-500/10 text-green-400 border-green-500/20':'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>{o.type}</span></td>
                                                <td className="px-4 py-4 text-tride-text">{o.driver}</td>
                                                <td className="px-4 py-4"><span className={`px-2 py-1 rounded text-xs font-medium ${o.status==='En Route to Pickup'?'bg-blue-500/10 text-blue-400':o.status==='Delivering'?'bg-green-500/10 text-green-400':o.status==='Picked Up'?'bg-purple-500/10 text-purple-400':o.status==='In Trip'?'bg-orange-500/10 text-orange-400':'bg-yellow-500/10 text-yellow-500'}`}>{o.status}</span></td>
                                                <td className="px-4 py-4 text-tride-text-muted">{o.eta}</td>
                                                <td className="px-4 py-4 text-tride-text-muted">{o.dist}</td>
                                                <td className="px-4 py-4 text-tride-text-muted">{o.dur}</td>
                                                <td className="px-4 py-4 font-bold text-tride-text">{o.fare}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex justify-end gap-2 text-tride-text-muted">
                                                        <Eye size={16} className="cursor-pointer hover:text-blue-500" />
                                                        <Phone size={16} className="cursor-pointer hover:text-blue-500" />
                                                        <span className="text-blue-500 cursor-pointer text-xs font-medium">Reassign</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "Online Drivers" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-tride-text">Online Drivers</h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" />
                                <Input placeholder="Search drivers..." className="pl-9 w-64" value={driverSearch} onChange={(e) => setDriverSearch(e.target.value)} />
                            </div>
                        </div>
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-tride-text-muted uppercase border-b border-tride-border bg-tride-hover/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-xl">Driver</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3">Vehicle</th>
                                        <th className="px-4 py-3">Location</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Current Order</th>
                                        <th className="px-4 py-3">Today's Trips</th>
                                        <th className="px-4 py-3">Rating</th>
                                        <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {availableDrivers.map(driver => (
                                        <tr key={driver.id} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-tride-hover overflow-hidden flex items-center justify-center">
                                                        {driver.photo ? <img src={driver.photo} className="w-full h-full object-cover" /> : <User size={16} className="text-tride-text-muted" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-tride-text">{driver.name}</div>
                                                        <div className="text-xs text-tride-text-muted">ID: DRV-{driver.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="border border-tride-border px-2 py-0.5 rounded-full text-xs text-tride-text-muted">{driver.service_type}</span>
                                            </td>
                                            <td className="px-4 py-4 text-tride-text-muted">{driver.vehicle_type}</td>
                                            <td className="px-4 py-4 text-tride-text flex items-center gap-1">
                                                <MapPin size={12} className="text-tride-text-muted" /> {driver.location || 'Unknown'}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold uppercase">Available</span>
                                            </td>
                                            <td className="px-4 py-4 text-tride-text-muted">-</td>
                                            <td className="px-4 py-4 text-tride-text font-mono">{driver.trips_count}</td>
                                            <td className="px-4 py-4 text-yellow-500 font-bold flex items-center gap-1">
                                                <Star size={12} fill="currentColor" /> {driver.rating}
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                 <div className="flex justify-end gap-2 text-tride-text-muted">
                                                    <Eye size={16} className="cursor-pointer hover:text-white" />
                                                    <Phone size={16} className="cursor-pointer hover:text-white" />
                                                    <MapPin size={16} className="cursor-pointer hover:text-white" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                 {activeTab === "Geo-Fencing Rules" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold text-tride-text">Active Geo-Fences</h3>
                                <Button size="sm"><Plus size={14} className="mr-1" /> Create New</Button>
                            </div>
                            <div className="space-y-4">
                                {[{name:'Airport Pickup Zone',radius:'300m',drivers:45,type:'Pickup Only',rule:'Queue Management',status:'Active'},{name:'CBD Peak Hours',radius:'2km',drivers:89,type:'Surge Zone',rule:'Auto Surge 1.5x',status:'Active'},{name:'University Campus',radius:'1km',drivers:12,type:'Restricted',rule:'Speed Limit 20km/h',status:'Active'},{name:'Industrial Area',radius:'3km',drivers:8,type:'No-Go Zone',rule:'Block All',status:'Active'},{name:'Stadium Event Zone',radius:'1.5km',drivers:34,type:'Event',rule:'Special Pricing',status:'Scheduled'},{name:'Construction Zone',radius:'800m',drivers:0,type:'Avoid',rule:'Route Around',status:'Active'}].map((zone, i) => (
                                    <div key={i} className="p-4 border border-tride-border rounded-2xl hover:border-blue-500/30 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-semibold text-tride-text">{zone.name}</h4>
                                                <p className="text-xs text-tride-text-muted">{zone.radius} radius · {zone.drivers} drivers inside</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${zone.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-400'}`}>{zone.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs bg-tride-hover px-2 py-0.5 rounded text-tride-text-muted">{zone.type}</span>
                                            <span className="text-xs text-tride-text-muted">→ {zone.rule}</span>
                                        </div>
                                        <div className="flex gap-2 text-xs">
                                            <span className="text-blue-500 cursor-pointer hover:underline">Edit</span>
                                            <span className="text-blue-500 cursor-pointer hover:underline">View on Map</span>
                                            <span className="text-red-400 cursor-pointer hover:underline">Disable</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">Geo-Fence Rules Engine</h3>
                            <p className="text-sm text-tride-text-muted mb-6">Automated actions when drivers/riders enter or exit zones</p>
                            <div className="space-y-4">
                                {[{title:'Driver enters Airport Zone',sub:'Entry → Add to airport queue',on:true},{title:'Driver exits service area',sub:'Exit → Send return notification',on:true},{title:'Order placed in No-Go Zone',sub:'Order → Auto-reject + suggest alternative',on:true},{title:'Driver speed > 120km/h',sub:'Speed → Send warning + log incident',on:true},{title:'Driver idle > 30min in Surge Zone',sub:'Idle → Notify dispatch for relocation',on:false},{title:'Customer pickup in Restricted Area',sub:'Pickup → Suggest nearest safe point',on:true},{title:'5+ drivers cluster in low-demand area',sub:'Cluster → Send relocation notice',on:true},{title:'Event zone activated',sub:'Schedule → Apply event pricing + deploy drivers',on:true}].map((rule, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-tride-border rounded-xl hover:border-blue-500/30 transition-colors">
                                        <div>
                                            <p className="font-medium text-sm text-tride-text">{rule.title}</p>
                                            <p className="text-xs text-tride-text-muted">{rule.sub}</p>
                                        </div>
                                        <div className={`w-10 h-5 rounded-full relative cursor-pointer ${rule.on ? 'bg-blue-600' : 'bg-tride-hover'}`}>
                                            <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${rule.on ? 'right-1' : 'left-1'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "AI Routing Config" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">Matching Algorithm</h3>
                            <div className="space-y-4">
                                {[{label:'Max Search Radius',val:'5 km',desc:'Maximum distance to find drivers'},{label:'Priority Weight: Distance',val:'40%',desc:'How much driver proximity matters'},{label:'Priority Weight: Rating',val:'25%',desc:'Driver rating importance'},{label:'Priority Weight: Vehicle Match',val:'20%',desc:'Vehicle type preference'},{label:'Priority Weight: Acceptance Rate',val:'15%',desc:'Historical accept rate'},{label:'Max Wait Before Escalation',val:'5 min',desc:'Time before widening search'},{label:'Driver Batch Size',val:'5',desc:'Drivers notified simultaneously'},{label:'Accept Timeout',val:'15 sec',desc:'Time for driver to accept'}].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-tride-border rounded-xl">
                                        <div>
                                            <p className="font-medium text-sm text-tride-text">{item.label}</p>
                                            <p className="text-xs text-tride-text-muted">{item.desc}</p>
                                        </div>
                                        <span className="bg-tride-hover px-3 py-1 rounded-lg text-sm font-mono font-medium text-tride-text">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">Rebalancing Strategy</h3>
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
                                <h4 className="font-semibold text-blue-400 mb-1">Active Strategy: Predictive Rebalancing</h4>
                                <p className="text-xs text-tride-text-muted mb-4">ML model predicts demand 30 minutes ahead and nudges drivers to high-demand zones</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div className="flex justify-between"><span className="text-tride-text-muted">Model Accuracy</span><span className="font-medium text-tride-text">87%</span></div>
                                    <div className="flex justify-between"><span className="text-tride-text-muted">Prediction Window</span><span className="font-medium text-tride-text">30 min</span></div>
                                    <div className="flex justify-between"><span className="text-tride-text-muted">Nudges Sent Today</span><span className="font-medium text-tride-text">234</span></div>
                                    <div className="flex justify-between"><span className="text-tride-text-muted">Driver Compliance</span><span className="font-medium text-tride-text">62%</span></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {[{zone:'Airport: Deploy 15 more drivers',time:'Next 30 min'},{zone:'CBD: Reduce by 10 drivers',time:'Now'},{zone:'Stadium: Pre-position 25 drivers',time:'In 2 hours'}].map((cmd, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-tride-border rounded-xl">
                                        <div>
                                            <p className="font-medium text-sm text-tride-text">{cmd.zone}</p>
                                            <p className="text-xs text-tride-text-muted">{cmd.time}</p>
                                        </div>
                                        <Button variant="secondary" size="sm">Execute</Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">Performance Metrics</h3>
                            <div className="space-y-4">
                                {[{label:'Avg Match Time',val:'1.8s',target:'target < 5s'},{label:'First Accept Rate',val:'78%',target:'target > 75%'},{label:'Escalation Rate',val:'8%',target:'target < 15%'},{label:'Ghost Rides',val:'0.3%',target:'target < 1%'},{label:'Route Efficiency',val:'92%',target:'target > 90%'},{label:'Driver Idle Time',val:'12 min',target:'target < 15 min'},{label:'Cancel After Match',val:'4.2%',target:'target < 5%'}].map((m, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-tride-border/50 last:border-0">
                                        <span className="text-sm text-tride-text">{m.label}</span>
                                        <div className="text-right">
                                            <span className="font-bold text-tride-text font-mono">{m.val}</span>
                                            <span className="text-xs text-tride-text-muted ml-2">({m.target})</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Demand Heatmap" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-1">Demand Heatmap</h3>
                            <p className="text-sm text-tride-text-muted mb-6">Real-time demand intensity across service zones</p>
                            <div className="border-2 border-dashed border-tride-border rounded-2xl h-[350px] flex flex-col items-center justify-center text-tride-text-muted">
                                <Globe size={48} className="mb-3 opacity-50" />
                                <p className="font-medium">Live demand heatmap</p>
                                <p className="text-xs">Color intensity = request density</p>
                                <div className="mt-6 bg-tride-hover rounded-xl p-4">
                                    <p className="text-xs font-medium text-tride-text mb-2">Demand Scale</p>
                                    <div className="flex gap-1">
                                        {['bg-green-300','bg-green-500','bg-yellow-400','bg-orange-400','bg-red-400','bg-red-600'].map((c,i) => (
                                            <div key={i} className={`w-8 h-4 rounded ${c}`} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-[10px] mt-1"><span>Low</span><span>High</span></div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">Hot Zones (Live)</h3>
                            <div className="space-y-3">
                                {[{name:'Airport Terminal 1',req:89,drv:12,gap:77,surge:'2.1x'},{name:'Central Business District',req:156,drv:89,gap:67,surge:'1.8x'},{name:'University Area',req:67,drv:28,gap:39,surge:'1.5x'},{name:'Mall of Africa',req:45,drv:34,gap:11,surge:'1.2x'},{name:'Industrial Park',req:23,drv:45,gap:-22,surge:'1.0x'},{name:'Residential North',req:34,drv:41,gap:-7,surge:'1.0x'}].map((z, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border ${z.gap > 30 ? 'border-red-500/30 bg-red-500/5' : z.gap > 10 ? 'border-orange-500/20 bg-orange-500/5' : 'border-tride-border'}`}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold text-tride-text">{z.name}</h4>
                                                <p className="text-xs text-tride-text-muted">{z.req} requests    {z.drv} drivers</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${parseFloat(z.surge) > 1.5 ? 'bg-red-500 text-white' : 'bg-tride-hover text-tride-text'}`}>{z.surge}</span>
                                        </div>
                                        <p className={`text-xs font-medium mt-1 ${z.gap > 0 ? 'text-red-400' : 'text-green-500'}`}>Gap: {z.gap > 0 ? '+' : ''}{z.gap}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Assignment History" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-tride-text">Assignment History</h3>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" />
                                <Input placeholder="Search history..." className="pl-9 w-64" />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-tride-text-muted uppercase bg-tride-hover/50">
                                    <tr>
                                        <th className="px-4 py-3 rounded-l-xl">Order</th>
                                        <th className="px-4 py-3">Driver</th>
                                        <th className="px-4 py-3">Method</th>
                                        <th className="px-4 py-3">Match Time</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 rounded-r-xl">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[{order:'RID-7990',driver:'Ali K.',method:'AI Auto',time:'1.2s',status:'Completed',date:'Feb 13, 2:30 PM'},{order:'DEL-7989',driver:'Sara M.',method:'AI Auto',time:'0.8s',status:'Completed',date:'Feb 13, 2:15 PM'},{order:'PKG-7988',driver:'Omar R.',method:'Manual',time:'5 min',status:'Completed',date:'Feb 13, 1:45 PM'},{order:'RID-7987',driver:'Zain A.',method:'AI Auto',time:'2.1s',status:'Cancelled',date:'Feb 13, 1:20 PM'},{order:'DEL-7986',driver:'Hina P.',method:'Broadcast',time:'45s',status:'Completed',date:'Feb 13, 12:50 PM'}].map((h, i) => (
                                        <tr key={i} className="border-b border-tride-border/50 last:border-0 hover:bg-tride-hover/30 transition-colors">
                                            <td className="px-4 py-4 font-mono font-medium text-tride-text">{h.order}</td>
                                            <td className="px-4 py-4 text-tride-text">{h.driver}</td>
                                            <td className="px-4 py-4"><span className={`px-2 py-0.5 rounded text-xs font-medium ${h.method==='AI Auto'?'bg-blue-500/10 text-blue-400':h.method==='Manual'?'bg-orange-500/10 text-orange-400':'bg-purple-500/10 text-purple-400'}`}>{h.method}</span></td>
                                            <td className="px-4 py-4 font-mono text-tride-text-muted">{h.time}</td>
                                            <td className="px-4 py-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${h.status==='Completed'?'bg-green-500/10 text-green-500':'bg-red-500/10 text-red-400'}`}>{h.status}</span></td>
                                            <td className="px-4 py-4 text-tride-text-muted">{h.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Booking Modal */}
            <ManualBookingModal 
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSave={fetchAllData}
                isLoaded={isLoaded}
            />

            {/* Assign Driver Modal */}
            <AssignDriverModal 
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false)
                    setSelectedOrder(null)
                }}
                order={selectedOrder}
                drivers={availableDrivers}
                onAssign={handleAssignDriver}
                isAssigning={isAssigning}
            />
        </AdminLayout>
    )
}

// ==================== COMPONENTS ====================

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-5 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-xs font-medium mb-1">{label}</p>
                <div className="text-2xl font-bold mb-2 text-tride-text">{value}</div>
                <div className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-sm">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center text-tride-text`}>
                {icon}
            </div>
        </div>
    )
}

function OrderCard({ order, onAssign }: { order: PendingOrder, onAssign: () => void }) {
    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'ride': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'delivery': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'courier': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            default: return 'bg-white/10 text-white/70 border-white/20'
        }
    }

    return (
        <div className="bg-tride-hover border border-tride-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(order.type)}`}>
                    {order.type}
                </span>
                <span className="text-xs text-tride-text-muted">{order.time_ago}</span>
            </div>
            <p className="font-bold text-tride-text mb-1">Order #{order.order_id}</p>
            <p className="text-sm text-tride-text-muted mb-3">{order.status}</p>
            <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-center"
                onClick={onAssign}
            >
                Assign Driver
            </Button>
        </div>
    )
}

// ==================== MODALS ====================

function ManualBookingModal({ isOpen, onClose, onSave, isLoaded }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onSave: () => void,
    isLoaded: boolean
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [type, setType] = useState("ride")
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [pickupAddress, setPickupAddress] = useState("")
    const [dropoffAddress, setDropoffAddress] = useState("")
    const [fare, setFare] = useState("")
    const [notes, setNotes] = useState("")

    const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
    const [dropoffAutocomplete, setDropoffAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

    const onPickupLoad = (autocomplete: google.maps.places.Autocomplete) => {
        setPickupAutocomplete(autocomplete)
    }

    const onDropoffLoad = (autocomplete: google.maps.places.Autocomplete) => {
        setDropoffAutocomplete(autocomplete)
    }

    const onPickupPlaceChanged = () => {
        if (pickupAutocomplete !== null) {
            const place = pickupAutocomplete.getPlace()
            if (place.formatted_address) {
                setPickupAddress(place.formatted_address)
            }
        }
    }

    const onDropoffPlaceChanged = () => {
        if (dropoffAutocomplete !== null) {
            const place = dropoffAutocomplete.getPlace()
            if (place.formatted_address) {
                setDropoffAddress(place.formatted_address)
            }
        }
    }

    useEffect(() => {
        if (isOpen) {
            setType("ride")
            setCustomerName("")
            setCustomerPhone("")
            setPickupAddress("")
            setDropoffAddress("")
            setFare("")
            setNotes("")
            setError("")
        }
    }, [isOpen])

    const handleSubmit = async () => {
        if (!customerName || !customerPhone || !pickupAddress || !dropoffAddress) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            await axios.post('/admin/dispatch/manual-booking', {
                type,
                customer_name: customerName,
                customer_phone: customerPhone,
                pickup_address: pickupAddress,
                dropoff_address: dropoffAddress,
                fare: fare ? parseFloat(fare) : null,
                notes
            })
            onSave()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Manual Booking"
            description="Create a new booking manually"
            icon={<Plus size={20} />}
            size="lg"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit} isLoading={loading}>
                        Create Booking
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />
                
                <ModalSelect
                    label="Booking Type"
                    value={type}
                    onChange={setType}
                    options={[
                        { label: "Ride", value: "ride" },
                        { label: "Delivery", value: "delivery" },
                        { label: "Courier", value: "courier" },
                    ]}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput 
                        label="Customer Name" 
                        value={customerName} 
                        onChange={setCustomerName} 
                        placeholder="John Doe"
                        icon={<User size={16} />}
                        required 
                    />
                    <ModalInput 
                        label="Customer Phone" 
                        value={customerPhone} 
                        onChange={setCustomerPhone} 
                        placeholder="+1234567890"
                        icon={<Phone size={16} />}
                        required 
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-white/70 ml-1">Pickup Address</label>
                    {isLoaded ? (
                        <Autocomplete onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                            <input 
                                type="text"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                                placeholder="123 Main St, City"
                                className="w-full bg-tride-hover border border-tride-border rounded-xl px-4 py-3 text-tride-text focus:outline-none focus:border-tride-yellow transition-all"
                                required
                            />
                        </Autocomplete>
                    ) : (
                        <ModalInput 
                            label="" 
                            value={pickupAddress} 
                            onChange={setPickupAddress} 
                            placeholder="123 Main St, City"
                            icon={<MapPin size={16} />}
                            required 
                        />
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-white/70 ml-1">Dropoff Address</label>
                    {isLoaded ? (
                        <Autocomplete onLoad={onDropoffLoad} onPlaceChanged={onDropoffPlaceChanged}>
                            <input 
                                type="text"
                                value={dropoffAddress}
                                onChange={(e) => setDropoffAddress(e.target.value)}
                                placeholder="456 Oak Ave, City"
                                className="w-full bg-tride-hover border border-tride-border rounded-xl px-4 py-3 text-tride-text focus:outline-none focus:border-tride-yellow transition-all"
                                required
                            />
                        </Autocomplete>
                    ) : (
                        <ModalInput 
                            label="" 
                            value={dropoffAddress} 
                            onChange={setDropoffAddress} 
                            placeholder="456 Oak Ave, City"
                            icon={<MapPin size={16} />}
                            required 
                        />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput 
                        label="Fare (Optional)" 
                        value={fare} 
                        onChange={setFare} 
                        placeholder="25.00"
                        type="number"
                    />
                    <ModalInput 
                        label="Notes (Optional)" 
                        value={notes} 
                        onChange={setNotes} 
                        placeholder="Any special instructions"
                    />
                </div>
            </div>
        </Modal>
    )
}

function AssignDriverModal({ isOpen, onClose, order, drivers, onAssign, isAssigning }: {
    isOpen: boolean
    onClose: () => void
    order: PendingOrder | null
    drivers: AvailableDriver[]
    onAssign: (driverId: number) => void
    isAssigning: boolean
}) {
    const [selectedDriverId, setSelectedDriverId] = useState<string>("")

    useEffect(() => {
        if (isOpen) {
            setSelectedDriverId("")
        }
    }, [isOpen])

    // Filter drivers based on order type
    const filteredDrivers = drivers.filter(driver => {
        if (!order) return false
        const orderType = order.type.toLowerCase()
        return driver.service_type === orderType
    })

    const driverOptions = filteredDrivers.map(driver => ({
        label: `${driver.name} (${driver.vehicle_type}) - ⭐ ${driver.rating}`,
        value: driver.id.toString()
    }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Driver"
            description={order ? `Assign a driver to ${order.type} Order #${order.order_id}` : "Select a driver"}
            icon={<Users size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={isAssigning}>Cancel</ModalButton>
                    <ModalButton 
                        variant="primary" 
                        onClick={() => selectedDriverId && onAssign(parseInt(selectedDriverId))} 
                        isLoading={isAssigning}
                        disabled={!selectedDriverId}
                    >
                        Confirm Assignment
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4 py-2">
                <ModalSelect
                    label="Select Active Driver"
                    value={selectedDriverId}
                    onChange={setSelectedDriverId}
                    options={driverOptions}
                    required
                />
                
                {selectedDriverId && (
                    <div className="bg-tride-hover border border-tride-border rounded-xl p-4 flex items-center gap-4">
                        {drivers.find(d => d.id.toString() === selectedDriverId)?.photo ? (
                            <img 
                                src={drivers.find(d => d.id.toString() === selectedDriverId)?.photo || ""} 
                                alt="Driver" 
                                className="w-12 h-12 rounded-full object-cover" 
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-tride-card flex items-center justify-center">
                                <User size={24} className="text-tride-text-muted" />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-tride-text">
                                {drivers.find(d => d.id.toString() === selectedDriverId)?.name}
                            </p>
                            <p className="text-sm text-tride-text-muted">
                                {drivers.find(d => d.id.toString() === selectedDriverId)?.phone}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

// ==================== CONSTANTS ====================

const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b9" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
]
