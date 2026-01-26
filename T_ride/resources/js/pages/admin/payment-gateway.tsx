import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PaymentProviderModal } from "@/components/admin/PaymentProviderModal"
import { MobileMoneyModal } from "@/components/admin/MobileMoneyModal"
import { WebhookModal } from "@/components/admin/WebhookModal"
import { LimitModal } from "@/components/admin/LimitModal"
import axios from "@/lib/axios"
import {
    DollarSign,
    CheckCircle,
    AlertCircle,
    Zap,
    Shield,
    Plus,
    Settings,
    CreditCard,
    Wallet,
    Smartphone,
    Eye,
    Search,
    Download,
    RefreshCw,
    Trash2,
    Link as LinkIcon,
    Landmark
} from "lucide-react"

// Interfaces
interface PaymentProvider {
    id: number
    name: string
    type: string
    api_key?: string
    secret_key?: string
    country?: string
    transaction_fee?: number
    transaction_limit?: number
    transaction_count?: number
    total_processed?: number
    success_rate?: number
    is_active: boolean
    status: string
    created_at: string
    updated_at: string
}

interface DashboardStats {
    total_processed: number
    success_rate: number
    failed_transactions: number
    avg_processing_time: string
    chargebacks: number
}

interface MobileMoneyProvider {
    id: number
    payment_provider_id: number
    name: string
    country: string
    transaction_limit: number
    fee_percentage: number
    is_active: boolean
    today_volume?: number
    payment_provider?: PaymentProvider
}

interface FraudSettings {
    risk_score_threshold: number
    block_suspicious_ips: boolean
    velocity_checks: boolean
    cvv_verification: boolean
}

interface CardSetting {
    id: number
    setting_name: string
    value: string
    is_enabled: boolean
}

interface Webhook {
    id: number
    name: string
    url: string
    event_type: string
    status: string
    secret: string
}

interface TransactionLimit {
    id: number
    name: string
    limit_type: string
    amount: number
    is_active: boolean
}

// Custom Switch Component with Project Colors
function Switch({ checked, onCheckedChange, disabled }: { checked: boolean, onCheckedChange: (checked: boolean) => void, disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={`
                relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tride-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-tride-dark disabled:cursor-not-allowed disabled:opacity-50
                ${checked ? 'bg-tride-yellow' : 'bg-neutral-700'}
            `}
        >
            <span
                className={`
                    pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    )
}

// Stats Card matching RentPage design
function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-sm font-medium mb-1">{label}</p>
                <div className="text-3xl font-bold text-tride-text mb-2">{value}</div>
                <div className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-lg">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center text-tride-text`}>
                {icon}
            </div>
        </div>
    )
}

// Format currency
function formatCurrency(amount: number | string | undefined | null): string {
    if (amount === undefined || amount === null) return "$0"
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return "$0"
    if (numAmount >= 1000000) return `$${(numAmount / 1000000).toFixed(1)}M`
    if (numAmount >= 1000) return `$${(numAmount / 1000).toFixed(1)}K`
    return `$${numAmount.toLocaleString()}`
}

// Format percentage
function formatPercentage(value: number | string | undefined | null): string {
    if (value === undefined || value === null) return "0%"
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) return "0%"
    return `${numValue.toFixed(1)}%`
}

