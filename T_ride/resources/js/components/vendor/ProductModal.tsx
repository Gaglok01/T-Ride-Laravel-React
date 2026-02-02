import { useState, useEffect } from "react"
import { Package, FileText, DollarSign, Tag, Box, Upload, Plus } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalTextarea } from "@/components/ui/modal"

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

interface ProductModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (formData: FormData) => Promise<void>
    initialData?: Product | null
}

export function ProductModal({ isOpen, onClose, onSave, initialData }: ProductModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [salePrice, setSalePrice] = useState("")
    const [stock, setStock] = useState("")
    const [sku, setSku] = useState("")
    const [isFeatured, setIsFeatured] = useState(false)
    const [image, setImage] = useState<File | null>(null)

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name)
                setDescription(initialData.description || "")
                setPrice(initialData.price.toString())
                setSalePrice(initialData.sale_price?.toString() || "")
                setStock(initialData.stock.toString())
                setSku(initialData.sku || "")
                setIsFeatured(initialData.is_featured)
                setImage(null)
            } else {
                setName("")
                setDescription("")
                setPrice("")
                setSalePrice("")
                setStock("")
                setSku("")
                setIsFeatured(false)
                setImage(null)
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !price) {
            setError("Product Name and Price are required.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("description", description)
            formData.append("price", price)
            if (salePrice) formData.append("sale_price", salePrice)
            formData.append("stock", stock || "0")
            if (sku) formData.append("sku", sku)
            formData.append("is_featured", isFeatured ? "1" : "0")

            if (image) {
                formData.append("image", image)
            }

            // Method spoofing not needed here as parent handles the API call logic
            // But usually parent appends _method if editing. I'll let parent handle that 
            // OR I can prepare FormData strictly based on fields.
            // DriverModal logic:
            /*
             if (initialData) {
                  formData.append("_method", "PUT")
              }
            */
            // I'll add it here to be consistent with DriverModal logic which handles FormData preparation
            if (initialData) {
                formData.append("_method", "PUT")
            }

            await onSave(formData)
            onClose()
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || err.message || "Failed to save product")
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Product" : "Add New Product"}
            description={initialData ? "Update product details." : "Add a new product to your store."}
            icon={initialData ? <Package size={20} /> : <Plus size={20} />}
            size="lg"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </ModalButton>
                    <ModalButton
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText={initialData ? "Updating..." : "Creating..."}
                    >
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Product" : "Create Product")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalInput
                    label="Product Name"
                    icon={<Package size={16} />}
                    placeholder="e.g. Wireless Headphones"
                    value={name}
                    onChange={setName}
                    required
                />

                <ModalTextarea
                    label="Description"
                    placeholder="Enter product description..."
                    value={description}
                    onChange={setDescription}
                    rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Price"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={setPrice}
                        required
                    />
                    <ModalInput
                        label="Sale Price"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="0.00"
                        value={salePrice}
                        onChange={setSalePrice}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Stock"
                        icon={<Box size={16} />}
                        type="number"
                        placeholder="0"
                        value={stock}
                        onChange={setStock}
                    />
                    <ModalInput
                        label="SKU"
                        icon={<Tag size={16} />}
                        placeholder="SKU-001"
                        value={sku}
                        onChange={setSku}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Product Image
                    </label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-tride-yellow/30 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                            {image ? (
                                <>
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 mb-2">
                                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-emerald-400 font-medium text-sm">{image.name}</span>
                                </>
                            ) : (
                                initialData?.image ? (
                                    <>
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 mb-2">
                                            <img src={`/storage/${initialData.image}`} alt="Current" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-gray-400 text-sm">Click to change</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} className="mb-1 opacity-50" />
                                        <span className="text-sm">Click to upload image</span>
                                        <span className="text-xs opacity-50">(JPG, PNG, max 2MB)</span>
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-tride-hover border border-tride-border rounded-xl">
                    <input
                        type="checkbox"
                        id="is_featured"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-5 h-5 rounded accent-tride-yellow cursor-pointer"
                    />
                    <label htmlFor="is_featured" className="text-tride-text cursor-pointer select-none">
                        Mark as Featured Product
                    </label>
                </div>
            </div>
        </Modal>
    )
}
