import { useState, useEffect } from "react"
import { Modal, ModalButton, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/modal"
import axios from "@/lib/axios"
import { Calendar, Tag, DollarSign, Type, Monitor } from "lucide-react"
import { ModalDateRangePicker } from "@/components/ui/date-range-picker"

interface CreateCampaignModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    campaignToEdit?: any // If editing (optional)
}

export function CreateCampaignModal({ isOpen, onClose, onSuccess, campaignToEdit }: CreateCampaignModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        type: "general",
        status: "draft",
        start_date: "",
        end_date: "",
        budget: "",
        description: ""
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (campaignToEdit) {
            setFormData({
                name: campaignToEdit.name,
                type: campaignToEdit.type,
                status: campaignToEdit.status,
                start_date: campaignToEdit.start_date ? campaignToEdit.start_date.split('T')[0] : "",
                end_date: campaignToEdit.end_date ? campaignToEdit.end_date.split('T')[0] : "",
                budget: campaignToEdit.budget,
                description: campaignToEdit.description || ""
            })
        } else {
            // Reset form
            setFormData({
                name: "",
                type: "general",
                status: "draft",
                start_date: "",
                end_date: "",
                budget: "",
                description: ""
            })
        }
        setError("")
    }, [isOpen, campaignToEdit])

    const handleSubmit = async () => {
        setError("")
        
        // Basic validation
        if (!formData.name || !formData.budget || !formData.start_date) {
            setError("Please fill in all required fields.")
            return
        }

        setIsLoading(true)
        try {
            if (campaignToEdit) {
                await axios.put(`/admin/referral-campaigns/${campaignToEdit.id}`, formData)
            } else {
                await axios.post("/admin/referral-campaigns", formData)
            }
            onSuccess()
            onClose()
        } catch (err: any) {
            console.error(err)
            setError(err.response?.data?.message || "Something went wrong. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={campaignToEdit ? "Edit Campaign" : "Create Campaign"}
            description={campaignToEdit ? "Update campaign details" : "Set up a new referral campaign"}
            icon={<Tag size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </ModalButton>
                    <ModalButton onClick={handleSubmit} isLoading={isLoading}>
                        {campaignToEdit ? "Update Campaign" : "Create Campaign"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <ModalInput
                    label="Campaign Name"
                    placeholder="e.g. Summer Driver Bonus"
                    value={formData.name}
                    onChange={(val) => setFormData({ ...formData, name: val })}
                    required
                    icon={<Type size={16} />}
                />

                <div className="grid grid-cols-2 gap-4">
                    <ModalSelect
                        label="Type"
                        value={formData.type}
                        onChange={(val) => setFormData({ ...formData, type: val })}
                        options={[
                            { label: "General", value: "general" },
                            { label: "Driver Focused", value: "driver" },
                            { label: "User Focused", value: "user" }
                        ]}
                        required
                    />

                    <ModalSelect
                        label="Status"
                        value={formData.status}
                        onChange={(val) => setFormData({ ...formData, status: val })}
                        options={[
                            { label: "Draft", value: "draft" },
                            { label: "Active", value: "active" },
                            { label: "Scheduled", value: "scheduled" },
                            { label: "Paused", value: "paused" },
                            { label: "Ended", value: "ended" }
                        ]}
                        required
                    />
                </div>

                <ModalInput
                    label="Budget ($)"
                    placeholder="5000"
                    type="number"
                    value={formData.budget}
                    onChange={(val) => setFormData({ ...formData, budget: val })}
                    required
                    icon={<DollarSign size={16} />}
                />

                <ModalDateRangePicker
                    label="Campaign Duration"
                    startDate={formData.start_date}
                    endDate={formData.end_date}
                    onChange={(start, end) => setFormData({ ...formData, start_date: start, end_date: end })}
                    required
                />

                <ModalTextarea
                    label="Description"
                    placeholder="Describe the campaign objectives..."
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    rows={3}
                />
            </div>
        </Modal>
    )
}
