import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, Calendar, DollarSign, Gift, Target, TrendingUp, Users, CheckCircle, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface CampaignDetail {
    id: number
    name: string
    type: string
    status: string
    start_date: string
    end_date: string
    budget: number
    spent: number
    description: string
    referrals?: {
        id: number
        referee: { name: string }
        referrer: { name: string }
        status: string
        reward_amount: number
        created_at: string
    }[]
    rules?: {
        id: number
        name: string
        trigger_event: string
        reward_amount: number
        reward_type: string
        is_active: boolean
    }[]
    stats?: {
        clicks: number
        conversions: number
        conversion_rate: number
    }
}

export default function ViewCampaign({ id }: { id: string | number }) {
    const [campaign, setCampaign] = useState<CampaignDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Overview")

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const res = await axios.get(`/admin/referral-campaigns/${id}`)
                console.log("res.data==",res.data)
                const data = res.data.data || res.data
                setCampaign(data)
            } catch (error) {
                console.error("Failed to fetch campaign details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCampaign()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Campaign Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!campaign) {
        return (
            <AdminLayout title="Campaign Details" description="Not found">
                <div className="text-center text-white/50 py-12">
                    <Gift size={48} className="mx-auto mb-4 opacity-50" />
                    Campaign not found
                </div>
            </AdminLayout>
        )
    }

    const progress = campaign.budget > 0 ? Math.min((campaign.spent / campaign.budget) * 100, 100) : 0

    return (
        <AdminLayout
            title="Campaign Details"
            description={`View details for ${campaign.name}`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/referral-program" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Referral Program
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-tride-card border border-tride-card/20 rounded-3xl p-6">
                        <div className="aspect-[3/1] w-full bg-tride-hover rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                            <Gift size={48} className="text-tride-text-muted" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-tride-text">{campaign.name}</h2>
                                <p className="text-tride-text-muted font-mono capitalize">{campaign.type}</p>
                            </div>
                            <StatusBadge status={campaign.status} />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <InfoRow label="Start Date" value={campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'} />
                            <InfoRow label="End Date" value={campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'Ongoing'} />
                            <InfoRow label="Total Budget" value={`$${Number(campaign.budget).toLocaleString()}`} highlight />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            label="Spent" 
                            value={`$${Number(campaign.spent || 0).toLocaleString()}`} 
                            icon={<DollarSign size={16} className="text-orange-400" />}
                            bg="bg-orange-500/10"
                        />
                         <StatCard 
                            label="Remaining" 
                            value={`$${(Number(campaign.budget || 0) - Number(campaign.spent || 0)).toLocaleString()}`} 
                            icon={<Target size={16} className="text-green-400" />}
                            bg="bg-green-500/10"
                        />
                    </div>
                </div>

                {/* Right Column: Details & History */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit">
                        {["Overview", "Referrals", "Rules"].map((tab) => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? "default" : "ghost"}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>

                    <div className="bg-tride-card border border-white/5 rounded-3xl p-6 min-h-[400px]">
                        {activeTab === "Overview" && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-tride-text mb-4">Budget Utilization</h3>
                                    <div className="bg-tride-hover/30 rounded-2xl p-6">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm text-tride-text-muted">Budget Progress</span>
                                            <span className="text-sm font-bold text-tride-text">{progress.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-4 w-full bg-tride-hover rounded-full overflow-hidden mb-4">
                                            <div 
                                                className="h-full bg-gradient-to-r from-tride-yellow to-orange-500 rounded-full transition-all duration-500"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-tride-text-muted">Spent: <span className="text-tride-text font-bold">${Number(campaign.spent).toLocaleString()}</span></span>
                                            <span className="text-tride-text-muted">Budget: <span className="text-tride-text font-bold">${Number(campaign.budget).toLocaleString()}</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-tride-text mb-4">Description</h3>
                                    <div className="bg-tride-hover/30 p-6 rounded-2xl">
                                        <p className="text-tride-text-muted">{campaign.description || "No description provided."}</p>
                                    </div>
                                </div>

                                {campaign.stats && (
                                    <div>
                                        <h3 className="text-lg font-bold text-tride-text mb-4">Performance Stats</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <StatCard label="Clicks" value={campaign.stats.clicks || 0} icon={<Users size={16} className="text-blue-400"/>} bg="bg-blue-500/10" />
                                            <StatCard label="Conversions" value={campaign.stats.conversions || 0} icon={<CheckCircle size={16} className="text-green-400"/>} bg="bg-green-500/10" />
                                            <StatCard label="Rate" value={`${campaign.stats.conversion_rate || 0}%`} icon={<TrendingUp size={16} className="text-purple-400"/>} bg="bg-purple-500/10" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Referrals" && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 text-left text-tride-text/40 text-sm">
                                            <th className="px-4 py-3 font-medium">Referee</th>
                                            <th className="px-4 py-3 font-medium">Referrer</th>
                                            <th className="px-4 py-3 font-medium">Reward</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {campaign.referrals?.length ? (
                                            campaign.referrals.map((referral) => (
                                                <tr key={referral.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-white">{referral.referee?.name || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-white">{referral.referrer?.name || 'N/A'}</td>
                                                    <td className="px-4 py-3 text-green-400 font-medium">${referral.reward_amount}</td>
                                                    <td className="px-4 py-3 text-white/50 text-sm">
                                                        {new Date(referral.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={referral.status} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-white/40">No referrals found for this campaign.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "Rules" && (
                             <div className="overflow-x-auto">
                             <table className="w-full">
                                 <thead>
                                     <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                         <th className="px-4 py-3 font-medium">Rule Name</th>
                                         <th className="px-4 py-3 font-medium">Trigger</th>
                                         <th className="px-4 py-3 font-medium">Reward</th>
                                         <th className="px-4 py-3 font-medium">Status</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                     {campaign.rules?.length ? (
                                         campaign.rules.map((rule) => (
                                             <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                                                 <td className="px-4 py-3 text-white">{rule.name}</td>
                                                 <td className="px-4 py-3 text-white/60 text-sm capitalize">{rule.trigger_event.replace(/_/g, ' ')}</td>
                                                 <td className="px-4 py-3 text-tride-yellow font-medium">
                                                    {rule.reward_type === 'fixed' ? '$' : ''}{rule.reward_amount}{rule.reward_type === 'percentage' ? '%' : ''}
                                                 </td>
                                                 <td className="px-4 py-3">
                                                     <span className={`px-2 py-1 rounded text-xs font-bold ${rule.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                         {rule.is_active ? 'Active' : 'Inactive'}
                                                     </span>
                                                 </td>
                                             </tr>
                                         ))
                                     ) : (
                                         <tr>
                                             <td colSpan={4} className="px-4 py-8 text-center text-white/40">No specific rules linked.</td>
                                         </tr>
                                     )}
                                 </tbody>
                             </table>
                         </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status?.toLowerCase()
    let styles = "bg-white/10 text-white/50 border-white/10"
    
    if (normalized === 'active' || normalized === 'completed' || normalized === 'successful') styles = "bg-green-500/20 text-green-400 border-green-500/20"
    else if (normalized === 'scheduled' || normalized === 'pending') styles = "bg-blue-600/20 text-blue-400 border-blue-600/20"
    else if (normalized === 'paused' || normalized === 'fraud') styles = "bg-red-500/20 text-red-400 border-red-500/20"
    else if (normalized === 'ended' || normalized === 'expired') styles = "bg-gray-500/20 text-gray-400 border-gray-500/20"

    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles}`}>
            {status}
        </span>
    )
}

function InfoRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-tride-text-muted text-sm">{label}</span>
            <span className={`text-sm font-medium ${highlight ? 'text-tride-yellow' : 'text-tride-text'}`}>{value}</span>
        </div>
    )
}

function StatCard({ label, value, icon, bg }: any) {
    return (
        <div className="bg-tride-card border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
                <p className="text-tride-text-muted text-xs font-medium uppercase mb-1">{label}</p>
                <p className="text-xl font-bold text-tride-text">{value}</p>
            </div>
            <div className={`p-2 rounded-xl ${bg}`}>
                {icon}
            </div>
        </div>
    )
}
