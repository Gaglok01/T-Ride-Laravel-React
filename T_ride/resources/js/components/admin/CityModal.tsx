import { useState, useEffect } from "react"
import { Building, Globe, Clock, DollarSign, Tag, Plus, Pencil } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface CityData {
    id?: number
    name: string
    country: string
    timezone?: string
    currency?: string
    services?: string[]
    status: 'active' | 'inactive'
}

interface CityModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: CityData | null
}

const availableServices = ["Ride", "Delivery", "Courier", "Rental"]

export function CityModal({ isOpen, onClose, onSave, initialData }: CityModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [country, setCountry] = useState("")
    const [timezone, setTimezone] = useState("")
    const [currency, setCurrency] = useState("")
    const [services, setServices] = useState<string[]>([])
    const [status, setStatus] = useState<'active' | 'inactive'>("active")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setCountry(initialData.country || "")
                setTimezone(initialData.timezone || "")
                setCurrency(initialData.currency || "")
                setServices(initialData.services || [])
                setStatus(initialData.status || "active")
            } else {
                setName("")
                setCountry("")
                setTimezone("")
                setCurrency("")
                setServices([])
                setStatus("active")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleServiceToggle = (service: string) => {
        if (services.includes(service)) {
            setServices(services.filter(s => s !== service))
        } else {
            setServices([...services, service])
        }
    }

    const handleSubmit = async () => {
        if (!name || !country) {
            setError("City name and country are required.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                name,
                country,
                timezone: timezone || null,
                currency: currency || null,
                services,
                status
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
            title={initialData ? "Edit City" : "Add New City"}
            description={initialData ? "Update city details." : "Add a new operational city."}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update City" : "Add City")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="City Name"
                        icon={<Building size={16} />}
                        placeholder="e.g. Accra"
                        value={name}
                        onChange={setName}
                        required
                    />
                    <ModalInput
                        label="Country"
                        icon={<Globe size={16} />}
                        placeholder="e.g. Ghana"
                        value={country}
                        onChange={setCountry}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Timezone"
                        icon={<Clock size={16} />}
                        placeholder="e.g. Africa/Accra"
                        value={timezone}
                        onChange={setTimezone}
                    />
                    <ModalInput
                        label="Currency"
                        icon={<DollarSign size={16} />}
                        placeholder="e.g. GHS"
                        value={currency}
                        onChange={setCurrency}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Services</label>
                    <div className="flex flex-wrap gap-2">
                        {availableServices.map(service => (
                            <button
                                key={service}
                                type="button"
                                onClick={() => handleServiceToggle(service)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                    services.includes(service)
                                        ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                                        : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                }`}
                            >
                                {service}
                            </button>
                        ))}
                    </div>
                </div>

                <ModalSelect
                    label="Status"
                    placeholder="Select Status"
                    value={status}
                    onChange={(val) => setStatus(val as 'active' | 'inactive')}
                    options={[
                        { label: "Active", value: "active" },
                        { label: "Inactive", value: "inactive" }
                    ]}
                    required
                    icon={<Tag size={16} />}
                />
            </div>
        </Modal>
    )
}
