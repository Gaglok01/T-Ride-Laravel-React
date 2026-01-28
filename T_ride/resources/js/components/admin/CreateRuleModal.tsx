import { useState, useEffect } from "react"
import { Modal, ModalButton, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/modal"
import axios from "@/lib/axios"
import { Award, DollarSign } from "lucide-react"

interface CreateRuleModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    ruleToEdit?: any
}

export function CreateRuleModal({ isOpen, onClose, onSuccess, ruleToEdit }: CreateRuleModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        type: "referrer",
        trigger_event: "signup",
        reward_type: "fixed",
        reward_amount: "",
        is_active: true,
        description: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (ruleToEdit) {
            setFormData({
                name: ruleToEdit.name,
                type: ruleToEdit.type,
                trigger_event: ruleToEdit.trigger_event,
                reward_type: ruleToEdit.reward_type,
                reward_amount: ruleToEdit.reward_amount,
                is_active: ruleToEdit.is_active,
                description: ruleToEdit.description || ""
            })
        } else {
            setFormData({
                name: "",
                type: "referrer",
                trigger_event: "signup",
                reward_type: "fixed",
                reward_amount: "",
                is_active: true,
                description: ""
            })
        }
        setError("")
    }, [isOpen, ruleToEdit])

    const handleSubmit = async () => {
        setError("")
        if (!formData.name || !formData.reward_amount) {
            setError("Please fill in all required fields.")
            return
        }

        setIsLoading(true)
        try {
            if (ruleToEdit) {
                await axios.put(`/admin/referral-rules/${ruleToEdit.id}`, formData)
            } else {
                await axios.post("/admin/referral-rules", formData)
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
            title={ruleToEdit ? "Edit Rule" : "Create Reward Rule"}
            description={ruleToEdit ? "Update rule details" : "Set up a new referral reward rule"}
            icon={<Award size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</ModalButton>
                    <ModalButton onClick={handleSubmit} isLoading={isLoading}>
                        {ruleToEdit ? "Update Rule" : "Create Rule"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm">{error}</div>
                )}
                <ModalInput
                    label="Rule Name"
                    placeholder="e.g. First Ride Bonus"
                    value={formData.name}
                    onChange={(val) => setFormData({ ...formData, name: val })}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <ModalSelect
                        label="Reward For"
                        value={formData.type}
                        onChange={(val) => setFormData({ ...formData, type: val })}
                        options={[
                            { label: "Referrer (Who refers)", value: "referrer" },
                            { label: "Referee (New user)", value: "referee" }
                        ]}
                        required
                    />
                    <ModalSelect
                        label="Trigger Event"
                        value={formData.trigger_event}
                        onChange={(val) => setFormData({ ...formData, trigger_event: val })}
                        options={[
                            { label: "Signup Complete", value: "signup" },
                            { label: "First Ride", value: "first_ride" },
                            { label: "First Order", value: "first_order" },
                            { label: "KYC Verified", value: "kyc_verified" }
                        ]}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <ModalSelect
                        label="Reward Type"
                        value={formData.reward_type}
                        onChange={(val) => setFormData({ ...formData, reward_type: val })}
                        options={[
                            { label: "Fixed Amount ($)", value: "fixed" },
                            { label: "Percentage (%)", value: "percentage" },
                            { label: "Credit", value: "credit" },
                            { label: "Points", value: "points" }
                        ]}
                        required
                    />
                    <ModalInput
                        label="Reward Amount"
                        placeholder={formData.reward_type === 'percentage' ? "10" : "25"}
                        type="number"
                        value={formData.reward_amount}
                        onChange={(val) => setFormData({ ...formData, reward_amount: val })}
                        required
                        icon={<DollarSign size={16} />}
                    />
                </div>
                <ModalTextarea
                    label="Description"
                    placeholder="Describe when this rule applies..."
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    rows={2}
                />
            </div>
        </Modal>
    )
}
