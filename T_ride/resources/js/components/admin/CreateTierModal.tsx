import { useState, useEffect } from "react"
import { Modal, ModalButton, ModalInput, ModalTextarea } from "@/components/ui/modal"
import axios from "@/lib/axios"
import { Crown } from "lucide-react"

interface CreateTierModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    tierToEdit?: any
}

export function CreateTierModal({ isOpen, onClose, onSuccess, tierToEdit }: CreateTierModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        min_referrals: "",
        max_referrals: "",
        bonus_multiplier: "1.00",
        benefits: "",
        color: "Bronze"
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (tierToEdit) {
            setFormData({
                name: tierToEdit.name,
                min_referrals: tierToEdit.min_referrals,
                max_referrals: tierToEdit.max_referrals || "",
                bonus_multiplier: tierToEdit.bonus_multiplier,
                benefits: Array.isArray(tierToEdit.benefits) ? tierToEdit.benefits.join("\n") : "",
                color: tierToEdit.color || "Bronze"
            })
        } else {
            setFormData({
                name: "",
                min_referrals: "",
                max_referrals: "",
                bonus_multiplier: "1.00",
                benefits: "",
                color: "Bronze"
            })
        }
        setError("")
    }, [isOpen, tierToEdit])

    const handleSubmit = async () => {
        setError("")
        if (!formData.name || !formData.min_referrals || !formData.bonus_multiplier) {
            setError("Please fill in all required fields.")
            return
        }

        const payload = {
            ...formData,
            min_referrals: parseInt(formData.min_referrals),
            max_referrals: formData.max_referrals ? parseInt(formData.max_referrals) : null,
            bonus_multiplier: parseFloat(formData.bonus_multiplier),
            benefits: formData.benefits ? formData.benefits.split("\n").filter(b => b.trim()) : []
        }

        setIsLoading(true)
        try {
            if (tierToEdit) {
                await axios.put(`/admin/referrer-tiers/${tierToEdit.id}`, payload)
            } else {
                await axios.post("/admin/referrer-tiers", payload)
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={tierToEdit ? "Edit Tier" : "Create Referrer Tier"}
            description={tierToEdit ? "Update tier details" : "Set up a new referrer tier level"}
            icon={<Crown size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</ModalButton>
                    <ModalButton onClick={handleSubmit} isLoading={isLoading}>
                        {tierToEdit ? "Update Tier" : "Create Tier"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm">{error}</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <ModalInput
                        label="Tier Name"
                        placeholder="e.g. Gold"
                        value={formData.name}
                        onChange={(val) => setFormData({ ...formData, name: val })}
                        required
                    />
                    <ModalInput
                        label="Color Badge"
                        placeholder="e.g. Gold, Silver, Bronze"
                        value={formData.color}
                        onChange={(val) => setFormData({ ...formData, color: val })}
                    />
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <ModalInput
                        label="Min Referrals"
                        placeholder="0"
                        type="number"
                        value={formData.min_referrals}
                        onChange={(val) => setFormData({ ...formData, min_referrals: val })}
                        required
                    />
                    <ModalInput
                        label="Max Referrals"
                        placeholder="∞ (leave empty)"
                        type="number"
                        value={formData.max_referrals}
                        onChange={(val) => setFormData({ ...formData, max_referrals: val })}
                    />
                    <ModalInput
                        label="Bonus Multiplier"
                        placeholder="1.10 = 10% bonus"
                        type="number"
                        value={formData.bonus_multiplier}
                        onChange={(val) => setFormData({ ...formData, bonus_multiplier: val })}
                        required
                    />
                </div>
                <ModalTextarea
                    label="Benefits (one per line)"
                    placeholder="Priority support&#10;Exclusive rewards&#10;Early access"
                    value={formData.benefits}
                    onChange={(val) => setFormData({ ...formData, benefits: val })}
                    rows={3}
                />
            </div>
        </Modal>
    )
}
