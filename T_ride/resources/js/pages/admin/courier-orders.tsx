import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Filter, Plus, Package, CheckCircle, Activity, DollarSign, Eye, Edit, Trash2, Download } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Button, IconButton } from "@/components/ui/button"
import orderService, { Order, CreateOrderRequest } from "@/services/orderService"
import { OrderModal } from "@/components/admin/OrderModal"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { StatusUpdateModal } from "@/components/admin/StatusUpdateModal"
import { ModalInput, ModalSelect } from "@/components/ui/modal"
import { Check, X } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function CourierOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState<Order | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    // Filter States
    const [activeTab, setActiveTab] = useState("All Orders")
    const [showFilters, setShowFilters] = useState(false)
    const [appliedFilters, setAppliedFilters] = useState({
        package_type: "All Package Types",
        order_id: ""
    })
    const [tempFilters, setTempFilters] = useState({
        package_type: "All Package Types",
        order_id: ""
    })

    // Status Update Modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [orderToUpdateStatus, setOrderToUpdateStatus] = useState<Order | null>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    const [isExporting, setIsExporting] = useState(false)

    useEffect(() => {
        fetchOrders()
    }, [appliedFilters, activeTab])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const params: any = {}
            if (activeTab !== "All Orders") {
                params.status = activeTab
            }
            if (appliedFilters.package_type !== "All Package Types") {
                params.package_type = appliedFilters.package_type
            }
            if (appliedFilters.order_id) {
                params.order_id = appliedFilters.order_id
            }
            
            const data = await orderService.getAll(params)
            setOrders(data)
        } catch (error) {
            console.error("Failed to fetch orders", error)
        } finally {
            setLoading(false)
        }
    }

    const openStatusModal = (order: Order) => {
        setOrderToUpdateStatus(order)
        setIsStatusModalOpen(true)
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!orderToUpdateStatus) return
        try {
            setIsUpdatingStatus(true)
            await orderService.updateStatus(orderToUpdateStatus.id, newStatus)
            fetchOrders()
            setIsStatusModalOpen(false)
            setOrderToUpdateStatus(null)
        } catch (error) {
            console.error("Failed to update status", error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const clearFilters = () => {
        const reset = {
            package_type: "All Package Types",
            order_id: ""
        }
        setAppliedFilters(reset)
        setTempFilters(reset)
        setShowFilters(false)
    }

    const applyFilters = () => {
        setAppliedFilters(tempFilters)
        setShowFilters(false)
    }

    const handleExport = async () => {
        try {
            setIsExporting(true)
            const params: any = {}
            if (activeTab !== "All Orders") params.status = activeTab
            if (appliedFilters.package_type !== "All Package Types") params.package_type = appliedFilters.package_type
            if (appliedFilters.order_id) params.order_id = appliedFilters.order_id
            
            const data = await orderService.getAll(params)

            const doc = new jsPDF()
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text("T-RIDE", 14, 20)
            
            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text("Courier Orders Report", 14, 28)
            
            doc.setFontSize(10)
            doc.setTextColor(150, 150, 150)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)

            const tableData = data.map((order: Order) => [
                order.order_id || `#${order.id}`,
                order.sender,
                order.recipient,
                order.package_type,
                order.courier,
                `$${Number(order.fee).toFixed(2)}`,
                order.status,
            ])

            autoTable(doc, {
                head: [["Order ID", "Sender", "Recipient", "Type", "Courier", "Fee", "Status"]],
                body: tableData,
                startY: 40,
                theme: 'grid',
                headStyles: { fillColor: [245, 197, 24], textColor: [0, 0, 0] }
            })
            
            doc.save(`courier_orders_${Date.now()}.pdf`)

        } catch (error) {
            console.error("Export failed:", error)
        } finally {
            setIsExporting(false)
        }
    }

    const handleSaveOrder = async (data: CreateOrderRequest) => {
        try {
            if (editingOrder) {
                await orderService.update(editingOrder.id, data)
            } else {
                await orderService.create(data)
            }
            fetchOrders()
            setIsModalOpen(false)
            setEditingOrder(null)
        } catch (error) {
            console.error("Failed to save order", error)
            throw error 
        }
    }

    const confirmDelete = (order: Order) => {
        setOrderToDelete(order)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteOrder = async () => {
        if (!orderToDelete) return
        
        try {
            setIsDeleting(true)
            await orderService.delete(orderToDelete.id)
            fetchOrders()
            setIsDeleteModalOpen(false)
            setOrderToDelete(null)
        } catch (error) {
            console.error("Failed to delete order", error)
            alert("Failed to delete order. Please try again.")
        } finally {
            setIsDeleting(false)
        }
    }

    const openCreateModal = () => {
        setEditingOrder(null)
        setIsModalOpen(true)
    }

    const openEditModal = (order: Order) => {
        setEditingOrder(order)
        setIsModalOpen(true)
    }

    // Calculate Stats
    const totalOrders = orders.length
    const inTransit = orders.filter(o => o.status === 'In Transit').length
    const delivered = orders.filter(o => o.status === 'Delivered').length
    const revenue = orders.reduce((acc, o) => acc + Number(o.fee), 0)

    const filteredOrders = orders.filter(order => 
        (order.order_id?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        order.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <AdminLayout
            title="Courier Orders"
            description="Package delivery management"
            actions={
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search order ID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-tride-card border border-tride-border rounded-full pl-10 pr-4 py-2 text-sm text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow transition-colors w-full md:w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="secondary"
                            onClick={() => {
                                if (!showFilters) setTempFilters(appliedFilters)
                                setShowFilters(!showFilters)
                            }}
                            className={showFilters ? "bg-tride-yellow/20 text-tride-yellow border-tride-yellow/50" : ""}
                        >
                            <Filter size={18} />
                            Filters
                        </Button>
                        <Button variant="secondary" className="gap-2" onClick={handleExport} disabled={isExporting}>
                            <Download size={18} className={isExporting ? "animate-bounce" : ""} />
                            {isExporting ? "Exporting..." : "Export"}
                        </Button>
                        <Button onClick={openCreateModal}>
                            <Plus size={18} className="mr-2" />
                            Create Order
                        </Button>
                    </div>
                </div>
            }
        >
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    label="Total Orders"
                    value={totalOrders.toLocaleString()}
                    trend="+10.2%"
                    trendUp={true}
                    icon={<Package size={24} />}
                    iconBaseColor="blue"
                />
                <StatsCard
                    label="In Transit"
                    value={inTransit.toLocaleString()}
                    trend="+5.1%"
                    trendUp={true}
                    icon={<Activity size={24} />}
                    iconBaseColor="blue"
                />
                <StatsCard
                    label="Delivered"
                    value={delivered.toLocaleString()}
                    trend="+8.3%"
                    trendUp={true}
                    icon={<CheckCircle size={24} />}
                    iconBaseColor="green"
                />
                <StatsCard
                    label="Revenue"
                    value={`$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    trend="+12.5%"
                    trendUp={true}
                    icon={<DollarSign size={24} />}
                    iconBaseColor="yellow"
                />
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="bg-tride-card border border-tride-border rounded-2xl p-5 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="text-xs font-semibold text-tride-text-muted mb-2 block uppercase tracking-wider">Package Type</label>
                        <select 
                            value={tempFilters.package_type}
                            onChange={(e) => setTempFilters({...tempFilters, package_type: e.target.value})}
                            className="w-full bg-tride-hover border border-tride-border rounded-xl px-4 py-2.5 text-sm text-tride-text focus:outline-none focus:border-tride-yellow transition-colors"
                        >
                            <option value="All Package Types">All Package Types</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                            <option value="Document">Document</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-tride-text-muted mb-2 block uppercase tracking-wider">Order ID</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" />
                            <input
                                type="text"
                                placeholder="e.g. PKG-0021"
                                value={tempFilters.order_id}
                                onChange={(e) => setTempFilters({...tempFilters, order_id: e.target.value})}
                                className="w-full bg-tride-hover border border-tride-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-tride-text focus:outline-none focus:border-tride-yellow transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
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
            )}

            {/* Main Content Area */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                 {/* Tabs */}
            <div className="flex gap-1 p-4 border-b border-tride-border flex-wrap">
                {["All Orders", "Pending", "Assigned", "Picked Up", "In Transit", "Delivered", "Cancelled"].map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "ghost"}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </Button>
                ))}
            </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">Order ID</th>
                                <th className="px-6 py-4 font-medium">Sender</th>
                                <th className="px-6 py-4 font-medium">Recipient</th>
                                <th className="px-6 py-4 font-medium">Package</th>
                                <th className="px-6 py-4 font-medium">Courier</th>
                                <th className="px-6 py-4 font-medium">Fee</th>
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
                                            Loading orders...
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-tride-text-muted">No orders found.</td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <OrderRow 
                                        key={order.id} 
                                        order={order} 
                                        onEdit={() => openEditModal(order)}
                                        onDelete={() => confirmDelete(order)}
                                        onToggleStatus={() => openStatusModal(order)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveOrder}
                initialData={editingOrder}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteOrder}
                title="Delete Order"
                description="Are you sure you want to permanently delete this order?"
                itemName={orderToDelete?.order_id || `#${orderToDelete?.id}`}
                isLoading={isDeleting}
            />

            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleUpdateStatus}
                currentStatus={orderToUpdateStatus?.status || "Pending"}
                isLoading={isUpdatingStatus}
                title="Update Order Status"
                description="Select new status for this order."
                options={[
                    { label: "Pending", value: "Pending" },
                    { label: "In Transit", value: "In Transit" },
                    { label: "Delivered", value: "Delivered" },
                    { label: "Cancelled", value: "Cancelled" }
                ]}
            />
        </AdminLayout>
    )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBaseColor }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBaseColor: 'blue' | 'green' | 'yellow' | 'red' }) {
    let iconColors = "bg-blue-500/20 text-blue-400"
    if (iconBaseColor === 'green') iconColors = "bg-green-500/20 text-green-400"
    if (iconBaseColor === 'yellow') iconColors = "bg-yellow-500/20 text-yellow-400"
    if (iconBaseColor === 'red') iconColors = "bg-red-500/20 text-red-400"

    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-xs font-medium mb-1">{label}</p>
                <div className="text-2xl font-bold mb-2 text-tride-text">{value}</div>
                <div className={`text-xs font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-sm">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-12 h-12 ${iconColors} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}



function OrderRow({ order, onEdit, onDelete, onToggleStatus }: { order: Order, onEdit: () => void, onDelete: () => void, onToggleStatus: () => void }) {
    let statusStyles = ""
    switch (order.status) {
        case "Delivered": statusStyles = "bg-green-500/20 text-green-400 border border-green-500/20"; break;
        case "In Transit": statusStyles = "bg-blue-600 text-white shadow-lg shadow-blue-600/20"; break;
        case "Pending": statusStyles = "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"; break;
        case "Cancelled": statusStyles = "bg-red-500/20 text-red-500 border border-red-500/20"; break;
        default: statusStyles = "bg-tride-hover text-tride-text-muted border border-tride-border";
    }
    
    return (
        <tr className="hover:bg-tride-hover transition-colors group">
            <td className="px-6 py-4 font-mono text-sm text-tride-text-muted">{order.order_id || `#${order.id}`}</td>
            <td className="px-6 py-4 font-medium text-tride-text">{order.sender}</td>
            <td className="px-6 py-4 font-medium text-tride-text">{order.recipient}</td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-tride-border text-xs font-medium text-tride-text bg-tride-card">
                    {order.package_type}
                </span>
            </td>
            <td className="px-6 py-4 font-medium text-tride-text">{order.courier}</td>
            <td className="px-6 py-4 font-medium text-tride-text">${Number(order.fee).toFixed(2)}</td>
            <td className="px-6 py-4">
                <button 
                    onClick={onToggleStatus}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer ${statusStyles}`}
                >
                    {order.status}
                </button>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/orders/${order.id}`}>
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
