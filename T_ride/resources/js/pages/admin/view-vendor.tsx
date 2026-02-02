import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, Store, Package, Star, MapPin, DollarSign, Mail, Phone, CheckCircle, XCircle, Edit, Trash2 } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { router } from "@inertiajs/react"
import axios from "@/lib/axios"

interface Product {
    id: number
    name: string
    description?: string
    price: number
    sale_price?: number
    stock: number
    image?: string
    is_featured: boolean
    is_active: boolean
}

interface VendorUser {
    id: number
    name: string
    email: string
    phone_number?: string
}

interface Category {
    id: number
    name: string
}

interface Vendor {
    id: number
    name: string
    address: string
    logo?: string
    category_id: number
    category?: Category
    user?: VendorUser
    products: Product[]
    commission_rate: number
    total_orders: number
    total_revenue: number
    rating: number
    is_open: boolean
    created_at: string
}

interface ViewVendorProps {
    id: string
}

export default function ViewVendor({ id }: ViewVendorProps) {
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchVendor()
    }, [id])

    const fetchVendor = async () => {
        try {
            const response = await axios.get(`/admin/vendors/${id}`)
            if (response.data.status) {
                setVendor(response.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch vendor:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <AdminLayout title="Vendor Details">
                <div className="flex items-center justify-center p-20">
                    <div className="animate-spin h-8 w-8 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!vendor) {
        return (
            <AdminLayout title="Vendor Details">
                <div className="text-center py-20">
                    <Store size={48} className="mx-auto mb-4 text-tride-text-muted opacity-50" />
                    <h3 className="text-xl font-bold text-tride-text mb-2">Vendor Not Found</h3>
                    <Button onClick={() => router.visit("/admin/vendors")}>
                        <ArrowLeft size={16} className="mr-2" /> Back to Vendors
                    </Button>
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Vendor Details"
            description={vendor.name}
            actions={
                <Button onClick={() => router.visit("/admin/vendors")} variant="secondary">
                    <ArrowLeft size={16} className="mr-2" /> Back to Vendors
                </Button>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vendor Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Main Info */}
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-20 h-20 bg-tride-hover rounded-2xl flex items-center justify-center overflow-hidden">
                                {vendor.logo ? (
                                    <img src={`/storage/${vendor.logo}`} alt={vendor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Store size={32} className="text-tride-text-muted" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-tride-text">{vendor.name}</h2>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${vendor.is_open ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {vendor.is_open ? 'Open' : 'Closed'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-tride-text-muted">
                                <MapPin size={18} />
                                <span className="text-sm">{vendor.address}</span>
                            </div>
                            {vendor.category && (
                                <div className="flex items-center gap-3 text-tride-text-muted">
                                    <Store size={18} />
                                    <span className="text-sm">{vendor.category.name}</span>
                                </div>
                            )}
                            {vendor.user?.email && (
                                <div className="flex items-center gap-3 text-tride-text-muted">
                                    <Mail size={18} />
                                    <span className="text-sm">{vendor.user.email}</span>
                                </div>
                            )}
                            {vendor.user?.phone_number && (
                                <div className="flex items-center gap-3 text-tride-text-muted">
                                    <Phone size={18} />
                                    <span className="text-sm">{vendor.user.phone_number}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <h3 className="text-lg font-bold text-tride-text mb-4">Performance</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-tride-text-muted">Total Orders</span>
                                <span className="font-bold text-tride-text">{vendor.total_orders}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-tride-text-muted">Total Revenue</span>
                                <span className="font-bold text-green-500">${Number(vendor.total_revenue).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-tride-text-muted">Commission Rate</span>
                                <span className="font-bold text-tride-text">{vendor.commission_rate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-tride-text-muted">Rating</span>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-400" fill="currentColor" />
                                    <span className="font-bold text-tride-text">{Number(vendor.rating).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products List */}
                <div className="lg:col-span-2">
                    <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden">
                        <div className="p-6 border-b border-tride-border">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-tride-text flex items-center gap-2">
                                    <Package size={20} />
                                    Vendor Products ({vendor.products?.length || 0})
                                </h3>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            {vendor.products && vendor.products.length > 0 ? (
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                            <th className="px-6 py-4 font-medium">Product</th>
                                            <th className="px-6 py-4 font-medium">Price</th>
                                            <th className="px-6 py-4 font-medium">Stock</th>
                                            <th className="px-6 py-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-tride-border">
                                        {vendor.products.map(product => (
                                            <tr key={product.id} className="hover:bg-tride-hover transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-tride-hover rounded-lg flex items-center justify-center overflow-hidden">
                                                            {product.image ? (
                                                                <img src={`/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package size={18} className="text-tride-text-muted" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-tride-text">{product.name}</div>
                                                            {product.is_featured && (
                                                                <span className="text-xs text-yellow-400">★ Featured</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-tride-text">${Number(product.price).toFixed(2)}</div>
                                                    {product.sale_price && (
                                                        <div className="text-xs text-green-400 line-through">${Number(product.sale_price).toFixed(2)}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-mono ${product.stock < 10 ? 'text-orange-400' : 'text-tride-text'}`}>
                                                        {product.stock}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {product.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-12 text-tride-text-muted">
                                    <Package size={48} className="mx-auto mb-4 opacity-50" />
                                    <p className="font-medium">No products yet</p>
                                    <p className="text-sm">This vendor hasn't added any products</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
