import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { 
    Users, MapPin, DollarSign, PieChart, Navigation, Clock, 
    Settings, Eye, ArrowUpRight, ArrowDownRight, Zap, 
    Users2, Percent, TrendingUp, Info, Activity, ShieldCheck, Loader2
} from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

export default function RidePoolingPage() {
    const [activeTab, setActiveTab] = useState("pools")
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        fetchDashboardData(true)
    }, [])

    const fetchDashboardData = async (isInitial = false) => {
        if (isInitial) setLoading(true)
        try {
            const res = await axios.get('/admin/ride-pooling/dashboard')
            if (res.data.success) {
                setData(res.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch pooling dashboard:", error)
        } finally {
            if (isInitial) setLoading(false)
        }
    }

    const handleUpdateSetting = async (key: string, value: any) => {
        try {
            await axios.patch('/admin/ride-pooling/settings', { [key]: value })
            fetchDashboardData()
        } catch (error) {
            console.error("Failed to update setting:", error)
        }
    }

    if (loading && !data) {
        return (
            <AdminLayout title="Ride Pooling" description="Loading metrics...">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 size={40} className="text-tride-yellow animate-spin" />
                    <p className="text-tride-text-muted animate-pulse">Syncing matching engine data...</p>
                </div>
            </AdminLayout>
        )
    }

    const { stats, pools, settings } = data || { stats: {}, pools: [], settings: {} }

    const statCards = [
        { label: "Active Pools", value: stats.active_pools, trend: "+3", trendUp: true, icon: <Users2 size={20} className="text-blue-500" />, iconBg: "bg-blue-500/10" },
        { label: "Match Rate", value: stats.match_rate + "%", trend: "+5%", trendUp: true, icon: <PieChart size={20} className="text-indigo-500" />, iconBg: "bg-indigo-500/10" },
        { label: "Rider Savings", value: "$" + stats.rider_savings, trend: "+18%", trendUp: true, icon: <DollarSign size={20} className="text-green-500" />, iconBg: "bg-green-500/10" },
        { label: "Avg Overlap", value: stats.avg_overlap + "%", trend: "+2%", trendUp: true, icon: <MapPin size={20} className="text-purple-500" />, iconBg: "bg-purple-500/10" },
        { label: "Avg Detour", value: stats.avg_detour + " km", trend: "-0.3", trendUp: true, icon: <Navigation size={20} className="text-orange-500" />, iconBg: "bg-orange-500/10" },
        { label: "Wait Match", value: stats.wait_match + " min", trend: "-0.8", trendUp: true, icon: <Clock size={20} className="text-cyan-500" />, iconBg: "bg-cyan-500/10" },
    ]

    return (
        <AdminLayout
            title="Ride Pooling"
            description="Backend-controlled multi-rider trips · route overlap · capacity matching"
            actions={
                <Button className="flex items-center gap-2 bg-tride-yellow text-black hover:bg-tride-yellow/90 font-bold border-none shadow-sm h-11 px-6 rounded-xl">
                    <Settings size={18} />
                    Pool Config
                </Button>
            }
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-tride-card border border-tride-border p-6 rounded-3xl relative overflow-hidden hover:bg-tride-hover/30 transition-all flex flex-col justify-between h-full group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                                stat.trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                            }`}>
                                {stat.trendUp ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                {stat.trend}
                            </span>
                        </div>
                        <div>
                            <p className="text-[11px] text-tride-text-muted font-medium mb-1 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-tride-text">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-tride-card border border-tride-border rounded-[2.5rem] overflow-hidden shadow-sm min-h-[500px]">
                
                {/* Tabs */}
                <div className="flex gap-1 p-4 border-b border-tride-border overflow-x-auto scrollbar-hide">
                    {[
                        { id: "pools", label: `Active Pools (${pools.length})` },
                        { id: "engine", label: "Matching Engine" },
                        { id: "pricing", label: "Pool Pricing" },
                        { id: "config", label: "Configuration" }
                    ].map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <Button
                                key={tab.id}
                                variant={isActive ? "default" : "ghost"}
                                onClick={() => setActiveTab(tab.id)}
                                className={`rounded-xl px-6 h-10 transition-all font-bold whitespace-nowrap ${
                                    isActive 
                                    ? "bg-tride-yellow text-black shadow-md border-none" 
                                    : "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover"
                                }`}
                            >
                                {tab.label}
                            </Button>
                        )
                    })}
                </div>

                <div className="">
                    {activeTab === "pools" && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-tride-border text-tride-text-muted text-sm bg-tride-hover">
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] whitespace-nowrap">Pool ID</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Riders</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Driver</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Seats</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Matching Logic</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Route Overlap</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Detour</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">Savings/Rider</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px]">ETA</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] whitespace-nowrap">Status</th>
                                        <th className="px-6 py-4 font-medium uppercase tracking-wider text-[11px] text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-tride-border">
                                    {pools.map((pool: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-tride-hover/50 transition-colors group">
                                            <td className="px-6 py-4 text-xs font-mono font-bold text-tride-text-muted whitespace-nowrap">{pool.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    {(pool.riders || []).map((rider: string, i: number) => (
                                                        <span key={i} className="bg-tride-hover border border-tride-border text-[10px] font-bold text-tride-text px-2 py-0.5 rounded-full whitespace-nowrap">
                                                            {rider}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-tride-text whitespace-nowrap">{pool.driver}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs font-black text-tride-text">
                                                    <Users size={12} className="text-tride-text-muted" />
                                                    {pool.capacity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-lg border border-indigo-500/20 font-bold whitespace-nowrap">
                                                        {pool.strategy}
                                                    </span>
                                                    {pool.is_smart && <Zap size={10} className="text-tride-yellow fill-tride-yellow animate-pulse" />}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-black text-tride-text">{pool.overlap}</td>
                                            <td className="px-6 py-4 text-sm text-tride-text-muted">{pool.detour}</td>
                                            <td className="px-6 py-4 text-sm font-bold text-green-500">{pool.savings}</td>
                                            <td className="px-6 py-4 text-sm text-tride-text-muted">{pool.eta}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border inline-flex items-center justify-center min-w-[100px] ${
                                                    pool.status === 'In Trip' ? 'bg-blue-600/20 text-blue-500 border-blue-500/20' :
                                                    pool.status === 'Waiting Match' ? 'bg-tride-hover text-tride-text-muted border-tride-border' :
                                                    'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                    {pool.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/admin/ride-pooling/${pool.db_id}`}>
                                                    <IconButton tooltip="View Detailed View" className="hover:bg-tride-hover transition-colors">
                                                        <Eye size={16} />
                                                    </IconButton>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === "engine" && (
                        <div className="p-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-tride-text mb-1">Matching Algorithm Parameters</h3>
                                <p className="text-sm text-tride-text-muted">Server-side route grouping criteria</p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { key: "min_route_overlap", label: "Min Route Overlap", value: settings.min_route_overlap + "%", desc: "Minimum shared route percentage to group riders" },
                                    { key: "max_detour_distance", label: "Max Detour Distance", value: settings.max_detour_distance + " km", desc: "Maximum additional distance for pooled pickup/dropoff" },
                                    { key: "max_detour_time", label: "Max Detour Time", value: settings.max_detour_time + " min", desc: "Maximum additional time added to any rider's trip" },
                                    { key: "max_pool_size", label: "Max Pool Size", value: settings.max_pool_size + " riders", desc: "Maximum riders in a single pool" },
                                    { key: "match_window_minutes", label: "Match Window", value: settings.match_window_minutes + " min", desc: "Time to wait for matching riders" },
                                    { key: "direction_tolerance", label: "Direction Tolerance", value: settings.direction_tolerance + "°", desc: "Angular tolerance for route direction matching" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-tride-hover/30 border border-tride-border rounded-2xl hover:bg-tride-hover transition-all group">
                                        <div>
                                            <p className="text-sm font-bold text-tride-text mb-0.5">{item.label}</p>
                                            <p className="text-[10px] uppercase font-black tracking-widest text-tride-text-muted">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-black text-tride-text">{item.value}</span>
                                            <IconButton size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Settings size={14} className="text-tride-text-muted" />
                                            </IconButton>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "pricing" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                            <div className="bg-tride-card/50 border border-tride-border p-6 rounded-[2rem]">
                                <h3 className="text-lg font-bold text-tride-text mb-6 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-tride-yellow" />
                                    Rider Pricing
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Pool Discount (2 riders)", value: settings.discount_2_riders + "% off solo fare" },
                                        { label: "Pool Discount (3 riders)", value: settings.discount_3_riders + "% off solo fare" },
                                        { label: "No-Match Guarantee", value: settings.no_match_guarantee ? "Solo fare if unmatched" : "Standard fare" },
                                        { label: "Wait Compensation", value: "$" + settings.wait_compensation_rider + "/min after 5 min" },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-tride-hover rounded-xl border border-tride-border">
                                            <span className="text-sm font-medium text-tride-text">{item.label}</span>
                                            <span className="text-xs font-bold text-tride-text-muted">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-tride-card/50 border border-tride-border p-6 rounded-[2rem]">
                                <h3 className="text-lg font-bold text-tride-text mb-6 flex items-center gap-2">
                                    <DollarSign size={18} className="text-green-500" />
                                    Driver Payout
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: "Pool Bonus (2 riders)", value: "+" + settings.bonus_2_riders + "% of base fare" },
                                        { label: "Pool Bonus (3 riders)", value: "+" + settings.bonus_3_riders + "% of base fare" },
                                        { label: "Detour Compensation", value: "$" + settings.detour_compensation_km + "/km extra" },
                                        { label: "Wait Time Pay", value: settings.wait_time_pay_type.charAt(0).toUpperCase() + settings.wait_time_pay_type.slice(1) },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-tride-hover rounded-xl border border-tride-border">
                                            <span className="text-sm font-medium text-tride-text">{item.label}</span>
                                            <span className="text-xs font-bold text-tride-text-muted">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "config" && (
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-tride-text mb-6">Pool Configuration</h3>
                            <div className="space-y-3">
                                {[
                                    { key: "is_pooling_enabled", label: "Enable Pooling", enabled: settings.is_pooling_enabled },
                                    { key: "auto_match_riders", label: "Auto-Match Riders", enabled: settings.auto_match_riders },
                                    { key: "allow_cross_zone", label: "Allow Cross-Zone Pools", enabled: settings.allow_cross_zone },
                                    { key: "surge_pooling", label: "Surge Pooling (pool during surge)", enabled: settings.surge_pooling },
                                    { key: "gender_preference", label: "Gender Preference Matching", enabled: settings.gender_preference },
                                    { key: "min_rating_filter", label: "Rating Filter (min 4.0 riders)", enabled: settings.min_rating_filter >= 4.0 },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-tride-hover/30 border border-tride-border rounded-2xl hover:bg-tride-hover transition-all">
                                        <span className="text-sm font-medium text-tride-text">{item.label}</span>
                                        <Switch 
                                            checked={item.enabled} 
                                            onChange={(val) => handleUpdateSetting(item.key, val)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}

function Switch({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                checked ? 'bg-tride-yellow' : 'bg-neutral-800'
            }`}
        >
            <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    checked ? 'translate-x-5' : 'translate-x-1'
                }`}
            />
        </button>
    )
}
