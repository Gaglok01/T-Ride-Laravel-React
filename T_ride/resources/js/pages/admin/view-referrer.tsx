import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, Crown, DollarSign, Users, Mail, TrendingUp, CheckCircle, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface ReferrerDetail {
    id: number
    name: string
    email: string
    tier: string
    total_referrals: number
    successful_referrals: number
    total_earnings: number
    conversion_rate: number
    joined_at: string
    referral_history?: {
        id: number
        referee: { name: string, email: string }
        status: string
        reward_amount: number
        created_at: string
    }[]
    earnings_history?: {
        id: number
        amount: number
        type: string
        date: string
        description: string
    }[]
    rank?: number
}

export default function ViewReferrer({ id }: { id: string | number }) {
    const [referrer, setReferrer] = useState<ReferrerDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Overview")

    useEffect(() => {
        const fetchReferrer = async () => {
            try {
                // Assuming endpoint exists or mirroring the user structure
                const res = await axios.get(`/admin/referrers/${id}`) 
                // Or /admin/users/${id}/referral-profile if specialized
                const data = res.data.data || res.data
                setReferrer(data)
            } catch (error) {
                console.error("Failed to fetch referrer details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchReferrer()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Referrer Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!referrer) {
        return (
            <AdminLayout title="Referrer Details" description="Not found">
                <div className="text-center text-white/50 py-12">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    Referrer not found
                </div>
            </AdminLayout>
        )
    }

    const getTierColor = (tier: string) => {
        switch (tier?.toLowerCase()) {
            case 'diamond': return 'bg-purple-500/20 text-purple-500 border-purple-500/20'
            case 'gold': return 'bg-yellow-500/20 text-yellow-600 border-yellow-500/20'
            case 'silver': return 'bg-gray-400/20 text-gray-400 border-gray-400/20'
            default: return 'bg-orange-500/20 text-orange-500 border-orange-500/20' // Bronze
        }
    }

    return (
        <AdminLayout
            title="Referrer Details"
            description={`View referral profile for ${referrer.name}`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/referral-program?tab=Top Referrers" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Top Referrers
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-tride-card border border-tride-card/20 rounded-3xl p-6">
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold mb-4 shadow-lg shadow-purple-500/20">
                                {referrer.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-tride-text text-center">{referrer.name}</h2>
                            <p className="text-tride-text-muted text-sm flex items-center gap-1 mt-1">
                                <Mail size={12} /> {referrer.email}
                            </p>
                            <div className={`mt-3 px-4 py-1.5 rounded-full text-sm font-bold border uppercase tracking-wider ${getTierColor(referrer.tier)}`}>
                                {referrer.tier || 'No Tier'}
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <InfoRow label="Joined Program" value={referrer.joined_at ? new Date(referrer.joined_at).toLocaleDateString() : 'N/A'} />
                            <InfoRow label="Total Referrals" value={referrer.total_referrals.toString()} />
                            <InfoRow label="Successful" value={referrer.successful_referrals.toString()} highlight />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            label="Total Earned" 
                            value={`$${Number(referrer.total_earnings || 0).toLocaleString()}`} 
                            icon={<DollarSign size={16} className="text-tride-yellow" />}
                            bg="bg-yellow-500/10"
                        />
                         <StatCard 
                            label="Conversion" 
                            value={`${referrer.conversion_rate}%`} 
                            icon={<TrendingUp size={16} className="text-green-400" />}
                            bg="bg-green-500/10"
                        />
                    </div>
                </div>

                {/* Right Column: Details & History */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit">
                        {["Overview", "Referral History", "Earnings"].map((tab) => (
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
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     <div className="bg-tride-hover/30 p-6 rounded-2xl">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-purple-500/20 p-3 rounded-xl text-purple-500">
                                                <Crown size={24} />
                                            </div>
                                            <div>
                                                <div className="text-tride-text-muted text-xs uppercase font-bold">Current Tier</div>
                                                <div className="text-xl font-bold text-tride-text">{referrer.tier}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-tride-text-muted">Referral Success Rate</span>
                                                <span className="font-bold text-tride-text">{referrer.conversion_rate}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-tride-hover rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-purple-500 rounded-full"
                                                    style={{ width: `${referrer.conversion_rate}%` }}
                                                />
                                            </div>
                                        </div>
                                     </div>

                                     <div className="bg-tride-hover/30 p-6 rounded-2xl">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-500">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <div className="text-tride-text-muted text-xs uppercase font-bold">Network Size</div>
                                                <div className="text-xl font-bold text-tride-text">{referrer.total_referrals} Users</div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-tride-text-muted">
                                            {referrer.name} is in the top {referrer.rank || 'N/A'}% of referrers.
                                        </p>
                                     </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-tride-text mb-4">Recent Activity</h3>
                                    {/* Placeholder for activity timeline if data existed, else simple list */}
                                    <div className="space-y-4">
                                         {referrer.referral_history?.slice(0, 3).map(ref => (
                                              <div key={ref.id} className="flex items-center justify-between p-4 bg-tride-hover/20 rounded-xl border border-white/5">
                                                  <div className="flex items-center gap-3">
                                                      <div className="w-8 h-8 rounded-full bg-tride-card flex items-center justify-center text-xs font-bold text-tride-text-muted border border-white/10">
                                                          {ref.referee.name.charAt(0)}
                                                      </div>
                                                      <div>
                                                          <div className="text-sm font-medium text-tride-text">Referred {ref.referee.name}</div>
                                                          <div className="text-xs text-tride-text-muted">{new Date(ref.created_at).toLocaleDateString()}</div>
                                                      </div>
                                                  </div>
                                                  <StatusBadge status={ref.status} />
                                              </div>
                                         )) || <div className="text-tride-text-muted text-sm">No recent activity.</div>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Referral History" && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 text-left text-tride-text/40 text-sm">
                                            <th className="px-4 py-3 font-medium">Referee</th>
                                            <th className="px-4 py-3 font-medium">Email</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Reward</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {referrer.referral_history?.length ? (
                                            referrer.referral_history.map((item) => (
                                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-white">{item.referee.name}</td>
                                                    <td className="px-4 py-3 text-white/60 text-sm">{item.referee.email}</td>
                                                    <td className="px-4 py-3 text-white/60 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                                                    <td className="px-4 py-3 text-tride-yellow font-medium">${item.reward_amount}</td>
                                                    <td className="px-4 py-3">
                                                        <StatusBadge status={item.status} />
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-8 text-center text-white/40">No referral history found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "Earnings" && (
                             <div className="overflow-x-auto">
                             <table className="w-full">
                                 <thead>
                                     <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                         <th className="px-4 py-3 font-medium">Description</th>
                                         <th className="px-4 py-3 font-medium">Date</th>
                                         <th className="px-4 py-3 font-medium">Type</th>
                                         <th className="px-4 py-3 font-medium">Amount</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                     {referrer.earnings_history?.length ? (
                                         referrer.earnings_history.map((earn) => (
                                             <tr key={earn.id} className="hover:bg-white/5 transition-colors">
                                                 <td className="px-4 py-3 text-white">{earn.description}</td>
                                                 <td className="px-4 py-3 text-white/60 text-sm">{new Date(earn.date).toLocaleDateString()}</td>
                                                 <td className="px-4 py-3 text-white/60 text-sm capitalize">{earn.type}</td>
                                                 <td className="px-4 py-3 text-green-400 font-bold">${earn.amount}</td>
                                             </tr>
                                         ))
                                     ) : (
                                         <tr>
                                             <td colSpan={4} className="px-4 py-8 text-center text-white/40">No earnings history found.</td>
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
    
    if (normalized === 'active' || normalized === 'successful' || normalized === 'completed') styles = "bg-green-500/20 text-green-400 border-green-500/20"
    else if (normalized === 'pending') styles = "bg-blue-600/20 text-blue-400 border-blue-600/20"
    else if (normalized === 'fraud' || normalized === 'rejected') styles = "bg-red-500/20 text-red-400 border-red-500/20"

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
