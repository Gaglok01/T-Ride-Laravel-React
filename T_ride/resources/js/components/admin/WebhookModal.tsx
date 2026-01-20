
import { useState, useEffect } from "react"
import { Globe, Link, Activity, Zap, Plus, Settings } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface WebhookModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: any
}

export function WebhookModal({ isOpen, onClose, onSave, initialData }: WebhookModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [url, setUrl] = useState("")
    const [eventType, setEventType] = useState("")
    const [status, setStatus] = useState("active")

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setUrl(initialData.url || "")
                setEventType(initialData.event_type || "")
                setStatus(initialData.status || "active")
            } else {
                setName("")
                setUrl("")
                setEventType("")
                setStatus("active")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !url || !eventType) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                name,
                url,
                event_type: eventType,
                status
            }

            await onSave(data)
            onClose()
        } catch (err: any) {
            console.error(err)
            const errorMsg = err.response?.data?.message || err.message || "Something went wrong"
             if (err.response?.data?.errors) {
                 const firstErrorKey = Object.keys(err.response.data.errors)[0];
                 setError(err.response.data.errors[firstErrorKey][0]);
            } else {
                setError(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Webhook" : "Add Webhook"}
            description={initialData ? "Update webhook configuration." : "Register a new webhook endpoint."}
            icon={initialData ? <Settings size={20} /> : <Zap size={20} />}
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
                        loadingText={initialData ? "Updating..." : "Saving..."}
                    >
                        {initialData ? "Update Webhook" : "Save Webhook"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalInput
                    label="Webhook Name"
                    icon={<Globe size={16} />}
                    placeholder="e.g. Payment Success Listener"
                    value={name}
                    onChange={setName}
                    required
                />
                
                <ModalInput
                    label="Endpoint URL"
                    icon={<Link size={16} />}
                    placeholder="https://api.example.com/webhooks/..."
                    value={url}
                    onChange={setUrl}
                    required
                />

                <ModalInput
                    label="Event Type"
                    icon={<Zap size={16} />}
                    placeholder="e.g. payment.success"
                    value={eventType}
                    onChange={setEventType}
                    required
                />

                <ModalSelect
                    label="Status"
                    placeholder="Select Status"
                    value={status}
                    onChange={setStatus}
                    options={[
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" }
                    ]}
                    required
                    icon={<Activity size={16} />}
                />
            </div>
        </Modal>
    )
}
