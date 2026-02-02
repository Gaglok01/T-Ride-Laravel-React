import { useState, useEffect } from "react"
import { VendorLayout } from "@/layouts/vendor-layout"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { ProductModal } from "@/components/vendor/ProductModal"
import axios from "@/lib/axios"

interface Product {
    id: number
    name: string
    description?: string
    price: number
    sale_price?: number
    stock: number
    sku?: string
    image?: string
    is_featured: boolean
    is_active: boolean
    created_at: string
}

export default function VendorProducts() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null)
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [productToDelete, setProductToDelete] = useState<Product | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            const response = await axios.get("/vendor/products")
            if (response.data.status) {
                setProducts(response.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch products:", error)
        } finally {
            setLoading(false)
        }
    }

    const openCreateModal = () => {
        setEditingProduct(null)
        setIsModalOpen(true)
    }

    const openEditModal = (product: Product) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleSave = async (formData: FormData) => {
        if (editingProduct) {
            await axios.post(`/vendor/products/${editingProduct.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        } else {
            await axios.post("/vendor/products", formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
        }
        fetchProducts()
    }

    const confirmDelete = (product: Product) => {
        setProductToDelete(product)
        setIsDeleteModalOpen(true)
    }

    const handleDelete = async () => {
        if (!productToDelete) return
        
        try {
            setIsDeleting(true)
            await axios.delete(`/vendor/products/${productToDelete.id}`)
            fetchProducts()
            setIsDeleteModalOpen(false)
            setProductToDelete(null)
        } catch (error) {
            console.error("Failed to delete product:", error)
        } finally {
            setIsDeleting(false)
        }
    }

    const toggleStatus = async (product: Product) => {
        try {
            await axios.patch(`/vendor/products/${product.id}/status`)
            fetchProducts()
        } catch (error) {
            console.error("Failed to toggle status:", error)
        }
    }

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <VendorLayout
            title="Products"
            description="Manage your store products"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-tride-card border border-tride-border rounded-full pl-10 pr-4 py-2 text-sm text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <Button onClick={openCreateModal} className="flex-1 sm:flex-none justify-center gap-2">
                        <Plus size={18} />
                        Add Product
                    </Button>
                </div>
            }
        >
            {/* Products Table */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 font-medium">Featured</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-tride-text-muted">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="animate-spin h-5 w-5 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                                            Loading products...
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-tride-text-muted">
                                        <Package size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>No products found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-tride-hover transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-tride-hover rounded-2xl flex items-center justify-center overflow-hidden">
                                                    {product.image ? (
                                                        <img src={`/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package size={18} className="text-tride-text-muted" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-tride-text">{product.name}</div>
                                                    {product.sku && <div className="text-xs text-tride-text-muted">SKU: {product.sku}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-tride-text">${Number(product.price).toFixed(2)}</div>
                                            {product.sale_price && (
                                                <div className="text-xs text-green-400">Sale: ${Number(product.sale_price).toFixed(2)}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-mono ${product.stock < 10 ? 'text-orange-400' : 'text-tride-text'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.is_featured ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {product.is_featured ? 'Featured' : 'Normal'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleStatus(product)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                                    product.is_active 
                                                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                                                        : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                                }`}
                                            >
                                                {product.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <IconButton tooltip="Edit" onClick={() => openEditModal(product)}>
                                                    <Edit size={16} />
                                                </IconButton>
                                                <IconButton tooltip="Delete" variant="danger" onClick={() => confirmDelete(product)}>
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

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingProduct}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Product"
                description="Are you sure you want to permanently delete this product?"
                itemName={productToDelete?.name}
                isLoading={isDeleting}
            />
        </VendorLayout>
    )
}
