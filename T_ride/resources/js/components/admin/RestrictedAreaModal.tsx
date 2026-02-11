import { useState, useEffect } from "react"
import { ShieldAlert, Building, AlertTriangle, Clock, FileText, Tag, Plus, Pencil, MapPin } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { PlacesAutocompleteInput } from "@/components/ui/places-autocomplete-input"
import { City } from "@/services/cityZoneService"

interface RestrictedAreaData {
    id?: number
    city_id: number
    name: string
    restriction_type: 'no_entry' | 'time_based' | 'pickup_only' | 'dropoff_only'
    reason?: string
    effective_period?: string
    status: 'active' | 'inactive'
}

interface RestrictedAreaModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: RestrictedAreaData | null
    cities: City[]
}

export function RestrictedAreaModal({ isOpen, onClose, onSave, initialData, cities }: RestrictedAreaModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [cityId, setCityId] = useState("")
    const [name, setName] = useState("")
    const [restrictionType, setRestrictionType] = useState<'no_entry' | 'time_based' | 'pickup_only' | 'dropoff_only'>("no_entry")
    const [reason, setReason] = useState("")
    const [effectivePeriod, setEffectivePeriod] = useState("")
    const [status, setStatus] = useState<'active' | 'inactive'>("active")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCityId(initialData.city_id ? initialData.city_id.toString() : "")
                setName(initialData.name || "")
                setRestrictionType(initialData.restriction_type || "no_entry")
                setReason(initialData.reason || "")
                setEffectivePeriod(initialData.effective_period || "")
                setStatus(initialData.status || "active")
            } else {
                setCityId(cities.length > 0 ? cities[0].id.toString() : "")
                setName("")
                setRestrictionType("no_entry")
                setReason("")
                setEffectivePeriod("")
                setStatus("active")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData, cities])

    const handleSubmit = async () => {
        if (!cityId || !name || !restrictionType) {
            setError("City, area name, and restriction type are required.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                city_id: parseInt(cityId),
                name,
                restriction_type: restrictionType,
                reason: reason || null,
                effective_period: effectivePeriod || null,
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
            title={initialData ? "Edit Restricted Area" : "Add Restricted Area"}
            description={initialData ? "Update restriction details." : "Add a new restricted or limited service area."}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Area" : "Add Area")}
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
                        label="Restriction Type"
                        placeholder="Select Type"
                        value={restrictionType}
                        onChange={(val) => setRestrictionType(val as 'no_entry' | 'time_based' | 'pickup_only' | 'dropoff_only')}
                        options={[
                            { label: "No Entry", value: "no_entry" },
                            { label: "Time-Based", value: "time_based" },
                            { label: "Pickup Only", value: "pickup_only" },
                            { label: "Dropoff Only", value: "dropoff_only" }
                        ]}
                        required
                        icon={<AlertTriangle size={16} />}
                    />
                </div>

                <PlacesAutocompleteInput
                    label="Area Name"
                    value={name}
                    onChange={setName}
                    onPlaceSelect={(place) => {
                        setName(place.address)
                    }}
                    placeholder="Search for a location..."
                    required
                    icon={<ShieldAlert size={16} />}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Reason"
                        icon={<FileText size={16} />}
                        placeholder="e.g. Security, Road Work"
                        value={reason}
                        onChange={setReason}
                    />

                    <ModalInput
                        label="Effective Period"
                        icon={<Clock size={16} />}
                        placeholder="e.g. Permanent, Match Days"
                        value={effectivePeriod}
                        onChange={setEffectivePeriod}
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
