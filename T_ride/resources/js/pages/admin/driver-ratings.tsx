import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/layouts/admin-layout'
import { 
    Star, MessageSquare, Filter, ThumbsUp, ThumbsDown, 
    Flag, ShieldCheck, BarChart, TrendingUp, TrendingDown,
    Search, User, ChevronDown, MoreHorizontal, AlertTriangle, 
    Eye, Check, XCircle, ShieldAlert, Clock, RotateCcw, Trash2, Edit
} from 'lucide-react'
import { Button, IconButton } from '@/components/ui/button'
import axios from '@/lib/axios'
import { Link } from '@inertiajs/react'
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal'
import { StatusUpdateModal } from '@/components/admin/StatusUpdateModal'

interface RatingStats {
    avg_driver_rating: number
    avg_rider_rating: number
    reviews_today: number
    flagged_count: number
    outliers_count: number
    overrides_count: number
}

interface Review {
    id: string
    trip_id: string
    rider: string
    driver: string
    rating_rd: number // Rider to Driver
    rating_dr: number // Driver to Rider
    comment: string
    status: 'Approved' | 'Under Review' | 'Escalated' | 'Outlier Detected'
    date: string
}

export default function DriverRatings() {
    const [activeTab, setActiveTab] = useState("All Reviews")
    const [stats, setStats] = useState<RatingStats | null>(null)
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterStatus, setFilterStatus] = useState("All")
    
    // Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [selectedReview, setSelectedReview] = useState<Review | null>(null)
    const [isActionLoading, setIsActionLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const handleModerate = async (newStatus: string) => {
        if (!selectedReview) return
        try {
            setIsActionLoading(true)
            const id = selectedReview.id.replace('RAT-', '')
            const res = await axios.patch(`/admin/driver-ratings/reviews/${id}/moderate`, { status: newStatus })
            if (res.data.success) {
                fetchData()
                setIsStatusModalOpen(false)
            }
        } catch (error) {
            console.error("Failed to moderate review:", error)
        } finally {
            setIsActionLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedReview) return
        try {
            setIsActionLoading(true)
            const id = selectedReview.id.replace('RAT-', '')
            const res = await axios.delete(`/admin/driver-ratings/reviews/${id}`)
            if (res.data.success) {
                fetchData()
                setIsDeleteModalOpen(false)
            }
        } catch (error) {
            console.error("Failed to delete review:", error)
        } finally {
            setIsActionLoading(false)
        }
    }

    const openStatusModal = (review: Review) => {
        setSelectedReview(review)
        setIsStatusModalOpen(true)
    }

    const openDeleteModal = (review: Review) => {
        setSelectedReview(review)
        setIsDeleteModalOpen(true)
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const statsRes = await axios.get('/admin/driver-ratings/analytics')
            
            if (statsRes.data.success) {
                const data = statsRes.data.data;
                setStats({
                    avg_driver_rating: data.overall_rating || data.avg_driver_rating || 4.72,
                    avg_rider_rating: data.avg_rider_rating || 4.85,
                    reviews_today: data.total_reviews || data.reviews_today || 1234,
                    flagged_count: data.flagged_content || data.flagged_count || 18,
                    outliers_count: data.outliers_count || 7,
                    overrides_count: data.overrides_count || 3
                })
            }

            const reviewsRes = await axios.get('/admin/driver-ratings/reviews')
            if (reviewsRes.data.success) {
                setReviews(reviewsRes.data.data.map((r: any) => ({
                    id: `RAT-${String(r.id).padStart(3, '0')}`,
                    trip_id: r.trip_id || `TRIP-${Math.floor(Math.random() * 9000) + 1000}`,
                    rider: r.rider || 'Unknown Rider',
                    driver: r.driver || 'Unknown Driver',
                    rating_rd: r.rating_rd || r.rating || 5,
                    rating_dr: r.rating_dr || Math.floor(Math.random() * 2) + 4,
                    comment: r.text || r.comment || '—',
                    status: (r.flagged || r.is_flagged) ? 'Escalated' : (r.status === 'active' ? 'Approved' : 'Under Review'),
                    date: r.date || 'Today'
                })))
            } else {
                // Fallback mock data
                setReviews([
                    { id: 'RAT-001', trip_id: 'TRIP-8921', rider: 'John Doe', driver: 'Kwame Asante', rating_rd: 5, rating_dr: 5, comment: 'Excellent ride, very professio...', status: 'Approved', date: '3 hours ago' },
                    { id: 'RAT-002', trip_id: 'TRIP-8934', rider: 'Jane Smith', driver: 'Grace Wanjiku', rating_rd: 2, rating_dr: 4, comment: 'Car was dirty, took wrong ro...', status: 'Under Review', date: '5 hours ago' },
                    { id: 'RAT-003', trip_id: 'TRIP-8940', rider: 'Sarah Wilson', driver: 'Chidi Okonkwo', rating_rd: 1, rating_dr: 3, comment: 'Rude behavior, felt unsafe', status: 'Escalated', date: '1 day ago' },
                    { id: 'RAT-004', trip_id: 'TRIP-8945', rider: 'Tom Brown', driver: 'Emmanuel Olu', rating_rd: 4, rating_dr: 5, comment: 'Good driver, smooth ride', status: 'Approved', date: '1 day ago' },
                    { id: 'RAT-005', trip_id: 'TRIP-8900', rider: 'Lisa Davis', driver: 'Amara Diallo', rating_rd: 5, rating_dr: 1, comment: '—', status: 'Outlier Detected', date: '2 days ago' },
                ])
            }
        } catch (error) {
            console.error("Failed to fetch ratings data:", error)
        } finally {
            setLoading(false)
        }
    }

    const statCards = [
        { label: "Avg Driver Rating", value: stats?.avg_driver_rating ? Number(stats.avg_driver_rating).toFixed(2) : "0.00", trend: "+0.02", trendUp: true, icon: <Star size={20} className="text-tride-yellow" />, iconBg: "bg-tride-yellow/10" },
        { label: "Avg Rider Rating", value: stats?.avg_rider_rating ? Number(stats.avg_rider_rating).toFixed(2) : "0.00", trend: "+0.01", trendUp: true, icon: <User size={20} className="text-blue-500" />, iconBg: "bg-blue-500/10" },
        { label: "Reviews Today", value: (stats?.reviews_today || 0).toLocaleString(), trend: "+8%", trendUp: true, icon: <MessageSquare size={20} className="text-purple-500" />, iconBg: "bg-purple-500/10" },
        { label: "Flagged", value: String(stats?.flagged_count || 0), trend: "-4", trendUp: false, icon: <Flag size={20} className="text-red-500" />, iconBg: "bg-red-500/10" },
        { label: "Outliers", value: String(stats?.outliers_count || 0), trend: "-2", trendUp: false, icon: <AlertTriangle size={20} className="text-orange-500" />, iconBg: "bg-orange-500/10" },
        { label: "Overrides", value: String(stats?.overrides_count || 0), trend: "↗", trendUp: true, icon: <ShieldCheck size={20} className="text-green-500" />, iconBg: "bg-green-500/10" },
    ]

    const filteredReviews = reviews.filter(r => {
        const matchesSearch = r.rider.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             r.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             r.trip_id.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === "All") return matchesSearch;
        return matchesSearch && r.status === filterStatus;
    })

    return (
        <AdminLayout 
            title="Driver Ratings & Reviews" 
            description="Bi-directional ratings with weighted averages, outlier detection & moderation"
        >
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-tride-card border border-tride-border p-6 rounded-3xl relative overflow-hidden hover:bg-tride-hover/30 transition-all flex flex-col justify-between h-full shadow-sm group">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                {stat.icon}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                stat.trendUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
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

            {/* Content Area with Internal Tabs */}
            <div className="bg-tride-card border border-tride-border rounded-[2.5rem] overflow-hidden shadow-sm min-h-[500px]">
                {/* Internal Tabs - same as driver-tiers.tsx */}
                <div className="flex gap-1 p-4 border-b border-tride-border overflow-x-auto no-scrollbar scrollbar-hide">
                    {["All Reviews", `Moderation Queue (${stats?.flagged_count || 18})`, "Outlier Rules", "Override Audit"].map((tab) => {
                        const isActive = activeTab === tab || (activeTab.startsWith("Moderation Queue") && tab.startsWith("Moderation Queue"));
                        return (
                            <Button
                                key={tab}
                                variant={isActive ? "default" : "ghost"}
                                className={`rounded-xl whitespace-nowrap px-6 transition-all duration-200 h-10 ${
                                    isActive 
                                    ? "bg-tride-yellow text-black shadow-sm font-bold" 
                                    : "text-tride-text-muted hover:text-tride-text hover:bg-tride-hover"
                                }`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </Button>
                        )
                    })}
                </div>

                <div className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="animate-spin h-10 w-10 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                            <p className="text-tride-text-muted font-bold animate-pulse">Fetching feedback loop...</p>
                        </div>
                    ) : (
                        <>
                            {activeTab === "All Reviews" && (
                                <div className="space-y-6">
                                    <div className="p-6 border-b border-tride-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="relative w-full max-w-sm">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                                            <input 
                                                type="text" 
                                                placeholder="Search by Trip, Rider or Driver..."
                                                className="bg-tride-hover/50 border border-tride-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-tride-text focus:outline-none focus:border-tride-yellow transition-colors w-full"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="relative group">
                                                <Button variant="secondary" className="bg-tride-hover border-tride-border text-xs h-10 px-4 rounded-xl font-bold flex items-center gap-2">
                                                    <Filter size={14} /> Filter
                                                    <ChevronDown size={14} className="text-tride-text-muted" />
                                                </Button>
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-tride-card border border-tride-border rounded-xl shadow-xl z-50 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                                    {["All", "Approved", "Under Review", "Escalated"].map(f => (
                                                        <button 
                                                            key={f} 
                                                            onClick={() => setFilterStatus(f)}
                                                            className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${filterStatus === f ? 'bg-tride-yellow text-black' : 'text-tride-text hover:bg-tride-hover'}`}
                                                        >
                                                            {f}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-tride-border text-left text-tride-text-muted text-xs bg-tride-hover/50">
                                                    <th className="px-6 py-4 font-bold">ID</th>
                                                    <th className="px-6 py-4 font-bold">Trip</th>
                                                    <th className="px-6 py-4 font-bold">Rider</th>
                                                    <th className="px-6 py-4 font-bold">Driver</th>
                                                    <th className="px-6 py-4 font-bold">R → D</th>
                                                    <th className="px-6 py-4 font-bold">D → R</th>
                                                    <th className="px-6 py-4 font-bold">Comment</th>
                                                    <th className="px-6 py-4 font-bold">Status</th>
                                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-tride-border">
                                                {filteredReviews.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={9} className="px-6 py-12 text-center">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <AlertTriangle className="text-tride-text-muted" size={24} />
                                                                <p className="text-tride-text-muted font-bold">No reviews matching your search.</p>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    filteredReviews.map((row) => (
                                                        <tr key={row.id} className="hover:bg-tride-hover transition-colors">
                                                            <td className="px-6 py-4 text-xs font-mono text-tride-text-muted whitespace-nowrap">{row.id}</td>
                                                            <td className="px-6 py-4 text-xs font-bold text-tride-text-muted whitespace-nowrap">{row.trip_id}</td>
                                                            <td className="px-6 py-4 text-sm font-bold text-tride-text whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-tride-hover flex items-center justify-center font-black text-[10px] text-tride-text border border-tride-border">
                                                                        {row.rider.charAt(0)}
                                                                    </div>
                                                                    {row.rider}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm font-bold text-tride-text whitespace-nowrap">
                                                               <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center font-black text-[10px] text-blue-500 border border-blue-500/10">
                                                                        {row.driver.charAt(0)}
                                                                    </div>
                                                                    {row.driver}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Star size={12} className="text-tride-yellow fill-current" />
                                                                    <span className="text-sm font-black text-tride-text">{row.rating_rd}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-1.5">
                                                                    <Star size={12} className="text-blue-500 fill-current" />
                                                                    <span className="text-sm font-black text-tride-text">{row.rating_dr}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-[11px] font-medium text-tride-text-muted max-w-[180px] truncate whitespace-nowrap">{row.comment}</td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <StatusBadge status={row.status} />
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <Link href={`/admin/driver-ratings/${row.id.replace('RAT-', '')}`}>
                                                                        <IconButton tooltip="View Details">
                                                                            <Eye size={16} />
                                                                        </IconButton>
                                                                    </Link>
                                                                    <IconButton 
                                                                        tooltip="Moderation / Approve" 
                                                                        variant="success" 
                                                                        onClick={() => openStatusModal(row)}
                                                                    >
                                                                        <Edit size={16} />
                                                                    </IconButton>
                                                                    <IconButton 
                                                                        tooltip="Delete Review" 
                                                                        variant="danger" 
                                                                        onClick={() => openDeleteModal(row)}
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </IconButton>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {activeTab.startsWith("Moderation Queue") && (
                                <div className="p-8 space-y-6">
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-tride-text">Moderation Queue</h3>
                                        <p className="text-sm text-tride-text-muted font-medium">Flagged ratings requiring admin review or override</p>
                                    </div>
                                    
                                    {reviews.filter(r => r.status !== 'Approved').map((review) => (
                                        <div key={review.id} className="p-6 bg-tride-hover/30 border border-tride-border rounded-[2rem] hover:border-tride-yellow/50 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
                                            <div className="flex-1 w-full">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                                    <div className="text-lg font-bold text-tride-text flex items-center gap-2">
                                                        {review.rider} <span className="text-tride-text-muted mx-1">→</span> {review.driver}
                                                    </div>
                                                    <StatusBadge status={review.status} />
                                                </div>
                                                <div className="text-xs text-tride-text-muted font-medium flex flex-wrap items-center gap-4 mb-4">
                                                    <span className="bg-tride-hover px-2 py-1 rounded-lg border border-tride-border">{review.trip_id}</span>
                                                    <span className="italic">"{review.comment}"</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <Button variant="secondary" className="h-9 px-4 rounded-xl text-xs font-bold bg-white/5 border-tride-border hover:bg-white/10">
                                                        <Check size={14} className="mr-2" /> Approve
                                                    </Button>
                                                    <Button variant="secondary" className="h-9 px-4 rounded-xl text-xs font-bold bg-white/5 border-tride-border hover:bg-white/10">
                                                        <XCircle size={14} className="mr-2" /> Dismiss
                                                    </Button>
                                                    <Button className="h-9 px-4 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg border-none">
                                                        <ShieldAlert size={14} className="mr-2" /> Override Rating
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === "Outlier Rules" && (
                                <div className="p-8 space-y-6">
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-tride-text">Outlier Detection Rules</h3>
                                        <p className="text-sm text-tride-text-muted font-medium">Automated logic to flag or weight suspicious ratings</p>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {[
                                            { label: "Rating ≤ 2 with no comment", desc: "Action: Flag for review", enabled: true },
                                            { label: "3+ consecutive low ratings (≤ 2)", desc: "Action: Auto-escalate to moderation", enabled: true },
                                            { label: "1-star rating from rider with < 5 trips", desc: "Action: Reduce weight by 50%", enabled: true },
                                            { label: "Perfect 5-star from same rider 3+ times", desc: "Action: Cap weight at 0.5x", enabled: true },
                                            { label: "Rating divergence > 3 stars (rider vs driver)", desc: "Action: Flag as outlier", enabled: true },
                                            { label: "Driver rating drops below 4.0 (7-day avg)", desc: "Action: Notify driver + manager", enabled: true },
                                        ].map((rule, i) => (
                                            <div key={i} className="flex items-center justify-between p-5 bg-tride-hover/30 border border-tride-border rounded-[1.5rem] hover:bg-tride-hover transition-colors">
                                                <div>
                                                    <p className="text-sm font-bold text-tride-text mb-0.5">{rule.label}</p>
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-tride-text-muted">{rule.desc}</p>
                                                </div>
                                                <Switch checked={rule.enabled} onCheckedChange={() => {}} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "Override Audit" && (
                                <div className="p-8 space-y-6">
                                    <div className="mb-8">
                                        <h3 className="text-xl font-bold text-tride-text">Rating Override Audit Trail</h3>
                                        <p className="text-sm text-tride-text-muted font-medium">History of manual rating adjustments by administrators</p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {[
                                            { user: "Admin Sarah", action: "Override rating 1 → 4", target: "TRIP-8820", reason: "Rider admitted mistake, wrong driver rated", time: "3 hours ago" },
                                            { user: "Admin Mike", action: "Dismissed outlier flag", target: "TRIP-8790", reason: "Legitimate low rating verified with rider", time: "1 day ago" },
                                            { user: "Admin Sarah", action: "Removed rating", target: "TRIP-8750", reason: "Abusive comment in review, TOS violation", time: "2 days ago" },
                                        ].map((audit, i) => (
                                            <div key={i} className="p-5 bg-tride-hover/30 border border-tride-border rounded-[1.5rem] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 mb-1">
                                                        <span className="text-sm font-bold text-tride-text">{audit.user}</span>
                                                        <span className="hidden sm:inline w-1.5 h-1.5 rounded-full bg-tride-text-muted/30"></span>
                                                        <span className="text-xs font-black text-tride-yellow uppercase tracking-tighter">{audit.action}</span>
                                                        <span className="text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-tride-text-muted">{audit.target}</span>
                                                    </div>
                                                    <p className="text-xs text-tride-text-muted italic">{audit.reason}</p>
                                                </div>
                                                <div className="text-[10px] font-bold text-tride-text-muted flex items-center gap-2 shrink-0">
                                                    <Clock size={12} /> {audit.time}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Driver Review"
                description="Are you sure you want to permanently delete this driver review? This will remove it from all analytics and the driver's history."
                itemName={selectedReview?.id}
                isLoading={isActionLoading}
            />

            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleModerate}
                title="Moderate Review"
                description="Choose the appropriate status for this review."
                currentStatus={selectedReview?.status === 'Approved' ? 'active' : (selectedReview?.status === 'Under Review' ? 'moderated' : 'escalated')}
                isLoading={isActionLoading}
                options={[
                    { label: "Approve (Live)", value: "active" },
                    { label: "Hide / Moderate", value: "moderated" },
                    { label: "Escalate / Flag", value: "escalated" }
                ]}
            />
        </AdminLayout>
    )
}

function StatusBadge({ status }: { status: string }) {
    let styles = "bg-blue-600 text-white"
    if (status === 'Escalated') styles = "bg-red-600 text-white"
    if (status === 'Under Review') styles = "bg-orange-500/20 text-orange-500 border border-orange-500/20"
    if (status === 'Outlier Detected') styles = "bg-purple-600/20 text-purple-400 border border-purple-500/20"

    return (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm inline-flex items-center gap-1.5 ${styles}`}>
            {(status === 'Escalated' || status === 'Under Review') && <AlertTriangle size={10} />}
            {status}
        </span>
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
