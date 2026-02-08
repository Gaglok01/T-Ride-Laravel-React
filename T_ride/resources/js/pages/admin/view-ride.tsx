import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, MapPin, Navigation, User, Car, Clock, DollarSign, Calendar, Star, Phone, MessageSquare } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import axios from "@/lib/axios"
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api'

declare global {
    interface Window {
        google: any
    }
}

interface Ride {
    id: number
    ride_custom_id: string
    rider_id: number
    driver_id: number | null
    vehicle_type_id: number
    pickup_address: string
    dropoff_address: string
    pickup_lat: number
    pickup_lng: number
    dropoff_lat: number
    dropoff_lng: number
    fare: number
    payment_method: string
    payment_status: string
    status: string
    rating: number | null
    created_at: string
    started_at: string | null
    completed_at: string | null
    rider: { id: number, name: string, phone_number?: string, photo?: string }
    driver: { id: number, name: string, phone_number?: string, photo?: string } | null
    vehicleType?: { name: string, icon: string }
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem'
}

const defaultCenter = {
    lat: 40.7549,
    lng: -73.9840
}

export default function ViewRide({ id }: { id: string }) {
    const [ride, setRide] = useState<Ride | null>(null)
    const [loading, setLoading] = useState(true)
    const [driverLocation, setDriverLocation] = useState<{ lat: number, lng: number } | null>(null)

    useEffect(() => {
        fetchRide()
    }, [id])

    // Simulate driver movement for "in_progress" rides
    useEffect(() => {
        if (ride && ride.status === 'in_progress' && ride.driver) {
            // Start driver at slight offset from pickup or somewhere random between pickup/dropoff
            // For simplicity, let's just use pickup or a point near it
            setDriverLocation({ lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng) })
            
            const interval = setInterval(() => {
                setDriverLocation(prev => {
                    if (!prev) return { lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng) }
                    // Move slightly towards dropoff
                    const dLat = Number(ride.dropoff_lat)
                    const dLng = Number(ride.dropoff_lng)
                    
                    const newLat = prev.lat + (dLat - prev.lat) * 0.05
                    const newLng = prev.lng + (dLng - prev.lng) * 0.05
                    
                    return { lat: newLat, lng: newLng }
                })
            }, 2000)

            return () => clearInterval(interval)
        } else if (ride && (ride.status === 'completed' || ride.status === 'pending')) {
             setDriverLocation(null)
        }
    }, [ride])

    const fetchRide = async () => {
        try {
            setLoading(true)
            const response = await axios.get(`/admin/rides/${id}`)
            if (response.data.status) {
                setRide(response.data.data)
            }
        } catch (error) {
            console.error("Failed to fetch ride details:", error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-500 bg-green-500/10'
            case 'in_progress': return 'text-blue-500 bg-blue-500/10'
            case 'cancelled': return 'text-red-500 bg-red-500/10'
            default: return 'text-yellow-500 bg-yellow-500/10'
        }
    }

    if (loading) {
        return (
             <AdminLayout title="Ride Details" description="Loading ride information...">
                <div className="flex justify-center items-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tride-yellow"></div>
                </div>
             </AdminLayout>
        )
    }

    if (!ride) {
        return (
            <AdminLayout title="Ride Not Found" description="The requested ride could not be found.">
                 <div className="text-center py-20">
                    <h3 className="text-lg font-medium text-tride-text">Ride not found</h3>
                    <Link href="/admin/rides" className="mt-4 inline-block text-tride-yellow hover:underline">
                        Return to Rides List
                    </Link>
                </div>
            </AdminLayout>
        )
    }

    const pathCoordinates = [
        { lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng) },
        { lat: Number(ride.dropoff_lat), lng: Number(ride.dropoff_lng) }
    ];

    return (
        <AdminLayout
            title={`Ride: ${ride.ride_custom_id}`}
            description="Detailed view of ride"
            actions={
                <Link href="/admin/rides">
                    <Button variant="secondary">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to List
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
                {/* Left Column: Stats & Users */}
                <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    
                    {/* Status Card */}
                    <div className="bg-tride-card border border-tride-border p-5 rounded-3xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-tride-text">Ride Status</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(ride.status)}`}>
                                {ride.status.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-tride-hover p-3 rounded-xl">
                                <p className="text-xs text-tride-text-muted mb-1">Fare Amount</p>
                                <p className="text-xl font-bold text-tride-text">${Number(ride.fare).toFixed(2)}</p>
                            </div>
                             <div className="bg-tride-hover p-3 rounded-xl">
                                <p className="text-xs text-tride-text-muted mb-1">Payment</p>
                                <p className="text-sm font-bold text-tride-text">{ride.payment_method}</p>
                                <p className={`text-xs ${ride.payment_status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                                    {ride.payment_status}
                                </p>
                            </div>
                        </div>
                        {ride.rating && (
                            <div className="mt-4 flex items-center justify-center p-3 bg-yellow-500/10 rounded-xl">
                                <div className="flex gap-1 text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill={i < ride.rating! ? "currentColor" : "none"} strokeWidth={i < ride.rating! ? 0 : 2} />
                                    ))}
                                </div>
                                <span className="ml-2 font-bold text-tride-text">{ride.rating}.0 Rating</span>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <div className="bg-tride-card border border-tride-border p-5 rounded-3xl">
                        <h3 className="font-semibold text-tride-text mb-4">Ride Timeline</h3>
                        <div className="space-y-6 relative pl-4 border-l-2 border-tride-border ml-2">
                             <div className="relative">
                                <div className="absolute -left-[21px] top-1 bg-tride-card border-2 border-tride-yellow w-3 h-3 rounded-full"></div>
                                <p className="text-xs text-tride-text-muted mb-0.5">Created At</p>
                                <p className="text-sm font-medium text-tride-text">{new Date(ride.created_at).toLocaleString()}</p>
                            </div>
                            
                            {ride.started_at && (
                                <div className="relative">
                                     <div className="absolute -left-[21px] top-1 bg-blue-500 w-3 h-3 rounded-full border-2 border-tride-card"></div>
                                    <p className="text-xs text-tride-text-muted mb-0.5">Started At</p>
                                    <p className="text-sm font-medium text-tride-text">{new Date(ride.started_at).toLocaleString()}</p>
                                </div>
                            )}

                             {ride.completed_at && (
                                <div className="relative">
                                     <div className="absolute -left-[21px] top-1 bg-green-500 w-3 h-3 rounded-full border-2 border-tride-card"></div>
                                    <p className="text-xs text-tride-text-muted mb-0.5">Completed At</p>
                                    <p className="text-sm font-medium text-tride-text">{new Date(ride.completed_at).toLocaleString()}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rider Info */}
                    <div className="bg-tride-card border border-tride-border p-5 rounded-3xl">
                         <h3 className="font-semibold text-tride-text mb-4 flex items-center gap-2">
                             <User size={18} className="text-tride-yellow" />
                             Rider Details
                         </h3>
                         <div className="flex items-center gap-4 mb-4">
                             <div className="w-12 h-12 bg-tride-hover rounded-full flex items-center justify-center font-bold text-xl text-tride-text">
                                 {ride.rider?.name?.charAt(0) || "U"}
                             </div>
                             <div>
                                 <p className="font-bold text-tride-text">{ride.rider?.name}</p>
                                 <p className="text-sm text-tride-text-muted">{ride.rider?.phone_number || "No phone"}</p>
                             </div>
                         </div>
                         <div className="flex gap-2">
                             <Button size="sm" variant="secondary" className="flex-1">
                                 <Phone size={14} className="mr-1" /> Call
                             </Button>
                             <Button size="sm" variant="secondary" className="flex-1">
                                 <MessageSquare size={14} className="mr-1" /> Chat
                             </Button>
                         </div>
                    </div>

                    {/* Driver Info */}
                    {ride.driver ? (
                        <div className="bg-tride-card border border-tride-border p-5 rounded-3xl">
                            <h3 className="font-semibold text-tride-text mb-4 flex items-center gap-2">
                                <Car size={18} className="text-tride-yellow" />
                                Driver Details
                            </h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-tride-hover rounded-full flex items-center justify-center font-bold text-xl text-tride-text">
                                    {ride.driver?.name?.charAt(0) || "D"}
                                </div>
                                <div>
                                    <p className="font-bold text-tride-text">{ride.driver?.name}</p>
                                    <p className="text-sm text-tride-text-muted">{ride.driver?.phone_number || "No phone"}</p>
                                </div>
                            </div>
                             <div className="mb-4 bg-tride-hover p-3 rounded-xl">
                                <p className="text-xs text-tride-text-muted">Vehicle Type</p>
                                <p className="text-sm font-medium text-tride-text">{ride.vehicleType?.name || "Standard"}</p>
                             </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" className="flex-1">
                                    <Phone size={14} className="mr-1" /> Call
                                </Button>
                                <Button size="sm" variant="secondary" className="flex-1">
                                    <MessageSquare size={14} className="mr-1" /> Chat
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-tride-card border border-tride-border p-5 rounded-3xl border-dashed">
                             <div className="text-center py-4 text-tride-text-muted">
                                 <p>No driver assigned yet</p>
                             </div>
                        </div>
                    )}

                </div>

                {/* Right Column: Map */}
                <div className="lg:col-span-2 bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-lg relative h-full">
                     <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            zoom={13}
                            center={{ lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng) }}
                            options={{
                                styles: [
                                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                                    // ... simpler dark mode style
                                ],
                                disableDefaultUI: false,
                                zoomControl: true,
                            }}
                        >
                            {/* Pickup Marker */}
                            <Marker 
                                position={{ lat: Number(ride.pickup_lat), lng: Number(ride.pickup_lng) }} 
                                label="A"
                                title={`Pickup: ${ride.pickup_address}`}
                            />
                            
                            {/* Dropoff Marker */}
                            <Marker 
                                position={{ lat: Number(ride.dropoff_lat), lng: Number(ride.dropoff_lng) }} 
                                label="B"
                                title={`Dropoff: ${ride.dropoff_address}`}
                            />

                             {/* Driver Location Marker (if in progress) */}
                             {driverLocation && window.google && (
                                <Marker
                                    position={driverLocation}
                                    icon={{
                                        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                        scale: 5,
                                        fillColor: "#F5C518", // T-Ride Yellow
                                        fillOpacity: 1,
                                        strokeWeight: 1
                                    }}
                                    title="Driver Location"
                                />
                             )}

                            {/* Standard Route Line */}
                            {window.google && (
                                <Polyline
                                    path={pathCoordinates}
                                    options={{
                                        strokeColor: "#F5C518", // T-Ride Yellow
                                        strokeOpacity: 0.8,
                                        strokeWeight: 4,
                                        icons: [{
                                            icon: { path: window.google.maps.SymbolPath.FORWARD_OPEN_ARROW },
                                            offset: '100%',
                                            repeat: '100px'
                                        }]
                                    }}
                                />
                            )}
                        </GoogleMap>
                     </LoadScript>
                     
                     {/* Overlay Address Details */}
                     <div className="absolute top-4 left-4 right-4 bg-tride-card/90 backdrop-blur-md p-4 rounded-2xl border border-tride-border max-w-xl mx-auto shadow-lg">
                         <div className="flex flex-col gap-3">
                             <div className="flex gap-3">
                                 <div className="mt-1">
                                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                     <div className="w-0.5 h-8 bg-tride-border mx-auto my-1"></div>
                                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                 </div>
                                 <div className="flex-1 space-y-4">
                                     <div>
                                         <p className="text-xs text-tride-text-muted">Pickup Location</p>
                                         <p className="text-sm font-medium text-tride-text truncate">{ride.pickup_address}</p>
                                     </div>
                                      <div>
                                         <p className="text-xs text-tride-text-muted">Dropoff Location</p>
                                         <p className="text-sm font-medium text-tride-text truncate">{ride.dropoff_address}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
            </div>
        </AdminLayout>
    )
}
