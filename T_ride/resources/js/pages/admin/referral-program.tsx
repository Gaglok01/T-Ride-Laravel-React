import { useState, useEffect } from "react"
import { router } from "@inertiajs/react"
import { AdminLayout } from "@/layouts/admin-layout"
import { CreateCampaignModal } from "@/components/admin/CreateCampaignModal"
import { CreateRuleModal } from "@/components/admin/CreateRuleModal"
import { CreateTierModal } from "@/components/admin/CreateTierModal"
import { 
    ViewCampaignModal, ViewReferrerModal, ViewReferralCodeModal, 
    ViewRuleModal, ViewTierModal 
} from "@/components/admin/ReferralViewModals"
import { Button, IconButton } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ModalSelect } from "@/components/ui/modal"
import axios from "@/lib/axios"
import { 
    Users, UserPlus, DollarSign, Target, Gift, Share2, 
    TrendingUp, Calendar, CheckCircle, Search, Filter, 
    Plus, Edit, Trash2, Crown, Star, ChevronRight, X, Download, Copy, Eye, Check
} from "lucide-react"
import { Switch } from "@headlessui/react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart"

// Types
interface Stats {
    total_referrals: number
    successful_signups: number
    conversion_rate: number
    rewards_paid: number
    avg_reward: number
    active_referrers: number
    trends: {
        referrals: string
        signups: string
        conversion: string
        rewards: string
        avg_reward: string
        referrers: string
    }
}

interface Campaign {
    id: number
    name: string
    type: string
    status: string
    start_date: string
    end_date: string
    budget: number
    spent: number
    description: string
}

interface Rule {
    id: number
    name: string
    type: 'referrer' | 'referee'
    trigger_event: string
    reward_type: string
    reward_amount: number
    is_active: boolean
    description: string
}

interface Tier {
    id: number
    name: string
    min_referrals: number
    max_referrals: number | null
    bonus_multiplier: number
    benefits: string[] | null
    color: string
}

interface Referrer {
    id: number
    name: string
    email: string
    total_referrals: number
    successful_referrals: number
    total_earnings: number
    tier: string
    conversion_rate: number
}

interface RecentReferral {
    id: number
    referrer: { name: string }
    referee: { name: string }
    referral_code: string
    status: string
    reward_amount: number
    created_at: string
}

