import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, CreditCard, DollarSign, Activity, Wallet, Landmark, Layers, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface Transaction {
    id: number
    transaction_id: string
    reference: string
    amount: number
    currency: string
    type: string
    status: string
    created_at: string
    user: {
        name: string
        email: string
    }
}

interface ProviderData {
    id: number
    name: string
    type: string
    api_key?: string
    is_active: boolean
    transaction_fee: number
    transaction_limit: number
    country: string
    created_at: string
}

interface ProviderStats {
    total_processed: number
    transaction_count: number
    success_rate: number
    failed_count: number
}

interface ViewProviderData {
    status: boolean
    data: ProviderData
    stats: ProviderStats
    transactions: Transaction[]
}

export default function ViewPaymentProvider({ id }: { id: number }) {
    const [providerData, setProviderData] = useState<ViewProviderData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProvider = async () => {
            try {
                const res = await axios.get(`/admin/payment-gateway/providers/${id}`)
                if (res.data.status) {
                    setProviderData(res.data)
                }
            } catch (error) {
                console.error("Failed to fetch provider details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchProvider()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Provider Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!providerData) {
        return (
            <AdminLayout title="Provider Details" description="Not found">
                <div className="text-center text-white/50 py-12">Provider not found</div>
            </AdminLayout>
        )
    }

    const { data: provider, stats, transactions } = providerData

    const getIcon = (type: string) => {
        switch (type) {
            case 'card': return <CreditCard size={40} className="text-blue-400" />
            case 'wallet': return <Wallet size={40} className="text-purple-400" />
            case 'mobile_money': return <DollarSign size={40} className="text-green-400" />
            case 'bank_transfer': return <Landmark size={40} className="text-yellow-400" />
            default: return <Layers size={40} className="text-gray-400" />
        }
    }

    return (
        <AdminLayout
            title="Provider Details"
            description={`Details and statistics for ${provider.name}`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/payment-gateway" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Gateway
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
                                {getIcon(provider.type)}
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">{provider.name}</h2>
                            <p className="text-white/50 mb-4 capitalize">{provider.type.replace('_', ' ')} Provider</p>
                            
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                                provider.is_active ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                                'bg-white/10 text-white/50 border-white/10'
                            }`}>
                                {provider.is_active ? 'Active' : 'Inactive'}
                            </span>

                            <div className="w-full mt-8 space-y-4 pt-6 border-t border-white/5">
                                <InfoRow label="Transaction Fee" value={`${provider.transaction_fee}%`} />
                                <InfoRow label="Limit" value={`$${Number(provider.transaction_limit).toLocaleString()}`} />
                                <InfoRow label="Country" value={provider.country || 'Global'} />
                                <InfoRow label="Created" value={new Date(provider.created_at).toLocaleDateString()} />
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            label="Success Rate" 
                            value={`${stats.success_rate.toFixed(1)}%`} 
                            icon={<CheckCircle size={16} className="text-green-400" />}
                            bg="bg-green-500/10"
                        />
                         <StatCard 
                            label="Failed" 
                            value={stats.failed_count.toString()} 
                            icon={<XCircle size={16} className="text-red-400" />}
                            bg="bg-red-500/10"
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Big Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-tride-card border border-white/5 rounded-3xl p-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-tride-yellow/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                             <h3 className="text-white/50 mb-2 font-medium">Total Processed Volume</h3>
                             <p className="text-3xl font-bold text-white">${Number(stats.total_processed).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                             <h3 className="text-white/50 mb-2 font-medium">Total Transactions</h3>
                             <p className="text-3xl font-bold text-white">{stats.transaction_count.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                             <Activity size={18} className="text-tride-yellow" />
                             Recent Transactions
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                        <th className="px-4 py-3 font-medium">Reference</th>
                                        <th className="px-4 py-3 font-medium">User</th>
                                        <th className="px-4 py-3 font-medium">Amount</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {transactions.length > 0 ? (
                                        transactions.map((txn) => (
                                            <tr key={txn.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-4 py-3 font-mono text-xs text-white/60">{txn.reference}</td>
                                                <td className="px-4 py-3 text-white">{txn.user?.name || 'Unknown'}</td>
                                                <td className="px-4 py-3 font-medium text-white">${Number(txn.amount).toFixed(2)}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs capitalize ${
                                                        txn.status === 'success' ? 'bg-green-500/10 text-green-400' :
                                                        txn.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {txn.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-white/40 text-xs">
                                                    {new Date(txn.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-white/40">No transactions found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
            <span className="text-white/40 text-sm">{label}</span>
            <span className="text-sm font-medium text-white">{value}</span>
        </div>
    )
}

function StatCard({ label, value, icon, bg }: any) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
                <p className="text-white/40 text-xs font-medium uppercase mb-1">{label}</p>
                <p className="text-lg font-bold text-white">{value}</p>
            </div>
            <div className={`p-2 rounded-xl ${bg}`}>
                {icon}
            </div>
        </div>
    )
}
