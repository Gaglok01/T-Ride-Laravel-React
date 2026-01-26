import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Tag, Ticket, DollarSign, TrendingDown, Plus, Edit, Trash2, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import axios from "@/lib/axios"
import { PromotionModal } from "@/components/admin/PromotionModal"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"

interface Promotion {
    id: number
    code: string
    type: "percentage" | "fixed"
    value: number
    current_uses: number
    max_uses: number
    valid_until: string
    status: "active" | "paused" | "expired"
    total_discount_given: number
}

interface Stats {
    active_promos: number
    total_redemptions: number
    total_discount: number
    avg_discount: number
    trends: {
        active_trend: string
        redemption_trend: string
        discount_trend: string
        avg_trend: string
    }
}

interface Pagination {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export default function PromotionsPage() {
    const [promos, setPromos] = useState<Promotion[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
    
    // Delete States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [promoToDelete, setPromoToDelete] = useState<Promotion | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    useEffect(() => {
        fetchPromotions()
    }, [currentPage, searchTerm])

    const fetchStats = async () => {
        try {
            const res = await axios.get('/admin/promotions/stats')
            if (res.data.status) {
                setStats(res.data.data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        }
    }

    const fetchPromotions = async () => {
        setLoading(true)
        try {
            const params: any = { page: currentPage }
            if (searchTerm) params.search = searchTerm

            const res = await axios.get('/admin/promotions', { params })
            
            if (res.data.status) {
                setPromos(res.data.data.data)
                setPagination({
                    current_page: res.data.data.current_page,
                    last_page: res.data.data.last_page,
                    per_page: res.data.data.per_page,
                    total: res.data.data.total
                })
            }
        } catch (error) {
            console.error("Error fetching promotions:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (data: any) => {
        try {
            if (editingPromo) {
                await axios.put(`/admin/promotions/${editingPromo.id}`, data)
            } else {
                await axios.post('/admin/promotions', data)
            }
            fetchPromotions()
            fetchStats()
            setIsModalOpen(false)
            setEditingPromo(null)
        } catch (error) {
            console.error("Error saving promotion:", error)
            throw error 
        }
    }

    const handleDelete = async () => {
        if (!promoToDelete) return
        setIsDeleting(true)
        try {
            await axios.delete(`/admin/promotions/${promoToDelete.id}`)
            fetchPromotions()
            fetchStats()
            setIsDeleteModalOpen(false)
            setPromoToDelete(null)
        } catch (error) {
            console.error("Error deleting promotion:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleToggleStatus = async (promo: Promotion) => {
        try {
           // Optimistic update
           const newStatus = promo.status === 'active' ? 'paused' : 'active'
           setPromos(promos.map(p => p.id === promo.id ? { ...p, status: newStatus as any } : p))
           
           await axios.patch(`/admin/promotions/${promo.id}/status`)
           fetchStats() // Status change affects active count
        } catch (error) {
            console.error("Error toggling status:", error)
            fetchPromotions() // Revert on error
        }
    }

    const openCreateModal = () => {
        setEditingPromo(null)
        setIsModalOpen(true)
    }

    const openEditModal = (promo: Promotion) => {
        setEditingPromo(promo)
        setIsModalOpen(true)
    }

    const confirmDelete = (promo: Promotion) => {
        setPromoToDelete(promo)
        setIsDeleteModalOpen(true)
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setCurrentPage(1)
    }

    const handleRefresh = () => {
        fetchStats()
        fetchPromotions()
    }

    return (
        <AdminLayout
            title="Promotions & Vouchers"
            description="Manage discount codes and campaigns"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                     <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search code..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            className="bg-tride-card border border-tride-border rounded-full pl-10 pr-4 py-2 text-sm text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleRefresh} variant="secondary" className="flex-1 sm:flex-none justify-center">
                            <RefreshCw size={18} className="mr-2" />
                            Refresh
                        </Button>
                        <Button onClick={openCreateModal} className="flex-1 sm:flex-none justify-center">
                            <Plus size={18} className="mr-2" />
                            Create Promo
                        </Button>
                    </div>
                </div>
            }
        >
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard 
                    label="Active Promos" 
                    value={stats?.active_promos.toLocaleString() || "0"} 
                    trend={stats?.trends?.active_trend || "0"} 
                    trendUp={!stats?.trends?.active_trend.startsWith('-')} 
                    icon={<Tag size={24} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Total Redemptions" 
                    value={stats?.total_redemptions.toLocaleString() || "0"} 
                    trend={stats?.trends?.redemption_trend || "0"} 
                    trendUp={!stats?.trends?.redemption_trend.startsWith('-')} 
                    icon={<Ticket size={24} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Total Discount" 
                    value={`$${stats?.total_discount.toLocaleString() || "0"}`} 
                    trend={stats?.trends?.discount_trend || "0"} 
                    trendUp={!stats?.trends?.discount_trend.startsWith('-')} 
                    icon={<DollarSign size={24} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Avg Discount" 
                    value={`$${stats?.avg_discount.toLocaleString() || "0"}`} 
                    trend={stats?.trends?.avg_trend || "0"} 
                    trendUp={!stats?.trends?.avg_trend.startsWith('-')} 
                    icon={<TrendingDown size={24} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
            </div>

            {/* Main Content Area */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">Code</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Value</th>
                                <th className="px-6 py-4 font-medium">Uses</th>
                                <th className="px-6 py-4 font-medium">Limit</th>
                                <th className="px-6 py-4 font-medium">Valid Until</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-tride-text-muted">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-4 w-4 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                                            Loading promotions...
                                        </div>
                                    </td>
                                </tr>
                            ) : promos.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-tride-text-muted">No promotions found.</td>
                                </tr>
                            ) : (
                                promos.map((promo) => (
                                    <PromoRow 
                                        key={promo.id} 
                                        promo={promo} 
                                        onEdit={() => openEditModal(promo)}
                                        onDelete={() => confirmDelete(promo)}
                                        onToggleStatus={() => handleToggleStatus(promo)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                 {pagination && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-tride-border flex items-center justify-between">
                        <div className="text-sm text-tride-text-muted">
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} promotions
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={pagination.current_page === 1}
                                className="disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Previous
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                                disabled={pagination.current_page === pagination.last_page}
                                className="disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <PromotionModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingPromo}
            />

            <DeleteConfirmationModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Promotion"
                description="Are you sure you want to permanently delete this promotion code? This action cannot be undone."
                itemName={promoToDelete?.code}
                isLoading={isDeleting}
            />
        </AdminLayout>
    )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-sm font-medium mb-1">{label}</p>
                <div className="text-3xl font-bold mb-2 text-tride-text">{value}</div>
                <div className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-lg">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}

function formatDate(dateString: string): string {
    if (!dateString) return "-"
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
}

function PromoRow({ promo, onEdit, onDelete, onToggleStatus }: { promo: Promotion, onEdit: () => void, onDelete: () => void, onToggleStatus: () => void }) {
    const isPercentage = promo.type === "percentage"
    const isExpired = promo.status === "expired"
    
    return (
        <tr className="hover:bg-tride-hover transition-colors group">
            <td className="px-6 py-4 font-medium font-mono text-tride-text tracking-wide">{promo.code}</td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-tride-border text-xs font-medium text-tride-text-muted capitalize bg-tride-card">
                    {promo.type}
                </span>
            </td>
            <td className="px-6 py-4 font-bold text-tride-text">
                {isPercentage ? `${promo.value}%` : `$${promo.value}`}
            </td>
            <td className="px-6 py-4 text-tride-text-muted">{promo.current_uses?.toLocaleString() || 0}</td>
            <td className="px-6 py-4 text-tride-text-muted">{promo.max_uses.toLocaleString()}</td>
            <td className="px-6 py-4 text-tride-text-muted">
                {formatDate(promo.valid_until)}
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    promo.status === 'active' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                        : isExpired 
                            ? 'bg-red-500/20 text-red-500 border border-red-500/20'
                            : 'bg-tride-hover text-tride-text-muted border border-tride-border'
                }`}>
                    {promo.status}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 text-tride-text-muted">
                     {!isExpired && (
                        <IconButton 
                            tooltip={promo.status === 'active' ? 'Pause' : 'Activate'} 
                            onClick={onToggleStatus}
                            className={promo.status === 'active' ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}
                        >
                            {promo.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                        </IconButton>
                    )}
                    <IconButton tooltip="Edit" onClick={onEdit}>
                        <Edit size={16} />
                    </IconButton>
                    <IconButton tooltip="Delete" variant="danger" onClick={onDelete}>
                        <Trash2 size={16} />
                    </IconButton>
                </div>
            </td>
        </tr>
    )
}
