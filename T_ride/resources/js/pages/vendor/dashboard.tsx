import { useState, useEffect } from "react"
import { VendorLayout } from "@/layouts/vendor-layout"
import { Package, CheckCircle, Star, AlertTriangle, TrendingUp } from "lucide-react"
import axios from "@/lib/axios"
import { router } from "@inertiajs/react"

interface Product {
    id: number
    name: string
    price: number
    stock: number
    is_active: boolean
    image?: string
    created_at: string
}

interface VendorInfo {
    id: number
    name: string
    total_orders: number
    total_revenue: number
    rating: number
}

interface DashboardData {
    vendor: VendorInfo
    stats: {
        title: string
        value: string
        trend: string
        icon: string
    }[]
    recentProducts: Product[]
}

export default function VendorDashboard() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<DashboardData | null>(null)

    useEffect(() => {
        fetchDashboard()
    }, [])

    const fetchDashboard = async () => {
        try {
            const response = await axios.get("/vendor/dashboard")
            if (response.data.status) {
                setData(response.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch dashboard:", error)
        } finally {
            setLoading(false)
        }
    }

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'Package':
                return <Package size={24} className="text-blue-500" />
            case 'CheckCircle':
                return <CheckCircle size={24} className="text-green-500" />
            case 'Star':
                return <Star size={24} className="text-yellow-500" />
            case 'AlertTriangle':
                return <AlertTriangle size={24} className="text-orange-500" />
            default:
                return <Package size={24} className="text-blue-500" />
        }
    }

    const getIconBg = (iconName: string) => {
        switch (iconName) {
            case 'Package':
                return 'bg-blue-500/10'
            case 'CheckCircle':
                return 'bg-green-500/10'
            case 'Star':
                return 'bg-yellow-500/10'
            case 'AlertTriangle':
                return 'bg-orange-500/10'
            default:
                return 'bg-blue-500/10'
        }
    }

    return (
        <VendorLayout
            title="Vendor Dashboard"
            description={data?.vendor ? `Welcome back, ${data.vendor.name}` : "Manage your store"}
        >
            {loading ? (
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin h-8 w-8 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {data?.stats.map((stat, index) => (
                            <div key={index} className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start justify-between shadow-sm">
                                <div>
                                    <p className="text-tride-text-muted text-sm font-medium mb-1">{stat.title}</p>
                                    <div className="text-3xl font-bold text-tride-text mb-2">{stat.value}</div>
                                    <div className="text-sm font-medium text-green-500 flex items-center gap-1">
                                        <TrendingUp size={14} /> {stat.trend}
                                    </div>
                                </div>
                                <div className={`w-12 h-12 ${getIconBg(stat.icon)} rounded-2xl flex items-center justify-center`}>
                                    {getIcon(stat.icon)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Vendor Info Card */}
                    {data?.vendor && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            <div className="lg:col-span-1 bg-tride-card border border-tride-border p-6 rounded-3xl">
                                <h3 className="text-lg font-bold text-tride-text mb-4">Store Overview</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-tride-text-muted">Total Orders</span>
                                        <span className="font-bold text-tride-text">{data.vendor.total_orders}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-tride-text-muted">Total Revenue</span>
                                        <span className="font-bold text-green-500">${Number(data.vendor.total_revenue).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-tride-text-muted">Rating</span>
                                        <div className="flex items-center gap-1">
                                            <Star size={16} className="text-yellow-400" fill="currentColor" />
                                            <span className="font-bold text-tride-text">{Number(data.vendor.rating).toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Products */}
                            <div className="lg:col-span-2 bg-tride-card border border-tride-border p-6 rounded-3xl">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-tride-text">Recent Products</h3>
                                    <button 
                                        onClick={() => router.visit("/vendor/products")}
                                        className="text-sm text-tride-yellow hover:text-tride-yellow/80"
                                    >
                                        View All →
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {data.recentProducts && data.recentProducts.length > 0 ? (
                                        data.recentProducts.map((product) => (
                                            <div key={product.id} className="flex items-center justify-between p-3 bg-tride-hover rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-tride-dark rounded-lg flex items-center justify-center overflow-hidden">
                                                        {product.image ? (
                                                            <img src={`/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package size={18} className="text-tride-text-muted" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-tride-text">{product.name}</div>
                                                        <div className="text-xs text-tride-text-muted">Stock: {product.stock}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-tride-text">${Number(product.price).toFixed(2)}</div>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-tride-text-muted">
                                            <Package size={48} className="mx-auto mb-2 opacity-50" />
                                            <p>No products yet</p>
                                            <button 
                                                onClick={() => router.visit("/vendor/products")}
                                                className="mt-2 text-sm text-tride-yellow hover:text-tride-yellow/80"
                                            >
                                                Add your first product →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </VendorLayout>
    )
}
