import { useState, useEffect } from "react"
import { Percent, DollarSign, Car, Building, Package, Navigation, Tag, Plus, Pencil, TrendingUp } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

export interface CommissionRuleData {
    id?: number
    type: 'ride' | 'delivery' | 'courier' | 'vendor'
    name: string
    base_rate: number
    min_commission: number | null
    max_commission: number | null
    surge_multiplier: string | null
    city_id: number | null
    status: 'active' | 'inactive'
    attributes?: {
        featured_rate?: number
        new_vendor_rate?: number
        promo_period?: string
    } | null
}

interface City {
    id: number
    name: string
}

interface CommissionRuleModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: Partial<CommissionRuleData>) => Promise<void>
    initialData?: CommissionRuleData | null
    ruleType: 'ride' | 'delivery' | 'courier' | 'vendor'
    cities?: City[]
}

export function CommissionRuleModal({ isOpen, onClose, onSave, initialData, ruleType, cities = [] }: CommissionRuleModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [baseRate, setBaseRate] = useState("")
    const [minCommission, setMinCommission] = useState("")
    const [maxCommission, setMaxCommission] = useState("")
    const [surgeMultiplier, setSurgeMultiplier] = useState("")
    const [cityId, setCityId] = useState<string>("")
    const [status, setStatus] = useState<'active' | 'inactive'>("active")

    // Vendor specific fields
    const [featuredRate, setFeaturedRate] = useState("")
    const [newVendorRate, setNewVendorRate] = useState("")
    const [promoPeriod, setPromoPeriod] = useState("")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setBaseRate(initialData.base_rate?.toString() || "")
                setMinCommission(initialData.min_commission?.toString() || "")
                setMaxCommission(initialData.max_commission?.toString() || "")
                setSurgeMultiplier(initialData.surge_multiplier || "")
                setCityId(initialData.city_id?.toString() || "")
                setStatus(initialData.status || "active")
                // Vendor specific
                setFeaturedRate(initialData.attributes?.featured_rate?.toString() || "")
                setNewVendorRate(initialData.attributes?.new_vendor_rate?.toString() || "")
                setPromoPeriod(initialData.attributes?.promo_period || "")
            } else {
                setName("")
                setBaseRate("")
                setMinCommission("")
                setMaxCommission("")
                setSurgeMultiplier("")
                setCityId("")
                setStatus("active")
                setFeaturedRate("")
                setNewVendorRate("")
                setPromoPeriod("")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const getTypeLabel = () => {
        switch (ruleType) {
            case 'ride': return 'Ride'
            case 'delivery': return 'Delivery'
            case 'courier': return 'Courier'
            case 'vendor': return 'Vendor'
            default: return 'Commission'
        }
    }

    const getTypeIcon = () => {
        switch (ruleType) {
            case 'ride': return <Car size={16} />
            case 'delivery': return <Package size={16} />
            case 'courier': return <Navigation size={16} />
            case 'vendor': return <Building size={16} />
            default: return <Percent size={16} />
        }
    }

    const handleSubmit = async () => {
        if (!name || !baseRate) {
            setError("Rule name and base rate are required.")
            return
        }

        const rate = parseFloat(baseRate)
        if (isNaN(rate) || rate < 0 || rate > 100) {
            setError("Base rate must be a valid percentage between 0 and 100.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data: Partial<CommissionRuleData> = {
                type: ruleType,
                name,
                base_rate: rate,
                min_commission: minCommission ? parseFloat(minCommission) : null,
                max_commission: maxCommission ? parseFloat(maxCommission) : null,
                surge_multiplier: surgeMultiplier || null,
                city_id: cityId ? parseInt(cityId) : null,
                status
            }

            // Add vendor-specific attributes
            if (ruleType === 'vendor') {
                data.attributes = {
                    featured_rate: featuredRate ? parseFloat(featuredRate) : undefined,
                    new_vendor_rate: newVendorRate ? parseFloat(newVendorRate) : undefined,
                    promo_period: promoPeriod || undefined
                }
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
            title={initialData ? `Edit ${getTypeLabel()} Commission Rule` : `Add ${getTypeLabel()} Commission Rule`}
            description={initialData ? "Update the commission rule details." : "Create a new commission rule."}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Rule" : "Add Rule")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Rule Name"
                        icon={getTypeIcon()}
                        placeholder="e.g. Standard Rides"
                        value={name}
                        onChange={setName}
                        required
                    />
                    <ModalInput
                        label="Base Rate (%)"
                        icon={<Percent size={16} />}
                        type="number"
                        placeholder="e.g. 15"
                        value={baseRate}
                        onChange={setBaseRate}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Min Commission ($)"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="e.g. 1.00"
                        value={minCommission}
                        onChange={setMinCommission}
                    />
                    <ModalInput
                        label="Max Commission ($)"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="e.g. 50.00 (leave empty for no limit)"
                        value={maxCommission}
                        onChange={setMaxCommission}
                    />
                </div>

                {ruleType !== 'vendor' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ModalInput
                            label="Surge Multiplier"
                            icon={<TrendingUp size={16} />}
                            placeholder="e.g. 1.5x or Same Rate"
                            value={surgeMultiplier}
                            onChange={setSurgeMultiplier}
                        />
                        <ModalSelect
                            label="City (Optional)"
                            placeholder="All Cities"
                            value={cityId}
                            onChange={setCityId}
                            options={[
                                { label: "All Cities", value: "" },
                                ...cities.map(city => ({ label: city.name, value: city.id.toString() }))
                            ]}
                            icon={<Building size={16} />}
                        />
                    </div>
                )}

                {ruleType === 'vendor' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ModalInput
                                label="Featured Rate (%)"
                                icon={<Percent size={16} />}
                                type="number"
                                placeholder="e.g. 30"
                                value={featuredRate}
                                onChange={setFeaturedRate}
                            />
                            <ModalInput
                                label="New Vendor Rate (%)"
                                icon={<Percent size={16} />}
                                type="number"
                                placeholder="e.g. 15"
                                value={newVendorRate}
                                onChange={setNewVendorRate}
                            />
                        </div>
                        <ModalInput
                            label="Promotional Period"
                            icon={<Tag size={16} />}
                            placeholder="e.g. 30 days"
                            value={promoPeriod}
                            onChange={setPromoPeriod}
                        />
                    </>
                )}

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
