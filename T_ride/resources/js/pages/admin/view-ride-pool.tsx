import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { 
    Users, MapPin, DollarSign, PieChart, Navigation, Clock, 
    Settings, Eye, ArrowLeft, ArrowUpRight, ArrowDownRight, Zap, 
    Users2, Percent, TrendingUp, Info, Activity, ShieldCheck, Loader2,
    Calendar, CheckCircle2, User, Car
} from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface Props {
    id: string | number;
}

export default function ViewRidePool({ id }: Props) {
    const [loading, setLoading] = useState(true)
    const [pool, setPool] = useState<any>(null)

    useEffect(() => {
        fetchPoolDetails()
    }, [id])

    const fetchPoolDetails = async () => {
        setLoading(true)
        try {
            const res = await axios.get(`/admin/ride-pooling/${id}`)
            if (res.data.success) {
                setPool(res.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch pool details:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Pool Details" description="Loading pool intelligence...">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Loader2 size={40} className="text-tride-yellow animate-spin" />
                    <p className="text-tride-text-muted animate-pulse">Retrieving route data...</p>
                </div>
            </AdminLayout>
        )
    }

    if (!pool) {
        return (
            <AdminLayout title="Error" description="Pool not found">
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500">
                    The requested ride pool could not be found or has been archived.
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title={`Pool ${pool.pool_custom_id}`}
            description="Detailed trip grouping analysis and route overlap metrics"
            actions={
                <Link href="/admin/ride-pooling">
                    <Button variant="ghost" className="flex items-center gap-2 text-tride-text-muted hover:text-white">
                        <ArrowLeft size={18} />
                        Back to List
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Trip Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-tride-card border border-tride-border p-8 rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                             <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${
                                pool.status === 'In Trip' ? 'bg-blue-600/20 text-blue-500 border-blue-500/20' :
                                pool.status === 'Waiting Match' ? 'bg-tride-hover text-tride-text-muted border-tride-border' :
                                'bg-yellow-500/20 text-yellow-500 border-yellow-500/20'
                            }`}>
                                {pool.status}
                            </div>
                        </div>

                        <h3 className="text-2xl font-bold text-tride-text mb-8 flex items-center gap-3">
                            <Activity size={24} className="text-tride-yellow" />
                            Live Route Intelligence
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <div className="bg-tride-hover/50 p-6 rounded-3xl border border-tride-border">
                                <p className="text-[11px] text-tride-text-muted uppercase font-bold tracking-widest mb-1">Route Overlap</p>
                                <p className="text-3xl font-black text-tride-text">{pool.route_overlap}%</p>
                                <div className="mt-2 h-1.5 w-full bg-tride-border rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pool.route_overlap}%` }}></div>
                                </div>
                            </div>
                            <div className="bg-tride-hover/50 p-6 rounded-3xl border border-tride-border">
                                <p className="text-[11px] text-tride-text-muted uppercase font-bold tracking-widest mb-1">System Efficiency</p>
                                <p className="text-3xl font-black text-green-500">High</p>
                                <p className="text-[10px] text-tride-text-muted mt-1 flex items-center gap-1">
                                    <CheckCircle2 size={12} className="text-green-500" /> Matches tier 1 criteria
                                </p>
                            </div>
                            <div className="bg-tride-hover/50 p-6 rounded-3xl border border-tride-border">
                                <p className="text-[11px] text-tride-text-muted uppercase font-bold tracking-widest mb-1">Trip Detour</p>
                                <p className="text-3xl font-black text-orange-500">{pool.detour_distance} km</p>
                                <p className="text-[10px] text-tride-text-muted mt-1">Within {pool.eta_minutes} min threshold</p>
                            </div>
                        </div>

                        {/* Timeline of Events */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-tride-text-muted uppercase tracking-widest mb-4">Pickup Sequence</h4>
                            {pool.riders.map((rider: string, i: number) => (
                                <div key={i} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 bg-tride-hover rounded-full flex items-center justify-center border border-tride-border text-tride-yellow font-bold text-sm">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 bg-tride-hover/30 p-4 rounded-2xl border border-tride-border group-hover:bg-tride-hover transition-colors">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-tride-text">{rider}</span>
                                            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-black uppercase">Boarded</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-tride-card border border-tride-border p-8 rounded-[2.5rem]">
                        <h3 className="text-xl font-bold text-tride-text mb-6">Internal Audit / Log</h3>
                        <div className="space-y-3">
                            <div className="p-4 bg-tride-hover/20 rounded-xl border border-tride-border flex justify-between items-center text-xs">
                                <span className="text-tride-text-muted">Algorithm Version</span>
                                <span className="text-tride-text font-mono">POOL-V2.4.1</span>
                            </div>
                            <div className="p-4 bg-tride-hover/20 rounded-xl border border-tride-border flex justify-between items-center text-xs">
                                <span className="text-tride-text-muted">Matching Server</span>
                                <span className="text-tride-text font-mono">us-east-matching-02</span>
                            </div>
                            <div className="p-4 bg-tride-hover/20 rounded-xl border border-tride-border flex justify-between items-center text-xs">
                                <span className="text-tride-text-muted">Creation Timestamp</span>
                                <span className="text-tride-text font-mono">{new Date(pool.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Driver Card */}
                    <div className="bg-tride-card border border-tride-border p-6 rounded-[2rem]">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-tride-yellow rounded-2xl flex items-center justify-center text-black font-black text-xl">
                                {pool.driver ? pool.driver.name.charAt(0) : 'D'}
                            </div>
                            <div>
                                <h4 className="font-bold text-tride-text">{pool.driver ? pool.driver.name : 'Unassigned'}</h4>
                                <p className="text-xs text-tride-text-muted">Master Driver · 4.9⭐</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-tride-text-muted flex items-center gap-1"><Car size={14} /> Assigned Vehicle</span>
                                <span className="text-xs font-bold text-tride-text">Toyota Prius (White)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-tride-text-muted flex items-center gap-1"><Navigation size={14} /> Current Trip Progress</span>
                                <span className="text-xs font-bold text-indigo-500">2.4 km remaining</span>
                            </div>
                        </div>
                        <Button className="w-full mt-6 bg-tride-hover text-tride-text hover:bg-neutral-800 rounded-xl border border-tride-border h-12 font-bold">
                            Live Track Driver
                        </Button>
                    </div>

                    {/* Financial Breakdown */}
                    <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-500/10">
                        <div className="flex items-center gap-2 mb-6">
                            <DollarSign size={24} />
                            <h3 className="text-lg font-bold">Revenue Analysis</h3>
                        </div>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center opacity-80">
                                <span className="text-sm">Gross Fares</span>
                                <span className="text-sm font-bold">$42.50</span>
                            </div>
                            <div className="flex justify-between items-center opacity-80">
                                <span className="text-sm">Rider Pooling Savings</span>
                                <span className="text-sm font-bold">-${Number(pool.savings_per_rider * pool.riders.length).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center opacity-80">
                                <span className="text-sm">Driver Multi-Rider Bonus</span>
                                <span className="text-sm font-bold">+$4.20</span>
                            </div>
                            <div className="h-px bg-white/20 w-full my-2"></div>
                            <div className="flex justify-between items-center">
                                <span className="font-bold">Net System Revenue</span>
                                <span className="text-xl font-black text-tride-yellow">$18.40</span>
                            </div>
                        </div>

                        <div className="bg-white/10 p-4 rounded-2xl flex items-start gap-3">
                            <TrendingUp size={18} className="text-tride-yellow mt-0.5" />
                            <p className="text-[11px] leading-relaxed">
                                This pool generated 14% more revenue compared to two individual solo trips in this zone.
                            </p>
                        </div>
                    </div>

                    {/* Quick Config Toggle */}
                    <div className="bg-tride-card border border-tride-border p-6 rounded-[2rem]">
                         <h4 className="font-bold text-tride-text mb-4">Quick Governance</h4>
                         <div className="space-y-3">
                            <Button className="w-full justify-start gap-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl h-12 transition-all group">
                                <ShieldCheck size={18} />
                                <span className="font-bold">Halt matching for this trip</span>
                            </Button>
                            <Button className="w-full justify-start gap-3 bg-tride-hover text-tride-text hover:bg-white hover:text-black rounded-xl h-12 transition-all">
                                <Zap size={18} />
                                <span className="font-bold">Force route recalculation</span>
                            </Button>
                         </div>
                    </div>

                </div>
            </div>
        </AdminLayout>
    )
}
