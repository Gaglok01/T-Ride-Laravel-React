import { useState, useEffect } from "react"
import { Building, Globe, Clock, DollarSign, Tag, Plus, Pencil, MapPin } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { getCountryOptions, getTimezoneOptions, getCurrencyForCountry } from "@/data/countries-cities"
import { PlacesAutocompleteInput } from "@/components/ui/places-autocomplete-input"

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
    const [currencyCode, setCurrencyCode] = useState("") // Auto-set from timezone (e.g. "USD")
    const [currency, setCurrency] = useState("") // User-entered amount
    const [services, setServices] = useState<string[]>([])
    const [status, setStatus] = useState<'active' | 'inactive'>("active")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setCountry(initialData.country || "")
                setTimezone(initialData.timezone || "")
                setCurrencyCode(initialData.country ? getCurrencyForCountry(initialData.country) : "")
                setCurrency(initialData.currency || "")
                setServices(initialData.services || [])
                setStatus(initialData.status || "active")
            } else {
                setName("")
                setCountry("")
                setTimezone("")
                setCurrencyCode("")
                setCurrency("")
                setServices([])
                setStatus("active")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    // Reset city, timezone, and currency when country changes
    const handleCountryChange = (newCountry: string) => {
        setCountry(newCountry)
        setName("") // Reset city when country changes
        setTimezone("") // Reset timezone when country changes
        setCurrencyCode("") // Reset currency code
        setCurrency("") // Reset currency amount
    }

    // Auto-set currency code when timezone is selected (based on selected country)
    const handleTimezoneChange = (newTimezone: string) => {
        setTimezone(newTimezone)
        // Auto-set currency code based on the selected country
        if (country) {
            setCurrencyCode(getCurrencyForCountry(country))
        }
        setCurrency("") // Reset amount when timezone changes
    }

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
                currency_code: currencyCode || null,
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
                    <ModalSelect
                        label="Country"
                        icon={<MapPin size={16} />}
                        placeholder="Select a country"
                        value={country}
                        onChange={handleCountryChange}
                        options={getCountryOptions()}
                        required
                        enableSearch={true}
                    />
                    <PlacesAutocompleteInput
                        label="City"
                        value={name}
                        onChange={setName}
                        onPlaceSelect={(place) => {
                            if (place.city) {
                                setName(place.city)
                            } else {
                                setName(place.address)
                            }
                        }}
                        placeholder={country ? "Search for a city..." : "Select a country first"}
                        disabled={!country}
                        required
                        types={["(cities)"]}
                        icon={<Building size={16} />}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalSelect
                        label="Timezone"
                        icon={<Clock size={16} />}
                        placeholder={country ? "Select a timezone" : "Select a country first"}
                        value={timezone}
                        onChange={handleTimezoneChange}
                        options={getTimezoneOptions(country)}
                        disabled={!country}
                        enableSearch={true}
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-tride-text">
                            Currency
                        </label>
                        <div className="relative flex items-center">
                            {currencyCode && (
                                <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none z-10">
                                    <DollarSign size={14} className="text-tride-yellow" />
                                    <span className="bg-tride-yellow/15 text-tride-yellow text-xs font-bold px-2 py-0.5 rounded-md border border-tride-yellow/30">
                                        {currencyCode}
                                    </span>
                                </div>
                            )}
                            {!currencyCode && (
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-tride-text-muted pointer-events-none">
                                    <DollarSign size={16} />
                                </div>
                            )}
                            <input
                                type="number"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                placeholder={timezone ? "Enter amount" : "Select timezone first"}
                                disabled={!timezone}
                                min="0"
                                step="0.01"
                                className={`w-full bg-tride-card border border-tride-border rounded-xl text-tride-text focus:outline-none focus:border-tride-yellow focus:ring-1 focus:ring-tride-yellow transition-all placeholder-tride-text-muted pr-4 py-3 ${
                                    currencyCode ? 'pl-[5.5rem]' : 'pl-11'
                                } ${!timezone ? 'opacity-50 cursor-not-allowed' : ''}
                                [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]`}
                            />
                        </div>
                    </div>
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
