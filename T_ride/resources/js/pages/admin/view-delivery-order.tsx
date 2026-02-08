import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, User, Truck, ShoppingBag, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"

interface DeliveryOrder {
    id: number
    order_code: string
    customer: { name: string, phone_number?: string } | null
    vendor: { name: string, address?: string } | null
    driver: { name: string, phone_number?: string } | null
    category: { name: string } | null
    pickup_address: string
    dropoff_address: string
    total_items: number
    total_amount: number
    delivery_fee: number
    status: string
    created_at: string
    updated_at: string
}

export default function ViewDeliveryOrder({ id }: { id: string }) {
    const [order, setOrder] = useState<DeliveryOrder | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrder()
    }, [id])

    const fetchOrder = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/admin/delivery-orders/${id}`)
            if (response.data.status) {
                setOrder(response.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch order details:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'delivered': return 'text-green-500 bg-green-500/10'
            case 'on_the_way': return 'text-blue-500 bg-blue-500/10'
            case 'preparing': return 'text-orange-500 bg-orange-500/10'
            case 'cancelled': return 'text-red-500 bg-red-500/10'
            default: return 'text-tride-text-muted bg-tride-hover'
        }
    }

    if (loading) {
        return (
             <AdminLayout title="Order Details" description="Loading order information...">
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tride-yellow"></div>
                </div>
             </AdminLayout>
        )
    }

    if (!order) {
        return (
            <AdminLayout title="Order Not Found" description="The requested order could not be found.">
                 <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-tride-text">Order not found</h3>
                    <Link href="/admin/delivery-orders" className="mt-4 inline-block text-tride-yellow hover:underline">
                        Return to Orders
                    </Link>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title={`Order: ${order.order_code}`}
            description="Detailed view of delivery order"
            actions={
                <Link href="/admin/delivery-orders">
                    <Button variant="secondary">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to List
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Status & Basic Info */}
                    <div className="bg-tride-card border border-tride-border p-5 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-tride-text text-lg">Order Status</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-tride-hover p-4 rounded-xl">
                                <p className="text-xs text-tride-text-muted mb-1">Total Amount</p>
                                <p className="text-xl font-bold text-tride-text">${Number(order.total_amount).toFixed(2)}</p>
                            </div>
                             <div className="bg-tride-hover p-4 rounded-xl">
                                <p className="text-xs text-tride-text-muted mb-1">Delivery Fee</p>
                                <p className="text-lg font-bold text-tride-text">${Number(order.delivery_fee).toFixed(2)}</p>
                            </div>
                            <div className="bg-tride-hover p-4 rounded-xl">
                                <p className="text-xs text-tride-text-muted mb-1">Items</p>
                                <p className="text-lg font-bold text-tride-text">{order.total_items}</p>
                            </div>
                        </div>
                        <div className="mt-6 border-t border-tride-border pt-4">
                             <h4 className="font-medium text-tride-text mb-3 flex items-center gap-2">
                                <Clock size={16} className="text-tride-yellow" /> Timeline
                             </h4>
                             <div className="space-y-2 text-sm">
                                 <div className="flex justify-between">
                                     <span className="text-tride-text-muted">Created</span>
                                     <span className="text-tride-text">{new Date(order.created_at).toLocaleString()}</span>
                                 </div>
                                 <div className="flex justify-between">
                                     <span className="text-tride-text-muted">Last Updated</span>
                                     <span className="text-tride-text">{new Date(order.updated_at).toLocaleString()}</span>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* Locations */}
                    <div className="bg-tride-card border border-tride-border p-5 rounded-3xl">
                        <h3 className="font-semibold text-tride-text mb-4 text-lg">Delivery Locations</h3>
                        <div className="space-y-6 relative pl-4 border-l-2 border-tride-border ml-2">
                             <div className="relative">
                                <div className="absolute -left-[21px] top-1 bg-green-500 border-2 border-tride-card w-4 h-4 rounded-full"></div>
                                <p className="text-xs text-tride-text-muted mb-1 uppercase tracking-wider font-bold">Pickup (Vendor)</p>
                                <p className="text-base font-medium text-tride-text">{order.vendor?.name}</p>
                                <p className="text-sm text-tride-text-muted">{order.vendor?.address || order.pickup_address}</p>
                            </div>
                            
                            <div className="relative">
                                 <div className="absolute -left-[21px] top-1 bg-red-500 w-4 h-4 rounded-full border-2 border-tride-card"></div>
                                <p className="text-xs text-tride-text-muted mb-1 uppercase tracking-wider font-bold">Dropoff (Customer)</p>
                                <p className="text-base font-medium text-tride-text">{order.customer?.name}</p>
                                <p className="text-sm text-tride-text-muted">{order.dropoff_address}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: People */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Operations */}
                    <div className="bg-tride-card border border-tride-border p-5 rounded-3xl">
                        <h3 className="font-semibold text-tride-text mb-4">Involved Parties</h3>
                        
                        {/* Customer */}
                        <div className="mb-6">
                             <p className="text-xs text-tride-text-muted uppercase mb-2 font-bold">Customer</p>
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-tride-hover rounded-full flex items-center justify-center font-bold text-tride-text">
                                     {order.customer?.name?.charAt(0) || "C"}
                                 </div>
                                 <div>
                                     <p className="font-medium text-tride-text">{order.customer?.name}</p>
                                     <p className="text-xs text-tride-text-muted">{order.customer?.phone_number || "No phone"}</p>
                                 </div>
                             </div>
                        </div>

                         {/* Vendor */}
                         <div className="mb-6">
                             <p className="text-xs text-tride-text-muted uppercase mb-2 font-bold">Vendor</p>
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-tride-hover rounded-full flex items-center justify-center font-bold text-tride-text">
                                     <ShoppingBag size={18} />
                                 </div>
                                 <div>
                                     <p className="font-medium text-tride-text">{order.vendor?.name}</p>
                                     <p className="text-xs text-tride-text-muted">{order.category?.name || "Vendor"}</p>
                                 </div>
                             </div>
                        </div>

                        {/* Driver */}
                        <div>
                             <p className="text-xs text-tride-text-muted uppercase mb-2 font-bold">Driver</p>
                             {order.driver ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-tride-hover rounded-full flex items-center justify-center font-bold text-tride-text">
                                        <Truck size={18} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-tride-text">{order.driver?.name}</p>
                                        <p className="text-xs text-tride-text-muted">{order.driver?.phone_number || "No phone"}</p>
                                    </div>
                                </div>
                             ) : (
                                 <div className="p-3 bg-tride-hover rounded-xl text-center text-sm text-tride-text-muted border border-dashed border-tride-border">
                                     No driver assigned
                                 </div>
                             )}
                        </div>
                    </div>

                    
                </div>
            </div>
        </AdminLayout>
    )
}
