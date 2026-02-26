import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/layouts/admin-layout'
import { 
    Gem, 
    Star, 
    Medal, 
    Trophy, 
    ChevronDown, 
    Settings, 
    Activity, 
    TrendingUp, 
    CheckCircle2, 
    XCircle, 
    ArrowUpRight, 
    ArrowDownRight,
    Search,
    Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import axios from '@/lib/axios'

interface TierMetric {
    rating: number | string
    completion: string
    trips: number
    bonus: string
    multiplier: string
}

interface Tier {
    name: string
    drivers: number
    color: string
    metrics: TierMetric
}

interface Movement {
    name: string
    from: string
    to: string
    reason: string
    date: string
    dir: string
}

interface Rule {
    name: string
    min_rating: number
    min_completion_rate: number
    min_trips_30d: number
    max_cancellations_30d: number
    surge_access: string
    is_stackable: boolean
    bonus_multiplier: number
}

export default function DriverTiers() {
    const [activeTab, setActiveTab] = useState("Tier Rules")
    const [tiers, setTiers] = useState<Tier[]>([])
    const [rules, setRules] = useState<Rule[]>([])
    const [movements, setMovements] = useState<Movement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [statsRes, rulesRes, movementsRes] = await Promise.all([
                axios.get('/admin/driver-tiers/stats'),
                axios.get('/admin/driver-tiers/rules'),
                axios.get('/admin/driver-tiers/movements')
            ])

            if (statsRes.data.success) setTiers(statsRes.data.data)
            if (rulesRes.data.success) setRules(rulesRes.data.data)
            if (movementsRes.data.success) setMovements(movementsRes.data.data)
        } catch (error) {
            console.error("Failed to fetch tier data:", error)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (name: string, size = 24) => {
        switch (name.toLowerCase()) {
            case 'diamond': return <Gem size={size} className="text-blue-400" />
            case 'platinum': return <Star size={size} className="text-tride-yellow" />
            case 'gold': return <Trophy size={size} className="text-orange-400" />
            default: return <Medal size={size} className="text-gray-400" />
        }
    }

    return (
        <AdminLayout 
            title="Driver Rewards & Tiers" 
            description="Rules engine for tier recalculation based on rolling metrics"
            actions={
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="flex items-center gap-2 text-tride-text-muted hover:text-tride-text">
                        <Activity size={18} />
                        Recalculate All
                    </Button>
                    <Button className="flex items-center gap-2 bg-tride-yellow text-black hover:bg-tride-yellow/90 font-bold border-none shadow-sm h-11 px-6 rounded-xl">
                        <Settings size={18} />
                        Rules Config
                    </Button>
                </div>
            }
        >
            {/* Tier Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="bg-tride-card border border-tride-border rounded-[2rem] h-64 animate-pulse"></div>
                    ))
                ) : (
                    tiers.map((tier: Tier) => (
                        <div key={tier.name} className="bg-tride-card border border-tride-border rounded-[2rem] overflow-hidden group hover:border-tride-yellow/50 transition-all shadow-sm">
                            <div className={`h-1.5 w-full ${
                                tier.color === 'blue' ? 'bg-blue-500' : 
                                tier.color === 'yellow' || tier.color === 'gold' ? 'bg-tride-yellow' : 
                                tier.color === 'orange' ? 'bg-orange-500' : 'bg-gray-500'
                            }`}></div>
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        tier.color === 'blue' ? 'bg-blue-500/10' : 
                                        tier.color === 'yellow' || tier.color === 'gold' ? 'bg-tride-yellow/10' : 
                                        tier.color === 'orange' ? 'bg-orange-500/10' : 'bg-gray-500/10'
                                    }`}>
                                        {getIcon(tier.name, 24)}
                                    </div>
                                    <span className="text-[10px] font-black bg-tride-hover px-3 py-1 rounded-full text-tride-text-muted uppercase tracking-wider">
                                        {tier.drivers} drivers
                                    </span>
                                </div>
                                <h3 className="text-xl font-black text-tride-text mb-4 tracking-tight">{tier.name}</h3>
                                <div className="space-y-3">
                                    {Object.entries(tier.metrics).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center text-xs">
                                            <span className="text-tride-text-muted font-medium capitalize">{key.replace('bonus', 'Queue Bonus')}</span>
                                            <span className="font-bold text-tride-text">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Content Tabs */}
            <div className="bg-tride-card border border-tride-border rounded-[2.5rem] overflow-hidden shadow-sm min-h-[500px]">
                <div className="flex gap-1 p-4 border-b border-tride-border overflow-x-auto no-scrollbar scrollbar-hide">
                    {["Tier Rules", "Benefits Matrix", "Tier Movements", "Recalculation Config"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "ghost"}
                            className={`rounded-xl whitespace-nowrap px-6 transition-all duration-200 h-10 ${
                                activeTab === tab 
                                ? "bg-tride-yellow text-black shadow-sm font-bold" 
                                : "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover"
                            }`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                <div className="py-8">
                    {activeTab === "Tier Rules" && (
                        <div>
                            <div className="mb-8 px-8">
                                <h3 className="text-lg font-black text-tride-text">Tier Qualification Rules</h3>
                                <p className="text-xs text-tride-text-muted mt-1 uppercase tracking-widest font-bold">Rolling 30-day metrics evaluated daily at midnight UTC</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-tride-text-muted text-[10px] font-black uppercase tracking-wider bg-tride-hover/50">
                                            <th className="px-4 py-4 whitespace-nowrap">Tier</th>
                                            <th className="px-4 py-4 whitespace-nowrap">Min Rating</th>
                                            <th className="px-4 py-4 whitespace-nowrap">Min Completion</th>
                                            <th className="px-4 py-4 whitespace-nowrap">Trips (30d)</th>
                                            <th className="px-4 py-4 whitespace-nowrap">Max Cancels</th>
                                            <th className="px-4 py-4 whitespace-nowrap">Surge Access</th>
                                            <th className="px-4 py-4 whitespace-nowrap">Stackable</th>
                                            <th className="px-4 py-4 whitespace-nowrap text-right">Multiplier</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-tride-border/50">
                                        {loading ? (
                                            <tr><td colSpan={8} className="py-10 text-center text-tride-text-muted">Loading rules...</td></tr>
                                        ) : rules.map((row: Rule, i: number) => (
                                            <tr key={i} className="hover:bg-tride-hover/20 transition-colors">
                                                <td className="px-4 py-5">
                                                    <div className="flex items-center gap-2">
                                                        {getIcon(row.name, 14)}
                                                        <span className="text-sm font-bold text-tride-text">{row.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-5 text-sm font-bold text-tride-text">{row.min_rating}</td>
                                                <td className="px-4 py-5 text-sm font-bold text-tride-text">{row.min_completion_rate}%</td>
                                                <td className="px-4 py-5 text-sm font-bold text-tride-text">{row.min_trips_30d}</td>
                                                <td className="px-4 py-5 text-sm font-bold text-tride-text">{row.max_cancellations_30d}</td>
                                                <td className="px-4 py-5">
                                                    <span className="px-3 py-1 bg-tride-hover border border-tride-border rounded-lg text-[10px] font-black uppercase text-tride-text-muted whitespace-nowrap">
                                                        {row.surge_access}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase ${row.is_stackable ? 'bg-blue-600 text-white' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                        {row.is_stackable ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5 text-right font-black text-tride-text">{row.bonus_multiplier}x</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "Benefits Matrix" && (
                        <div className="px-8">
                            <div className="mb-10">
                                <h3 className="text-lg font-black text-tride-text">Tier Benefits Matrix</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { title: "Queue Priority Boost", items: [{ i: <Gem />, v: "+25%" }, { i: <Star />, v: "+15%" }, { i: <Trophy />, v: "+10%" }, { i: <Medal />, v: "None" }] },
                                    { title: "Surge Zone Access", items: [{ i: <Gem />, v: "All Zones" }, { i: <Star />, v: "Priority" }, { i: <Trophy />, v: "Standard" }, { i: <Medal />, v: "Limited" }] },
                                    { title: "Stacked Job Eligible", items: [{ i: <Gem />, v: true }, { i: <Star />, v: true }, { i: <Trophy />, v: true }, { i: <Medal />, v: false }] },
                                    { title: "Bonus Multiplier", items: [{ i: <Gem />, v: "2.0x" }, { i: <Star />, v: "1.5x" }, { i: <Trophy />, v: "1.2x" }, { i: <Medal />, v: "1.0x" }] },
                                    { title: "Guaranteed Earnings", items: [{ i: <Gem />, v: true }, { i: <Star />, v: true }, { i: <Trophy />, v: false }, { i: <Medal />, v: false }] },
                                    { title: "Priority Support", items: [{ i: <Gem />, v: true }, { i: <Star />, v: true }, { i: <Trophy />, v: false }, { i: <Medal />, v: false }] },
                                ].map((block, i: number) => (
                                    <div key={i} className="p-6 bg-tride-hover/5 border border-tride-border rounded-[2rem]">
                                        <h4 className="text-sm font-black text-tride-text mb-6 uppercase tracking-wider">{block.title}</h4>
                                        <div className="grid grid-cols-4 gap-2">
                                            {block.items.map((item, j: number) => (
                                                <div key={j} className="flex flex-col items-center gap-3">
                                                    <div className="text-tride-text-muted opacity-60 scale-75">
                                                        {React.cloneElement(item.i as React.ReactElement, { size: 18 })}
                                                    </div>
                                                    <div className="text-[11px] font-black text-tride-text uppercase">
                                                        {typeof item.v === 'boolean' ? (
                                                            item.v ? <CheckCircle2 size={18} className="text-green-500" /> : <XCircle size={18} className="text-red-500" />
                                                        ) : item.v}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === "Tier Movements" && (
                        <div>
                            <div className="mb-8 px-8">
                                <h3 className="text-lg font-black text-tride-text">Recent Tier Movements</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-tride-text-muted text-[11px] font-black uppercase tracking-widest bg-tride-hover/50">
                                            <th className="px-6 py-4 whitespace-nowrap">Driver</th>
                                            <th className="px-6 py-4 text-center whitespace-nowrap">From</th>
                                            <th className="px-6 py-4 text-center whitespace-nowrap">To</th>
                                            <th className="px-6 py-4 whitespace-nowrap">Reason</th>
                                            <th className="px-6 py-4 whitespace-nowrap text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-tride-border/50">
                                        {loading ? (
                                            <tr><td colSpan={5} className="py-10 text-center text-tride-text-muted">Loading movements...</td></tr>
                                        ) : movements.length === 0 ? (
                                            <tr><td colSpan={5} className="py-10 text-center text-tride-text-muted">No recent movements</td></tr>
                                        ) : movements.map((row: Movement, i: number) => (
                                            <tr key={i} className="hover:bg-tride-hover/20 transition-colors group">
                                                <td className="px-6 py-5 font-black text-tride-text text-sm">{row.name}</td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="px-3 py-1 bg-tride-hover border border-tride-border rounded-full text-[10px] font-black uppercase text-tride-text-muted">
                                                        {row.from || 'None'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {row.dir === 'up' ? <ArrowUpRight className="text-green-500" size={14} /> : row.dir === 'down' ? <ArrowDownRight className="text-red-500" size={14} /> : null}
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase text-white ${
                                                            row.to === 'Diamond' ? 'bg-blue-600' : 
                                                            row.to === 'Platinum' ? 'bg-amber-600' : 
                                                            row.to === 'Gold' ? 'bg-orange-600' : 'bg-gray-600'
                                                        }`}>
                                                            {row.to}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-xs text-tride-text-muted font-medium">{row.reason}</td>
                                                <td className="px-6 py-5 text-right text-xs text-tride-text-muted font-bold whitespace-nowrap">{row.date}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === "Recalculation Config" && (
                        <div className="px-8">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-tride-text">Recalculation Settings</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { label: "Recalculation Frequency", value: "Daily at 00:00 UTC", type: 'text' },
                                    { label: "Rolling Window", value: "30 days", type: 'text' },
                                    { label: "Demotion Grace Period", value: "7 days", type: 'text' },
                                    { label: "Promotion Cooldown", value: "None", type: 'text' },
                                    { label: "Notify Driver on Change", value: true, type: 'switch' },
                                    { label: "Auto-Demote on Violation", value: true, type: 'switch' },
                                ].map((item, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-5 bg-tride-card border border-tride-border rounded-2xl hover:border-tride-yellow transition-colors">
                                        <span className="text-sm font-bold text-tride-text">{item.label}</span>
                                        {item.type === 'switch' ? (
                                            <Switch checked={item.value as boolean} onCheckedChange={() => {}} />
                                        ) : (
                                            <span className="text-xs font-black text-tride-text-muted uppercase tracking-widest">{item.value}</span>
                                        )}
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

function Switch({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (checked: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onCheckedChange(!checked)}
            className={`
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tride-yellow focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner
                ${checked ? 'bg-tride-yellow' : 'bg-neutral-800'}
            `}
        >
            <span
                className={`
                    pointer-events-none block h-5 w-5 rounded-full bg-white shadow-xl ring-0 transition-transform duration-200
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    )
}
