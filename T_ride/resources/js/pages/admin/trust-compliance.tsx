import { useState, useEffect, useCallback } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, FileText, CheckCircle, AlertTriangle, ShieldAlert, ShieldX, Eye, Edit, Clock, Settings, XCircle, Check, Loader2 } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import axios from "@/lib/axios"
import { Link } from "@inertiajs/react"
import { DriverModal } from "@/components/admin/DriverModal"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"

export default function TrustCompliancePage() {
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("Driver Compliance")
    const [loading, setLoading] = useState(true)
    
    const [stats, setStats] = useState<any>(null)
    const [drivers, setDrivers] = useState<any[]>([])
    const [documentQueue, setDocumentQueue] = useState<any[]>([])
    const [cityRules, setCityRules] = useState<any[]>([])
    const [enforcementRules, setEnforcementRules] = useState<any[]>([])

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingDriver, setEditingDriver] = useState<any>(null)
    const [types, setTypes] = useState<any[]>([])

    const fetchTypes = async () => {
        try {
            const res = await axios.get('/admin/types')
            if (res.data.success) setTypes(res.data.data)
        } catch (error) {
            console.error("Error fetching types:", error)
        }
    }

    useEffect(() => {
        fetchTypes()
    }, [])

    const handleEditCompliance = (driver: any) => {
        setEditingDriver(driver)
        setIsModalOpen(true)
    }

    const handleSaveDriver = async (formData: FormData) => {
        try {
            if (editingDriver) {
                const driverId = editingDriver.db_id || editingDriver.id;
                await axios.post(`/admin/drivers/${driverId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
                fetchAllData()
                setIsModalOpen(false)
                setEditingDriver(null)
            }
        } catch (error) {
            console.error("Failed to save driver compliance:", error)
            throw error
        }
    }

    const fetchAllData = useCallback(async () => {
        setLoading(true)
        try {
            const [statsRes, driversRes, queueRes, cityRes, rulesRes] = await Promise.all([
                axios.get('/admin/trust-compliance/stats'),
                axios.get('/admin/trust-compliance/drivers'),
                axios.get('/admin/trust-compliance/document-queue'),
                axios.get('/admin/trust-compliance/city-rules'),
                axios.get('/admin/trust-compliance/enforcement-rules')
            ])
            
            if (statsRes.data.status) setStats(statsRes.data.data)
            if (driversRes.data.status) setDrivers(driversRes.data.data)
            if (queueRes.data.status) setDocumentQueue(queueRes.data.data)
            if (cityRes.data.status) setCityRules(cityRes.data.data)
            if (rulesRes.data.status) setEnforcementRules(rulesRes.data.data)
        } catch (error) {
            console.error("Error fetching compliance data:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAllData()
    }, [fetchAllData])

    const toggleRule = async (id: number) => {
        try {
            const res = await axios.patch(`/admin/trust-compliance/enforcement-rules/${id}/toggle`)
            if (res.data.status) {
                setEnforcementRules(rules => rules.map(r => r.id === id ? res.data.data : r))
            }
        } catch (error) {
            console.error("Error toggling rule:", error)
        }
    }

    const processDocument = async (id: number, status: string) => {
        try {
            const res = await axios.post(`/admin/trust-compliance/process-document/${id}`, { status })
            if (res.data.status) {
                setDocumentQueue(prev => prev.filter(item => item.id !== id))
                // Refresh stats and drivers as they might have changed
                fetchAllData()
            }
        } catch (error) {
            console.error("Error processing document:", error)
        }
    }

    const statCards = [
        { label: "Compliant", value: stats?.compliant ?? "0", trend: "+18%", trendUp: true, icon: <CheckCircle size={20} className="text-blue-500" />, iconBg: "bg-blue-500/10" },
        { label: "Warning", value: stats?.warning ?? "0", trend: "-5%", trendUp: false, icon: <AlertTriangle size={20} className="text-yellow-500" />, iconBg: "bg-yellow-500/10" },
        { label: "Non-Compliant", value: stats?.non_compliant ?? "0", trend: "-3%", trendUp: false, icon: <ShieldX size={20} className="text-red-500" />, iconBg: "bg-red-500/10" },
        { label: "Restricted", value: stats?.restricted ?? "0", trend: "-2%", trendUp: false, icon: <ShieldAlert size={20} className="text-red-900" />, iconBg: "bg-red-900/10" },
        { label: "Expiring (7d)", value: stats?.expiring_7d ?? "0", trend: "Now", trendUp: true, icon: <Clock size={20} className="text-orange-500" />, iconBg: "bg-orange-500/10" },
        { label: "Pending Review", value: stats?.pending_review ?? "0", trend: "-4%", trendUp: false, icon: <FileText size={20} className="text-purple-500" />, iconBg: "bg-purple-500/10" },
    ]

    const filteredDrivers = drivers.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout
            title="Trust & Compliance Layer"
            description="Document verification · expiration tracking · city-specific rules · dispatch restriction"
            actions={
                <Button className="flex items-center gap-2 bg-tride-yellow text-black hover:bg-tride-yellow/90 font-bold border-none shadow-sm h-11 px-6 rounded-xl">
                    <Settings size={18} />
                    Compliance Config
                </Button>
            }
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-tride-card border border-tride-border p-6 rounded-3xl relative overflow-hidden hover:bg-tride-hover/30 transition-all flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                stat.trend === "Now"
                                ? "bg-blue-500/10 text-blue-500"
                                : stat.trendUp
                                    ? "bg-green-500/10 text-green-500"
                                    : "bg-red-500/10 text-red-500"
                            }`}>
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

            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm min-h-[400px]">
                
                {/* Tabs */}
                <div className="flex gap-1 p-4 border-b border-tride-border overflow-x-auto scrollbar-hide">
                    {[
                        "Driver Compliance", 
                        `Document Queue (${documentQueue.length})`, 
                        "City Rules", 
                        "Enforcement"
                    ].map((tab) => {
                        const tabKey = tab.startsWith("Document Queue") ? "Document Queue" : tab;
                        const isActive = activeTab === tabKey || (activeTab === "Document Queue" && tab.startsWith("Document Queue"));
                        
                        return (
                            <Button
                                key={tab}
                                variant={isActive ? "default" : "ghost"}
                                onClick={() => setActiveTab(tabKey)}
                                className={isActive ? "bg-tride-yellow text-black" : "text-tride-text-muted hover:text-tride-text"}
                            >
                                {tab}
                            </Button>
                        )
                    })}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-tride-yellow animate-spin" />
                        <p className="text-tride-text-muted animate-pulse">Loading compliance data...</p>
                    </div>
                ) : (
                    <>
                        {/* Tab Content */}
                        {activeTab === "Driver Compliance" && (
                            <div className="overflow-x-auto">
                                <div className="p-4 border-b border-tride-border">
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Search driver by name or ID..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="bg-tride-hover/50 border border-tride-border rounded-xl pl-10 pr-4 py-2 text-sm text-tride-text focus:outline-none focus:border-tride-yellow transition-colors w-full"
                                        />
                                    </div>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                            <th className="px-6 py-4 font-medium">ID</th>
                                            <th className="px-6 py-4 font-medium">Driver</th>
                                            <th className="px-6 py-4 font-medium">City</th>
                                            <th className="px-6 py-4 font-medium">License</th>
                                            <th className="px-6 py-4 font-medium">Insurance</th>
                                            <th className="px-6 py-4 font-medium">Background</th>
                                            <th className="px-6 py-4 font-medium">Vehicle</th>
                                            <th className="px-6 py-4 font-medium">Expiring</th>
                                            <th className="px-6 py-4 font-medium">Dispatch</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-tride-border">
                                        {filteredDrivers.map((row, i) => (
                                            <tr key={i} className={`hover:bg-tride-hover transition-colors group ${
                                                row.status === "Non-Compliant" ? "bg-red-500/5" :
                                                row.status === "Warning" ? "bg-yellow-500/5" : ""
                                            }`}>
                                                <td className="px-6 py-4 text-sm font-mono text-tride-text-muted">{row.id}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-tride-text">{row.name}</td>
                                                <td className="px-6 py-4 text-sm text-tride-text-muted">{row.city}</td>
                                                
                                                <td className="px-6 py-4"><StatusBadge status={row.license} /></td>
                                                <td className="px-6 py-4"><StatusBadge status={row.insurance} /></td>
                                                <td className="px-6 py-4"><StatusBadge status={row.background} /></td>
                                                <td className="px-6 py-4"><StatusBadge status={row.vehicle} /></td>
                                                
                                                <td className={`px-6 py-4 text-sm ${row.expiring === "Overdue" ? "text-red-500 font-bold" : "text-tride-text-muted"}`}>
                                                    {row.expiring}
                                                </td>
                                                
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        row.dispatch === 'Active' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/20' : 
                                                        'bg-red-500/20 text-red-500 border border-red-500/20'
                                                    }`}>
                                                        {row.dispatch}
                                                    </span>
                                                </td>
                                                
                                                 <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap inline-flex items-center justify-center min-w-[124px] ${
                                                            row.status === 'Compliant' ? 'bg-blue-600 text-white shadow-sm' : 
                                                            row.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
                                                            'bg-red-600 text-white shadow-sm'
                                                        }`}>
                                                            {row.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link href={`/admin/drivers/${row.db_id || row.id}`}>
                                                            <IconButton tooltip="View Profile">
                                                                <Eye size={16} />
                                                            </IconButton>
                                                        </Link>
                                                        <Button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.post(`/admin/trust-compliance/approve-driver/${row.db_id || row.id}`)
                                                                    alert('Driver approved successfully')
                                                                    fetchAllData()
                                                                } catch (error) {
                                                                    alert('Approval failed. Check console.')
                                                                    console.error('Approval failed:', error)
                                                                }
                                                            }}
                                                            className="h-9 px-3 text-xs font-bold bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <Check size={14} className="mr-1.5" />
                                                            Approve
                                                        </Button>

                                                        <Button
                                                            onClick={async () => {
                                                                try {
                                                                    await axios.post(`/admin/trust-compliance/suspend-driver/${row.db_id || row.id}`)
                                                                    alert('Driver suspended successfully')
                                                                    fetchAllData()
                                                                } catch (error) {
                                                                    alert('Suspend failed. Check console.')
                                                                    console.error('Suspend failed:', error)
                                                                }
                                                            }}
                                                            className="h-9 px-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            <XCircle size={14} className="mr-1.5" />
                                                            Suspend
                                                        </Button>

                                                        <IconButton 
                                                            tooltip="Edit Compliance"
                                                            onClick={() => handleEditCompliance(row)}
                                                        >
                                                            <Edit size={16} />
                                                        </IconButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredDrivers.length === 0 && (
                                            <tr>
                                                <td colSpan={11} className="px-6 py-12 text-center text-tride-text-muted italic">
                                                    No drivers found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "Document Queue" && (
                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-tride-text">Document Verification Queue</h3>
                                </div>
                                <div className="space-y-3">
                                    {documentQueue.map((item) => (
                                        <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-tride-card border border-tride-border rounded-xl hover:bg-tride-hover/20 transition-all">
                                            <div className="mb-3 md:mb-0">
                                                <div className="text-base font-bold text-tride-text mb-0.5">{item.name}</div>
                                                <div className="text-xs text-tride-text-muted flex items-center gap-1.5 font-medium">
                                                    <span>{item.doc}</span>
                                                    <span className="text-gray-600 font-bold">·</span>
                                                    <span>{item.city}</span>
                                                    <span className="text-gray-600 font-bold">·</span>
                                                    <span>Submitted {item.submitted}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button variant="secondary" className="h-9 px-3 text-xs bg-tride-hover border-tride-border hover:bg-white/10">
                                                    <Eye size={14} className="mr-1.5" /> Review
                                                </Button>
                                                <Button 
                                                    onClick={() => processDocument(item.id, 'approved')}
                                                    className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                    style={{ backgroundColor: '#22c55e' }} // Dynamic green override as requested
                                                >
                                                    <Check size={14} className="mr-1.5" /> Approve
                                                </Button>
                                                <Button 
                                                    onClick={() => processDocument(item.id, 'rejected')}
                                                    className="h-9 px-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    <XCircle size={14} className="mr-1.5" /> Reject
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {documentQueue.length === 0 && (
                                        <div className="text-center py-12 bg-tride-hover/5 rounded-2xl border-2 border-dashed border-tride-border/50">
                                            <CheckCircle size={32} className="text-blue-500 mx-auto mb-3" />
                                            <h4 className="text-lg font-bold text-tride-text mb-1">Queue Empty</h4>
                                            <p className="text-xs text-tride-text-muted">No pending documents to review.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "City Rules" && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                            <th className="px-6 py-4 font-medium whitespace-nowrap">City</th>
                                            <th className="px-6 py-4 font-medium whitespace-nowrap">License Renewal</th>
                                            <th className="px-6 py-4 font-medium whitespace-nowrap">Insurance Req</th>
                                            <th className="px-6 py-4 font-medium whitespace-nowrap">Background Check</th>
                                            <th className="px-6 py-4 font-medium whitespace-nowrap">Inspection</th>
                                            <th className="px-6 py-4 font-medium whitespace-nowrap text-center">Min Age</th>
                                            <th className="px-6 py-4 font-medium whitespace-nowrap text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-tride-border/50">
                                        {cityRules.map((row, i) => (
                                            <tr key={i} className="hover:bg-tride-hover/30 transition-all group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-tride-yellow/10 flex items-center justify-center text-tride-yellow font-bold text-xs border border-tride-yellow/20">
                                                            {row.city.charAt(0)}
                                                        </div>
                                                        <span className="text-sm font-black text-tride-text group-hover:text-tride-yellow transition-colors">{row.city}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-tride-text-muted font-medium">{row.license}</td>
                                                <td className="px-6 py-5 text-sm text-tride-text-muted font-medium">
                                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/10">{row.insurance}</span>
                                                </td>
                                                <td className="px-6 py-5 text-sm text-tride-text-muted font-medium">{row.background}</td>
                                                <td className="px-6 py-5 text-sm text-tride-text-muted font-medium">{row.inspection}</td>
                                                <td className="px-6 py-5 text-sm text-tride-text-muted font-bold text-center">
                                                    <span className="px-2 py-1 bg-tride-hover rounded-lg">{row.age}</span>
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <IconButton tooltip="Edit City Rules" className="text-tride-text-muted hover:text-tride-yellow hover:bg-tride-yellow/10 transition-all">
                                                        <Settings size={18} />
                                                    </IconButton>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "Enforcement" && (
                            <div className="p-6">
                                <div className="mb-6">
                                    <h3 className="text-lg font-bold text-tride-text mb-0.5">Enforcement Rules</h3>
                                    <p className="text-xs text-tride-text-muted font-medium">Auto-restriction on non-compliance</p>
                                </div>
                                <div className="space-y-3">
                                    {enforcementRules.map((rule) => (
                                        <div key={rule.id} className="flex items-center justify-between p-4 bg-tride-card border border-tride-border rounded-xl">
                                            <span className="text-sm font-medium text-tride-text">{rule.label}</span>
                                            <Switch checked={rule.enabled} onCheckedChange={() => toggleRule(rule.id)} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <DriverModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveDriver}
                types={types}
                initialData={editingDriver}
            />
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
                    pointer-events-none block h-5 w-5 rounded-full bg-white shadow-xl ring-0 transition-transform duration-300
                    ${checked ? 'translate-x-5' : 'translate-x-0'}
                `}
            />
        </button>
    )
}

function StatusBadge({ status }: { status: string }) {
    let styles = "bg-tride-hover/50 text-tride-text-muted"
    if (status === "Valid" || status === "Cleared") styles = "bg-blue-500/10 text-blue-500 border-blue-500/20"
    if (status === "Expired") styles = "bg-red-500/10 text-red-500 border-red-500/20"
    if (status === "Expiring") styles = "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"

    return (
        <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${styles} uppercase tracking-wider`}>
            {status}
        </span>
    )
}
