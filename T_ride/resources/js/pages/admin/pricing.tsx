import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { DollarSign, Plus, Edit, Package, Car, Zap, Truck } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import axios from "@/lib/axios"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

// ==================== INTERFACES ====================

interface VehicleMultiplier {
    id?: number
    vehicle_type: string
    multiplier: number
}

interface PricingZone {
    id: number
    zone_id: string
    name: string
    description: string
    base_fare: number
    per_km: number
    per_minute: number
    min_fare: number
    status: string
    vehicle_multipliers: VehicleMultiplier[]
}

interface PackagePricing {
    id: number
    package_type: string
    base_price: number
    per_km: number
    status: string
}

interface DeliveryFee {
    id: number
    name: string
    description: string
    base_fee: number
    per_km: number
    min_order: number
    free_delivery_threshold: number | null
    status: string
}

interface SurgeRule {
    id: number
    name: string
    description: string
    multiplier: number
    start_time: string | null
    end_time: string | null
    days: string[] | null
    trigger_type: string
    status: string
}

// ==================== MAIN COMPONENT ====================

export default function PricingPage() {
    const [activeTab, setActiveTab] = useState("Ride Pricing")
    const [loading, setLoading] = useState(true)

    // Data states
    const [pricingZones, setPricingZones] = useState<PricingZone[]>([])
    const [packagePricing, setPackagePricing] = useState<PackagePricing[]>([])
    const [deliveryFees, setDeliveryFees] = useState<DeliveryFee[]>([])
    const [surgeRules, setSurgeRules] = useState<SurgeRule[]>([])

    // Modal states
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
    const [editingZone, setEditingZone] = useState<PricingZone | null>(null)

    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false)
    const [editingPackage, setEditingPackage] = useState<PackagePricing | null>(null)

    const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false)
    const [editingDeliveryFee, setEditingDeliveryFee] = useState<DeliveryFee | null>(null)

    const [isSurgeModalOpen, setIsSurgeModalOpen] = useState(false)
    const [editingSurge, setEditingSurge] = useState<SurgeRule | null>(null)

    const tabs = ["Ride Pricing", "Courier Pricing", "Delivery Fees", "Surge Rules"]

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [zonesRes, packagesRes, feesRes, surgeRes] = await Promise.all([
                axios.get('/admin/pricing-zones'),
                axios.get('/admin/package-pricing'),
                axios.get('/admin/delivery-fees'),
                axios.get('/admin/surge-rules')
            ])

            if (zonesRes.data.status) setPricingZones(zonesRes.data.data)
            if (packagesRes.data.status) setPackagePricing(packagesRes.data.data)
            if (feesRes.data.status) setDeliveryFees(feesRes.data.data)
            if (surgeRes.data.status) setSurgeRules(surgeRes.data.data)
        } catch (error) {
            console.error("Failed to fetch pricing data:", error)
        } finally {
            setLoading(false)
        }
    }

    const openAddModal = () => {
        switch (activeTab) {
            case "Ride Pricing":
                setEditingZone(null)
                setIsZoneModalOpen(true)
                break
            case "Courier Pricing":
                setEditingPackage(null)
                setIsPackageModalOpen(true)
                break
            case "Delivery Fees":
                setEditingDeliveryFee(null)
                setIsDeliveryModalOpen(true)
                break
            case "Surge Rules":
                setEditingSurge(null)
                setIsSurgeModalOpen(true)
                break
        }
    }

    return (
        <AdminLayout
            title="Pricing Configuration"
            description="Manage fares and pricing rules"
            actions={
                <Button onClick={openAddModal}>
                    <Plus size={18} />
                    {activeTab === "Ride Pricing" ? "Add Pricing Zone" : 
                     activeTab === "Courier Pricing" ? "Add Package" :
                     activeTab === "Delivery Fees" ? "Add Delivery Fee" : "Add Surge Rule"}
                </Button>
            }
        >
            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
                {tabs.map(tab => (
                    <Button 
                        key={tab}
                        variant={activeTab === tab ? "secondary" : "ghost"}
                        className={activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white"}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <>
                    {activeTab === "Ride Pricing" && (
                        <RidePricingTab 
                            zones={pricingZones} 
                            onEdit={(zone) => {
                                setEditingZone(zone)
                                setIsZoneModalOpen(true)
                            }}
                            onRefresh={fetchAllData}
                        />
                    )}
                    {activeTab === "Courier Pricing" && (
                        <CourierPricingTab 
                            packages={packagePricing}
                            onEdit={(pkg) => {
                                setEditingPackage(pkg)
                                setIsPackageModalOpen(true)
                            }}
                            onRefresh={fetchAllData}
                        />
                    )}
                    {activeTab === "Delivery Fees" && (
                        <DeliveryFeesTab 
                            fees={deliveryFees}
                            onEdit={(fee) => {
                                setEditingDeliveryFee(fee)
                                setIsDeliveryModalOpen(true)
                            }}
                            onRefresh={fetchAllData}
                        />
                    )}
                    {activeTab === "Surge Rules" && (
                        <SurgeRulesTab 
                            rules={surgeRules}
                            onEdit={(rule) => {
                                setEditingSurge(rule)
                                setIsSurgeModalOpen(true)
                            }}
                            onRefresh={fetchAllData}
                        />
                    )}
                </>
            )}

            {/* Modals */}
            <PricingZoneModal 
                isOpen={isZoneModalOpen}
                onClose={() => setIsZoneModalOpen(false)}
                initialData={editingZone}
                onSave={fetchAllData}
            />
            <PackagePricingModal 
                isOpen={isPackageModalOpen}
                onClose={() => setIsPackageModalOpen(false)}
                initialData={editingPackage}
                onSave={fetchAllData}
            />
            <DeliveryFeeModal 
                isOpen={isDeliveryModalOpen}
                onClose={() => setIsDeliveryModalOpen(false)}
                initialData={editingDeliveryFee}
                onSave={fetchAllData}
            />
            <SurgeRuleModal 
                isOpen={isSurgeModalOpen}
                onClose={() => setIsSurgeModalOpen(false)}
                initialData={editingSurge}
                onSave={fetchAllData}
            />
        </AdminLayout>
    )
}

// ==================== RIDE PRICING TAB ====================

function RidePricingTab({ zones, onEdit, onRefresh }: { zones: PricingZone[], onEdit: (zone: PricingZone) => void, onRefresh: () => void }) {
    const defaultMultipliers = [
        { vehicle_type: "Economy", multiplier: 1.0 },
        { vehicle_type: "Comfort", multiplier: 1.3 },
        { vehicle_type: "Premium", multiplier: 1.8 },
        { vehicle_type: "SUV", multiplier: 1.5 },
    ]

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {zones.length === 0 ? (
                <div className="col-span-2 bg-white/5 border border-white/5 rounded-3xl p-12 text-center text-white/50">
                    No pricing zones configured yet. Add your first zone to get started.
                </div>
            ) : (
                zones.map(zone => (
                    <div key={zone.id} className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-white">City: {zone.name}</h3>
                                <p className="text-sm text-white/50">{zone.description || "Default pricing for this region"}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <PriceItem label="Base Fare" value={`$${Number(zone.base_fare).toFixed(2)}`} />
                            <PriceItem label="Per KM" value={`$${Number(zone.per_km).toFixed(2)}`} />
                            <PriceItem label="Per Minute" value={`$${Number(zone.per_minute).toFixed(2)}`} />
                            <PriceItem label="Min Fare" value={`$${Number(zone.min_fare).toFixed(2)}`} />
                        </div>

                        <Button 
                            variant="secondary" 
                            className="w-full justify-center"
                            onClick={() => onEdit(zone)}
                        >
                            Edit Pricing
                        </Button>
                    </div>
                ))
            )}

            {/* Vehicle Types Card */}
            <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-white">Vehicle Types</h3>
                    <p className="text-sm text-white/50">Multipliers by vehicle type</p>
                </div>

                <div className="space-y-3">
                    {(zones[0]?.vehicle_multipliers?.length > 0 ? zones[0].vehicle_multipliers : defaultMultipliers).map((m, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                            <span className="text-white">{m.vehicle_type}</span>
                            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                                {Number(m.multiplier).toFixed(1)}x
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function PriceItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-white/5 rounded-xl p-4">
            <p className="text-xs text-white/50 mb-1">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    )
}

// ==================== COURIER PRICING TAB ====================

function CourierPricingTab({ packages, onEdit, onRefresh }: { packages: PackagePricing[], onEdit: (pkg: PackagePricing) => void, onRefresh: () => void }) {
    const getPackageIcon = (type: string) => {
        return <Package size={32} className="text-white/30" />
    }

    return (
        <div>
            <h3 className="text-xl font-bold text-white mb-6">Package Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {packages.length === 0 ? (
                    <div className="col-span-4 bg-white/5 border border-white/5 rounded-3xl p-12 text-center text-white/50">
                        No package pricing configured yet.
                    </div>
                ) : (
                    packages.map(pkg => (
                        <div key={pkg.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                {getPackageIcon(pkg.package_type)}
                            </div>
                            <p className="text-white/70 text-sm mb-2">{pkg.package_type}</p>
                            <p className="text-2xl font-bold text-white mb-1">${Number(pkg.base_price).toFixed(0)}</p>
                            <p className="text-sm text-white/50 mb-4">${Number(pkg.per_km).toFixed(2)}/km</p>
                            <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => onEdit(pkg)}
                            >
                                Edit
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

// ==================== DELIVERY FEES TAB ====================

function DeliveryFeesTab({ fees, onEdit, onRefresh }: { fees: DeliveryFee[], onEdit: (fee: DeliveryFee) => void, onRefresh: () => void }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                        <th className="px-6 py-4 font-medium">Name</th>
                        <th className="px-6 py-4 font-medium">Base Fee</th>
                        <th className="px-6 py-4 font-medium">Per KM</th>
                        <th className="px-6 py-4 font-medium">Min Order</th>
                        <th className="px-6 py-4 font-medium">Free Delivery</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {fees.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-white/50">
                                No delivery fees configured yet.
                            </td>
                        </tr>
                    ) : (
                        fees.map(fee => (
                            <tr key={fee.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-white">{fee.name}</p>
                                        <p className="text-xs text-white/50">{fee.description}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-mono">${Number(fee.base_fee).toFixed(2)}</td>
                                <td className="px-6 py-4 font-mono">${Number(fee.per_km).toFixed(2)}</td>
                                <td className="px-6 py-4 font-mono">${Number(fee.min_order).toFixed(2)}</td>
                                <td className="px-6 py-4 font-mono">
                                    {fee.free_delivery_threshold ? `$${Number(fee.free_delivery_threshold).toFixed(2)}+` : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        fee.status === 'active' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-white/10 text-white/50'
                                    }`}>
                                        {fee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <IconButton tooltip="Edit" onClick={() => onEdit(fee)}>
                                        <Edit size={16} />
                                    </IconButton>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

// ==================== SURGE RULES TAB ====================

function SurgeRulesTab({ rules, onEdit, onRefresh }: { rules: SurgeRule[], onEdit: (rule: SurgeRule) => void, onRefresh: () => void }) {
    const handleToggleStatus = async (rule: SurgeRule) => {
        try {
            await axios.patch(`/admin/surge-rules/${rule.id}/status`)
            onRefresh()
        } catch (error) {
            console.error("Failed to toggle status:", error)
        }
    }

    return (
        <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                        <th className="px-6 py-4 font-medium">Rule Name</th>
                        <th className="px-6 py-4 font-medium">Multiplier</th>
                        <th className="px-6 py-4 font-medium">Trigger</th>
                        <th className="px-6 py-4 font-medium">Time</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {rules.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-white/50">
                                No surge rules configured yet.
                            </td>
                        </tr>
                    ) : (
                        rules.map(rule => (
                            <tr key={rule.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-white">{rule.name}</p>
                                        <p className="text-xs text-white/50">{rule.description}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded-full text-sm font-bold">
                                        {Number(rule.multiplier).toFixed(1)}x
                                    </span>
                                </td>
                                <td className="px-6 py-4 capitalize text-white/70">{rule.trigger_type}</td>
                                <td className="px-6 py-4 text-white/70">
                                    {rule.start_time && rule.end_time 
                                        ? `${rule.start_time} - ${rule.end_time}` 
                                        : '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => handleToggleStatus(rule)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                            rule.status === 'active' 
                                                ? 'bg-blue-600 text-white hover:bg-blue-500' 
                                                : 'bg-white/10 text-white/50 hover:bg-white/20'
                                        }`}
                                    >
                                        {rule.status}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <IconButton tooltip="Edit" onClick={() => onEdit(rule)}>
                                        <Edit size={16} />
                                    </IconButton>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}

// ==================== MODALS ====================

function PricingZoneModal({ isOpen, onClose, initialData, onSave }: { isOpen: boolean, onClose: () => void, initialData: PricingZone | null, onSave: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [baseFare, setBaseFare] = useState("")
    const [perKm, setPerKm] = useState("")
    const [perMinute, setPerMinute] = useState("")
    const [minFare, setMinFare] = useState("")
    const [multipliers, setMultipliers] = useState<VehicleMultiplier[]>([
        { vehicle_type: "Economy", multiplier: 1.0 },
        { vehicle_type: "Comfort", multiplier: 1.3 },
        { vehicle_type: "Premium", multiplier: 1.8 },
        { vehicle_type: "SUV", multiplier: 1.5 },
    ])

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name)
                setDescription(initialData.description || "")
                setBaseFare(initialData.base_fare.toString())
                setPerKm(initialData.per_km.toString())
                setPerMinute(initialData.per_minute.toString())
                setMinFare(initialData.min_fare.toString())
                if (initialData.vehicle_multipliers?.length > 0) {
                    setMultipliers(initialData.vehicle_multipliers)
                }
            } else {
                setName("")
                setDescription("")
                setBaseFare("")
                setPerKm("")
                setPerMinute("")
                setMinFare("")
                setMultipliers([
                    { vehicle_type: "Economy", multiplier: 1.0 },
                    { vehicle_type: "Comfort", multiplier: 1.3 },
                    { vehicle_type: "Premium", multiplier: 1.8 },
                    { vehicle_type: "SUV", multiplier: 1.5 },
                ])
            }
            setError("")
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !baseFare || !perKm || !perMinute || !minFare) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                name,
                description,
                base_fare: parseFloat(baseFare),
                per_km: parseFloat(perKm),
                per_minute: parseFloat(perMinute),
                min_fare: parseFloat(minFare),
                vehicle_multipliers: multipliers
            }

            if (initialData) {
                await axios.put(`/admin/pricing-zones/${initialData.id}`, data)
            } else {
                await axios.post('/admin/pricing-zones', data)
            }

            onSave()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    const updateMultiplier = (index: number, value: string) => {
        const updated = [...multipliers]
        updated[index].multiplier = parseFloat(value) || 0
        setMultipliers(updated)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Pricing Zone" : "Add Pricing Zone"}
            description={initialData ? "Update zone pricing details" : "Configure a new pricing zone"}
            icon={<DollarSign size={20} />}
            size="lg"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit} isLoading={loading}>
                        {initialData ? "Update Zone" : "Create Zone"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />
                
                <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="Zone Name" value={name} onChange={setName} placeholder="Metro Area" required />
                    <ModalInput label="Description" value={description} onChange={setDescription} placeholder="Default pricing for metro region" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="Base Fare ($)" value={baseFare} onChange={setBaseFare} type="number" placeholder="3.50" required />
                    <ModalInput label="Per KM ($)" value={perKm} onChange={setPerKm} type="number" placeholder="1.20" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="Per Minute ($)" value={perMinute} onChange={setPerMinute} type="number" placeholder="0.25" required />
                    <ModalInput label="Min Fare ($)" value={minFare} onChange={setMinFare} type="number" placeholder="5.00" required />
                </div>

                <div className="pt-4 border-t border-white/10">
                    <p className="text-sm font-medium text-gray-300 mb-3">Vehicle Type Multipliers</p>
                    <div className="grid grid-cols-2 gap-3">
                        {multipliers.map((m, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
                                <span className="text-sm text-white flex-1">{m.vehicle_type}</span>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={m.multiplier}
                                    onChange={(e) => updateMultiplier(i, e.target.value)}
                                    className="w-20 bg-tride-dark border border-white/10 rounded-lg px-3 py-1.5 text-white text-center text-sm"
                                />
                                <span className="text-white/50 text-sm">x</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    )
}

function PackagePricingModal({ isOpen, onClose, initialData, onSave }: { isOpen: boolean, onClose: () => void, initialData: PackagePricing | null, onSave: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [packageType, setPackageType] = useState("")
    const [basePrice, setBasePrice] = useState("")
    const [perKm, setPerKm] = useState("")

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setPackageType(initialData.package_type)
                setBasePrice(initialData.base_price.toString())
                setPerKm(initialData.per_km.toString())
            } else {
                setPackageType("")
                setBasePrice("")
                setPerKm("")
            }
            setError("")
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!packageType || !basePrice || !perKm) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                package_type: packageType,
                base_price: parseFloat(basePrice),
                per_km: parseFloat(perKm)
            }

            if (initialData) {
                await axios.put(`/admin/package-pricing/${initialData.id}`, data)
            } else {
                await axios.post('/admin/package-pricing', data)
            }

            onSave()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Package Pricing" : "Add Package Pricing"}
            description="Configure pricing for package types"
            icon={<Package size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit} isLoading={loading}>
                        {initialData ? "Update" : "Create"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />
                
                <ModalSelect
                    label="Package Type"
                    value={packageType}
                    onChange={setPackageType}
                    options={[
                        { label: "Document", value: "Document" },
                        { label: "Small", value: "Small" },
                        { label: "Medium", value: "Medium" },
                        { label: "Large", value: "Large" },
                    ]}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="Base Price ($)" value={basePrice} onChange={setBasePrice} type="number" placeholder="5.00" required />
                    <ModalInput label="Per KM ($)" value={perKm} onChange={setPerKm} type="number" placeholder="0.80" required />
                </div>
            </div>
        </Modal>
    )
}

function DeliveryFeeModal({ isOpen, onClose, initialData, onSave }: { isOpen: boolean, onClose: () => void, initialData: DeliveryFee | null, onSave: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [baseFee, setBaseFee] = useState("")
    const [perKm, setPerKm] = useState("")
    const [minOrder, setMinOrder] = useState("")
    const [freeThreshold, setFreeThreshold] = useState("")

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name)
                setDescription(initialData.description || "")
                setBaseFee(initialData.base_fee.toString())
                setPerKm(initialData.per_km.toString())
                setMinOrder(initialData.min_order.toString())
                setFreeThreshold(initialData.free_delivery_threshold?.toString() || "")
            } else {
                setName("")
                setDescription("")
                setBaseFee("")
                setPerKm("")
                setMinOrder("")
                setFreeThreshold("")
            }
            setError("")
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !baseFee || !perKm || !minOrder) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                name,
                description,
                base_fee: parseFloat(baseFee),
                per_km: parseFloat(perKm),
                min_order: parseFloat(minOrder),
                free_delivery_threshold: freeThreshold ? parseFloat(freeThreshold) : null
            }

            if (initialData) {
                await axios.put(`/admin/delivery-fees/${initialData.id}`, data)
            } else {
                await axios.post('/admin/delivery-fees', data)
            }

            onSave()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Delivery Fee" : "Add Delivery Fee"}
            description="Configure delivery fee structure"
            icon={<Truck size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit} isLoading={loading}>
                        {initialData ? "Update" : "Create"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />
                
                <ModalInput label="Name" value={name} onChange={setName} placeholder="Standard Delivery" required />
                <ModalInput label="Description" value={description} onChange={setDescription} placeholder="Default delivery fee" />

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="Base Fee ($)" value={baseFee} onChange={setBaseFee} type="number" placeholder="2.50" required />
                    <ModalInput label="Per KM ($)" value={perKm} onChange={setPerKm} type="number" placeholder="0.50" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="Min Order ($)" value={minOrder} onChange={setMinOrder} type="number" placeholder="10.00" required />
                    <ModalInput label="Free Delivery Above ($)" value={freeThreshold} onChange={setFreeThreshold} type="number" placeholder="50.00" />
                </div>
            </div>
        </Modal>
    )
}

function SurgeRuleModal({ isOpen, onClose, initialData, onSave }: { isOpen: boolean, onClose: () => void, initialData: SurgeRule | null, onSave: () => void }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [multiplier, setMultiplier] = useState("")
    const [triggerType, setTriggerType] = useState("time")
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name)
                setDescription(initialData.description || "")
                setMultiplier(initialData.multiplier.toString())
                setTriggerType(initialData.trigger_type)
                setStartTime(initialData.start_time || "")
                setEndTime(initialData.end_time || "")
            } else {
                setName("")
                setDescription("")
                setMultiplier("")
                setTriggerType("time")
                setStartTime("")
                setEndTime("")
            }
            setError("")
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !multiplier || !triggerType) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                name,
                description,
                multiplier: parseFloat(multiplier),
                trigger_type: triggerType,
                start_time: startTime || null,
                end_time: endTime || null
            }

            if (initialData) {
                await axios.put(`/admin/surge-rules/${initialData.id}`, data)
            } else {
                await axios.post('/admin/surge-rules', data)
            }

            onSave()
            onClose()
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Surge Rule" : "Add Surge Rule"}
            description="Configure surge pricing rules"
            icon={<Zap size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit} isLoading={loading}>
                        {initialData ? "Update" : "Create"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />
                
                <ModalInput label="Rule Name" value={name} onChange={setName} placeholder="Rush Hour" required />
                <ModalInput label="Description" value={description} onChange={setDescription} placeholder="Peak time surge pricing" />

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput label="Multiplier" value={multiplier} onChange={setMultiplier} type="number" placeholder="1.5" required />
                    <ModalSelect
                        label="Trigger Type"
                        value={triggerType}
                        onChange={setTriggerType}
                        options={[
                            { label: "Time Based", value: "time" },
                            { label: "Demand Based", value: "demand" },
                            { label: "Weather Based", value: "weather" },
                            { label: "Event Based", value: "event" },
                        ]}
                        required
                    />
                </div>

                {triggerType === "time" && (
                    <div className="grid grid-cols-2 gap-4">
                        <ModalInput label="Start Time" value={startTime} onChange={setStartTime} type="time" />
                        <ModalInput label="End Time" value={endTime} onChange={setEndTime} type="time" />
                    </div>
                )}
            </div>
        </Modal>
    )
}
