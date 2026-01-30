import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Filter, Plus, Eye, Edit, Trash2, Download, Users, UserCheck, UserX, TrendingUp, Clock } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { UserModal } from "@/components/admin/UserModal"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { StatusUpdateModal } from "@/components/admin/StatusUpdateModal"
import { ModalSelect } from "@/components/ui/modal"
import { Check, X } from "lucide-react"
import axios from "@/lib/axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { Link } from "@inertiajs/react"

interface User {
    id: number
    name: string
    email: string
    phone_number?: string
    status: string
    wallet_balance?: number
    photo?: string
    roles?: { name: string }[]
    rides_count?: number
    created_at?: string
}

interface Stats {
    total_users: number
    active_users: number
    suspended: number
    pending: number
    new_today: number
}

interface Pagination {
    current_page: number
    last_page: number
    per_page: number
    total: number
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    
    // Tabs & Filters
    const [activeTab, setActiveTab] = useState("All Users")
    const [showFilters, setShowFilters] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState({
        status: "All"
    })
    const [tempFilters, setTempFilters] = useState({
        status: "All"
    })
    const [pagination, setPagination] = useState<Pagination | null>(null)
    const [currentPage, setCurrentPage] = useState(1)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)
    
    // Status Update Modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [userToUpdateStatus, setUserToUpdateStatus] = useState<User | null>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Filter dropdown state replaced by new logic

    useEffect(() => {
        fetchUsers()
    }, [currentPage, activeTab, appliedFilters])

    const fetchUsers = async (search?: string) => {
        try {
            setLoading(true)
            const params: any = { page: currentPage }
            if (search || searchTerm) {
                params.search = search ?? searchTerm
            }
            // Filter by Status (from Filter Panel)
            if (appliedFilters.status !== "All") {
                params.status = appliedFilters.status.toLowerCase()
            }
            // Filter by Role (from Tabs)
            if (activeTab !== "All Users") {
                params.role = activeTab.toLowerCase() // "rider" or "customer"
            }

            const response = await axios.get("/admin/users", { params })
            
            if (response.data.status) {
                const { stats, users: usersData } = response.data.data
                setStats(stats)
                setUsers(usersData.data)
                setPagination({
                    current_page: usersData.current_page,
                    last_page: usersData.last_page,
                    per_page: usersData.per_page,
                    total: usersData.total
                })
            }
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        // Debounce search
        const timeoutId = setTimeout(() => {
            setCurrentPage(1)
            fetchUsers(value)
        }, 500)
        return () => clearTimeout(timeoutId)
    }

    const handleSaveUser = async (formData: FormData) => {
        try {
            if (editingUser) {
                // Update
                await axios.post(`/admin/users/${editingUser.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
            } else {
                // Create
                await axios.post("/admin/users", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                })
            }
            fetchUsers()
            setIsModalOpen(false)
            setEditingUser(null)
        } catch (error) {
            console.error("Failed to save user:", error)
            throw error // Re-throw to be caught by modal
        }
    }

    const confirmDelete = (user: User) => {
        setUserToDelete(user)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return
        
        try {
            setIsDeleting(true)
            await axios.delete(`/admin/users/${userToDelete.id}`)
            fetchUsers()
            setIsDeleteModalOpen(false)
            setUserToDelete(null)
        } catch (error) {
            console.error("Failed to delete user:", error)
            alert("Failed to delete user. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    const openStatusModal = (user: User) => {
        setUserToUpdateStatus(user)
        setIsStatusModalOpen(true)
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!userToUpdateStatus) return
        try {
            setIsUpdatingStatus(true)
            await axios.patch(`/admin/users/${userToUpdateStatus.id}/status`, {
                status: newStatus
            })
            fetchUsers()
            setIsStatusModalOpen(false)
            setUserToUpdateStatus(null)
        } catch (error) {
            console.error("Failed to update status:", error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const clearFilters = () => {
        setAppliedFilters({ status: "All" })
        setTempFilters({ status: "All" })
        setShowFilters(false)
    }

    const applyFilters = () => {
        setAppliedFilters(tempFilters)
        setShowFilters(false)
    }

    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        try {
            setIsExporting(true)
            
            // Fetch all users for export
            const response = await axios.get("/admin/users", { 
                params: { 
                    all: true,
                    search: searchTerm,
                    status: appliedFilters.status !== "All" ? appliedFilters.status.toLowerCase() : undefined,
                    role: activeTab !== "All Users" ? activeTab.toLowerCase() : undefined
                } 
            })

            if (!response.data.status) {
                console.error("Failed to fetch export data")
                return
            }

            const allUsers: User[] = response.data.data

            // Generate PDF from all users data
            const doc = new jsPDF()
            
            // Add title and branding
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text("T-RIDE", 14, 20)
            
            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text("User Management Report", 14, 28)
            
            // Add export date
            doc.setFontSize(10)
            doc.setTextColor(150, 150, 150)
            doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "long", 
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })}`, 14, 35)

            // Add stats summary
            if (stats) {
                doc.setFontSize(10)
                doc.setTextColor(60, 60, 60)
                doc.text(`Total Users: ${allUsers.length} | Active: ${stats.active_users} | Suspended: ${stats.suspended} | Pending: ${stats.pending}`, 14, 45)
            }

            // Prepare table data
            const tableData = allUsers.map(user => [
                user.id.toString(),
                user.name,
                user.email,
                user.phone_number || "-",
                user.status.charAt(0).toUpperCase() + user.status.slice(1),
                `$${Number(user.wallet_balance || 0).toFixed(2)}`,
                (user.rides_count || 0).toString(),
                user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"
            ])

            // Generate table
            autoTable(doc, {
                head: [["ID", "Name", "Email", "Phone", "Status", "Wallet", "Rides", "Joined"]],
                body: tableData,
                startY: 52,
                theme: "grid",
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [245, 197, 24], // T-RIDE yellow
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
                columnStyles: {
                    0: { cellWidth: 12 },
                    1: { cellWidth: 28 },
                    2: { cellWidth: 40 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 20 },
                    5: { cellWidth: 18 },
                    6: { cellWidth: 12 },
                    7: { cellWidth: 22 },
                },
            })

            // Add footer
            const pageCount = doc.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: "center" }
                )
                doc.text(
                    "T-RIDE Admin Panel - Confidential",
                    14,
                    doc.internal.pageSize.height - 10
                )
            }

            // Download PDF
            doc.save(`users_export_${new Date().toISOString().split("T")[0]}.pdf`)

        } catch (error) {
            console.error("Export failed:", error)
            alert("Failed to generate export. Please try again.")
        } finally {
            setIsExporting(false)
        }
    }

    const openCreateModal = () => {
        setEditingUser(null)
        setIsModalOpen(true)
    }

    const openEditModal = (user: User) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-"
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        })
    }

    const formatWallet = (balance?: number | string) => {
        return `$${Number(balance || 0).toFixed(2)}`
    }

    return (
        <AdminLayout
            title="User Management"
            description="Manage riders and customers"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search name, email..." 
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="bg-tride-card border border-tride-border rounded-full pl-10 pr-4 py-2 text-sm text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <div className="flex gap-2 flex-nowrap">
                        <div className="relative">
                            <Button 
                                variant={showFilters ? "default" : "secondary"} 
                                onClick={() => {
                                    if (!showFilters) setTempFilters(appliedFilters)
                                    setShowFilters(!showFilters)
                                }}
                            >
                                <Filter size={18} />
                                Filter
                            </Button>
                            
                            {/* Filter Dropdown Panel */}
                            {showFilters && (
                                <div className="absolute right-0 mt-3 w-80 bg-tride-card border border-tride-border rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between border-b border-tride-border pb-3">
                                            <h3 className="font-semibold text-tride-text">Filter Users</h3>
                                            <button onClick={() => setShowFilters(false)} className="text-tride-text-muted hover:text-tride-text transition-colors">
                                                <span className="sr-only">Close</span>
                                                <X size={18} />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <ModalSelect
                                                label="Status"
                                                value={tempFilters.status}
                                                onChange={(val) => setTempFilters({...tempFilters, status: val})}
                                                options={[
                                                    { label: "All Statuses", value: "All" },
                                                    { label: "Active", value: "Active" },
                                                    { label: "Suspended", value: "Suspended" },
                                                    { label: "Inactive", value: "Inactive" },
                                                    { label: "Pending", value: "Pending" }
                                                ]}
                                            />
                                        </div>

                                        <div className="pt-4 grid grid-cols-2 gap-3">
                                            <Button 
                                                onClick={clearFilters}
                                                variant="secondary"
                                                className="w-full justify-center"
                                            >
                                                <X size={16} />
                                                Clear
                                            </Button>
                                            <Button 
                                                onClick={applyFilters} 
                                                variant="default"
                                                className="w-full justify-center"
                                            >
                                                <Check size={16} />
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
                            {isExporting ? (
                                <>
                                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
                                    Export
                                </>
                            )}
                        </Button>
                        <Button onClick={openCreateModal}>
                            <Plus size={18} />
                            Add User
                        </Button>
                    </div>
                </div>
            }
        >
            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <StatsCard 
                    label="Total Users" 
                    value={stats?.total_users.toLocaleString() || "0"} 
                    trend="+5%" 
                    trendUp={true} 
                    icon={<Users size={20} className="text-tride-text" />} 
                    iconBg="bg-tride-hover"
                />
                <StatsCard 
                    label="Active Users" 
                    value={stats?.active_users.toLocaleString() || "0"} 
                    trend="+12%" 
                    trendUp={true} 
                    icon={<UserCheck size={20} className="text-green-500" />} 
                    iconBg="bg-green-500/10"
                />
                <StatsCard 
                    label="Suspended" 
                    value={stats?.suspended.toLocaleString() || "0"} 
                    trend="-2%" 
                    trendUp={false} 
                    icon={<UserX size={20} className="text-red-500" />} 
                    iconBg="bg-red-500/10"
                />
                <StatsCard 
                    label="Pending Approval" 
                    value={stats?.pending.toLocaleString() || "0"} 
                    trend="+8" 
                    trendUp={true} 
                    icon={<Clock size={20} className="text-orange-500" />} 
                    iconBg="bg-orange-500/10"
                />
                <StatsCard 
                    label="New Today" 
                    value={stats?.new_today.toLocaleString() || "0"} 
                    trend="+3" 
                    trendUp={true} 
                    icon={<TrendingUp size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
            </div>


            {/* Users Table */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                <div className="flex gap-1 p-4 border-b border-tride-border flex-wrap">
                    {["All Users", "Rider", "Customer"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "ghost"}
                            className={activeTab === tab ? "" : ""}
                            onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium">Phone</th>
                                <th className="px-6 py-4 font-medium">Rides</th>
                                <th className="px-6 py-4 font-medium">Wallet</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-tride-text-muted">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-5 w-5 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                                            Loading users...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-tride-text-muted">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => (
                                    <UserRow 
                                        key={user.id} 
                                        user={user}
                                        onEdit={() => openEditModal(user)}
                                        onDelete={() => confirmDelete(user)}
                                        onToggleStatus={() => openStatusModal(user)}
                                        formatDate={formatDate}
                                        formatWallet={formatWallet}
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
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} users
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-tride-hover text-tride-text-muted hover:bg-tride-border hover:text-tride-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    let pageNum: number
                                    if (pagination.last_page <= 5) {
                                        pageNum = i + 1
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1
                                    } else if (currentPage >= pagination.last_page - 2) {
                                        pageNum = pagination.last_page - 4 + i
                                    } else {
                                        pageNum = currentPage - 2 + i
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`w-10 h-10 rounded-xl transition-colors ${
                                                currentPage === pageNum 
                                                    ? "bg-tride-yellow text-black font-bold" 
                                                    : "bg-tride-hover text-tride-text-muted hover:bg-tride-border hover:text-tride-text"
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(pagination.last_page, prev + 1))}
                                disabled={currentPage === pagination.last_page}
                                className="px-4 py-2 rounded-xl bg-tride-hover text-tride-text-muted hover:bg-tride-border hover:text-tride-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UserModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveUser}
                initialData={editingUser}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteUser}
                title="Delete User"
                description="Are you sure you want to permanently delete this user account?"
                itemName={userToDelete?.name}
                isLoading={isDeleting}
            />

            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleUpdateStatus}
                currentStatus={userToUpdateStatus?.status || "active"}
                isLoading={isUpdatingStatus}
            />
        </AdminLayout>
    )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-5 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-xs font-medium mb-1">{label}</p>
                <div className="text-2xl font-bold mb-2 text-tride-text">{value}</div>
                <div className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-sm">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center text-tride-text`}>
                {icon}
            </div>
        </div>
    )
}

interface UserRowProps {
    user: User
    onEdit: () => void
    onDelete: () => void
    onToggleStatus: () => void
    formatDate: (date?: string) => string
    formatWallet: (balance?: number) => string
}

function UserRow({ user, onEdit, onDelete, onToggleStatus, formatDate, formatWallet }: UserRowProps) {
    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/20'
            case 'suspended':
                return 'bg-red-500/20 text-red-400 border-red-500/20'
            case 'pending':
                return 'bg-orange-500/20 text-orange-400 border-orange-500/20'
            case 'inactive':
                return 'bg-gray-500/20 text-gray-400 border-gray-500/20'
            default:
                return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
        }
    }

    return (
        <tr className="hover:bg-tride-hover transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-tride-hover flex items-center justify-center overflow-hidden">
                        {user.photo ? (
                            <img src={`/storage/${user.photo}`} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-tride-text">{user.name.charAt(0)}</span>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-tride-text">{user.name}</div>
                        <div className="text-xs text-tride-text-muted">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                 <span className="px-3 py-1 rounded-full border border-tride-border text-xs font-medium capitalize text-tride-text">
                    {user.roles && user.roles.length > 0 ? user.roles[0].name : "User"}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-tride-text-muted">{user.phone_number || "-"}</td>
            <td className="px-6 py-4 font-mono text-sm text-tride-text">{user.rides_count || 0}</td>
            <td className="px-6 py-4 font-mono text-sm text-tride-text">{formatWallet(user.wallet_balance)}</td>
            <td className="px-6 py-4">
                <button 
                    onClick={onToggleStatus}
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(user.status)} hover:opacity-80 transition-opacity cursor-pointer`}
                    title="Click to toggle status"
                >
                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </button>
            </td>
            <td className="px-6 py-4 text-sm text-tride-text-muted">{formatDate(user.created_at)}</td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/users/${user.id}`}>
                        <IconButton tooltip="View">
                            <Eye size={16} />
                        </IconButton>
                    </Link>
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
