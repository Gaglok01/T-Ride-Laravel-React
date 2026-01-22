import { useState, useEffect } from "react"
import { Plane, Train, Building, DollarSign, Users, Tag, Plus, Pencil, MapPin } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { City } from "@/services/cityZoneService"

interface TransportationHubData {
    id?: number
    city_id: number
    name: string
    type: 'airport' | 'hub' | 'station'
    pickup_fee: number
    queue_capacity: number
    status: 'active' | 'inactive'
}

interface TransportationHubModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: TransportationHubData | null
    cities: City[]
}

export function TransportationHubModal({ isOpen, onClose, onSave, initialData, cities }: TransportationHubModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [cityId, setCityId] = useState("")
    const [name, setName] = useState("")
    const [type, setType] = useState<'airport' | 'hub' | 'station'>("airport")
    const [pickupFee, setPickupFee] = useState("0.00")
    const [queueCapacity, setQueueCapacity] = useState("50")
    const [status, setStatus] = useState<'active' | 'inactive'>("active")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCityId(initialData.city_id ? initialData.city_id.toString() : "")
                setName(initialData.name || "")
                setType(initialData.type || "airport")
                setPickupFee(initialData.pickup_fee ? initialData.pickup_fee.toString() : "0.00")
                setQueueCapacity(initialData.queue_capacity ? initialData.queue_capacity.toString() : "50")
                setStatus(initialData.status || "active")
            } else {
                setCityId(cities.length > 0 ? cities[0].id.toString() : "")
                setName("")
                setType("airport")
                setPickupFee("0.00")
                setQueueCapacity("50")
                setStatus("active")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData, cities])

    const handleSubmit = async () => {
        if (!cityId || !name || !type) {
            setError("City, hub name, and type are required.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                city_id: parseInt(cityId),
                name,
                type,
                pickup_fee: parseFloat(pickupFee) || 0,
                queue_capacity: parseInt(queueCapacity) || 50,
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

    const getTypeIcon = () => {
        switch (type) {
            case 'airport': return <Plane size={16} />
            case 'station': return <Train size={16} />
            default: return <MapPin size={16} />
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Transportation Hub" : "Add Transportation Hub"}
            description={initialData ? "Update hub details." : "Add a new airport, station, or hub."}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Hub" : "Add Hub")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalSelect
                        label="City"
                        placeholder="Select City"
                        value={cityId}
                        onChange={setCityId}
                        options={cities.map(city => ({ label: `${city.name}, ${city.country}`, value: city.id.toString() }))}
                        required
                        icon={<Building size={16} />}
                    />

                    <ModalSelect
                        label="Hub Type"
                        placeholder="Select Type"
                        value={type}
                        onChange={(val) => setType(val as 'airport' | 'hub' | 'station')}
                        options={[
                            { label: "Airport", value: "airport" },
                            { label: "Hub / Mall", value: "hub" },
                            { label: "Station", value: "station" }
                        ]}
                        required
                        icon={getTypeIcon()}
                    />
                </div>

                <ModalInput
                    label="Hub Name"
                    icon={<MapPin size={16} />}
                    placeholder="e.g. Kotoka International Airport"
                    value={name}
                    onChange={setName}
                    required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Pickup Fee ($)"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="0.00"
                        value={pickupFee}
                        onChange={setPickupFee}
                    />

                    <ModalInput
                        label="Queue Capacity"
                        icon={<Users size={16} />}
                        type="number"
                        placeholder="50"
                        value={queueCapacity}
                        onChange={setQueueCapacity}
                    />
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
