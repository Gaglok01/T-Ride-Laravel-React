import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, Package, DollarSign, MapPin, User, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface CourierOrderData {
    id: number
    order_id: string
    sender: string
    recipient: string
    package_type: string
    courier: string
    fee: number
    status: string
    created_at: string
}

export default function ViewCourierOrder({ id }: { id: number }) {
    const [order, setOrder] = useState<CourierOrderData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Adjust endpoint if needed, assuming /api/admin/orders/{id} serves this
                const res = await axios.get(`/admin/orders/${id}`)
                if (res.data.success) {
                    setOrder(res.data.data)
                }
            } catch (error) {
                console.error("Failed to fetch order:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Order Details" description="Loading...">
                 <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!order) {
        return (
            <AdminLayout title="Order Details" description="Not found">
                <div className="text-center text-white/50 py-12">Order not found</div>
            </AdminLayout>
        )
    }

    // Status Styling and Logic
    const getStatusColor = (status: string) => {
        switch(status.toLowerCase()) {
            case 'delivered': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'in transit': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'cancelled': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-white/70 bg-white/5 border-white/10';
        }
    }

    const steps = ['Pending', 'In Transit', 'Delivered'];
    const currentStepIndex = steps.indexOf(order.status) === -1 && order.status === 'Cancelled' ? -1 : steps.indexOf(order.status);
    const isCancelled = order.status === 'Cancelled';

    return (
        <AdminLayout
            title={`Courier Order #${order.order_id}`}
            description={`Created on ${new Date(order.created_at).toLocaleDateString()}`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/orders" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Orders
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-bold">Tracking Status</h2>
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border capitalize ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>

                        {isCancelled ? (
                             <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                <AlertCircle size={24} />
                                <div>
                                    <p className="font-bold">Order Cancelled</p>
                                    <p className="text-sm opacity-80">This order has been cancelled and delivery stopped.</p>
                                </div>
                             </div>
                        ) : (
                            <div className="relative flex items-center justify-between px-4 my-4">
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 -z-10"></div>
                                
                                {steps.map((step, idx) => {
                                    const isCompleted = idx <= currentStepIndex;
                                    const isCurrent = idx === currentStepIndex;
                                    
                                    return (
                                        <div key={step} className="flex flex-col items-center gap-2 px-4 z-10 transition-all duration-300">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                                                isCompleted 
                                                    ? 'bg-tride-yellow border-tride-yellow text-black shadow-[0_0_15px_rgba(245,197,24,0.3)]' 
                                                    : 'bg-[#1C1C1E] border-white/10 text-white'
                                            }`}>
                                                {isCompleted ? <CheckCircle size={18} /> : (idx + 1)}
                                            </div>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${
                                                isCompleted ? 'text-tride-yellow' : 'text-tride-text'
                                            }`}>
                                                {step}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Shipment Details */}
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Package size={20} className="text-tride-yellow" />
                            Shipment Details
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoCard icon={<Package size={18} />} label="Package Type" value={order.package_type} />
                            <InfoCard icon={<Truck size={18} />} label="Courier Service" value={order.courier} />
                            <InfoCard icon={<DollarSign size={18} />} label="Delivery Fee" value={`$${Number(order.fee).toFixed(2)}`} highlight />
                            <InfoCard icon={<Clock size={18} />} label="Last Updated" value={new Date(order.created_at).toLocaleString()} />
                        </div>
                    </div>
                </div>

                {/* Right Column: People Involved */}
                <div className="space-y-6">
                    {/* Sender */}
                    <ContactCard 
                        title="Sender From" 
                        icon={<MapPin size={18} className="text-blue-400" />}
                        iconBg="bg-blue-500/10"
                        name={order.sender}
                        detail="Address details hidden"
                    />

                    {/* Recipient */}
                    <ContactCard 
                        title="Recipient To" 
                        icon={<MapPin size={18} className="text-green-400" />}
                        iconBg="bg-green-500/10"
                        name={order.recipient}
                        detail="Address details hidden"
                    />

                    {/* Courier Summary */}
                    <div className="bg-tride-yellow/10 border border-tride-yellow/20 rounded-3xl p-6">
                         <h3 className="text-tride-yellow font-bold uppercase text-xs tracking-wider mb-2">Service</h3>
                         <div className="text-2xl font-bold text-tride-yellow mb-1">{order.courier}</div>
                         <p className="text-tride-yellow/60 text-sm">Standard Delivery</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function ContactCard({ title, icon, iconBg, name, detail }: any) {
    return (
        <div className="bg-tride-card border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className={`absolute top-0 right-0 w-24 h-24 ${iconBg} blur-2xl rounded-full -mr-10 -mt-10 opacity-50`}></div>
            
            <h3 className="text-tride-text text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 z-10 relative">
                <div className={`p-1.5 rounded-lg ${iconBg}`}>
                    {icon}
                </div> 
                {title}
            </h3>
            
            <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="w-8 h-8 rounded-full  bg-tride-hover flex items-center justify-center text-tride-text/70 font-bold text-xs">
                        {name.charAt(0).toUpperCase()}
                     </div>
                     <p className="font-bold text-lg leading-tight truncate">{name}</p>
                 </div>
                 {detail && <p className="text-tride-text/40 text-xs pl-11">{detail}</p>}
            </div>
        </div>
    )
}

function InfoCard({ icon, label, value, highlight }: any) {
    return (
        <div className={`p-4 rounded-2xl border ${highlight ? 'bg-tride-yellow/10 border-tride-yellow/20' : ' bg-tride-hover border-tride-border hover:bg-white/10'} transition-colors flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${highlight ? 'bg-tride-yellow text-black' : 'bg-white/10 text-tride-text'}`}>
                {icon}
            </div>
            <div>
                <p className={`text-xs font-medium uppercase tracking-wider mb-0.5 ${highlight ? 'text-tride-yellow/80' : 'text-tride-text'}`}>{label}</p>
                <p className={`font-bold ${highlight ? 'text-tride-yellow text-lg' : 'text-tride-text'}`}>{value}</p>
            </div>
        </div>
    )
}