export default function ReferralProgram() {
    const [activeTab, setActiveTab] = useState("Overview")
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<Stats | null>(null)
    const [campaigns, setCampaigns] = useState<Campaign[]>([])
    const [rules, setRules] = useState<{referrer: Rule[], referee: Rule[]}>({ referrer: [], referee: [] })
    const [tiers, setTiers] = useState<Tier[]>([])
    const [topReferrers, setTopReferrers] = useState<Referrer[]>([])
    const [recentReferrals, setRecentReferrals] = useState<RecentReferral[]>([])
    
    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [campaignToEdit, setCampaignToEdit] = useState<Campaign | null>(null)
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
    const [ruleToEdit, setRuleToEdit] = useState<Rule | null>(null)
    const [isTierModalOpen, setIsTierModalOpen] = useState(false)
    const [tierToEdit, setTierToEdit] = useState<Tier | null>(null)
    
    // View Modal State
    const [viewCampaign, setViewCampaign] = useState<Campaign | null>(null)
    const [viewReferrer, setViewReferrer] = useState<Referrer | null>(null)
    const [viewCode, setViewCode] = useState<any | null>(null)
    const [viewRule, setViewRule] = useState<Rule | null>(null)
    const [viewTier, setViewTier] = useState<Tier | null>(null)
    
    // Delete confirmation
    const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, type: string, id: number | null, name: string}>({
        isOpen: false, type: '', id: null, name: ''
    })

    // Analytics & Performance
    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [performanceData, setPerformanceData] = useState<any>(null)
    const [funnelData, setFunnelData] = useState<any[]>([])

    // Settings
    const [settings, setSettings] = useState<any>({
        program_active: true,
        auto_approve_rewards: true,
        allow_custom_codes: true,
        fraud_detection: true,
        daily_referral_limit: 10,
        monthly_earnings_cap: 500,
        reward_expiry_days: 90,
        minimum_payout: 10
    })

    // Referral Codes
    const [referralCodes, setReferralCodes] = useState<any[]>([])
    const [codesLoading, setCodesLoading] = useState(false)
    const [codeSearch, setCodeSearch] = useState("")
    const [codeStatusFilter, setCodeStatusFilter] = useState("all")
    const [showCodeFilters, setShowCodeFilters] = useState(false)
    const [tempCodeFilters, setTempCodeFilters] = useState({ status: "all" })

    // Campaigns Search & Filter
    const [campaignSearch, setCampaignSearch] = useState("")
    const [campaignStatusFilter, setCampaignStatusFilter] = useState("all")
    const [showCampaignFilters, setShowCampaignFilters] = useState(false)
    const [tempCampaignFilters, setTempCampaignFilters] = useState({ status: "all" })

    // Top Referrers Search & Filter
    const [referrerSearch, setReferrerSearch] = useState("")
    const [referrerTierFilter, setReferrerTierFilter] = useState("all")
    const [showReferrerFilters, setShowReferrerFilters] = useState(false)
    const [tempReferrerFilters, setTempReferrerFilters] = useState({ tier: "all" })

    const fetchCampaigns = async () => {
        try {
            const res = await axios.get('/admin/referral-campaigns')
            setCampaigns(res.data)
        } catch (error) {
            console.error(error)
        }
    }

    const fetchRules = async () => {
        try {
            const res = await axios.get('/admin/referral-rules')
            setRules(res.data)
        } catch (error) { console.error(error) }
    }

    const fetchTiers = async () => {
        try {
            const res = await axios.get('/admin/referrer-tiers')
            setTiers(res.data)
        } catch (error) { console.error(error) }
    }

    const fetchAnalytics = async () => {
        try {
            const [analyticsRes, performanceRes, funnelRes] = await Promise.all([
                axios.get('/admin/referral-analytics'),
                axios.get('/admin/referral-performance'),
                axios.get('/admin/referral-funnel')
            ])
            setAnalyticsData(analyticsRes.data)
            setPerformanceData(performanceRes.data)
            setFunnelData(funnelRes.data)
        } catch (error) { console.error(error) }
    }

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/admin/referral-settings')
            setSettings(res.data)
        } catch (error) { console.error(error) }
    }

    const fetchReferralCodes = async () => {
        setCodesLoading(true)
        try {
            const res = await axios.get('/admin/referral-codes', { params: { search: codeSearch, status: codeStatusFilter } })
            setReferralCodes(res.data.data || [])
        } catch (error) { console.error(error) } 
        finally { setCodesLoading(false) }
    }

    // Auto-fetch referral codes on search/filter change with debounce
    useEffect(() => {
        if (activeTab === "Referral Codes") {
            const timer = setTimeout(() => {
                fetchReferralCodes()
            }, 500)
            return () => clearTimeout(timer)
        }
    }, [codeSearch, codeStatusFilter])

    // Fetch Data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsRes, campaignsRes, rulesRes, tiersRes, referrersRes, recentRes] = await Promise.all([
                    axios.get('/admin/referrals/stats'),
                    axios.get('/admin/referral-campaigns'),
                    axios.get('/admin/referral-rules'),
                    axios.get('/admin/referrer-tiers'),
                    axios.get('/admin/top-referrers'),
                    axios.get('/admin/recent-referrals')
                ])

                setStats(statsRes.data)
                setCampaigns(campaignsRes.data)
                setRules(rulesRes.data)
                setTiers(tiersRes.data)
                setTopReferrers(referrersRes.data)
                setRecentReferrals(recentRes.data)
            } catch (error) {
                console.error("Error fetching referral data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    // Load tab specific data
    useEffect(() => {
        if (activeTab === "Analytics") fetchAnalytics()
        if (activeTab === "Settings") fetchSettings()
        if (activeTab === "Referral Codes") fetchReferralCodes()
        if (activeTab === "Overview") {
            // Fetch performance and funnel data for Overview tab as well
            const fetchOverviewData = async () => {
                try {
                    const [performanceRes, funnelRes] = await Promise.all([
                        axios.get('/admin/referral-performance'),
                        axios.get('/admin/referral-funnel')
                    ])
                    setPerformanceData(performanceRes.data)
                    setFunnelData(funnelRes.data)
                } catch (error) { console.error(error) }
            }
            fetchOverviewData()
        }
    }, [activeTab])

    // Delete handlers
    const handleDelete = async () => {
        if (!deleteModal.id) return
        try {
            if (deleteModal.type === 'campaign') await axios.delete(`/admin/referral-campaigns/${deleteModal.id}`)
            if (deleteModal.type === 'rule') await axios.delete(`/admin/referral-rules/${deleteModal.id}`)
            if (deleteModal.type === 'tier') await axios.delete(`/admin/referrer-tiers/${deleteModal.id}`)
            
            if (deleteModal.type === 'campaign') fetchCampaigns()
            if (deleteModal.type === 'rule') fetchRules()
            if (deleteModal.type === 'tier') fetchTiers()
        } catch (error) { console.error(error) }
        setDeleteModal({ isOpen: false, type: '', id: null, name: '' })
    }

    // Toggle rule status
    const handleToggleRule = async (id: number) => {
        try {
            await axios.patch(`/admin/referral-rules/${id}/status`)
            fetchRules()
        } catch (error) { console.error(error) }
    }

    // Update setting toggle
    const handleSettingToggle = async (key: string, value: boolean) => {
        try {
            await axios.put('/admin/referral-settings', { [key]: value })
            setSettings((prev: any) => ({ ...prev, [key]: value }))
        } catch (error) { console.error(error) }
    }

    // Update limit
    const handleUpdateLimit = async (field: string, value: number) => {
        try {
            await axios.patch('/admin/referral-settings/limit', { field, value })
            setSettings((prev: any) => ({ ...prev, [field]: value }))
        } catch (error) { console.error(error) }
    }

    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)
            
            // Generate PDF
            const doc = new jsPDF()
            
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text("T-RIDE", 14, 20)
            
            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text("Referral Program Report", 14, 28)
            
            doc.setFontSize(10)
            doc.setTextColor(150, 150, 150)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)

            // Add Campaigns Table (Example data)
            const tableData = campaigns.map(c => [
                c.name,
                c.type,
                c.status,
                `$${c.budget}`,
                `$${c.spent}`,
                new Date(c.end_date).toLocaleDateString()
            ])

            autoTable(doc, {
                head: [["Name", "Type", "Status", "Budget", "Spent", "Ends"]],
                body: tableData,
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [245, 197, 24], textColor: [0, 0, 0] }
            })
            
            doc.save(`referral_program_${Date.now()}.pdf`)

        } catch (e) {
            console.error("Export failed:", e)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <AdminLayout
            title="Referral Program"
            description="Manage referral rewards and track performance"
            actions={
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Export
                            </>
                        )}
                    </Button>
                    <Button onClick={() => { setCampaignToEdit(null); setIsCreateModalOpen(true); }}>
                        <Plus size={18} />
                        Create Campaign
                    </Button>
                </div>
            }
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <StatsCard 
                    label="Total Referrals" 
                    value={stats?.total_referrals.toLocaleString() || "0"} 
                    trend={stats?.trends.referrals || "+0%"} 
                    trendUp={true}
                    icon={<Users size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Successful Signups" 
                    value={stats?.successful_signups.toLocaleString() || "0"} 
                    trend={stats?.trends.signups || "+0%"} 
                    trendUp={true}
                    icon={<UserPlus size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Conversion Rate" 
                    value={`${stats?.conversion_rate || 0}%`} 
                    trend={stats?.trends.conversion || "+0%"} 
                    trendUp={true}
                    icon={<Target size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Rewards Paid" 
                    value={`$${stats?.rewards_paid.toLocaleString() || "0"}`} 
                    trend={stats?.trends.rewards || "+0%"} 
                    trendUp={true}
                    icon={<Gift size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Avg Reward" 
                    value={`$${stats?.avg_reward || "0"}`} 
                    trend={stats?.trends.avg_reward || "+0"} 
                    trendUp={true}
                    icon={<DollarSign size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Active Referrers" 
                    value={stats?.active_referrers.toLocaleString() || "0"} 
                    trend={stats?.trends.referrers || "+0%"} 
                    trendUp={true}
                    icon={<Share2 size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit border border-tride-border overflow-x-auto">
                {["Overview", "Campaigns", "Top Referrers", "Referral Codes", "Reward Rules", "Referrer Tiers", "Analytics", "Settings"].map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "ghost"}
                        onClick={() => setActiveTab(tab)}
                        className="rounded-xl whitespace-nowrap"
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6 animate-in fade-in duration-300">
                {activeTab === "Overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Referral Performance Chart */}
                        <div className="lg:col-span-2">
                             <RevenueTrendChart 
                                data={performanceData?.data?.map((val: number, i: number) => ({
                                    name: performanceData.labels?.[i] || '',
                                    value: val
                                })) || []}
                                title="Referral Performance"
                                dataKey="value"
                                xAxisKey="name"
                                height={300}
                            />
                            <div className="grid grid-cols-4 gap-4 mt-6">
                                <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
                                    <div className="text-xs text-tride-text-muted mb-1">This Week</div>
                                    <div className="text-xl font-bold text-tride-text">{performanceData?.summary?.this_week?.toLocaleString() || 0}</div>
                                    <div className={`text-xs font-medium ${(performanceData?.summary?.week_change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(performanceData?.summary?.week_change || 0) >= 0 ? '+' : ''}{performanceData?.summary?.week_change || 0}%
                                    </div>
                                </div>
                                <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
                                    <div className="text-xs text-tride-text-muted mb-1">This Month</div>
                                    <div className="text-xl font-bold text-tride-text">{performanceData?.summary?.this_month?.toLocaleString() || 0}</div>
                                    <div className={`text-xs font-medium ${(performanceData?.summary?.month_change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(performanceData?.summary?.month_change || 0) >= 0 ? '+' : ''}{performanceData?.summary?.month_change || 0}%
                                    </div>
                                </div>
                                <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
                                    <div className="text-xs text-tride-text-muted mb-1">This Quarter</div>
                                    <div className="text-xl font-bold text-tride-text">{performanceData?.summary?.this_quarter?.toLocaleString() || 0}</div>
                                    <div className={`text-xs font-medium ${(performanceData?.summary?.quarter_change || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {(performanceData?.summary?.quarter_change || 0) >= 0 ? '+' : ''}{performanceData?.summary?.quarter_change || 0}%
                                    </div>
                                </div>
                                <div className="bg-tride-hover/50 p-4 rounded-2xl text-center hover:bg-tride-hover transition-colors">
                                    <div className="text-xs text-tride-text-muted mb-1">All Time</div>
                                    <div className="text-xl font-bold text-tride-text">{performanceData?.summary?.all_time?.toLocaleString() || 0}</div>
                                    <div className="text-xs text-green-500 font-medium">Total</div>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Funnel */}
                        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl">
                            <h3 className="text-lg font-semibold mb-6 text-tride-text">Conversion Funnel</h3>
                            <div className="space-y-6">
                                {funnelData.length > 0 ? funnelData.map((item: any, idx: number) => (
                                    <FunnelItem 
                                        key={idx}
                                        label={item.label} 
                                        value={item.value?.toLocaleString() || '0'} 
                                        percentage={item.percentage || 0} 
                                        color={['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-blue-600'][idx] || 'bg-gray-500'} 
                                    />
                                )) : (
                                    <>
                                        <FunnelItem label="Links Shared" value="0" percentage={100} color="bg-blue-500" />
                                        <FunnelItem label="Links Clicked" value="0" percentage={0} color="bg-purple-500" />
                                        <FunnelItem label="Signups Started" value="0" percentage={0} color="bg-orange-500" />
                                        <FunnelItem label="Signups Completed" value="0" percentage={0} color="bg-green-500" />
                                        <FunnelItem label="First Transaction" value="0" percentage={0} color="bg-blue-600" />
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Recent Referrals Table */}
                        <div className="lg:col-span-3 bg-tride-card border border-tride-border p-6 rounded-3xl">
                            <h3 className="text-lg font-semibold mb-4 text-tride-text">Recent Referrals</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-tride-text-muted uppercase bg-tride-hover/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-xl">Referrer</th>
                                            <th className="px-4 py-3">New User</th>
                                            <th className="px-4 py-3">Code Used</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Reward</th>
                                            <th className="px-4 py-3 rounded-r-xl">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentReferrals.length > 0 ? recentReferrals.map(referral => (
                                            <tr key={referral.id} className="border-b border-tride-border/50 last:border-0 hover:bg-tride-hover/30 transition-colors">
                                                <td className="px-4 py-4 font-medium text-tride-text">{referral.referrer?.name}</td>
                                                <td className="px-4 py-4 text-tride-text">{referral.referee?.name}</td>
                                                <td className="px-4 py-4"><span className="bg-tride-hover px-2 py-1 rounded text-xs font-mono">{referral.referral_code}</span></td>
                                                <td className="px-4 py-4"><StatusBadge status={referral.status} /></td>
                                                <td className="px-4 py-4 text-green-500 font-medium">${referral.reward_amount}</td>
                                                <td className="px-4 py-4 text-tride-text-muted">{new Date(referral.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-6 text-center text-tride-text-muted">No recent referrals found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Campaigns" && (
                    <div className="space-y-6">
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="relative w-full md:w-auto">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" />
                                <Input 
                                    placeholder="Search campaigns..." 
                                    className="pl-9 w-full md:w-64" 
                                    value={campaignSearch}
                                    onChange={(e) => setCampaignSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Button 
                                        variant={showCampaignFilters ? "default" : "secondary"}
                                        onClick={() => {
                                            if (!showCampaignFilters) setTempCampaignFilters({ status: campaignStatusFilter })
                                            setShowCampaignFilters(!showCampaignFilters)
                                        }}
                                    >
                                        <Filter size={16} /> Filter
                                    </Button>
                                    {showCampaignFilters && (
                                        <div className="absolute right-0 mt-3 w-72 bg-tride-card border border-tride-border rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between border-b border-tride-border pb-3">
                                                    <h3 className="font-semibold text-tride-text">Filter Campaigns</h3>
                                                    <button onClick={() => setShowCampaignFilters(false)} className="text-tride-text-muted hover:text-tride-text transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <ModalSelect
                                                        label="Status"
                                                        value={tempCampaignFilters.status}
                                                        onChange={(val) => setTempCampaignFilters({...tempCampaignFilters, status: val})}
                                                        options={[
                                                            { label: "All Statuses", value: "all" },
                                                            { label: "Active", value: "active" },
                                                            { label: "Scheduled", value: "scheduled" },
                                                            { label: "Paused", value: "paused" },
                                                            { label: "Ended", value: "ended" }
                                                        ]}
                                                    />
                                                </div>
                                                <div className="pt-4 grid grid-cols-2 gap-3">
                                                    <Button 
                                                        onClick={() => { setCampaignStatusFilter("all"); setTempCampaignFilters({ status: "all" }); setShowCampaignFilters(false) }}
                                                        variant="secondary" className="w-full justify-center"
                                                    >
                                                        <X size={16} /> Clear
                                                    </Button>
                                                    <Button 
                                                        onClick={() => { setCampaignStatusFilter(tempCampaignFilters.status); setShowCampaignFilters(false) }}
                                                        variant="default" className="w-full justify-center"
                                                    >
                                                        <Check size={16} /> Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <Button onClick={() => { setCampaignToEdit(null); setIsCreateModalOpen(true); }}>
                                    <Plus size={16} /> New Campaign
                                </Button>
                            </div>
                        </div>

                        {/* Campaign Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {campaigns
                                .filter(c => {
                                    const matchesSearch = campaignSearch === "" || c.name.toLowerCase().includes(campaignSearch.toLowerCase())
                                    const matchesStatus = campaignStatusFilter === "all" || c.status?.toLowerCase() === campaignStatusFilter.toLowerCase()
                                    return matchesSearch && matchesStatus
                                })
                                .map(campaign => (
                                    <CampaignCard 
                                        key={campaign.id} 
                                        campaign={campaign} 
                                        onView={() => router.visit(`/admin/referral-campaigns/${campaign.id}`)}
                                        onEdit={() => { setCampaignToEdit(campaign); setIsCreateModalOpen(true) }}
                                        onDelete={() => setDeleteModal({ isOpen: true, type: 'campaign', id: campaign.id, name: campaign.name })}
                                    />
                                ))}
                            {campaigns.filter(c => {
                                const matchesSearch = campaignSearch === "" || c.name.toLowerCase().includes(campaignSearch.toLowerCase())
                                const matchesStatus = campaignStatusFilter === "all" || c.status?.toLowerCase() === campaignStatusFilter.toLowerCase()
                                return matchesSearch && matchesStatus
                            }).length === 0 && (
                                <div className="col-span-full text-center py-12 text-tride-text-muted">
                                    <Gift size={48} className="mx-auto mb-4 opacity-50" />
                                    <p>No campaigns found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "Top Referrers" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-lg font-semibold text-tride-text">Top Referrers Leaderboard</h3>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" />
                                    <Input 
                                        placeholder="Search referrers..." 
                                        className="pl-9 w-48 md:w-64" 
                                        value={referrerSearch}
                                        onChange={(e) => setReferrerSearch(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Button 
                                        variant={showReferrerFilters ? "default" : "secondary"}
                                        onClick={() => {
                                            if (!showReferrerFilters) setTempReferrerFilters({ tier: referrerTierFilter })
                                            setShowReferrerFilters(!showReferrerFilters)
                                        }}
                                    >
                                        <Filter size={16} /> Filter
                                    </Button>
                                    {showReferrerFilters && (
                                        <div className="absolute right-0 mt-3 w-72 bg-tride-card border border-tride-border rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between border-b border-tride-border pb-3">
                                                    <h3 className="font-semibold text-tride-text">Filter Referrers</h3>
                                                    <button onClick={() => setShowReferrerFilters(false)} className="text-tride-text-muted hover:text-tride-text transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <ModalSelect
                                                        label="Tier"
                                                        value={tempReferrerFilters.tier}
                                                        onChange={(val) => setTempReferrerFilters({...tempReferrerFilters, tier: val})}
                                                        options={[
                                                            { label: "All Tiers", value: "all" },
                                                            { label: "Diamond", value: "Diamond" },
                                                            { label: "Gold", value: "Gold" },
                                                            { label: "Silver", value: "Silver" },
                                                            { label: "Bronze", value: "Bronze" }
                                                        ]}
                                                    />
                                                </div>
                                                <div className="pt-4 grid grid-cols-2 gap-3">
                                                    <Button 
                                                        onClick={() => { setReferrerTierFilter("all"); setTempReferrerFilters({ tier: "all" }); setShowReferrerFilters(false) }}
                                                        variant="secondary" className="w-full justify-center"
                                                    >
                                                        <X size={16} /> Clear
                                                    </Button>
                                                    <Button 
                                                        onClick={() => { setReferrerTierFilter(tempReferrerFilters.tier); setShowReferrerFilters(false) }}
                                                        variant="default" className="w-full justify-center"
                                                    >
                                                        <Check size={16} /> Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-tride-text-muted border-b border-tride-border bg-tride-hover/50">
                                        <th className="px-4 py-3 text-left">Rank</th>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Tier</th>
                                        <th className="px-4 py-3 text-left">Total Referrals</th>
                                        <th className="px-4 py-3 text-left">Successful</th>
                                        <th className="px-4 py-3 text-left">Conversion</th>
                                        <th className="px-4 py-3 text-left">Earnings</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topReferrers
                                        .filter(r => {
                                            const matchesSearch = referrerSearch === "" || r.name.toLowerCase().includes(referrerSearch.toLowerCase())
                                            const matchesTier = referrerTierFilter === "all" || r.tier === referrerTierFilter
                                            return matchesSearch && matchesTier
                                        })
                                        .map((referrer, index) => (
                                        <tr key={referrer.id} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index < 3 ? 'bg-yellow-500/20 text-yellow-600' : 'text-tride-text-muted'}`}>
                                                    {index < 3 ? <Crown size={16} /> : index + 1}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {referrer.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-tride-text">{referrer.name}</div>
                                                        <div className="text-xs text-tride-text-muted">{referrer.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    referrer.tier === 'Diamond' ? 'bg-purple-500/20 text-purple-500' :
                                                    referrer.tier === 'Gold' ? 'bg-yellow-500/20 text-yellow-600' :
                                                    referrer.tier === 'Silver' ? 'bg-gray-400/20 text-gray-400' :
                                                    'bg-orange-500/20 text-orange-500'
                                                }`}>
                                                    {referrer.tier}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-tride-text font-mono">{referrer.total_referrals}</td>
                                            <td className="px-4 py-4 text-green-500 font-mono">{referrer.successful_referrals}</td>
                                            <td className="px-4 py-4 text-tride-text font-mono">{referrer.conversion_rate}%</td>
                                            <td className="px-4 py-4 text-tride-text font-bold font-mono">${referrer.total_earnings}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <IconButton tooltip="View" onClick={() => router.visit(`/admin/referrers/${referrer.id}`)}>
                                                        <Eye size={16} />
                                                    </IconButton>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {topReferrers.filter(r => {
                                        const matchesSearch = referrerSearch === "" || r.name.toLowerCase().includes(referrerSearch.toLowerCase())
                                        const matchesTier = referrerTierFilter === "all" || r.tier === referrerTierFilter
                                        return matchesSearch && matchesTier
                                    }).length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-12 text-center text-tride-text-muted">
                                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                                <p>No referrers found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === "Referral Codes" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-lg font-semibold text-tride-text">Referral Codes</h3>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" />
                                    <Input 
                                        placeholder="Search codes..." 
                                        className="pl-9 w-48 lg:w-64" 
                                        value={codeSearch}
                                        onChange={(e) => setCodeSearch(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Button 
                                        variant={showCodeFilters ? "default" : "secondary"}
                                        onClick={() => {
                                            if (!showCodeFilters) setTempCodeFilters({ status: codeStatusFilter })
                                            setShowCodeFilters(!showCodeFilters)
                                        }}
                                    >
                                        <Filter size={16} /> Filter
                                    </Button>
                                    {showCodeFilters && (
                                        <div className="absolute right-0 mt-3 w-72 bg-tride-card border border-tride-border rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between border-b border-tride-border pb-3">
                                                    <h3 className="font-semibold text-tride-text">Filter Codes</h3>
                                                    <button onClick={() => setShowCodeFilters(false)} className="text-tride-text-muted hover:text-tride-text transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    <ModalSelect
                                                        label="Status"
                                                        value={tempCodeFilters.status}
                                                        onChange={(val) => setTempCodeFilters({...tempCodeFilters, status: val})}
                                                        options={[
                                                            { label: "All Statuses", value: "all" },
                                                            { label: "Pending", value: "pending" },
                                                            { label: "Completed", value: "completed" },
                                                            { label: "Expired", value: "expired" }
                                                        ]}
                                                    />
                                                </div>
                                                <div className="pt-4 grid grid-cols-2 gap-3">
                                                    <Button 
                                                        onClick={() => { setCodeStatusFilter("all"); setTempCodeFilters({ status: "all" }); setShowCodeFilters(false) }}
                                                        variant="secondary" className="w-full justify-center"
                                                    >
                                                        <X size={16} /> Clear
                                                    </Button>
                                                    <Button 
                                                        onClick={() => { setCodeStatusFilter(tempCodeFilters.status); setShowCodeFilters(false) }}
                                                        variant="default" className="w-full justify-center"
                                                    >
                                                        <Check size={16} /> Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            {codesLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                                </div>
                            ) : (
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-tride-text-muted border-b border-tride-border">
                                            <th className="px-4 py-3 text-left">Code</th>
                                            <th className="px-4 py-3 text-left">Referrer</th>
                                            <th className="px-4 py-3 text-left">Referee</th>
                                            <th className="px-4 py-3 text-left">Campaign</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                            <th className="px-4 py-3 text-left">Reward</th>
                                            <th className="px-4 py-3 text-left">Date</th>
                                            <th className="px-4 py-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {referralCodes.length > 0 ? referralCodes.map((code: any) => (
                                            <tr key={code.id} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono bg-tride-hover px-2 py-1 rounded text-xs">{code.referral_code}</span>
                                                        <button 
                                                            onClick={() => navigator.clipboard.writeText(code.referral_code)}
                                                            className="text-tride-text-muted hover:text-tride-text"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                                                            {code.referrer?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="text-tride-text">{code.referrer?.name || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs font-bold">
                                                            {code.referee?.name?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="text-tride-text">{code.referee?.name || 'Pending'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-tride-text-muted">{code.campaign?.name || 'General'}</td>
                                                <td className="px-4 py-4"><StatusBadge status={code.status} /></td>
                                                <td className="px-4 py-4 text-green-500 font-bold">${code.reward_amount || 0}</td>
                                                <td className="px-4 py-4 text-tride-text-muted">{new Date(code.created_at).toLocaleDateString()}</td>
                                                <td className="px-4 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <IconButton tooltip="View" onClick={() => router.visit(`/admin/referral-codes/${code.id}`)}>
                                                            <Eye size={16} />
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-tride-text-muted">
                                                    No referral codes found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "Reward Rules" && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <Button onClick={() => { setRuleToEdit(null); setIsRuleModalOpen(true); }}>
                                <Plus size={18} /> Add Rule
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <RuleSection 
                                title="Referrer Rewards" 
                                description="Rewards given to the person who refers" 
                                rules={rules.referrer || []} 
                                onToggle={handleToggleRule}
                                onEdit={(rule) => { setRuleToEdit(rule); setIsRuleModalOpen(true); }}
                                onDelete={(rule) => setDeleteModal({ isOpen: true, type: 'rule', id: rule.id, name: rule.name })}
                            />
                            <RuleSection 
                                title="Referee Rewards" 
                                description="Rewards given to the new user who signed up" 
                                rules={rules.referee || []} 
                                onToggle={handleToggleRule}
                                onEdit={(rule) => { setRuleToEdit(rule); setIsRuleModalOpen(true); }}
                                onDelete={(rule) => setDeleteModal({ isOpen: true, type: 'rule', id: rule.id, name: rule.name })}
                            />
                        </div>
                    </div>
                )}

                {activeTab === "Referrer Tiers" && (
                    <div className="space-y-6">
                        <div className="flex justify-end">
                            <Button onClick={() => { setTierToEdit(null); setIsTierModalOpen(true); }}>
                                <Plus size={18} /> Add Tier
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {tiers.map(tier => (
                                <TierCard 
                                    key={tier.id} 
                                    tier={tier} 
                                    onEdit={() => { setTierToEdit(tier); setIsTierModalOpen(true); }}
                                    onDelete={() => setDeleteModal({ isOpen: true, type: 'tier', id: tier.id, name: tier.name })}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "Analytics" && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Referral Sources */}
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">Referral Sources</h3>
                            <div className="flex flex-col items-center justify-center py-6">
                                {/* CSS Donut Chart */}
                                <div className="relative w-48 h-48 mb-8">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="12" fill="none" className="text-tride-hover" />
                                        {/* Segments - dynamic based on API data */}
                                        {analyticsData?.sources && analyticsData.sources.length > 0 && (
                                            <>
                                                <circle cx="50" cy="50" r="40" stroke="#3B82F6" strokeWidth="12" fill="none" strokeDasharray="251" strokeDashoffset={251 * (1 - (analyticsData.sources[0]?.percentage || 0) / 100)} className="transition-all duration-1000 ease-out" />
                                                <circle cx="50" cy="50" r="40" stroke="#8B5CF6" strokeWidth="12" fill="none" strokeDasharray="251" strokeDashoffset={251 * (1 - (analyticsData.sources[1]?.percentage || 0) / 100)} className="transition-all duration-1000 ease-out" style={{ transform: `rotate(${(analyticsData.sources[0]?.percentage || 0) * 3.6}deg)`, transformOrigin: 'center' }} />
                                                <circle cx="50" cy="50" r="40" stroke="#F97316" strokeWidth="12" fill="none" strokeDasharray="251" strokeDashoffset={251 * (1 - (analyticsData.sources[2]?.percentage || 0) / 100)} className="transition-all duration-1000 ease-out" style={{ transform: `rotate(${((analyticsData.sources[0]?.percentage || 0) + (analyticsData.sources[1]?.percentage || 0)) * 3.6}deg)`, transformOrigin: 'center' }} />
                                                <circle cx="50" cy="50" r="40" stroke="#F8B803" strokeWidth="12" fill="none" strokeDasharray="251" strokeDashoffset={251 * (1 - (analyticsData.sources[3]?.percentage || 0) / 100)} className="transition-all duration-1000 ease-out" style={{ transform: `rotate(${((analyticsData.sources[0]?.percentage || 0) + (analyticsData.sources[1]?.percentage || 0) + (analyticsData.sources[2]?.percentage || 0)) * 3.6}deg)`, transformOrigin: 'center' }} />
                                            </>
                                        )}
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                                        <span className="text-3xl font-bold text-tride-text">{analyticsData?.total_referrals?.toLocaleString() || 0}</span>
                                        <span className="text-xs text-tride-text-muted">Total Referrals</span>
                                    </div>
                                </div>
                                <div className="w-full space-y-3">
                                    {analyticsData?.sources?.map((source: any, idx: number) => (
                                        <SourceLegendItem 
                                            key={idx}
                                            color={['bg-blue-500', 'bg-violet-500', 'bg-orange-500', 'bg-tride-yellow'][idx] || 'bg-gray-500'} 
                                            label={source.name} 
                                            percentage={source.percentage} 
                                            count={source.count} 
                                        />
                                    )) || (
                                        <>
                                            <SourceLegendItem color="bg-blue-500" label="Direct Link" percentage={0} count={0} />
                                            <SourceLegendItem color="bg-violet-500" label="Social Media" percentage={0} count={0} />
                                            <SourceLegendItem color="bg-orange-500" label="WhatsApp Share" percentage={0} count={0} />
                                            <SourceLegendItem color="bg-tride-yellow" label="QR Code" percentage={0} count={0} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Referral by User Type */}
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">Referral by User Type</h3>
                            <div className="space-y-8 py-6">
                                {analyticsData?.by_user_type?.map((item: any, idx: number) => {
                                    const maxVal = Math.max(...(analyticsData.by_user_type?.map((i: any) => i.referrals) || [1]));
                                    return (
                                        <UserTypeBar 
                                            key={idx}
                                            label={item.label} 
                                            referrals={item.referrals} 
                                            conversions={item.conversions} 
                                            max={maxVal || 1} 
                                        />
                                    );
                                }) || (
                                    <>
                                        <UserTypeBar label="Riders" referrals={0} conversions={0} max={1} />
                                        <UserTypeBar label="Drivers" referrals={0} conversions={0} max={1} />
                                        <UserTypeBar label="Vendors" referrals={0} conversions={0} max={1} />
                                        <UserTypeBar label="Couriers" referrals={0} conversions={0} max={1} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "Settings" && (
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6 space-y-6">
                            <h3 className="text-xl font-bold text-tride-text mb-2">Program Settings</h3>
                            
                            <SettingToggle 
                                title="Referral Program Active" 
                                description="Enable/disable the entire program"
                                checked={settings.program_active}
                                onChange={(val) => handleSettingToggle('program_active', val)}
                            />
                            <SettingToggle 
                                title="Auto-approve Rewards" 
                                description="Automatically credit rewards on completion"
                                checked={settings.auto_approve_rewards}
                                onChange={(val) => handleSettingToggle('auto_approve_rewards', val)}
                            />
                            <SettingToggle 
                                title="Allow Custom Codes" 
                                description="Let users create personalized referral codes"
                                checked={settings.allow_custom_codes}
                                onChange={(val) => handleSettingToggle('allow_custom_codes', val)}
                            />
                            <SettingToggle 
                                title="Fraud Detection" 
                                description="Block suspicious referral patterns"
                                checked={settings.fraud_detection}
                                onChange={(val) => handleSettingToggle('fraud_detection', val)}
                            />
                        </div>

                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6 space-y-6">
                            <h3 className="text-xl font-bold text-tride-text mb-2">Limits & Caps</h3>
                            
                            <LimitCard 
                                title="Daily Referral Limit" 
                                value={`${settings.daily_referral_limit} per user`}
                                field="daily_referral_limit"
                                currentValue={settings.daily_referral_limit}
                                onSave={handleUpdateLimit}
                            />
                            <LimitCard 
                                title="Monthly Earnings Cap" 
                                value={`$${settings.monthly_earnings_cap}`}
                                field="monthly_earnings_cap"
                                currentValue={settings.monthly_earnings_cap}
                                onSave={handleUpdateLimit}
                            />
                            <LimitCard 
                                title="Reward Expiry" 
                                value={`${settings.reward_expiry_days} days`}
                                field="reward_expiry_days"
                                currentValue={settings.reward_expiry_days}
                                onSave={handleUpdateLimit}
                            />
                            <LimitCard 
                                title="Minimum Payout" 
                                value={`$${settings.minimum_payout}`}
                                field="minimum_payout"
                                currentValue={settings.minimum_payout}
                                onSave={handleUpdateLimit}
                            />
                        </div>
                     </div>
                )}

            </div>

            <CreateCampaignModal 
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchCampaigns}
                campaignToEdit={campaignToEdit}
            />

            <CreateRuleModal
                isOpen={isRuleModalOpen}
                onClose={() => setIsRuleModalOpen(false)}
                onSuccess={fetchRules}
                ruleToEdit={ruleToEdit}
            />

            <CreateTierModal
                isOpen={isTierModalOpen}
                onClose={() => setIsTierModalOpen(false)}
                onSuccess={fetchTiers}
                tierToEdit={tierToEdit}
            />

            <ConfirmationModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, type: '', id: null, name: '' })}
                onConfirm={handleDelete}
                title={`Delete ${deleteModal.type}?`}
                description={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </AdminLayout>
    )
}

// Components

function SourceLegendItem({ color, label, percentage, count }: { color: string, label: string, percentage: number, count: number }) {
    return (
        <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color}`}></div>
                <span className="text-tride-text-muted">{label}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="font-bold text-tride-text">{percentage}%</span>
                <span className="text-tride-text-muted w-16 text-right">({count.toLocaleString()})</span>
            </div>
        </div>
    )
}

function UserTypeBar({ label, referrals, conversions, max }: { label: string, referrals: number, conversions: number, max: number }) {
    return (
        <div>
            <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-tride-text">{label}</span>
                <div className="space-x-4">
                    <span className="text-tride-text-muted"><span className="text-tride-text font-bold">{referrals.toLocaleString()}</span> referred</span>
                    <span className="text-green-500 font-bold">{conversions.toLocaleString()} converted</span>
                </div>
            </div>
            <div className="h-2 w-full bg-tride-hover rounded-full overflow-hidden flex">
                <div className="h-full bg-tride-text/20" style={{ width: `${(referrals/max)*100}%` }}></div>
                <div className="h-full bg-green-500 -ml-[calc(100%-0px)] style={{ width: `${(conversions/max)*100}%` }}" style={{ width: `${(conversions/max)*100}%`, marginLeft: `-${(conversions/max)*100}%` }}></div> 
                {/* CSS hack for overlapping bars, actually better to separate or stack carefully. Let's simpler stack: */}
            </div>
             <div className="h-2 w-full bg-tride-hover rounded-full overflow-hidden mt-1 relative">
                <div className="absolute top-0 left-0 h-full bg-tride-text/30" style={{ width: `${(referrals/max)*100}%` }}></div>
                <div className="absolute top-0 left-0 h-full bg-green-500" style={{ width: `${(conversions/max)*100}%` }}></div>
            </div>
        </div>
    )
}

function SettingToggle({ title, description, checked, onChange }: { title: string, description: string, checked: boolean, onChange?: (val: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-4 border border-tride-border rounded-2xl hover:border-tride-yellow/50 transition-colors">
            <div>
                <div className="font-medium text-tride-text">{title}</div>
                <div className="text-xs text-tride-text-muted">{description}</div>
            </div>
            <Switch 
                checked={checked} 
                onChange={(val) => onChange?.(val)} 
                className={`${checked ? 'bg-blue-600' : 'bg-tride-hover'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
            >
                <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
            </Switch>
        </div>
    )
}

function LimitCard({ title, value, field, currentValue, onSave }: { 
    title: string, value: string, field?: string, currentValue?: number, onSave?: (field: string, value: number) => void 
}) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(currentValue?.toString() || "")

    const handleSave = () => {
        if (field && onSave) {
            onSave(field, parseFloat(editValue))
        }
        setIsEditing(false)
    }

    return (
        <div className="flex items-center justify-between p-4 border border-tride-border rounded-2xl">
            <span className="font-medium text-tride-text">{title}</span>
            <div className="flex items-center gap-3">
                {isEditing ? (
                    <>
                        <Input 
                            type="number" 
                            value={editValue} 
                            onChange={(e) => setEditValue(e.target.value)} 
                            className="w-24 h-8"
                        />
                        <Button variant="default" size="sm" className="h-8" onClick={handleSave}>Save</Button>
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </>
                ) : (
                    <>
                        <span className="font-bold text-tride-text">{value}</span>
                        <Button variant="outline" size="sm" className="h-8" onClick={() => { setEditValue(currentValue?.toString() || ""); setIsEditing(true); }}>Edit</Button>
                    </>
                )}
            </div>
        </div>
    )
}

// Components

function FunnelItem({ label, value, percentage, color }: { label: string, value: string, percentage: number, color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-tride-text font-medium">{label}</span>
                <span className="text-tride-text font-bold">{value}</span>
            </div>
            <div className="h-2 w-full bg-tride-hover rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        completed: "bg-blue-500/20 text-blue-600",
        pending: "bg-orange-500/20 text-orange-600",
        fraud: "bg-red-500/20 text-red-600"
    }
    const style = styles[status as keyof typeof styles] || "bg-gray-500/20 text-gray-600"
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${style} capitalize`}>
            {status}
        </span>
    )
}

function CampaignCard({ campaign, onView, onEdit, onDelete }: { campaign: Campaign, onView?: () => void, onEdit: () => void, onDelete?: () => void }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-lg font-bold text-tride-text">{campaign.name}</h4>
                    <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full mt-1 inline-block">{campaign.status}</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={onEdit} className="text-tride-text-muted hover:text-tride-text"><Edit size={16} /></button>
                    <button onClick={onDelete} className="text-tride-text-muted hover:text-red-500"><Trash2 size={16} /></button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                    <div className="text-tride-text-muted text-xs">Budget</div>
                    <div className="font-bold text-tride-text">${campaign.budget.toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-tride-text-muted text-xs">Spent</div>
                    <div className="font-bold text-blue-500">${campaign.spent.toLocaleString()}</div>
                </div>
            </div>

            <div className="mb-4">
               <div className="h-2 w-full bg-tride-hover rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}></div>
               </div>
            </div>

            <div className="flex justify-between items-center text-xs text-tride-text-muted border-t border-tride-border pt-4">
                <span>Ends: {new Date(campaign.end_date).toLocaleDateString()}</span>
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8" onClick={onView}>View</Button>
                    <Button variant="outline" size="sm" className="h-8" onClick={onEdit}>Edit</Button>
                </div>
            </div>
        </div>
    )
}

function RuleSection({ title, description, rules, onToggle, onEdit, onDelete }: { 
    title: string, description: string, rules: Rule[], 
    onToggle?: (id: number) => void, onEdit?: (rule: Rule) => void, onDelete?: (rule: Rule) => void 
}) {
    return (
        <div className="bg-tride-card border border-tride-border rounded-3xl p-6 h-full">
            <h3 className="text-lg font-bold text-tride-text mb-1">{title}</h3>
            <p className="text-sm text-tride-text-muted mb-6">{description}</p>
            <div className="space-y-4">
                {rules.map(rule => (
                    <div key={rule.id} className="flex items-center justify-between p-4 border border-tride-border rounded-2xl hover:border-blue-500/50 transition-colors">
                        <div>
                            <div className="font-semibold text-tride-text">{rule.name}</div>
                            <div className="text-blue-500 text-sm font-bold">
                                {rule.reward_type === 'fixed' ? `$${rule.reward_amount}` : `${rule.reward_amount}%`}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch 
                                checked={rule.is_active} 
                                onChange={() => onToggle?.(rule.id)} 
                                className={`${rule.is_active ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}
                            >
                                <span className={`${rule.is_active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                            </Switch>
                            <button onClick={() => onEdit?.(rule)} className="text-tride-text-muted hover:text-blue-500"><Edit size={16} /></button>
                            <button onClick={() => onDelete?.(rule)} className="text-tride-text-muted hover:text-red-500"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
                {rules.length === 0 && <div className="text-center text-tride-text-muted py-4">No rules defined</div>}
            </div>
        </div>
    )
}

function TierCard({ tier, onEdit, onDelete }: { tier: Tier, onEdit?: () => void, onDelete?: () => void }) {
    return (
        <div className="bg-tride-card border border-tride-border rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className={`p-4 rounded-full bg-opacity-10 mb-4 ${tier.color === 'Gold' ? 'bg-yellow-500 text-yellow-500' : 'bg-gray-500 text-gray-500'}`}>
                {tier.color === 'Gold' ? <Crown size={32} /> : <Star size={32} />}
            </div>
            <h3 className="text-xl font-bold text-tride-text mb-1">{tier.name}</h3>
            <div className="text-sm text-tride-text-muted mb-4">{tier.min_referrals} - {tier.max_referrals || '∞'} referrals</div>
            
            <div className="text-3xl font-bold text-blue-500 mb-2">{tier.bonus_multiplier}x</div>
            <div className="text-xs text-tride-text-muted mb-6">bonus multiplier</div>

            <ul className="space-y-2 text-sm text-left w-full mb-6">
                {(tier.benefits || ['Basic rewards', 'Standard support']).map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-tride-text">
                        <CheckCircle size={14} className="text-green-500" /> {benefit}
                    </li>
                ))}
            </ul>

            <div className="flex gap-2 w-full mt-auto">
                <Button variant="outline" className="flex-1" onClick={onEdit}>Edit</Button>
                <Button variant="ghost" className="text-red-500 hover:bg-red-500/10" onClick={onDelete}><Trash2 size={16} /></Button>
            </div>
        </div>
    )
}



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
