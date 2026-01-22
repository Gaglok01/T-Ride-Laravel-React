import { useState, useEffect } from "react"
import { Users, Store, Percent, Hash, FileText, Tag, Plus, Pencil } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

export interface CommissionTierData {
    id?: number
    type: 'driver' | 'vendor'
    name: string
    min_threshold: number
    max_threshold: number | null
    rate: number
    description: string | null
}

interface CommissionTierModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: Partial<CommissionTierData>) => Promise<void>
    initialData?: CommissionTierData | null
    tierType: 'driver' | 'vendor'
}

export function CommissionTierModal({ isOpen, onClose, onSave, initialData, tierType }: CommissionTierModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [minThreshold, setMinThreshold] = useState("")
    const [maxThreshold, setMaxThreshold] = useState("")
    const [rate, setRate] = useState("")
    const [description, setDescription] = useState("")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setMinThreshold(initialData.min_threshold?.toString() || "")
                setMaxThreshold(initialData.max_threshold?.toString() || "")
                setRate(initialData.rate?.toString() || "")
                setDescription(initialData.description || "")
            } else {
                setName("")
                setMinThreshold("")
                setMaxThreshold("")
                setRate("")
                setDescription("")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const getTypeLabel = () => {
        return tierType === 'driver' ? 'Driver' : 'Vendor'
    }

    const getTypeIcon = () => {
        return tierType === 'driver' ? <Users size={16} /> : <Store size={16} />
    }

    const getThresholdLabel = () => {
        return tierType === 'driver' ? 'trips/month' : 'orders/month'
    }

    const handleSubmit = async () => {
        if (!name || !minThreshold || !rate) {
            setError("Tier name, minimum threshold, and rate are required.")
            return
        }

        const minVal = parseInt(minThreshold)
        if (isNaN(minVal) || minVal < 0) {
            setError("Minimum threshold must be a valid positive number.")
            return
        }

        const rateVal = parseFloat(rate)
        if (isNaN(rateVal)) {
            setError("Rate must be a valid number.")
            return
        }

        if (maxThreshold) {
            const maxVal = parseInt(maxThreshold)
            if (isNaN(maxVal) || maxVal <= minVal) {
                setError("Maximum threshold must be greater than minimum threshold.")
                return
            }
        }

        setLoading(true)
        setError("")

        try {
            const data: Partial<CommissionTierData> = {
                type: tierType,
                name,
                min_threshold: minVal,
                max_threshold: maxThreshold ? parseInt(maxThreshold) : null,
                rate: rateVal,
                description: description || null
            }

            await onSave(data)
            onClose()
        } catch (err: any) {
            console.error(err)
            if (err.response?.data?.errors) {
                const firstErrorKey = Object.keys(err.response.data.errors)[0]
                setError(err.response.data.errors[firstErrorKey][0])
            } else if (err.response?.data?.message) {
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
            title={initialData ? `Edit ${getTypeLabel()} Tier` : `Add ${getTypeLabel()} Tier`}
            description={initialData ? "Update commission tier details." : `Create a new ${getTypeLabel().toLowerCase()} commission tier.`}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Tier" : "Add Tier")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalInput
                    label="Tier Name"
                    icon={getTypeIcon()}
                    placeholder={tierType === 'driver' ? "e.g. Bronze, Silver, Gold" : "e.g. Starter, Partner, Premium"}
                    value={name}
                    onChange={setName}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label={`Min Threshold (${getThresholdLabel()})`}
                        icon={<Hash size={16} />}
                        type="number"
                        placeholder="e.g. 0"
                        value={minThreshold}
                        onChange={setMinThreshold}
                        required
                    />
                    <ModalInput
                        label={`Max Threshold (${getThresholdLabel()})`}
                        icon={<Hash size={16} />}
                        type="number"
                        placeholder="e.g. 50 (leave empty for unlimited)"
                        value={maxThreshold}
                        onChange={setMaxThreshold}
                    />
                </div>

                <ModalInput
                    label={tierType === 'vendor' ? "Discount Rate (%)" : "Commission Rate (%)"}
                    icon={<Percent size={16} />}
                    type="number"
                    placeholder={tierType === 'vendor' ? "e.g. -5 for 5% discount" : "e.g. 15"}
                    value={rate}
                    onChange={setRate}
                    required
                />

                <ModalInput
                    label="Description (Optional)"
                    icon={<FileText size={16} />}
                    placeholder="Brief description of this tier..."
                    value={description}
                    onChange={setDescription}
                />
            </div>
        </Modal>
    )
}
