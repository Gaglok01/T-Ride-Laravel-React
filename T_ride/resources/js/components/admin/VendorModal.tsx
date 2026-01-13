import { useState, useEffect } from "react"
import { Store, MapPin, Percent, Image, Plus, Pencil, Layers } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface Category {
    id: number
    name: string
}

interface VendorData {
    id?: number
    name: string
    address: string
    category_id: number | string
    commission_rate: number | string
    logo?: string
    is_open?: boolean
}

interface VendorModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (formData: FormData) => Promise<void>
    initialData?: VendorData | null
    categories: Category[]
}

export function VendorModal({ isOpen, onClose, onSave, initialData, categories }: VendorModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [address, setAddress] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [commissionRate, setCommissionRate] = useState("")
    const [logo, setLogo] = useState<File | null>(null)

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setAddress(initialData.address || "")
                setCategoryId(initialData.category_id?.toString() || "")
                setCommissionRate(initialData.commission_rate?.toString() || "")
                setLogo(null)
            } else {
                setName("")
                setAddress("")
                setCategoryId("")
                setCommissionRate("")
                setLogo(null)
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !address || !categoryId || !commissionRate) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const formData = new FormData()
            formData.append("name", name)
            formData.append("address", address)
            formData.append("category_id", categoryId)
            formData.append("commission_rate", commissionRate)
            
            if (logo) {
                formData.append("logo", logo)
            }
            
            // If editing, needed for Laravel method spoofing if using POST for update
             if (initialData) {
                formData.append("_method", "PUT")
            }

            await onSave(formData)
            onClose()
        } catch (err: any) {
            console.error(err)
            if (err.response?.data?.errors) {
                const errors = err.response.data.errors
                const firstError = Object.values(errors)[0]
                setError(Array.isArray(firstError) ? firstError[0] : firstError as string)
            } else {
                setError(err.response?.data?.message || "Something went wrong. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    const categoryOptions = categories.map(cat => ({
        label: cat.name,
        value: cat.id.toString()
    }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Vendor" : "Add New Vendor"}
            description={initialData ? "Update vendor details." : "Register a new vendor partner."}
            icon={initialData ? <Pencil size={20} /> : <Plus size={20} />}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Vendor" : "Create Vendor")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Vendor Name"
                        icon={<Store size={16} />}
                        placeholder="e.g. Burger King"
                        value={name}
                        onChange={setName}
                        required
                    />
                    <ModalSelect
                        label="Category"
                        placeholder="Select Category"
                        value={categoryId}
                        onChange={setCategoryId}
                        options={categoryOptions}
                        required
                        icon={<Layers size={16} />}
                    />
                </div>

                <ModalInput
                    label="Address"
                    icon={<MapPin size={16} />}
                    placeholder="e.g. 123 Main St, New York"
                    value={address}
                    onChange={setAddress}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <ModalInput
                        label="Commission Rate (%)"
                        icon={<Percent size={16} />}
                        type="number"
                        placeholder="e.g. 15"
                        value={commissionRate}
                        onChange={setCommissionRate}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Vendor Logo
                    </label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-tride-yellow/30 transition-colors cursor-pointer relative">
                        <input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => setLogo(e.target.files?.[0] || null)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                             {logo ? (
                                <>
                                     <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-2">
                                        <img src={URL.createObjectURL(logo)} alt="Preview" className="w-full h-full object-cover" />
                                     </div>
                                     <span className="text-emerald-400 font-medium text-sm">{logo.name}</span>
                                </>
                            ) : (
                                initialData?.logo ? (
                                   <>
                                     <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-2">
                                        <img src={`/storage/${initialData.logo}`} alt="Current" className="w-full h-full object-cover" />
                                     </div>
                                     <span className="text-gray-400 text-sm">Click to change</span>
                                   </>
                                ) : (
                                  <>
                                      <Image size={24} className="mb-1 opacity-50" />
                                      <span className="text-sm">Click to upload logo</span>
                                  </>
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
