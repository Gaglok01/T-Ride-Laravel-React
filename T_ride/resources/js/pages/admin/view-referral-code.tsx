import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, Tag, Calendar, DollarSign, Users, Gift, Copy, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface ReferralCodeDetail {
    id: number
    code: string
    status: string
    referral_code: string // sometimes keys differ
    reward_amount: number
    created_at: string
    completed_at?: string
    expires_at?: string
    usage_count?: number
    max_usage?: number
    referrer?: {
        id: number
        name: string
        email: string
    }
    referee?: {
        id: number
        name: string
        email: string
    }
    campaign?: {
        id: number
        name: string
        type: string
    }
}

export default function ViewReferralCode({ id }: { id: string | number }) {
    const [codeData, setCodeData] = useState<ReferralCodeDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Overview")

    useEffect(() => {
        const fetchCode = async () => {
            try {
                const res = await axios.get(`/admin/referral-codes/${id}`)
                const data = res.data.data || res.data
                setCodeData(data)
            } catch (error) {
                console.error("Failed to fetch referral code details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCode()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Referral Code Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!codeData) {
        return (
            <AdminLayout title="Referral Code Details" description="Not found">
                <div className="text-center text-white/50 py-12">
                    <Tag size={48} className="mx-auto mb-4 opacity-50" />
                    Referral Code not found
                </div>
            </AdminLayout>
        )
    }

    const copyCode = () => {
        navigator.clipboard.writeText(codeData.referral_code || codeData.code)
        // Could show toast here
    }

    return (
        <AdminLayout
            title="Referral Code Details"
            description={`View details for code ${codeData.referral_code || codeData.code}`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/referral-program?tab=Referral Codes" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Referral Codes
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-tride-card border border-tride-card/20 rounded-3xl p-6">
                        <div className="aspect-[3/1] w-full bg-tride-hover rounded-2xl mb-6 flex flex-col items-center justify-center overflow-hidden relative group">
                            <div className="text-3xl font-mono font-bold text-tride-text tracking-widest flex items-center gap-3">
                                {codeData.referral_code || codeData.code}
                            </div>
                            <button 
                                onClick={copyCode}
                                className="absolute bottom-2 right-2 p-2 bg-black/40 rounded-xl hover:bg-black/60 text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                title="Copy Code"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-tride-text">Referral Code</h2>
                                <p className="text-tride-text-muted text-xs">Generated on {new Date(codeData.created_at).toLocaleDateString()}</p>
                            </div>
                            <StatusBadge status={codeData.status} />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <InfoRow label="Expires" value={codeData.expires_at ? new Date(codeData.expires_at).toLocaleDateString() : 'Never'} />
                            <InfoRow label="Total Value" value={`$${Number(codeData.reward_amount).toLocaleString()}`} highlight />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            label="Uses" 
                            value={codeData.usage_count || (codeData.referee ? 1 : 0)} 
                            icon={<Users size={16} className="text-blue-400" />}
                            bg="bg-blue-500/10"
                        />
                         <StatCard 
                            label="Max Uses" 
                            value={codeData.max_usage || 1} 
                            icon={<CheckCircle size={16} className="text-green-400" />}
                            bg="bg-green-500/10"
                        />
                    </div>
                </div>

                {/* Right Column: Details & History */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit">
                        {["Overview"].map((tab) => (
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
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Campaign Info */}
                                    <div className="bg-tride-hover/30 p-5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500">
                                                <Gift size={20} />
                                            </div>
                                            <h3 className="font-bold text-tride-text">Campaign</h3>
                                        </div>
                                        {codeData.campaign ? (
                                            <div>
                                                <div className="text-lg font-medium text-tride-text">{codeData.campaign.name}</div>
                                                <div className="text-sm text-tride-text-muted capitalize">{codeData.campaign.type} Campaign</div>
                                            </div>
                                        ) : (
                                            <div className="text-tride-text-muted text-sm">General Referral Program</div>
                                        )}
                                    </div>

                                    {/* Reward Info */}
                                    <div className="bg-tride-hover/30 p-5 rounded-2xl border border-white/5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="bg-green-500/20 p-2 rounded-lg text-green-500">
                                                <DollarSign size={20} />
                                            </div>
                                            <h3 className="font-bold text-tride-text">Reward</h3>
                                        </div>
                                        <div>
                                            <div className="text-lg font-medium text-tride-text">${codeData.reward_amount}</div>
                                            <div className="text-sm text-tride-text-muted">Paid upon completion</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Referrer */}
                                    <div className="bg-tride-hover/20 p-5 rounded-2xl">
                                        <h4 className="text-sm font-bold text-tride-text-muted uppercase mb-3 text-center md:text-left">Details</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">
                                                        {codeData.referrer?.name?.charAt(0) || '?'}
                                                     </div>
                                                     <div>
                                                         <div className="text-xs text-tride-text-muted">Referrer</div>
                                                         <div className="font-medium text-tride-text">{codeData.referrer?.name || 'N/A'}</div>
                                                         <div className="text-xs text-tride-text-muted">{codeData.referrer?.email}</div>
                                                     </div>
                                                </div>
                                            </div>
                                             
                                            <div className="flex items-center justify-center">
                                                <div className="h-8 w-[1px] bg-white/10 md:hidden"></div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                     <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-bold">
                                                        {codeData.referee?.name?.charAt(0) || '?'}
                                                     </div>
                                                     <div>
                                                         <div className="text-xs text-tride-text-muted">Referee</div>
                                                         <div className="font-medium text-tride-text">{codeData.referee?.name || 'Pending'}</div>
                                                         <div className="text-xs text-tride-text-muted">{codeData.referee?.email}</div>
                                                     </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline/Status */}
                                    <div className="bg-tride-hover/20 p-5 rounded-2xl">
                                        <h4 className="text-sm font-bold text-tride-text-muted uppercase mb-3">Timeline</h4>
                                        <div className="space-y-4 relative">
                                            <div className="absolute left-[11px] top-2 bottom-2 w-[1px] bg-white/10"></div>
                                            
                                            <div className="flex items-start gap-3 relative z-10">
                                                <div className="bg-tride-card rounded-full p-1 border border-white/10">
                                                    <Clock size={14} className="text-tride-text-muted" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-tride-text">Code Generated</div>
                                                    <div className="text-xs text-tride-text-muted">{new Date(codeData.created_at).toLocaleString()}</div>
                                                </div>
                                            </div>

                                            {codeData.completed_at ? (
                                                <div className="flex items-start gap-3 relative z-10">
                                                    <div className="bg-green-500/20 rounded-full p-1 border border-green-500/20">
                                                        <CheckCircle size={14} className="text-green-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-tride-text">Completed</div>
                                                        <div className="text-xs text-tride-text-muted">{new Date(codeData.completed_at).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                 <div className="flex items-start gap-3 relative z-10 opacity-50">
                                                    <div className="bg-tride-card rounded-full p-1 border border-white/10">
                                                        <CheckCircle size={14} className="text-tride-text-muted" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-tride-text">Pending Completion</div>
                                                    </div>
                                                </div>
                                            )}

                                            {codeData.status === 'expired' && (
                                                <div className="flex items-start gap-3 relative z-10">
                                                    <div className="bg-red-500/20 rounded-full p-1 border border-red-500/20">
                                                        <AlertTriangle size={14} className="text-red-500" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-tride-text">Expired</div>
                                                        <div className="text-xs text-tride-text-muted">Code has expired</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

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
    else if (normalized === 'expired' || normalized === 'fraud' || normalized === 'rejected') styles = "bg-red-500/20 text-red-400 border-red-500/20"

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
