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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search orders..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-full md:w-64"
                        />
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        <Button variant="secondary" className="gap-2" onClick={handleExport} disabled={isExporting}>
                            <Download size={18} className={isExporting ? "animate-bounce" : ""} />
                            {isExporting ? "Exporting..." : "Export"}
                        </Button>
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
                                <div className="absolute right-0 mt-3 w-80 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                            <h3 className="font-semibold text-white">Filter Orders</h3>
                                            <button onClick={() => setShowFilters(false)} className="text-white/40 hover:text-white transition-colors">
                                                <span className="sr-only">Close</span>
                                                <X size={18} />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <ModalSelect
                                                label="Package Type"
                                                value={tempFilters.package_type}
                                                onChange={(val) => setTempFilters({...tempFilters, package_type: val})}
                                                options={[
                                                    { label: "All Package Types", value: "All Package Types" },
                                                    { label: "Small", value: "Small" },
                                                    { label: "Medium", value: "Medium" },
                                                    { label: "Large", value: "Large" },
                                                    { label: "Document", value: "Document" }
                                                ]}
                                            />

                                            <ModalInput
                                                label="Order ID"
                                                placeholder="e.g. PKG-0021"
                                                value={tempFilters.order_id}
                                                onChange={(val) => setTempFilters({...tempFilters, order_id: val})}
                                                icon={<Search size={16} />}
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

            {/* Main Content Area */}
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                 {/* Tabs */}
                <div className="flex gap-1 p-4 border-b border-white/5">
                    {["All Orders", "Pending", "In Transit", "Delivered", "Cancelled"].map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "secondary" : "ghost"}
                            className={activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white"}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-left text-white/40 text-sm">
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
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-white/50">Loading orders...</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-white/50">No orders found.</td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
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
        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-start justify-between">
            <div>
                <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
                <div className="text-2xl font-bold mb-2">{value}</div>
                <div className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
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
        case "Delivered": statusStyles = "bg-white/10 text-white border border-white/10"; break;
        case "In Transit": statusStyles = "bg-blue-600 text-white shadow-lg shadow-blue-600/20"; break;
        case "Pending": statusStyles = "bg-yellow-500/20 text-yellow-500 border border-yellow-500/20"; break;
        case "Cancelled": statusStyles = "bg-red-500/20 text-red-500 border border-red-500/20"; break;
        default: statusStyles = "bg-white/5 text-white/70 border border-white/10";
    }
    
    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4 font-mono text-sm text-white/70">{order.order_id || `#${order.id}`}</td>
            <td className="px-6 py-4 font-medium">{order.sender}</td>
            <td className="px-6 py-4 font-medium">{order.recipient}</td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white/60 bg-white/5">
                    {order.package_type}
                </span>
            </td>
            <td className="px-6 py-4 font-medium">{order.courier}</td>
            <td className="px-6 py-4 font-medium">${Number(order.fee).toFixed(2)}</td>
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
