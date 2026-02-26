import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, User, Star, MessageSquare, Clock, Check, XCircle, Flag, AlertTriangle } from "lucide-react"
import { Link, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"

interface DriverReview {
    id: number
    trip_id: string
    rider: { name: string; email: string; photo?: string } | null
    driver: { name: string; email: string; photo?: string } | null
    rating_rd: number
    rating_dr: number
    comment: string
    driver_comment?: string
    status: string
    flagged: boolean
    date: string
}

export default function ViewReview({ id }: { id: string }) {
    const [review, setReview] = useState<DriverReview | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchReview()
    }, [id])

    const fetchReview = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/admin/driver-ratings/reviews/${id}`)
            if (response.data.success) {
                setReview(reviewData(response.data.data))
            }
        } catch (error) {
            console.error("Failed to fetch review details:", error)
        } finally {
            setLoading(false)
        }
    }

    const reviewData = (data: any) => {
        return {
            ...data,
            rider: data.rider || { name: 'Unknown Rider', email: 'N/A' },
            driver: data.driver || { name: 'Unknown Driver', email: 'N/A' },
        }
    }

    const handleModerate = async (status: string) => {
        try {
            const res = await axios.patch(`/admin/driver-ratings/reviews/${id}/moderate`, { status })
            if (res.data.success) {
                fetchReview()
            }
        } catch (error) {
            console.error("Failed to moderate review:", error)
        }
    }

    if (loading) {
        return (
             <AdminLayout title="Review Details" description="Loading review information...">
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tride-yellow"></div>
                </div>
             </AdminLayout>
        )
    }

    if (!review) {
        return (
            <AdminLayout title="Review Not Found" description="The requested review could not be found.">
                 <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-tride-text">Review not found</h3>
                    <Link href="/admin/driver-ratings" className="mt-4 inline-block text-tride-yellow hover:underline">
                        Return to Ratings
                    </Link>
                </div>
            </AdminLayout>
        )
    }

    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/20'
            case 'escalated': return 'bg-red-500/20 text-red-400 border-red-500/20'
            case 'under review': return 'bg-orange-500/20 text-orange-400 border-orange-500/20'
            default: return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
        }
    }

    return (
        <AdminLayout
            title={`Review: ${review.trip_id}`}
            description="Detailed bidirectional rating analysis"
            actions={
                <div className="flex items-center gap-3">
                    <Link href="/admin/driver-ratings">
                        <Button variant="secondary">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to List
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Review Content */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Status & Ratings Pair */}
                    <div className="bg-tride-card border border-tride-border p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                        {review.flagged && (
                            <div className="absolute top-0 right-0 p-4">
                                <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-red-500/20">
                                    <AlertTriangle size={14} /> Flagged for Review
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-4">
                            <div>
                                <h3 className="text-2xl font-black text-tride-text mb-2">Rating Overview</h3>
                                <p className="text-tride-text-muted text-sm font-medium">Bidirectional feedback for trip {review.trip_id}</p>
                            </div>
                            <span className={`px-5 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border ${getStatusStyles(review.status)}`}>
                                {review.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-tride-hover/50 border border-tride-border p-6 rounded-3xl group hover:bg-tride-hover transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tride-text-muted">Rider to Driver</p>
                                    <div className="bg-tride-yellow text-black w-8 h-8 rounded-xl flex items-center justify-center font-black">
                                        {review.rating_rd}
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={20} className={s <= review.rating_rd ? "text-tride-yellow fill-current" : "text-tride-border"} />
                                    ))}
                                </div>
                                <p className="text-tride-text font-medium italic leading-relaxed">"{review.comment}"</p>
                            </div>

                            <div className="bg-tride-hover/50 border border-tride-border p-6 rounded-3xl group hover:bg-tride-hover transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-tride-text-muted">Driver to Rider</p>
                                    <div className="bg-blue-500 text-white w-8 h-8 rounded-xl flex items-center justify-center font-black">
                                        {review.rating_dr}
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={20} className={s <= review.rating_dr ? "text-blue-500 fill-current" : "text-tride-border"} />
                                    ))}
                                </div>
                                <p className="text-tride-text font-medium italic leading-relaxed">"{review.driver_comment}"</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 border-t border-tride-border pt-8">
                            <Button 
                                onClick={() => handleModerate('active')}
                                disabled={review.status === 'Approved'}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest border-none shadow-lg shadow-green-600/20"
                            >
                                <Check size={18} className="mr-2" /> Approve Review
                            </Button>
                            <Button 
                                onClick={() => handleModerate('moderated')}
                                disabled={review.status === 'Under Review'}
                                variant="secondary"
                                className="bg-tride-hover border-tride-border px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest"
                            >
                                <AlertTriangle size={18} className="mr-2" /> Mark for Review
                            </Button>
                            <Button 
                                onClick={() => handleModerate('deleted')}
                                className="bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white px-8 h-12 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-500/20 transition-all"
                            >
                                <XCircle size={18} className="mr-2" /> Dismiss Rating
                            </Button>
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-tride-card border border-tride-border p-8 rounded-[2.5rem] shadow-sm">
                        <h4 className="font-black text-tride-text mb-6 uppercase tracking-widest text-xs flex items-center gap-2">
                            <Clock size={16} className="text-tride-yellow" /> System Metadata
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-black text-tride-text-muted uppercase tracking-widest mb-1">Created At</p>
                                <p className="text-tride-text font-bold">{new Date(review.date).toLocaleDateString()} {new Date(review.date).toLocaleTimeString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-tride-text-muted uppercase tracking-widest mb-1">Trip Reference</p>
                                <p className="text-tride-text font-mono font-bold bg-tride-hover inline-block px-3 py-1 rounded-lg border border-tride-border">{review.trip_id}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: People */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Involved Parties */}
                    <div className="bg-tride-card border border-tride-border p-8 rounded-[2.5rem] shadow-sm">
                        <h3 className="font-black text-tride-text text-sm uppercase tracking-widest mb-8 border-b border-tride-border pb-4">Involved Parties</h3>
                        
                        {/* Rider */}
                        <div className="mb-10 group cursor-pointer">
                             <p className="text-[10px] text-tride-text-muted uppercase tracking-widest mb-4 font-black">Rider</p>
                             <div className="flex items-center gap-4 p-4 bg-tride-hover/30 border border-tride-border rounded-3xl group-hover:bg-tride-hover transition-all">
                                 <div className="w-16 h-16 bg-tride-yellow rounded-2xl flex items-center justify-center font-black text-black text-2xl shadow-lg ring-4 ring-tride-yellow/20">
                                     {review.rider?.photo ? (
                                         <img src={`/storage/${review.rider.photo}`} className="w-full h-full object-cover rounded-2xl" alt="" />
                                     ) : (
                                         review.rider?.name?.charAt(0) || "R"
                                     )}
                                 </div>
                                 <div className="overflow-hidden">
                                     <p className="font-black text-lg text-tride-text truncate">{review.rider?.name}</p>
                                     <p className="text-xs text-tride-text-muted font-bold truncate">{review.rider?.email}</p>
                                 </div>
                             </div>
                        </div>

                        {/* Driver */}
                        <div className="group cursor-pointer">
                             <p className="text-[10px] text-tride-text-muted uppercase tracking-widest mb-4 font-black">Driver</p>
                             <div className="flex items-center gap-4 p-4 bg-blue-600/5 border border-blue-500/20 rounded-3xl group-hover:bg-blue-600/10 transition-all">
                                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg ring-4 ring-blue-600/20">
                                     {review.driver?.photo ? (
                                         <img src={`/storage/${review.driver.photo}`} className="w-full h-full object-cover rounded-2xl" alt="" />
                                     ) : (
                                         review.driver?.name?.charAt(0) || "D"
                                     )}
                                 </div>
                                 <div className="overflow-hidden">
                                     <p className="font-black text-lg text-tride-text truncate">{review.driver?.name}</p>
                                     <p className="text-xs text-tride-text-muted font-bold truncate">{review.driver?.email}</p>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-tride-card border border-tride-border p-6 rounded-[2rem] shadow-sm bg-gradient-to-br from-tride-card to-tride-hover/30">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-tride-yellow/10 rounded-xl flex items-center justify-center">
                                <Star size={20} className="text-tride-yellow" />
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-widest text-tride-text">Moderation Tip</h4>
                        </div>
                        <p className="text-xs text-tride-text-muted font-medium leading-relaxed">
                            Low ratings with no comments are often outliers. Check if the rider has a history of poor ratings for other drivers before taking action.
                        </p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
