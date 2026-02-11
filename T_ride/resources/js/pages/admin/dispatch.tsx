import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Car, Package, Truck, Users, Clock, Plus, RefreshCw, MapPin, Phone, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { GoogleMap, Marker, Autocomplete } from "@react-google-maps/api"
import { useGoogleMaps } from "@/providers/GoogleMapsProvider"

// ==================== INTERFACES ====================

interface DispatchStats {
    active_rides: number
    active_deliveries: number
    active_couriers: number
    online_drivers: number
    pending_assignment: number
    trends: {
        rides_trend: string
        deliveries_trend: string
        couriers_trend: string
        drivers_trend: string
        pending_trend: string
    }
}

interface PendingOrder {
    id: number
    order_id: string
    type: string
    status: string
    time_ago: string
    pickup: string
    dropoff: string
    source_type: string
    source_id: number
}

interface AvailableDriver {
    id: number
    name: string
    phone: string
    vehicle_type: string
    service_type: string
    rating: number
    photo: string | null
}

// ==================== MAIN COMPONENT ====================

export default function DispatchPage() {
    const [stats, setStats] = useState<DispatchStats | null>(null)
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
    const [availableDrivers, setAvailableDrivers] = useState<AvailableDriver[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    // Modal states
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null)
    const [isAssigning, setIsAssigning] = useState(false)

    const { isLoaded } = useGoogleMaps()

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
        borderRadius: '1.5rem'
    }

    const center = {
        lat: 31.5204, // Default to Lahore
        lng: 74.3587
    }

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setLoading(true)
        try {
            const [statsRes, ordersRes, driversRes] = await Promise.all([
                axios.get('/admin/dispatch/stats'),
                axios.get('/admin/dispatch/pending-orders'),
                axios.get('/admin/dispatch/available-drivers')
            ])

            if (statsRes.data.status) setStats(statsRes.data.data)
            if (ordersRes.data.status) setPendingOrders(ordersRes.data.data)
            if (driversRes.data.status) setAvailableDrivers(driversRes.data.data)
        } catch (error) {
            console.error("Failed to fetch dispatch data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchAllData()
        setRefreshing(false)
    }

    const openAssignModal = (order: PendingOrder) => {
        setSelectedOrder(order)
        setIsAssignModalOpen(true)
    }

    const handleAssignDriver = async (driverId: number) => {
        if (!selectedOrder) return
        
        setIsAssigning(true)
        try {
            await axios.post('/admin/dispatch/assign-driver', {
                order_type: selectedOrder.source_type,
                order_id: selectedOrder.source_id,
                driver_id: driverId
            })
            setIsAssignModalOpen(false)
            setSelectedOrder(null)
            fetchAllData()
        } catch (error) {
            console.error("Failed to assign driver:", error)
        } finally {
            setIsAssigning(false)
        }
    }

    return (
        <AdminLayout
            title="Dispatch Center"
            description="Live operations management"
            actions={
                <div className="flex items-center gap-3">
                    <Button variant="secondary" onClick={handleRefresh} disabled={refreshing}>
                        <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                        Refresh
                    </Button>
                    <Button onClick={() => setIsBookingModalOpen(true)}>
                        <Plus size={18} />
                        Manual Booking
                    </Button>
                </div>
            }
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                <StatsCard 
                    label="Active Rides" 
                    value={stats?.active_rides || 0} 
                    trend={stats?.trends?.rides_trend || "+0"} 
                    icon={<Car size={20} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Active Deliveries" 
                    value={stats?.active_deliveries || 0} 
                    trend={stats?.trends?.deliveries_trend || "+0"} 
                    icon={<Truck size={20} className="text-green-500" />}
                    iconBg="bg-green-500/10"
                />
                <StatsCard 
                    label="Active Couriers" 
                    value={stats?.active_couriers || 0} 
                    trend={stats?.trends?.couriers_trend || "+0"} 
                    icon={<Package size={20} className="text-purple-500" />}
                    iconBg="bg-purple-500/10"
                />
                <StatsCard 
                    label="Online Drivers" 
                    value={stats?.online_drivers || 0} 
                    trend={stats?.trends?.drivers_trend || "+0"} 
                    icon={<Users size={20} className="text-orange-500" />}
                    iconBg="bg-orange-500/10"
                />
                <StatsCard 
                    label="Pending Assignment" 
                    value={stats?.pending_assignment || 0} 
                    trend={stats?.trends?.pending_trend || "0"} 
                    icon={<Clock size={20} className="text-red-500" />}
                    iconBg="bg-red-500/10"
                    trendDown={stats?.trends?.pending_trend?.startsWith('-')}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Map */}
                <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-tride-text mb-4">Live Map</h3>
                    <div className="bg-tride-hover rounded-2xl h-96 overflow-hidden">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={mapContainerStyle}
                                center={center}
                                zoom={12}
                                options={{
                                    styles: darkMapStyles,
                                    disableDefaultUI: true,
                                    zoomControl: true,
                                }}
                            >
                                {/* We can add markers for active drivers/rides here */}
                            </GoogleMap>
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-tride-text-muted">
                                <MapPin size={48} className="mx-auto mb-3" />
                                <p>Loading map...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Pending Orders */}
                <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                    <h3 className="text-lg font-bold text-tride-text mb-4">Pending Orders</h3>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin h-6 w-6 border-2 border-tride-yellow border-t-transparent rounded-full"></div>
                            </div>
                        ) : pendingOrders.length === 0 ? (
                            <div className="text-center py-8 text-tride-text-muted">
                                No pending orders at the moment
                            </div>
                        ) : (
                            pendingOrders.map(order => (
                                <OrderCard 
                                    key={`${order.source_type}-${order.source_id}`}
                                    order={order}
                                    onAssign={() => openAssignModal(order)}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Manual Booking Modal */}
            <ManualBookingModal 
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                onSave={fetchAllData}
                isLoaded={isLoaded}
            />

            {/* Assign Driver Modal */}
            <AssignDriverModal 
                isOpen={isAssignModalOpen}
                onClose={() => {
                    setIsAssignModalOpen(false)
                    setSelectedOrder(null)
                }}
                order={selectedOrder}
                drivers={availableDrivers}
                onAssign={handleAssignDriver}
                isAssigning={isAssigning}
            />
        </AdminLayout>
    )
}

