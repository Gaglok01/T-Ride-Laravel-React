import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Plus, Eye, Edit, Store, CheckCircle, Clock, DollarSign, Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { router } from "@inertiajs/react"
import { Button, IconButton } from "@/components/ui/button"
import { VendorModal } from "@/components/admin/VendorModal"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { StatusConfirmationModal } from "@/components/admin/StatusConfirmationModal"
import axios from "@/lib/axios"

interface Category {
    id: number
    name: string
}

interface Pagination {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

interface Vendor {
    id: number
    name: string
    address: string
    country?: string
    city?: string
    category_id: number
    category?: Category
    logo?: string
    commission_rate: number
    status: number // Assuming strictly 1 from controller, but maybe used later
    is_open: boolean
    total_orders: number
    total_revenue: number
    rating: number
    created_at?: string
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<number | "All">("All")
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Status Update Modal State
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [vendorToUpdateStatus, setVendorToUpdateStatus] = useState<Vendor | null>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchVendors()
    }, [currentPage, searchTerm, selectedCategory])

    const fetchCategories = async () => {
        try {
            const res = await axios.get("/admin/categories")
            if (res.data.status) {
                setCategories(res.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        }
    }

    const fetchVendors = async () => {
        setLoading(true)
        try {
            const params: any = {
                page: currentPage,
                search: searchTerm
            }
            if (selectedCategory !== "All") {
                params.category_id = selectedCategory
            }

            const response = await axios.get("/admin/vendors", { params })
            if (response.data.status) {
                setVendors(response.data.data.data)
                setPagination({
                    current_page: response.data.data.current_page,
                    last_page: response.data.data.last_page,
                    per_page: response.data.data.per_page,
                    total: response.data.data.total
                })
            }
        } catch (error) {
            console.error("Failed to fetch vendors:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveVendor = async (formData: FormData) => {
        try {
            if (editingVendor) {
                // Update
                await axios.post(`/admin/vendors/${editingVendor.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            } else {
                // Create
                await axios.post("/admin/vendors", formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            }
            fetchVendors()
            setIsModalOpen(false)
            setEditingVendor(null)
        } catch (error) {
            console.error("Failed to save vendor:", error)
            throw error 
        }
    }

    const confirmDelete = (vendor: Vendor) => {
        setVendorToDelete(vendor)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteVendor = async () => {
        if (!vendorToDelete) return
        
        try {
            setIsDeleting(true)
            await axios.delete(`/admin/vendors/${vendorToDelete.id}`)
            fetchVendors()
            setIsDeleteModalOpen(false)
            setVendorToDelete(null)
        } catch (error) {
            console.error("Failed to delete vendor:", error)
            alert("Failed to delete vendor. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    const openStatusModal = (vendor: Vendor) => {
        setVendorToUpdateStatus(vendor)
        setIsStatusModalOpen(true)
    }

    const handleUpdateStatus = async () => {
        if (!vendorToUpdateStatus) return
        try {
            setIsUpdatingStatus(true)
            await axios.patch(`/admin/vendors/${vendorToUpdateStatus.id}/status`)
            fetchVendors()
            setIsStatusModalOpen(false)
            setVendorToUpdateStatus(null)
        } catch (error) {
            console.error("Failed to update status:", error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const openCreateModal = () => {
        setEditingVendor(null)
        setIsModalOpen(true)
    }

    const openEditModal = (vendor: Vendor) => {
        setEditingVendor(vendor)
        setIsModalOpen(true)
    }

    // filtering logic moved to server-side
    // const filteredVendors = vendors.filter... removed


    // Stats Calculation
    const totalVendors = vendors.length
    const activeVendors = vendors.filter(v => v.is_open).length
    // Assuming 'status' isn't explicitly 'pending' in the current controller logic (it defaults to 1), 
    // but maybe we can just show closed vendors or something else. 
    // For now, let's just count 'closed' as 'inactive' or similar if we want.
    // The mockup had "Pending", but controller sets is_open=true, status=1 on create.
    // We'll calculate Total Orders and Revenue from the data.
    const totalRevenue = vendors.reduce((acc, v) => acc + Number(v.total_revenue || 0), 0)
    
    return (
        <AdminLayout
            title="Vendor Management"
            description="Restaurants, shops, and stores"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search vendors..." 
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="bg-tride-card border border-tride-border rounded-full pl-10 pr-4 py-2 text-sm text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <Button onClick={openCreateModal} className="flex-1 sm:flex-none justify-center gap-2">
                        <Plus size={18} />
                        Add Vendor
                    </Button>
                </div>
            }
        >


            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard 
                    label="Total Vendors" 
                    value={totalVendors.toString()} 
                    trend="-" 
                    trendUp={true} 
                    icon={<Store size={24} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Active" 
                    value={activeVendors.toString()} 
                    trend={`${totalVendors > 0 ? ((activeVendors / totalVendors) * 100).toFixed(1) : 0}%`}
                    trendUp={true} 
                    icon={<CheckCircle size={24} className="text-green-500" />} 
                    iconBg="bg-green-500/10"
                />
                <StatsCard 
                    label="Closed" 
                    value={(totalVendors - activeVendors).toString()} 
                    trend="-"
                    trendUp={false} 
                    icon={<Clock size={24} className="text-orange-500" />} 
                    iconBg="bg-orange-500/10"
                />
                <StatsCard 
                    label="Total Revenue" 
                    value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
                    trend="-"
                    trendUp={true} 
                    icon={<DollarSign size={24} className="text-tride-yellow" />} 
                    iconBg="bg-yellow-500/10"
                />
            </div>



            {/* Main Content Area */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                
                 {/* Tabs */}
                 <div className="flex gap-1 p-4 border-b border-tride-border overflow-x-auto scrollbar-hide">
                    <Button 
                        variant={selectedCategory === "All" ? "default" : "ghost"}
                        className={selectedCategory === "All" ? "" : ""}
                        onClick={() => setSelectedCategory("All")}
                    >
                        All Vendors
                    </Button>
                    {categories.map(category => (
                        <Button 
                            key={category.id} 
                            variant={selectedCategory === category.id ? "default" : "ghost"}
                            className={selectedCategory === category.id ? "" : ""}
                            onClick={() => { setSelectedCategory(category.id); setCurrentPage(1); }}
                        >
                            {category.name}
                        </Button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">Vendor</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Orders</th>
                                <th className="px-6 py-4 font-medium">Revenue</th>
                                <th className="px-6 py-4 font-medium">Rating</th>
                                <th className="px-6 py-4 font-medium">Commission</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-tride-text-muted">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-5 w-5 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                                            Loading vendors...
                                        </div>
                                    </td>
                                </tr>
                            ) : vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-tride-text-muted">
                                        No vendors found.
                                    </td>
                                </tr>
                            ) : (
                                vendors.map(vendor => (
                                    <VendorRow 
                                        key={vendor.id} 
                                        vendor={vendor}
                                        onView={() => router.visit(`/admin/vendors/${vendor.id}`)}
                                        onEdit={() => openEditModal(vendor)}
                                        onDelete={() => confirmDelete(vendor)}
                                        onToggleStatus={() => openStatusModal(vendor)}
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
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} vendors
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={pagination.current_page === 1}
                                className="disabled:opacity-30 disabled:cursor-not-allowed text-tride-text"
                            >
                                <ChevronLeft size={16} className="mr-1" /> Previous
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                                disabled={pagination.current_page === pagination.last_page}
                                className="disabled:opacity-30 disabled:cursor-not-allowed text-tride-text"
                            >
                                Next <ChevronRight size={16} className="ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>


            <VendorModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveVendor}
                initialData={editingVendor}
                categories={categories}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteVendor}
                title="Delete Vendor"
                description="Are you sure you want to permanently delete this vendor?"
                itemName={vendorToDelete?.name}
                isLoading={isDeleting}
            />

            <StatusConfirmationModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleUpdateStatus}
                title="Update Status"
                description={`Are you sure you want to change the status to ${vendorToUpdateStatus?.is_open ? 'Closed' : 'Open'}?`}
                currentStatus={vendorToUpdateStatus?.is_open ? 'Open' : 'Closed'}
                itemName={vendorToUpdateStatus?.name}
                isLoading={isUpdatingStatus}
            />
        </AdminLayout>
    )
}

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
            <div className={`w-12 h-12 ${iconBg} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}

interface VendorRowProps {
    vendor: Vendor
    onView: () => void
    onEdit: () => void
    onDelete: () => void
    onToggleStatus: () => void
}

function VendorRow({ vendor, onView, onEdit, onDelete, onToggleStatus }: VendorRowProps) {
    return (
        <tr className="hover:bg-tride-hover transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-tride-hover rounded-2xl flex items-center justify-center text-lg font-bold overflow-hidden text-tride-text">
                        {vendor.logo ? (
                            <img src={`/storage/${vendor.logo}`} alt={vendor.name} className="w-full h-full object-cover" />
                        ) : (
                            <Store size={18} className="text-tride-text-muted" />
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-tride-text">{vendor.name}</div>
                        <div className="text-xs text-tride-text-muted">{vendor.address}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-tride-border text-xs font-medium text-tride-text-muted">
                    {vendor.category?.name || "Uncategorized"}
                </span>
            </td>
            <td className="px-6 py-4 font-mono text-sm text-tride-text">{vendor.total_orders || 0}</td>
            <td className="px-6 py-4 font-mono text-sm text-tride-text">${Number(vendor.total_revenue || 0).toFixed(2)}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                    <Star size={14} fill="currentColor" /> {Number(vendor.rating || 0).toFixed(1)}
                </div>
            </td>
            <td className="px-6 py-4 text-tride-text-muted">{vendor.commission_rate}%</td>
            <td className="px-6 py-4">
                <button
                    onClick={onToggleStatus}
                    className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all ${
                        vendor.is_open 
                            ? 'bg-blue-500/20 text-blue-400 shadow-none border border-blue-500/20 hover:bg-blue-500/30' 
                            : 'bg-red-500/20 text-red-400 shadow-none border border-red-500/20 hover:bg-red-500/30'
                    }`}
                >
                    {vendor.is_open ? 'Open' : 'Closed'}
                </button>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <IconButton tooltip="View" onClick={onView}>
                        <Eye size={16} />
                    </IconButton>
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


