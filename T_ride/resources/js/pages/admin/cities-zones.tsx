
import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { 
    Search, Filter, Plus, Eye, Edit, Trash2, Map as MapIcon, 
    Navigation, Globe, Car, Layout, Building, Plane, 
    Train, ShieldAlert, CheckCircle, XCircle, Loader2 
} from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { Dropdown } from "@/components/ui/dropdown"

import { Link, router } from "@inertiajs/react"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { StatusConfirmationModal } from "@/components/admin/StatusConfirmationModal"
import { CityModal } from "@/components/admin/CityModal"
import { ServiceZoneModal } from "@/components/admin/ServiceZoneModal"
import { TransportationHubModal } from "@/components/admin/TransportationHubModal"
import { RestrictedAreaModal } from "@/components/admin/RestrictedAreaModal"
import { ExpansionPlanModal } from "@/components/admin/ExpansionPlanModal"
import cityZoneService, { 
    City, ServiceZone, TransportationHub, RestrictedArea, ExpansionPlan 
} from "@/services/cityZoneService"

export default function CitiesZonesPage() {
    const [activeTab, setActiveTab] = useState("Cities")
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)

    // Data states
    const [cities, setCities] = useState<City[]>([])
    const [serviceZones, setServiceZones] = useState<ServiceZone[]>([])
    const [transportationHubs, setTransportationHubs] = useState<TransportationHub[]>([])
    const [restrictedAreas, setRestrictedAreas] = useState<RestrictedArea[]>([])
    const [expansionPlans, setExpansionPlans] = useState<ExpansionPlan[]>([])

    // Stats state
    const [stats, setStats] = useState({
        active_cities: 0,
        total_zones: 0,
        total_countries: 0,
        total_hubs: 0,
        restricted_areas: 0,
    })

    // Delete Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<any>(null)
    const [deleteType, setDeleteType] = useState("") 

    // Status Modal states
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [itemToToggle, setItemToToggle] = useState<any>(null)
    const [statusToggleType, setStatusToggleType] = useState("")

    // Create/Edit Modal states
    const [isCityModalOpen, setIsCityModalOpen] = useState(false)
    const [editingCity, setEditingCity] = useState<City | null>(null)

    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
    const [editingZone, setEditingZone] = useState<ServiceZone | null>(null)

    const [isHubModalOpen, setIsHubModalOpen] = useState(false)
    const [editingHub, setEditingHub] = useState<TransportationHub | null>(null)

    const [isAreaModalOpen, setIsAreaModalOpen] = useState(false)
    const [editingArea, setEditingArea] = useState<RestrictedArea | null>(null)

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
    const [editingPlan, setEditingPlan] = useState<ExpansionPlan | null>(null)

    const tabs = [
        "Cities", "Service Zones", "Geo-Fencing", "Airports & Stations", "Restricted Areas", "Expansion Planning"
    ]

    // Fetch data on component mount and tab change
    useEffect(() => {
        fetchData()
    }, [activeTab])

    // Also fetch cities when opening modals that need city list
    useEffect(() => {
        if (isZoneModalOpen || isHubModalOpen || isAreaModalOpen) {
            if (cities.length === 0) {
                cityZoneService.getCities().then(response => setCities(response.data))
            }
        }
    }, [isZoneModalOpen, isHubModalOpen, isAreaModalOpen])

    const fetchData = async () => {
        setLoading(true)
        try {
            switch (activeTab) {
                case "Cities":
                    const citiesResponse = await cityZoneService.getCities()
                    setCities(citiesResponse.data)
                    setStats({
                        active_cities: citiesResponse.stats.active_cities,
                        total_zones: citiesResponse.stats.total_zones,
                        total_countries: citiesResponse.stats.total_countries,
                        total_hubs: 0,
                        restricted_areas: 0,
                    })
                    break
                case "Service Zones":
                    const zones = await cityZoneService.getServiceZones()
                    setServiceZones(zones)
                    // Also fetch cities for the dropdown
                    if (cities.length === 0) {
                        const citiesRes = await cityZoneService.getCities()
                        setCities(citiesRes.data)
                    }
                    break
                case "Airports & Stations":
                    const hubs = await cityZoneService.getTransportationHubs()
                    setTransportationHubs(hubs)
                    break
                case "Restricted Areas":
                    const areas = await cityZoneService.getRestrictedAreas()
                    setRestrictedAreas(areas)
                    break
                case "Expansion Planning":
                    const plans = await cityZoneService.getExpansionPlans()
                    setExpansionPlans(plans)
                    break
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (item: any, type: string) => {
        setItemToDelete(item)
        setDeleteType(type)
        setIsDeleteModalOpen(true)
    }

    const handleStatusToggle = (item: any, type: string) => {
        setItemToToggle(item)
        setStatusToggleType(type)
        setIsStatusModalOpen(true)
    }

    const handleEdit = (item: any, type: string) => {
        switch (type) {
            case 'City':
                setEditingCity(item)
                setIsCityModalOpen(true)
                break
            case 'Zone':
                setEditingZone(item)
                setIsZoneModalOpen(true)
                break
            case 'Hub':
                setEditingHub(item)
                setIsHubModalOpen(true)
                break
            case 'Area':
                setEditingArea(item)
                setIsAreaModalOpen(true)
                break
            case 'Plan':
                setEditingPlan(item)
                setIsPlanModalOpen(true)
                break
        }
    }

    const confirmDelete = async () => {
        try {
            switch (deleteType) {
                case 'City':
                    await cityZoneService.deleteCity(itemToDelete.id)
                    setCities(cities.filter(c => c.id !== itemToDelete.id))
                    break
                case 'Zone':
                    await cityZoneService.deleteServiceZone(itemToDelete.id)
                    setServiceZones(serviceZones.filter(z => z.id !== itemToDelete.id))
                    break
                case 'Hub':
                    await cityZoneService.deleteTransportationHub(itemToDelete.id)
                    setTransportationHubs(transportationHubs.filter(h => h.id !== itemToDelete.id))
                    break
                case 'Area':
                    await cityZoneService.deleteRestrictedArea(itemToDelete.id)
                    setRestrictedAreas(restrictedAreas.filter(a => a.id !== itemToDelete.id))
                    break
                case 'Plan':
                    await cityZoneService.deleteExpansionPlan(itemToDelete.id)
                    setExpansionPlans(expansionPlans.filter(p => p.id !== itemToDelete.id))
                    break
            }
        } catch (error) {
            console.error("Error deleting:", error)
        }
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
    }

    const confirmStatusToggle = async () => {
        const newStatus = itemToToggle.status === 'active' ? 'inactive' : 'active'
        try {
            switch (statusToggleType) {
                case 'City':
                    await cityZoneService.updateCityStatus(itemToToggle.id, newStatus)
                    setCities(cities.map(c => c.id === itemToToggle.id ? { ...c, status: newStatus } : c))
                    break
                case 'Zone':
                    await cityZoneService.updateServiceZoneStatus(itemToToggle.id, newStatus)
                    setServiceZones(serviceZones.map(z => z.id === itemToToggle.id ? { ...z, status: newStatus } : z))
                    break
                case 'Hub':
                    await cityZoneService.updateTransportationHubStatus(itemToToggle.id, newStatus)
                    setTransportationHubs(transportationHubs.map(h => h.id === itemToToggle.id ? { ...h, status: newStatus } : h))
                    break
                case 'Area':
                    await cityZoneService.updateRestrictedAreaStatus(itemToToggle.id, newStatus)
                    setRestrictedAreas(restrictedAreas.map(a => a.id === itemToToggle.id ? { ...a, status: newStatus } : a))
                    break
            }
        } catch (error) {
            console.error("Error updating status:", error)
        }
        setIsStatusModalOpen(false)
        setItemToToggle(null)
    }

    // Save handlers for create/edit modals
    const handleSaveCity = async (data: any) => {
        if (editingCity) {
            const updated = await cityZoneService.updateCity(editingCity.id, data)
            setCities(cities.map(c => c.id === editingCity.id ? updated : c))
        } else {
            const created = await cityZoneService.createCity(data)
            setCities([created, ...cities])
        }
        setEditingCity(null)
    }

    const handleSaveZone = async (data: any) => {
        if (editingZone) {
            const updated = await cityZoneService.updateServiceZone(editingZone.id, data)
            setServiceZones(serviceZones.map(z => z.id === editingZone.id ? updated : z))
        } else {
            const created = await cityZoneService.createServiceZone(data)
            setServiceZones([created, ...serviceZones])
        }
        setEditingZone(null)
    }

    const handleSaveHub = async (data: any) => {
        if (editingHub) {
            const updated = await cityZoneService.updateTransportationHub(editingHub.id, data)
            setTransportationHubs(transportationHubs.map(h => h.id === editingHub.id ? updated : h))
        } else {
            const created = await cityZoneService.createTransportationHub(data)
            setTransportationHubs([created, ...transportationHubs])
        }
        setEditingHub(null)
    }

    const handleSaveArea = async (data: any) => {
        if (editingArea) {
            const updated = await cityZoneService.updateRestrictedArea(editingArea.id, data)
            setRestrictedAreas(restrictedAreas.map(a => a.id === editingArea.id ? updated : a))
        } else {
            const created = await cityZoneService.createRestrictedArea(data)
            setRestrictedAreas([created, ...restrictedAreas])
        }
        setEditingArea(null)
    }

    const handleSavePlan = async (data: any) => {
        if (editingPlan) {
            const updated = await cityZoneService.updateExpansionPlan(editingPlan.id, data)
            setExpansionPlans(expansionPlans.map(p => p.id === editingPlan.id ? updated : p))
        } else {
            const created = await cityZoneService.createExpansionPlan(data)
            setExpansionPlans([created, ...expansionPlans])
        }
        setEditingPlan(null)
    }

    // Get the right action button based on active tab
    const getActionButton = () => {
        switch (activeTab) {
            case "Cities":
                return (
                    <Button onClick={() => { setEditingCity(null); setIsCityModalOpen(true) }}>
                        <Plus size={18} />
                        Add City
                    </Button>
                )
            case "Service Zones":
                return (
                    <Button onClick={() => { setEditingZone(null); setIsZoneModalOpen(true) }}>
                        <Plus size={18} />
                        Add Zone
                    </Button>
                )
            case "Airports & Stations":
                return (
                    <Button onClick={() => { setEditingHub(null); setIsHubModalOpen(true) }}>
                        <Plus size={18} />
                        Add Hub
                    </Button>
                )
            case "Restricted Areas":
                return (
                    <Button onClick={() => { setEditingArea(null); setIsAreaModalOpen(true) }}>
                        <Plus size={18} />
                        Add Restriction
                    </Button>
                )
            case "Expansion Planning":
                return (
                    <Button onClick={() => { setEditingPlan(null); setIsPlanModalOpen(true) }}>
                        <Plus size={18} />
                        Add Plan
                    </Button>
                )
            default:
                return null
        }
    }

    return (
        <AdminLayout
            title="Cities & Service Zones"
            description="Manage operational areas and geo-fencing"
            actions={
                <div className="flex gap-2">
                    <Button variant="secondary">
                        <MapIcon size={18} />
                        View Map
                    </Button>
                    {getActionButton()}
                </div>
            }
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatsCard label="Active Cities" value={stats.active_cities.toString()} trend="+3" trendUp={true} icon={<Building size={20} />} />
                <StatsCard label="Service Zones" value={stats.total_zones.toString()} trend="+12" trendUp={true} icon={<Navigation size={20} />} />
                <StatsCard label="Countries" value={stats.total_countries.toString()} trend="+1" trendUp={true} icon={<Globe size={20} />} />
                <StatsCard label="Transportation Hubs" value={transportationHubs.length.toString()} trend="+5" trendUp={true} icon={<Plane size={20} />} />
                <StatsCard label="Restricted Areas" value={restrictedAreas.length.toString()} trend="+2" trendUp={true} icon={<ShieldAlert size={20} />} />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-2xl w-fit flex-wrap">
                {tabs.map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "secondary" : "ghost"}
                        className={activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Main Content Info */}
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                ) : (
                    <>
                        {activeTab === "Cities" && <CitiesTab cities={cities} onDelete={(item) => handleDelete(item, 'City')} onStatusToggle={(item) => handleStatusToggle(item, 'City')} onEdit={(item) => handleEdit(item, 'City')} />}
                        {activeTab === "Service Zones" && <ServiceZonesTab zones={serviceZones} cities={cities} onDelete={(item) => handleDelete(item, 'Zone')} onStatusToggle={(item) => handleStatusToggle(item, 'Zone')} onEdit={(item) => handleEdit(item, 'Zone')} onAddZone={() => { setEditingZone(null); setIsZoneModalOpen(true) }} />}
                        {activeTab === "Airports & Stations" && <AirportsTab hubs={transportationHubs} onDelete={(item) => handleDelete(item, 'Hub')} onStatusToggle={(item) => handleStatusToggle(item, 'Hub')} onEdit={(item) => handleEdit(item, 'Hub')} onAddHub={() => { setEditingHub(null); setIsHubModalOpen(true) }} />}
                        {activeTab === "Restricted Areas" && <RestrictedAreasTab areas={restrictedAreas} onDelete={(item) => handleDelete(item, 'Area')} onStatusToggle={(item) => handleStatusToggle(item, 'Area')} onEdit={(item) => handleEdit(item, 'Area')} onAddArea={() => { setEditingArea(null); setIsAreaModalOpen(true) }} />}
                        {activeTab === "Expansion Planning" && <ExpansionPlanningTab plans={expansionPlans} onDelete={(item) => handleDelete(item, 'Plan')} onEdit={(item) => handleEdit(item, 'Plan')} onAddPlan={() => { setEditingPlan(null); setIsPlanModalOpen(true) }} />}
                        {activeTab === "Geo-Fencing" && (
                            <div className="flex items-center justify-center h-96 text-white/40">
                                Geo-Fencing Map View Placeholder
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Modal */}
            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete ${deleteType}`}
                description={`Are you sure you want to delete this ${deleteType.toLowerCase()}?`}
                itemName={itemToDelete?.name || itemToDelete?.city_name || itemToDelete?.location}
            />

            {/* Status Modal */}
            <StatusConfirmationModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={confirmStatusToggle}
                itemName={itemToToggle?.name || itemToToggle?.city_name}
                currentStatus={itemToToggle?.status?.toLowerCase()}
            />

            {/* City Modal */}
            <CityModal
                isOpen={isCityModalOpen}
                onClose={() => { setIsCityModalOpen(false); setEditingCity(null) }}
                onSave={handleSaveCity}
                initialData={editingCity}
            />

            {/* Service Zone Modal */}
            <ServiceZoneModal
                isOpen={isZoneModalOpen}
                onClose={() => { setIsZoneModalOpen(false); setEditingZone(null) }}
                onSave={handleSaveZone}
                initialData={editingZone}
                cities={cities}
            />

            {/* Transportation Hub Modal */}
            <TransportationHubModal
                isOpen={isHubModalOpen}
                onClose={() => { setIsHubModalOpen(false); setEditingHub(null) }}
                onSave={handleSaveHub}
                initialData={editingHub}
                cities={cities}
            />

            {/* Restricted Area Modal */}
            <RestrictedAreaModal
                isOpen={isAreaModalOpen}
                onClose={() => { setIsAreaModalOpen(false); setEditingArea(null) }}
                onSave={handleSaveArea}
                initialData={editingArea}
                cities={cities}
            />

            {/* Expansion Plan Modal */}
            <ExpansionPlanModal
                isOpen={isPlanModalOpen}
                onClose={() => { setIsPlanModalOpen(false); setEditingPlan(null) }}
                onSave={handleSavePlan}
                initialData={editingPlan}
            />
        </AdminLayout>
    )
}

function CitiesTab({ cities, onDelete, onStatusToggle, onEdit }: { cities: City[], onDelete: (item: City) => void, onStatusToggle: (item: City) => void, onEdit: (item: City) => void }) {
    if (cities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-white/40">
                <Building size={48} className="mb-4 opacity-50" />
                <p>No cities found. Add your first city to get started.</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                        <th className="px-6 py-4 font-medium">City</th>
                        <th className="px-6 py-4 font-medium">Country</th>
                        <th className="px-6 py-4 font-medium">Zones</th>
                        <th className="px-6 py-4 font-medium">Currency</th>
                        <th className="px-6 py-4 font-medium">Services</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {cities.map((city) => (
                        <tr key={city.id} className="hover:bg-white/5 transition-colors group">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                        <Building size={16} />
                                    </div>
                                    <span className="font-semibold text-white">{city.name}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-white/70">{city.country}</td>
                            <td className="px-6 py-4 text-white/70">{city.service_zones_count || 0}</td>
                            <td className="px-6 py-4 text-white/70">{city.currency || '-'}</td>
                            <td className="px-6 py-4">
                                <div className="flex gap-1 flex-wrap">
                                    {city.services?.map(s => (
                                        <span key={s} className="px-2 py-0.5 rounded-full border border-white/10 text-xs text-white/60 bg-white/5">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <button 
                                    onClick={() => onStatusToggle(city)}
                                    className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                        city.status === 'active' 
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30' 
                                            : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'
                                    }`}
                                >
                                    {city.status === 'active' ? 'Active' : 'Inactive'}
                                </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <IconButton tooltip="View" onClick={() => router.visit(`/admin/cities-zones/${city.id}`)}>
                                        <Eye size={16} />
                                    </IconButton>
                                    <IconButton tooltip="Edit" onClick={() => onEdit(city)}>
                                        <Edit size={16} />
                                    </IconButton>
                                    <IconButton tooltip="Delete" variant="danger" onClick={() => onDelete(city)}>
                                        <Trash2 size={16} />
                                    </IconButton>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function ServiceZonesTab({ zones, cities, onDelete, onStatusToggle, onEdit, onAddZone }: { 
    zones: ServiceZone[], 
    cities: City[], 
    onDelete: (item: ServiceZone) => void, 
    onStatusToggle: (item: ServiceZone) => void,
    onEdit: (item: ServiceZone) => void,
    onAddZone: () => void 
}) {
    const [selectedCity, setSelectedCity] = useState<number | null>(null)
    const [filteredZones, setFilteredZones] = useState<ServiceZone[]>(zones)

    useEffect(() => {
        if (selectedCity) {
            setFilteredZones(zones.filter(z => z.city_id === selectedCity))
        } else {
            setFilteredZones(zones)
        }
    }, [selectedCity, zones])

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full min-h-[600px]">
            {/* Map Area */}
            <div className="lg:col-span-2 border-r border-white/5 bg-white/5 flex flex-col p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold text-lg">Zone Map</div>
                    <Dropdown 
                        value={selectedCity ? selectedCity.toString() : "all"}
                        onChange={(val) => setSelectedCity(val === "all" ? null : Number(val))}
                        placeholder="All Cities"
                        options={[
                            { value: "all", label: "All Cities" },
                            ...cities.map(city => ({ value: city.id, label: city.name }))
                        ]}
                        className="w-[180px]"
                    />
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20">
                    <MapIcon size={48} />
                </div>
            </div>
            
            {/* Zones List */}
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg">Service Zones ({filteredZones.length})</h3>
                </div>
                
                {filteredZones.length === 0 ? (
                    <div className="text-center text-white/40 py-8">
                        <Navigation size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No zones found</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                        {filteredZones.map((zone) => (
                            <div key={zone.id} className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium text-white">{zone.name}</div>
                                    <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
                                        {zone.price_multiplier}x
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-white/50">{zone.city?.name || 'Unknown City'}</div>
                                    <div className="flex gap-1">
                                        <button 
                                            onClick={() => onStatusToggle(zone)}
                                            className={`px-2 py-0.5 rounded text-xs ${
                                                zone.status === 'active' 
                                                    ? 'bg-green-500/20 text-green-400' 
                                                    : 'bg-red-500/20 text-red-400'
                                            }`}
                                        >
                                            {zone.status}
                                        </button>
                                        <IconButton tooltip="Edit" onClick={() => onEdit(zone)}>
                                            <Edit size={12} />
                                        </IconButton>
                                        <IconButton tooltip="Delete" variant="danger" onClick={() => onDelete(zone)}>
                                            <Trash2 size={12} />
                                        </IconButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Button className="w-full mt-6" variant="outline" onClick={onAddZone}>
                    <Plus size={16} />
                    Add Zone
                </Button>
            </div>
        </div>
    )
}

function AirportsTab({ hubs, onDelete, onStatusToggle, onEdit, onAddHub }: { hubs: TransportationHub[], onDelete: (item: TransportationHub) => void, onStatusToggle: (item: TransportationHub) => void, onEdit: (item: TransportationHub) => void, onAddHub: () => void }) {
    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'airport': return <Plane size={16} />
            case 'station': return <Train size={16} />
            default: return <Building size={16} />
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        Airports & Transportation Hubs
                    </h2>
                    <p className="text-white/50 text-sm">Special pickup/dropoff zones with queue management</p>
                </div>
                <Button onClick={onAddHub}>
                    <Plus size={16} />
                    Add Hub
                </Button>
            </div>
            
            {hubs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/40">
                    <Plane size={48} className="mb-4 opacity-50" />
                    <p>No transportation hubs found. Add your first hub to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                <th className="px-6 py-4 font-medium">Location</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">City</th>
                                <th className="px-6 py-4 font-medium">Queue Capacity</th>
                                <th className="px-6 py-4 font-medium">Pickup Fee</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {hubs.map((hub) => (
                                <tr key={hub.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                                                {getTypeIcon(hub.type)}
                                            </div>
                                            <span className="font-medium">{hub.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-full border border-white/10 text-xs bg-white/5 text-white/70 capitalize">
                                            {hub.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/70">{hub.city?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4 text-white/70">{hub.queue_capacity} drivers</td>
                                    <td className="px-6 py-4 text-white/70">${Number(hub.pickup_fee).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => onStatusToggle(hub)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                hub.status === 'active' 
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30' 
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'
                                            }`}
                                        >
                                            {hub.status === 'active' ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton tooltip="Edit" onClick={() => onEdit(hub)}>
                                                <Edit size={16} />
                                            </IconButton>
                                            <IconButton tooltip="Delete" variant="danger" onClick={() => onDelete(hub)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function RestrictedAreasTab({ areas, onDelete, onStatusToggle, onEdit, onAddArea }: { areas: RestrictedArea[], onDelete: (item: RestrictedArea) => void, onStatusToggle: (item: RestrictedArea) => void, onEdit: (item: RestrictedArea) => void, onAddArea: () => void }) {
    const getRestrictionTypeStyle = (type: string) => {
        switch (type) {
            case 'no_entry': return 'bg-red-500/20 text-red-400'
            case 'time_based': return 'bg-orange-500/20 text-orange-400'
            case 'pickup_only': return 'bg-yellow-500/20 text-yellow-400'
            case 'dropoff_only': return 'bg-purple-500/20 text-purple-400'
            default: return 'bg-white/10 text-white/70'
        }
    }

    const formatRestrictionType = (type: string) => {
        return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                     <h2 className="text-xl font-bold">Restricted Areas</h2>
                     <p className="text-white/50 text-sm">Areas where service is limited or prohibited</p>
                </div>
                <Button onClick={onAddArea}>
                    <Plus size={16} />
                    Add Restriction
                </Button>
            </div>

            {areas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/40">
                    <ShieldAlert size={48} className="mb-4 opacity-50" />
                    <p>No restricted areas found. Add your first restriction to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                <th className="px-6 py-4 font-medium">Area Name</th>
                                <th className="px-6 py-4 font-medium">City</th>
                                <th className="px-6 py-4 font-medium">Restriction Type</th>
                                <th className="px-6 py-4 font-medium">Reason</th>
                                <th className="px-6 py-4 font-medium">Effective</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {areas.map((area) => (
                                <tr key={area.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium">{area.name}</td>
                                    <td className="px-6 py-4 text-white/70">{area.city?.name || 'Unknown'}</td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${getRestrictionTypeStyle(area.restriction_type)}`}>
                                            {formatRestrictionType(area.restriction_type)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-white/70">{area.reason || '-'}</td>
                                    <td className="px-6 py-4 text-white/70">{area.effective_period || 'Permanent'}</td>
                                    <td className="px-6 py-4">
                                        <button 
                                            onClick={() => onStatusToggle(area)}
                                            className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                                                area.status === 'active' 
                                                    ? 'bg-green-500/20 text-green-400 border border-green-500/20 hover:bg-green-500/30' 
                                                    : 'bg-red-500/20 text-red-400 border border-red-500/20 hover:bg-red-500/30'
                                            }`}
                                        >
                                            {area.status === 'active' ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton tooltip="Edit" onClick={() => onEdit(area)}>
                                                <Edit size={16} />
                                            </IconButton>
                                            <IconButton tooltip="Delete" variant="danger" onClick={() => onDelete(area)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function ExpansionPlanningTab({ plans, onDelete, onEdit, onAddPlan }: { plans: ExpansionPlan[], onDelete: (item: ExpansionPlan) => void, onEdit: (item: ExpansionPlan) => void, onAddPlan: () => void }) {
    const formatStage = (stage: string) => {
        return stage.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'research': return 'bg-gray-500/20 text-gray-400'
            case 'partnerships': return 'bg-blue-500/20 text-blue-400'
            case 'licensing': return 'bg-yellow-500/20 text-yellow-400'
            case 'launch_prep': return 'bg-orange-500/20 text-orange-400'
            case 'launched': return 'bg-green-500/20 text-green-400'
            default: return 'bg-white/10 text-white/60'
        }
    }

    const checklistItems = [
        { label: "Market Research", stage: "research" },
        { label: "Legal & Licensing", stage: "licensing" },
        { label: "Local Partnerships", stage: "partnerships" },
        { label: "Driver Recruitment", stage: "launch_prep" },
        { label: "Payment Integration", stage: "launch_prep" },
        { label: "Marketing Campaign", stage: "launch_prep" },
        { label: "Beta Testing", stage: "launch_prep" },
        { label: "Full Launch", stage: "launched" },
    ]

    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Expansion Pipeline</h3>
                    <Button variant="outline" onClick={onAddPlan}>
                        <Plus size={14} />
                        Add Plan
                    </Button>
                </div>

                {plans.length === 0 ? (
                    <div className="text-center text-white/40 py-8">
                        <Globe size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No expansion plans found</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {plans.map((plan) => (
                            <div key={plan.id} className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">{plan.city_name}, {plan.country}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{plan.progress}%</span>
                                        <IconButton tooltip="Edit" onClick={() => onEdit(plan)}>
                                            <Edit size={12} />
                                        </IconButton>
                                        <IconButton tooltip="Delete" variant="danger" onClick={() => onDelete(plan)}>
                                            <Trash2 size={12} />
                                        </IconButton>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full border border-white/5 ${getStageColor(plan.stage)}`}>
                                        {formatStage(plan.stage)}
                                    </span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                                        style={{ width: `${plan.progress}%` }}
                                    />
                                </div>
                                {plan.target_launch_date && (
                                    <div className="text-xs text-white/50 mt-2">
                                        Target: {new Date(plan.target_launch_date).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                 <h3 className="font-bold text-lg mb-6">Expansion Checklist</h3>
                 <div className="space-y-4">
                     {checklistItems.map((task, i) => {
                         const isCompleted = plans.some(p => {
                             const stageOrder = ['research', 'partnerships', 'licensing', 'launch_prep', 'launched']
                             return stageOrder.indexOf(p.stage) >= stageOrder.indexOf(task.stage)
                         })
                         
                         return (
                             <div key={i} className={`p-4 rounded-xl border flex items-center gap-3 ${
                                 isCompleted ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10 text-white/50"
                             }`}>
                                 {isCompleted ? <CheckCircle size={20} className="text-green-500" /> : <XCircle size={20} />}
                                 <span className={isCompleted ? "text-green-100" : ""}>{task.label}</span>
                             </div>
                         )
                     })}
                 </div>
            </div>
        </div>
    )
}

function StatsCard({ label, value, trend, trendUp, icon }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex flex-col justify-between h-full relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div>
                     <p className="text-white/50 text-sm font-medium mb-1">{label}</p>
                     <div className="text-3xl font-bold">{value}</div>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
            </div>
            
            <div className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                <span className="text-lg leading-none">{trendUp ? '↗' : '↘'}</span> {trend}
            </div>
        </div>
    )
}