// ==================== COMPONENTS ====================

function StatsCard({ label, value, trend, icon, iconBg, trendDown = false }: { 
    label: string
    value: number
    trend: string
    icon: React.ReactNode
    iconBg: string
    trendDown?: boolean
}) {
    const isPositive = trend.startsWith('+') || (!trend.startsWith('-') && !trendDown)
    
    return (
        <div className="bg-tride-card border border-tride-border p-5 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-tride-text-muted">{label}</p>
                <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <p className="text-3xl font-bold text-tride-text mb-1">{value.toLocaleString()}</p>
            <p className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                ↗ {trend}
            </p>
        </div>
    )
}

function OrderCard({ order, onAssign }: { order: PendingOrder, onAssign: () => void }) {
    const getTypeColor = (type: string) => {
        switch (type.toLowerCase()) {
            case 'ride': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            case 'delivery': return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'courier': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
            default: return 'bg-white/10 text-white/70 border-white/20'
        }
    }

    return (
        <div className="bg-tride-hover border border-tride-border rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(order.type)}`}>
                    {order.type}
                </span>
                <span className="text-xs text-tride-text-muted">{order.time_ago}</span>
            </div>
            <p className="font-bold text-tride-text mb-1">Order #{order.order_id}</p>
            <p className="text-sm text-tride-text-muted mb-3">{order.status}</p>
            <Button 
                variant="secondary" 
                size="sm" 
                className="w-full justify-center"
                onClick={onAssign}
            >
                Assign Driver
            </Button>
        </div>
    )
}

// ==================== MODALS ====================