export default function PaymentGateway() {
    const [activeTab, setActiveTab] = useState("Payment Providers")
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(true)

    // Modal States
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false)
    const [isMobileModalOpen, setIsMobileModalOpen] = useState(false)
    const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false)
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false)

    // Editing States
    const [editingProvider, setEditingProvider] = useState<PaymentProvider | null>(null)
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
    const [editingLimit, setEditingLimit] = useState<TransactionLimit | null>(null)

    // Data States
    const [providers, setProviders] = useState<PaymentProvider[]>([])
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [mobileMoneyProviders, setMobileMoneyProviders] = useState<MobileMoneyProvider[]>([])
    const [fraudSettings, setFraudSettings] = useState<FraudSettings | null>(null)
    const [cardSettings, setCardSettings] = useState<CardSetting[]>([])
    const [webhooks, setWebhooks] = useState<Webhook[]>([])
    const [transactionLimits, setTransactionLimits] = useState<TransactionLimit[]>([])

    // Error States
    const [error, setError] = useState("")

    // Data Refreshers
    const fetchProviders = useCallback(async () => {
        try {
            const res = await axios.get('/admin/payment-gateway/providers')
            if (res.data.status) {
                setProviders(res.data.data)
                if (res.data.stats) setStats(res.data.stats)
            }
        } catch (err) { console.error(err) }
    }, [])

    const fetchDashboardStats = useCallback(async () => {
        try {
            const res = await axios.get('/admin/payment-gateway/dashboard')
            if (res.data.status) setStats(res.data.data)
        } catch (err) { console.error(err) }
    }, [])

    const fetchMobileMoneyProviders = useCallback(async () => {
        try {
            const res = await axios.get('/admin/payment-gateway/mobile-money')
            if (res.data.status) setMobileMoneyProviders(res.data.data)
        } catch (err) { console.error(err) }
    }, [])

    const fetchCardAndFraudSettings = useCallback(async () => {
        try {
            const [cardRes, fraudRes] = await Promise.all([
                axios.get('/admin/payment-gateway/card-settings'),
                axios.get('/admin/payment-gateway/fraud-settings')
            ])
            if (cardRes.data.status) setCardSettings(cardRes.data.data)
            if (fraudRes.data.status) setFraudSettings(fraudRes.data.data)
        } catch (err) { console.error(err) }
    }, [])

    const fetchGatewaySettings = useCallback(async () => {
        try {
            const [webhookRes, limitRes] = await Promise.all([
                axios.get('/admin/payment-gateway/webhooks'),
                axios.get('/admin/payment-gateway/transaction-limits')
            ])
            if (webhookRes.data.status) setWebhooks(webhookRes.data.data)
            if (limitRes.data.status) setTransactionLimits(limitRes.data.data)
        } catch (err) { console.error(err) }
    }, [])

    // Initial Load
    useEffect(() => {
        const load = async () => {
            setLoading(true)
            await Promise.all([fetchProviders(), fetchDashboardStats()])
            setLoading(false)
        }
        load()
    }, [fetchProviders, fetchDashboardStats])

    // Tab Load
    useEffect(() => {
        if (activeTab === 'Mobile Money') fetchMobileMoneyProviders()
        else if (activeTab === 'Card Processing') fetchCardAndFraudSettings()
        else if (activeTab === 'Gateway Settings') fetchGatewaySettings()
    }, [activeTab, fetchMobileMoneyProviders, fetchCardAndFraudSettings, fetchGatewaySettings])


    // Handlers
    const handleSaveProvider = async (data: any) => {
        try {
            if (editingProvider) {
                await axios.put(`/admin/payment-gateway/providers/${editingProvider.id}`, data)
            } else {
                await axios.post('/admin/payment-gateway/providers', data)
            }
            setIsProviderModalOpen(false)
            setEditingProvider(null)
            fetchProviders()
        } catch (err) { throw err }
    }

    const handleSaveMobileMoney = async (data: any) => {
        try {
            await axios.post('/admin/payment-gateway/mobile-money', data)
            setIsMobileModalOpen(false)
            fetchMobileMoneyProviders()
        } catch (err) { throw err }
    }

    const handleSaveWebhook = async (data: any) => {
        try {
            if (editingWebhook) {
                await axios.put(`/admin/payment-gateway/webhooks/${editingWebhook.id}`, data)
            } else {
                await axios.post('/admin/payment-gateway/webhooks', data)
            }
            setIsWebhookModalOpen(false)
            setEditingWebhook(null)
            fetchGatewaySettings()
        } catch (err) { throw err }
    }

    const deleteWebhook = async (id: number) => {
        if (!confirm("Are you sure you want to delete this webhook?")) return
        try {
            await axios.delete(`/admin/payment-gateway/webhooks/${id}`)
            fetchGatewaySettings()
        } catch (err) { console.error(err) }
    }

    const handleSaveLimit = async (data: any) => {
        try {
            if (editingLimit) {
                await axios.put(`/admin/payment-gateway/transaction-limits/${editingLimit.id}`, data)
            }
            setIsLimitModalOpen(false)
            setEditingLimit(null)
            fetchGatewaySettings()
        } catch (err) { throw err }
    }

    const handleToggleProvider = async (provider: PaymentProvider) => {
        try {
            await axios.patch(`/admin/payment-gateway/providers/${provider.id}/configure`, {
                is_enabled: !provider.is_active
            })
            fetchProviders()
        } catch (err) { console.error(err) }
    }
    
    // Helper to get providers for Mobile Money Modal
    const providerOptions = providers.map(p => ({ label: p.name, value: p.id }))

    // Helper for Card/Fraud settings updates
    const updateCardSetting = async (name: string, val: boolean) => {
        await axios.put('/admin/payment-gateway/card-settings', { [name]: val }); fetchCardAndFraudSettings();
    }
    const updateFraudSetting = async (name: string, val: boolean) => {
        await axios.put('/admin/payment-gateway/fraud-settings', { [name]: val }); fetchCardAndFraudSettings();
    }


    const statsDisplay = [
        { label: "Total Processed", value: formatCurrency(stats?.total_processed), trend: "+18.5%", trendUp: true, icon: <DollarSign size={20} className="text-blue-500" />, iconBg: "bg-blue-500/10" },
        { label: "Success Rate", value: formatPercentage(stats?.success_rate), trend: "+0.3%", trendUp: true, icon: <CheckCircle size={20} className="text-green-500" />, iconBg: "bg-green-500/10" },
        { label: "Failed Txns", value: stats?.failed_transactions?.toString() || "0", trend: "-12.5%", trendUp: false, icon: <AlertCircle size={20} className="text-red-500" />, iconBg: "bg-red-500/10" },
        { label: "Avg Processing", value: stats?.avg_processing_time || "1.2s", trend: "-0.2s", trendUp: true, icon: <Zap size={20} className="text-yellow-500" />, iconBg: "bg-yellow-500/10" },
        { label: "Chargebacks", value: stats?.chargebacks?.toString() || "0", trend: "-0.05%", trendUp: true, icon: <Shield size={20} className="text-purple-500" />, iconBg: "bg-purple-500/10" },
    ]

    return (
        <AdminLayout
            title="Payment Gateway"
            description="Manage payment providers and configurations"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" className="gap-2 flex-1 sm:flex-none justify-center" onClick={() => { fetchProviders(); fetchDashboardStats(); }}>
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </Button>
                        <Button variant="default" className="flex-1 sm:flex-none justify-center" onClick={() => { setEditingProvider(null); setIsProviderModalOpen(true); }}>
                            <Plus size={18} className="mr-2" />
                            Add Provider
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {statsDisplay.map((stat, i) => (
                    <StatsCard key={i} {...stat} />
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm p-6">
                <div className="flex gap-1 mb-8 p-1 rounded-2xl w-fit flex-wrap border-tride-border">
                    {["Payment Providers", "Mobile Money", "Card Processing", "Digital Wallets", "Bank Transfers", "Gateway Settings"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "ghost"}
                            className={activeTab === tab ? "" : "text-tride-text-muted hover:text-tride-text"}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-tride-yellow border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
                <>
                    {activeTab === 'Payment Providers' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {providers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((provider) => (
                                <div key={provider.id} className="bg-tride-card border border-tride-border rounded-xl p-6 relative group hover:border-tride-yellow/30 transition-colors">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-tride-hover rounded-lg flex items-center justify-center text-tride-text">
                                                {provider.type === 'mobile_money' ? <Smartphone size={20} /> : provider.type === 'wallet' ? <Wallet size={20} /> : <CreditCard size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-tride-text">{provider.name}</h3>
                                                <Badge variant={provider.is_active ? "default" : "secondary"} className={provider.is_active ? "bg-tride-yellow text-black" : "bg-neutral-700"}>{provider.is_active ? "Active" : "Inactive"}</Badge>
                                            </div>
                                        </div>
                                        <Switch checked={provider.is_active} onCheckedChange={() => handleToggleProvider(provider)} />
                                    </div>
                                    <div className="flex justify-between items-center mb-6 text-sm">
                                        <div><p className="text-tride-text-muted mb-1">Transactions</p><p className="text-tride-text font-medium">{provider.transaction_count?.toLocaleString() || "0"}</p></div>
                                        <div className="text-right"><p className="text-tride-text-muted mb-1">Fees</p><p className="text-tride-text font-medium">{formatPercentage(provider.transaction_fee)}</p></div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Link href={`/admin/payment-gateway/${provider.id}`} className="flex-1">
                                             <Button variant="secondary" className="w-full bg-tride-hover hover:bg-tride-border text-tride-text border border-tride-border"><Eye size={14} className="mr-2" /> View</Button>
                                        </Link>
                                        <Button variant="outline" className="flex-1 border-tride-border hover:bg-tride-hover text-tride-text-muted" onClick={() => { setEditingProvider(provider); setIsProviderModalOpen(true); }}><Settings size={14} className="mr-2" /> Configure</Button>
                                    </div>
                                </div>
                            ))}
                            {providers.length === 0 && <div className="col-span-full text-center py-10 text-tride-text-muted">No providers found.</div>}
                        </div>
                    )}

                    {activeTab === 'Mobile Money' && (
                        <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden backdrop-blur-sm">
                            <div className="flex justify-between items-center p-6 border-b border-tride-border">
                                <h3 className="text-lg font-bold text-tride-text">Mobile Money Providers</h3>
                                <Button onClick={() => setIsMobileModalOpen(true)}><Plus size={16} className="mr-2" /> Add Service</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                            <th className="px-6 py-4">Provider</th>
                                            <th className="px-6 py-4">Country</th>
                                            <th className="px-6 py-4">Limit</th>
                                            <th className="px-6 py-4">Fee</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-tride-border text-tride-text">
                                        {mobileMoneyProviders.map((item) => (
                                            <tr key={item.id} className="hover:bg-tride-hover transition-colors">
                                                <td className="px-6 py-4 flex items-center gap-3"><Smartphone size={16} /> {item.name}</td>
                                                <td className="px-6 py-4">{item.country}</td>
                                                <td className="px-6 py-4">{formatCurrency(item.transaction_limit)}</td>
                                                <td className="px-6 py-4">{formatPercentage(item.fee_percentage)}</td>
                                                <td className="px-6 py-4"><Badge className={item.is_active ? "bg-tride-yellow text-black" : "bg-neutral-700"}>{item.is_active ? "Active" : "Inactive"}</Badge></td>
                                            </tr>
                                        ))}
                                        {mobileMoneyProviders.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-tride-text-muted">No mobile money services configured.</td></tr>}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Card Processing' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-tride-card border border-tride-border rounded-xl p-6">
                                <h3 className="text-lg font-bold text-tride-text mb-6">Card Processing Settings</h3>
                                <div className="space-y-6">
                                    {cardSettings.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 border border-tride-border rounded-lg bg-tride-hover/50">
                                            <div className="flex items-center gap-3"><CreditCard size={18} className="text-tride-text-muted" /><span className="font-medium text-tride-text capitalize">{s.setting_name.replace(/_/g, ' ')}</span></div>
                                            <Switch checked={s.is_enabled} onCheckedChange={(c) => updateCardSetting(s.setting_name, c)} />
                                        </div>
                                    ))}
                                    {cardSettings.length === 0 && <div className="text-center text-tride-text-muted">No settings available.</div>}
                                </div>
                            </div>
                            <div className="bg-tride-card border border-tride-border rounded-xl p-6">
                                <h3 className="text-lg font-bold text-tride-text mb-6">Fraud Prevention</h3>
                                <div className="space-y-6">
                                    <div>
                                        <div className="flex justify-between mb-2"><span className="text-sm font-medium text-tride-text">Risk Score Threshold</span><Badge className="bg-blue-600">{fraudSettings?.risk_score_threshold || 75}</Badge></div>
                                        <div className="h-2 bg-tride-hover rounded-full overflow-hidden"><div className="h-full bg-blue-600" style={{ width: `${fraudSettings?.risk_score_threshold || 75}%` }}></div></div>
                                    </div>
                                    <div className="flex justify-between"><span className="text-sm font-medium text-tride-text">Block Suspicious IPs</span><Switch checked={fraudSettings?.block_suspicious_ips ?? true} onCheckedChange={(c) => updateFraudSetting('block_suspicious_ips', c)} /></div>
                                    <div className="flex justify-between"><span className="text-sm font-medium text-tride-text">Velocity Checks</span><Switch checked={fraudSettings?.velocity_checks ?? true} onCheckedChange={(c) => updateFraudSetting('velocity_checks', c)} /></div>
                                    <div className="flex justify-between"><span className="text-sm font-medium text-tride-text">CVV Verification</span><Switch checked={fraudSettings?.cvv_verification ?? true} onCheckedChange={(c) => updateFraudSetting('cvv_verification', c)} /></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Digital Wallets' && (
                        <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden backdrop-blur-sm">
                             <div className="flex justify-between items-center p-6 border-b border-tride-border">
                                <h3 className="text-lg font-bold text-tride-text">Digital Wallet Providers</h3>
                                <Button onClick={() => { setEditingProvider({ type: 'wallet' } as any); setIsProviderModalOpen(true); }}>
                                    <Plus size={16} className="mr-2" /> Add Wallet
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {providers.filter(p => p.type === 'wallet').map((provider) => (
                                     <div key={provider.id} className="bg-tride-card border border-tride-border rounded-xl p-6 relative group hover:border-tride-yellow/30 transition-colors">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-tride-hover rounded-lg flex items-center justify-center text-tride-text">
                                                    <Wallet size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-tride-text">{provider.name}</h3>
                                                     <Badge variant={provider.is_active ? "default" : "secondary"} className={provider.is_active ? "bg-tride-yellow text-black" : "bg-neutral-700"}>{provider.is_active ? "Active" : "Inactive"}</Badge>
                                                </div>
                                            </div>
                                            <Switch checked={provider.is_active} onCheckedChange={() => handleToggleProvider(provider)} />
                                        </div>
                                         <div className="flex justify-between items-center mb-6 text-sm">
                                            <div><p className="text-tride-text-muted mb-1">Transactions</p><p className="text-tride-text font-medium">{provider.transaction_count?.toLocaleString() || "0"}</p></div>
                                            <div className="text-right"><p className="text-tride-text-muted mb-1">Fees</p><p className="text-tride-text font-medium">{formatPercentage(provider.transaction_fee)}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link href={`/admin/payment-gateway/${provider.id}`} className="flex-1">
                                                 <Button variant="secondary" className="w-full bg-tride-hover hover:bg-tride-border text-tride-text border border-tride-border"><Eye size={14} className="mr-2" /> View</Button>
                                            </Link>
                                            <Button variant="outline" className="flex-1 border-tride-border hover:bg-tride-hover text-tride-text-muted" onClick={() => { setEditingProvider(provider); setIsProviderModalOpen(true); }}><Settings size={14} className="mr-2" /> Configure</Button>
                                        </div>
                                    </div>
                                ))}
                                {providers.filter(p => p.type === 'wallet').length === 0 && (
                                     <div className="col-span-full text-center py-10 text-tride-text-muted">No digital wallets configured.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Bank Transfers' && (
                         <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden backdrop-blur-sm">
                             <div className="flex justify-between items-center p-6 border-b border-tride-border">
                                <h3 className="text-lg font-bold text-tride-text">Bank Transfer Configuration</h3>
                                <Button onClick={() => { setEditingProvider({ type: 'bank_transfer' } as any); setIsProviderModalOpen(true); }}>
                                    <Plus size={16} className="mr-2" /> Add Bank
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {providers.filter(p => p.type === 'bank_transfer').map((provider) => (
                                     <div key={provider.id} className="bg-tride-card border border-tride-border rounded-xl p-6 relative group hover:border-tride-yellow/30 transition-colors">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-tride-hover rounded-lg flex items-center justify-center text-tride-text">
                                                    <Landmark size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-tride-text">{provider.name}</h3>
                                                     <Badge variant={provider.is_active ? "default" : "secondary"} className={provider.is_active ? "bg-tride-yellow text-black" : "bg-neutral-700"}>{provider.is_active ? "Active" : "Inactive"}</Badge>
                                                </div>
                                            </div>
                                            <Switch checked={provider.is_active} onCheckedChange={() => handleToggleProvider(provider)} />
                                        </div>
                                         <div className="flex justify-between items-center mb-6 text-sm">
                                            <div><p className="text-tride-text-muted mb-1">Limit</p><p className="text-tride-text font-medium">{formatCurrency(provider.transaction_limit)}</p></div>
                                            <div className="text-right"><p className="text-tride-text-muted mb-1">Fee</p><p className="text-tride-text font-medium">{formatPercentage(provider.transaction_fee)}</p></div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link href={`/admin/payment-gateway/${provider.id}`} className="flex-1">
                                                 <Button variant="secondary" className="w-full bg-tride-hover hover:bg-tride-border text-tride-text border border-tride-border"><Eye size={14} className="mr-2" /> View</Button>
                                            </Link>
                                            <Button variant="outline" className="flex-1 border-tride-border hover:bg-tride-hover text-tride-text-muted" onClick={() => { setEditingProvider(provider); setIsProviderModalOpen(true); }}><Settings size={14} className="mr-2" /> Configure</Button>
                                        </div>
                                    </div>
                                ))}
                                {providers.filter(p => p.type === 'bank_transfer').length === 0 && (
                                     <div className="col-span-full text-center py-10 text-tride-text-muted">No bank transfer options configured.</div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Gateway Settings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-tride-card border border-tride-border rounded-xl p-6">
                                <h3 className="text-lg font-bold text-tride-text mb-6">Transaction Limits</h3>
                                <div className="space-y-4">
                                    {transactionLimits.map(limit => (
                                        <div key={limit.id} className="flex justify-between p-4 border border-tride-border rounded-lg bg-tride-hover/50 items-center">
                                            <span className="text-sm text-tride-text-muted">{limit.name || limit.limit_type}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-tride-text">{formatCurrency(limit.amount)}</span>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-tride-text-muted hover:text-tride-text" onClick={() => { setEditingLimit(limit); setIsLimitModalOpen(true); }}><Settings size={14} /></Button>
                                            </div>
                                        </div>
                                    ))}
                                    {transactionLimits.length === 0 && <div className="text-center text-tride-text-muted">No limits configured.</div>}
                                </div>
                            </div>

                            <div className="bg-tride-card border border-tride-border rounded-xl p-6">
                                <h3 className="text-lg font-bold text-tride-text mb-6">Webhook Configuration</h3>
                                <div className="space-y-4">
                                    {webhooks.map(webhook => (
                                        <div key={webhook.id} className="border border-tride-border rounded-lg p-3 bg-tride-hover/50">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-xs text-tride-text-muted">{webhook.name}</span>
                                                <div className="flex gap-2">
                                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-tride-text-muted hover:text-tride-text" onClick={() => { setEditingWebhook(webhook); setIsWebhookModalOpen(true); }}><Settings size={12} /></Button>
                                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-red-400/50 hover:text-red-400" onClick={() => deleteWebhook(webhook.id)}><Trash2 size={12} /></Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${webhook.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div><code className="text-xs text-blue-400 font-mono block truncate">{webhook.url}</code></div>
                                        </div>
                                    ))}
                                    <Button variant="outline" className="w-full border-dashed border-tride-border text-tride-text-muted hover:text-tride-text hover:bg-tride-hover" onClick={() => { setEditingWebhook(null); setIsWebhookModalOpen(true); }}><Plus size={16} className="mr-2" /> Add Webhook</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
            </div>

            <PaymentProviderModal isOpen={isProviderModalOpen} onClose={() => { setIsProviderModalOpen(false); setEditingProvider(null); }} onSave={handleSaveProvider} initialData={editingProvider} />
            <MobileMoneyModal isOpen={isMobileModalOpen} onClose={() => setIsMobileModalOpen(false)} onSave={handleSaveMobileMoney} providers={providerOptions} />
            <WebhookModal isOpen={isWebhookModalOpen} onClose={() => { setIsWebhookModalOpen(false); setEditingWebhook(null); }} onSave={handleSaveWebhook} initialData={editingWebhook} />
            <LimitModal isOpen={isLimitModalOpen} onClose={() => { setIsLimitModalOpen(false); setEditingLimit(null); }} onSave={handleSaveLimit} initialData={editingLimit} />

        </AdminLayout>
    )
}
