import { useState, useEffect } from "react"
import { Navigation, Building, DollarSign, FileText, Tag, Plus, Pencil } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/modal"
import { City } from "@/services/cityZoneService"

interface ServiceZoneData {
    id?: number
    city_id: number
    name: string
    description?: string
    price_multiplier: number
    status: 'active' | 'inactive'
}

interface ServiceZoneModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: ServiceZoneData | null
    cities: City[]
}

export function ServiceZoneModal({ isOpen, onClose, onSave, initialData, cities }: ServiceZoneModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [cityId, setCityId] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [priceMultiplier, setPriceMultiplier] = useState("1.0")
    const [status, setStatus] = useState<'active' | 'inactive'>("active")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCityId(initialData.city_id ? initialData.city_id.toString() : "")
                setName(initialData.name || "")
                setDescription(initialData.description || "")
                setPriceMultiplier(initialData.price_multiplier ? initialData.price_multiplier.toString() : "1.0")
                setStatus(initialData.status || "active")
            } else {
                setCityId(cities.length > 0 ? cities[0].id.toString() : "")
                setName("")
                setDescription("")
                setPriceMultiplier("1.0")
                setStatus("active")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData, cities])

    const handleSubmit = async () => {
        if (!cityId || !name || !priceMultiplier) {
            setError("City, zone name, and price multiplier are required.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                city_id: parseInt(cityId),
                name,
                description: description || null,
                price_multiplier: parseFloat(priceMultiplier),
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
            title={initialData ? "Edit Service Zone" : "Add Service Zone"}
            description={initialData ? "Update zone details." : "Add a new service zone within a city."}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Zone" : "Add Zone")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalSelect
                    label="City"
                    placeholder="Select City"
                    value={cityId}
                    onChange={setCityId}
                    options={cities.map(city => ({ label: `${city.name}, ${city.country}`, value: city.id.toString() }))}
                    required
                    icon={<Building size={16} />}
                />

                <ModalInput
                    label="Zone Name"
                    icon={<Navigation size={16} />}
                    placeholder="e.g. Central Business District"
                    value={name}
                    onChange={setName}
                    required
                />

                <ModalTextarea
                    label="Description"
                    placeholder="Optional description of this zone..."
                    value={description}
                    onChange={setDescription}
                    rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Price Multiplier"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="1.0"
                        value={priceMultiplier}
                        onChange={setPriceMultiplier}
                        required
                    />

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
            </div>
        </Modal>
    )
}