function ManualBookingModal({ isOpen, onClose, onSave, isLoaded }: { 
    isOpen: boolean, 
    onClose: () => void, 
    onSave: () => void,
    isLoaded: boolean
}) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    
    const [type, setType] = useState("ride")
    const [customerName, setCustomerName] = useState("")
    const [customerPhone, setCustomerPhone] = useState("")
    const [pickupAddress, setPickupAddress] = useState("")
    const [dropoffAddress, setDropoffAddress] = useState("")
    const [fare, setFare] = useState("")
    const [notes, setNotes] = useState("")

    const [pickupAutocomplete, setPickupAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
    const [dropoffAutocomplete, setDropoffAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

    const onPickupLoad = (autocomplete: google.maps.places.Autocomplete) => {
        setPickupAutocomplete(autocomplete)
    }

    const onDropoffLoad = (autocomplete: google.maps.places.Autocomplete) => {
        setDropoffAutocomplete(autocomplete)
    }

    const onPickupPlaceChanged = () => {
        if (pickupAutocomplete !== null) {
            const place = pickupAutocomplete.getPlace()
            if (place.formatted_address) {
                setPickupAddress(place.formatted_address)
            }
        }
    }

    const onDropoffPlaceChanged = () => {
        if (dropoffAutocomplete !== null) {
            const place = dropoffAutocomplete.getPlace()
            if (place.formatted_address) {
                setDropoffAddress(place.formatted_address)
            }
        }
    }

    useEffect(() => {
        if (isOpen) {
            setType("ride")
            setCustomerName("")
            setCustomerPhone("")
            setPickupAddress("")
            setDropoffAddress("")
            setFare("")
            setNotes("")
            setError("")
        }
    }, [isOpen])

    const handleSubmit = async () => {
        if (!customerName || !customerPhone || !pickupAddress || !dropoffAddress) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            await axios.post('/admin/dispatch/manual-booking', {
                type,
                customer_name: customerName,
                customer_phone: customerPhone,
                pickup_address: pickupAddress,
                dropoff_address: dropoffAddress,
                fare: fare ? parseFloat(fare) : null,
                notes
            })
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
            title="Manual Booking"
            description="Create a new booking manually"
            icon={<Plus size={20} />}
            size="lg"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>Cancel</ModalButton>
                    <ModalButton variant="primary" onClick={handleSubmit} isLoading={loading}>
                        Create Booking
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />
                
                <ModalSelect
                    label="Booking Type"
                    value={type}
                    onChange={setType}
                    options={[
                        { label: "Ride", value: "ride" },
                        { label: "Delivery", value: "delivery" },
                        { label: "Courier", value: "courier" },
                    ]}
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput 
                        label="Customer Name" 
                        value={customerName} 
                        onChange={setCustomerName} 
                        placeholder="John Doe"
                        icon={<User size={16} />}
                        required 
                    />
                    <ModalInput 
                        label="Customer Phone" 
                        value={customerPhone} 
                        onChange={setCustomerPhone} 
                        placeholder="+1234567890"
                        icon={<Phone size={16} />}
                        required 
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-white/70 ml-1">Pickup Address</label>
                    {isLoaded ? (
                        <Autocomplete onLoad={onPickupLoad} onPlaceChanged={onPickupPlaceChanged}>
                            <input 
                                type="text"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                                placeholder="123 Main St, City"
                                className="w-full bg-tride-hover border border-tride-border rounded-xl px-4 py-3 text-tride-text focus:outline-none focus:border-tride-yellow transition-all"
                                required
                            />
                        </Autocomplete>
                    ) : (
                        <ModalInput 
                            label="" 
                            value={pickupAddress} 
                            onChange={setPickupAddress} 
                            placeholder="123 Main St, City"
                            icon={<MapPin size={16} />}
                            required 
                        />
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-white/70 ml-1">Dropoff Address</label>
                    {isLoaded ? (
                        <Autocomplete onLoad={onDropoffLoad} onPlaceChanged={onDropoffPlaceChanged}>
                            <input 
                                type="text"
                                value={dropoffAddress}
                                onChange={(e) => setDropoffAddress(e.target.value)}
                                placeholder="456 Oak Ave, City"
                                className="w-full bg-tride-hover border border-tride-border rounded-xl px-4 py-3 text-tride-text focus:outline-none focus:border-tride-yellow transition-all"
                                required
                            />
                        </Autocomplete>
                    ) : (
                        <ModalInput 
                            label="" 
                            value={dropoffAddress} 
                            onChange={setDropoffAddress} 
                            placeholder="456 Oak Ave, City"
                            icon={<MapPin size={16} />}
                            required 
                        />
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <ModalInput 
                        label="Fare (Optional)" 
                        value={fare} 
                        onChange={setFare} 
                        placeholder="25.00"
                        type="number"
                    />
                    <ModalInput 
                        label="Notes (Optional)" 
                        value={notes} 
                        onChange={setNotes} 
                        placeholder="Any special instructions"
                    />
                </div>
            </div>
        </Modal>
    )
}

function AssignDriverModal({ isOpen, onClose, order, drivers, onAssign, isAssigning }: {
    isOpen: boolean
    onClose: () => void
    order: PendingOrder | null
    drivers: AvailableDriver[]
    onAssign: (driverId: number) => void
    isAssigning: boolean
}) {
    const [selectedDriverId, setSelectedDriverId] = useState<string>("")

    useEffect(() => {
        if (isOpen) {
            setSelectedDriverId("")
        }
    }, [isOpen])

    // Filter drivers based on order type
    const filteredDrivers = drivers.filter(driver => {
        if (!order) return false
        const orderType = order.type.toLowerCase()
        return driver.service_type === orderType
    })

    const driverOptions = filteredDrivers.map(driver => ({
        label: `${driver.name} (${driver.vehicle_type}) - ⭐ ${driver.rating}`,
        value: driver.id.toString()
    }))

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Driver"
            description={order ? `Assign a driver to ${order.type} Order #${order.order_id}` : "Select a driver"}
            icon={<Users size={20} />}
            size="md"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={isAssigning}>Cancel</ModalButton>
                    <ModalButton 
                        variant="primary" 
                        onClick={() => selectedDriverId && onAssign(parseInt(selectedDriverId))} 
                        isLoading={isAssigning}
                        disabled={!selectedDriverId}
                    >
                        Confirm Assignment
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4 py-2">
                <ModalSelect
                    label="Select Active Driver"
                    value={selectedDriverId}
                    onChange={setSelectedDriverId}
                    options={driverOptions}
                    required
                />
                
                {selectedDriverId && (
                    <div className="bg-tride-hover border border-tride-border rounded-xl p-4 flex items-center gap-4">
                        {drivers.find(d => d.id.toString() === selectedDriverId)?.photo ? (
                            <img 
                                src={drivers.find(d => d.id.toString() === selectedDriverId)?.photo || ""} 
                                alt="Driver" 
                                className="w-12 h-12 rounded-full object-cover" 
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-tride-card flex items-center justify-center">
                                <User size={24} className="text-tride-text-muted" />
                            </div>
                        )}
                        <div>
                            <p className="font-semibold text-tride-text">
                                {drivers.find(d => d.id.toString() === selectedDriverId)?.name}
                            </p>
                            <p className="text-sm text-tride-text-muted">
                                {drivers.find(d => d.id.toString() === selectedDriverId)?.phone}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    )
}

// ==================== CONSTANTS ====================

const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b9" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
]
