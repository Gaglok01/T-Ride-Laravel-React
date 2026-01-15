import { useState, useEffect } from "react"
import { Tag, Calendar, Hash, DollarSign, List, Percent, Plus } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { ModalDatePicker } from "@/components/ui/date-picker"

interface Promotion {
    id?: number
    code: string
    type: "percentage" | "fixed"
    value: number
    max_uses: number
    valid_until: string
    status?: "active" | "paused" | "expired"
}

interface PromotionModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: Promotion | null
}

export function PromotionModal({ isOpen, onClose, onSave, initialData }: PromotionModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [code, setCode] = useState("")
    const [type, setType] = useState<"percentage" | "fixed">("percentage")
    const [value, setValue] = useState("")
    const [maxUses, setMaxUses] = useState("")
    const [validUntil, setValidUntil] = useState("")
    const [status, setStatus] = useState<"active" | "paused">("active")

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCode(initialData.code)
                setType(initialData.type)
                setValue(initialData.value.toString())
                setMaxUses(initialData.max_uses.toString())
                // Ensure date format YYYY-MM-DD
                setValidUntil(initialData.valid_until ? initialData.valid_until.split('T')[0] : "")
                setStatus(initialData.status === 'expired' ? 'active' : (initialData.status as "active" | "paused") || 'active')
            } else {
                setCode("")
                setType("percentage")
                setValue("")
                setMaxUses("")
                setValidUntil("")
                setStatus("active")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!code || !value || !maxUses || !validUntil) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data: any = {
                code,
                type,
                value: parseFloat(value),
                max_uses: parseInt(maxUses),
                valid_until: validUntil,
                status
            }
            
            // If editing, we might need method spoofing if the parent handles it as POST, 
            // but usually we pass the plain object and let the parent handle the API call method.
            // The DriverModal used FormData because of file upload. Here JSON is likely fine.

            await onSave(data)
            onClose()
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || err.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Promotion" : "Create Promotion"}
            description={initialData ? "Update promotion details." : "Create a new discount code."}
            icon={initialData ? <Tag size={20} /> : <Plus size={20} />}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Promotion" : "Create Promotion")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalInput
                    label="Promo Code"
                    icon={<Hash size={16} />}
                    placeholder="SUMMER2024"
                    value={code}
                    onChange={(val) => setCode(val.toUpperCase())}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <ModalSelect
                        label="Type"
                        value={type}
                        onChange={(val) => setType(val as "percentage" | "fixed")}
                        options={[{ label: "Percentage", value: "percentage" }, { label: "Fixed Amount", value: "fixed" }]}
                        required
                        icon={type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                    />
                    <ModalInput
                        label={type === 'percentage' ? "Percentage Off (%)" : "Discount Amount ($)"}
                        icon={type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                        type="number"
                        placeholder={type === 'percentage' ? "25" : "10.00"}
                        value={value}
                        onChange={setValue}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput
                        label="Max Uses"
                        icon={<List size={16} />}
                        type="number"
                        placeholder="1000"
                        value={maxUses}
                        onChange={setMaxUses}
                        required
                    />
                    <ModalDatePicker
                        label="Valid Until"
                        value={validUntil}
                        onChange={setValidUntil}
                        required
                        minDate={new Date()}
                    />
                </div>
                
                {initialData && (
                     <ModalSelect
                        label="Status"
                        value={status}
                        onChange={(val) => setStatus(val as "active" | "paused")}
                        options={[{ label: "Active", value: "active" }, { label: "Paused", value: "paused" }]}
                        required
                        icon={<Tag size={16} />}
                    />
                )}
            </div>
        </Modal>
    )
}
