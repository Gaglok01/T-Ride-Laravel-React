import { useState, useEffect } from "react"
import { Tag, Image, Plus, Pencil } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput } from "@/components/ui/modal"

interface CategoryData {
    id?: number
    name: string
    slug?: string
    icon?: string
    status?: boolean | number
}

interface CategoryModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: CategoryData | null
}

export function CategoryModal({ isOpen, onClose, onSave, initialData }: CategoryModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [icon, setIcon] = useState("")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setIcon(initialData.icon || "")
            } else {
                setName("")
                setIcon("")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name) {
            setError("Category name is required.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                name,
                icon
            }
            await onSave(data)
            onClose()
        } catch (err: any) {
            console.error(err)
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Something went wrong. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Category" : "Add New Category"}
            description={initialData ? "Update category details." : "Create a new category for your products."}
            icon={initialData ? <Pencil size={20} /> : <Plus size={20} />}
            size="md"
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Category" : "Create Category")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalInput
                    label="Category Name"
                    icon={<Tag size={16} />}
                    placeholder="e.g. Electronics"
                    value={name}
                    onChange={setName}
                    required
                />

                <ModalInput
                    label="Icon (Class or URL)"
                    icon={<Image size={16} />}
                    placeholder="e.g. fa-solid fa-car or https://..."
                    value={icon}
                    onChange={setIcon}
                />
            </div>
        </Modal>
    )
}
