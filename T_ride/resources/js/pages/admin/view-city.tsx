
import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, Building, Globe, Layers, Plane, ShieldAlert, CheckCircle, Navigation, Map, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import cityZoneService, { City } from "@/services/cityZoneService"
import { GoogleMap } from "@react-google-maps/api"
import { useGoogleMaps } from "@/providers/GoogleMapsProvider"

export default function ViewCity({ id }: { id: number }) {
    const [city, setCity] = useState<City | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Overview")
    const { isLoaded } = useGoogleMaps()

    const mapContainerStyle = {
        width: '100%',
        height: '100%',
        borderRadius: '1rem',
    }
    
    const defaultCenter = {
        lat: 40.7128,
        lng: -74.0060
    }

    useEffect(() => {
        const fetchCity = async () => {
            try {
                const data = await cityZoneService.getCity(id)
                setCity(data)
            } catch (error) {
                console.error("Failed to fetch city details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchCity()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="City Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!city) {
        return (
            <AdminLayout title="City Details" description="Not found">
                <div className="text-center text-white/50 py-12">
                    <Building size={48} className="mx-auto mb-4 opacity-50" />
                    City not found
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="City Details"
            description={`View details for ${city.name}, ${city.country}`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/cities-zones" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Cities & Zones
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: City Profile */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-tride-card border border-tride-card/20 rounded-3xl p-6">
                        <div className="aspect-video w-full bg-blue-500/10 rounded-2xl mb-6 flex items-center justify-center border border-blue-500/20">
                            <Building size={64} className="text-blue-400" />
                        </div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{city.name}</h2>
                                <p className="text-tride-text flex items-center gap-2">
                                    <Globe size={14} />
                                    {city.country}
                                </p>
                            </div>
                            <StatusBadge status={city.status} />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-tride-card/20">
                            <InfoRow label="Currency" value={city.currency || '-'} />
                            <InfoRow label="Timezone" value={city.timezone || '-'} />
                            <div className="py-1">
                                <span className="text-tride-text/40 text-sm block mb-1">Services</span>
                                <div className="flex flex-wrap gap-1">
                                    {city.services && city.services.map((service, index) => (
                                        <span key={index} className="px-2 py-0.5 bg-tride-card/10 rounded-full text-xs text-tride-text/70 border border-tride-card/20">
                                            {service}
                                        </span>
                                    ))}
                                    {(!city.services || city.services.length === 0) && <span className="text-tride-text/30 text-sm">-</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            label="Service Zones" 
                            value={city.service_zones?.length.toString() || '0'} 
                            icon={<Navigation size={16} className="text-blue-400" />}
                            bg="bg-blue-500/10"
                        />
                         <StatCard 
                            label="Transp. Hubs" 
                            value={city.transportation_hubs?.length.toString() || '0'} 
                            icon={<Plane size={16} className="text-orange-400" />}
                            bg="bg-orange-500/10"
                        />
                    </div>
                </div>

                {/* Right Column: Details & Associated Data */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit flex-wrap">
                        {["Overview", "Service Zones", "Transportation Hubs", "Restricted Areas"].map((tab) => (
                            <Button
                                key={tab}
                                variant={activeTab === tab ? "default" : "ghost"}
                                className={activeTab === tab ? "" : ""}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>

                    <div className="bg-tride-card border border-tride-card/20 rounded-3xl p-6 min-h-[400px]">
                        {activeTab === "Overview" && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-tride-card/10 rounded-2xl p-6 border border-tride-card/20">
                                        <h3 className="text-lg font-bold text-tride-text mb-4 flex items-center gap-2">
                                            <Navigation size={20} className="text-blue-400" />
                                            Service Coverage
                                        </h3>
                                        <div className="space-y-4">
                                            <p className="text-tride-text-muted text-sm">
                                                This city has {city.service_zones?.length || 0} active service zones defined.
                                                Service zones determine pricing multipliers and service availability.
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-tride-text-muted">
                                                <CheckCircle size={14} className="text-green-400" />
                                                <span>Operational since {city.created_at ? new Date(city.created_at).getFullYear() : 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-tride-hover rounded-2xl p-6 border border-white/5">
                                        <h3 className="text-lg font-bold text-tride-text mb-4 flex items-center gap-2">
                                            <ShieldAlert size={20} className="text-red-400" />
                                            Restrictions
                                        </h3>
                                        <div className="space-y-4">
                                            <p className="text-tride-text-muted text-sm">
                                                There are {city.restricted_areas?.length || 0} restricted areas in this city where service is limited or prohibited.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-64 bg-tride-hover rounded-2xl border border-tride-border overflow-hidden relative">
                                    {isLoaded ? (
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={defaultCenter}
                                            zoom={11}
                                            options={{
                                                disableDefaultUI: true,
                                                zoomControl: true,
                                                styles: [
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
                                                        stylers: [{ color: "#9ca5b3" }],
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
                                            }}
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-tride-text-muted">
                                            <div className="flex flex-col items-center">
                                                <Loader2 size={32} className="animate-spin mb-2" />
                                                <p>Loading Map...</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "Service Zones" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white mb-4">Service Zones</h3>
                                {city.service_zones && city.service_zones.length > 0 ? (
                                    <div className="grid gap-4">
                                        {city.service_zones.map(zone => (
                                            <div key={zone.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-white">{zone.name}</h4>
                                                    <p className="text-xs text-white/50">{zone.description || 'No description'}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-bold">
                                                        {zone.price_multiplier}x Multiplier
                                                    </div>
                                                    <StatusBadge status={zone.status} small />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState message="No service zones found for this city." icon={<Navigation size={40} />} />
                                )}
                            </div>
                        )}

                        {activeTab === "Transportation Hubs" && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-tride-text mb-4">Airports & Stations</h3>
                                {city.transportation_hubs && city.transportation_hubs.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/5 text-left text-tride-text-muted text-sm">
                                                    <th className="px-4 py-3 font-medium">Name</th>
                                                    <th className="px-4 py-3 font-medium">Type</th>
                                                    <th className="px-4 py-3 font-medium">Pickup Fee</th>
                                                    <th className="px-4 py-3 font-medium">Queue Cap.</th>
                                                    <th className="px-4 py-3 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {city.transportation_hubs.map((hub) => (
                                                    <tr key={hub.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-tride-text">{hub.name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="capitalize px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/70 border border-white/5">
                                                                {hub.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-tride-text-muted">${hub.pickup_fee}</td>
                                                        <td className="px-4 py-3 text-tride-text-muted">{hub.queue_capacity}</td>
                                                        <td className="px-4 py-3">
                                                            <StatusBadge status={hub.status} small />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <EmptyState message="No transportation hubs found for this city." icon={<Plane size={40} />} />
                                )}
                            </div>
                        )}

                        {activeTab === "Restricted Areas" && (
                             <div className="space-y-4">
                                <h3 className="text-lg font-bold text-white mb-4">Restricted Areas</h3>
                                {city.restricted_areas && city.restricted_areas.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                                    <th className="px-4 py-3 font-medium">Name</th>
                                                    <th className="px-4 py-3 font-medium">Type</th>
                                                    <th className="px-4 py-3 font-medium">Reason</th>
                                                    <th className="px-4 py-3 font-medium">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {city.restricted_areas.map((area) => (
                                                    <tr key={area.id} className="hover:bg-white/5 transition-colors">
                                                        <td className="px-4 py-3 font-medium text-white">{area.name}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="capitalize px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs border border-red-500/20">
                                                                {area.restriction_type.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-white/70">{area.reason || '-'}</td>
                                                        <td className="px-4 py-3">
                                                            <StatusBadge status={area.status} small />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <EmptyState message="No restricted areas found for this city." icon={<ShieldAlert size={40} />} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function StatusBadge({ status, small = false }: { status: string, small?: boolean }) {
    const normalized = status?.toLowerCase() || 'inactive'
    let styles = "bg-tride-card/10 text-tride-text/50 border-tride-card/20"
    
    if (normalized === 'active') styles = "bg-green-500/20 text-green-400 border-green-500/20"
    else if (normalized === 'inactive') styles = "bg-red-500/20 text-red-400 border-red-500/20"

    const classes = small 
        ? `px-2 py-0.5 rounded text-xs font-bold capitalize ${styles}`
        : `px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles}`

    return (
        <span className={classes}>
            {status}
        </span>
    )
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-tride-text/40 text-sm">{label}</span>
            <span className="text-sm font-medium text-tride-text">{value}</span>
        </div>
    )
}

function StatCard({ label, value, icon, bg }: any) {
    return (
        <div className="bg-tride-card border border-tride-card/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
                <p className="text-tride-text/40 text-xs font-medium uppercase mb-1">{label}</p>
                <p className="text-xl font-bold text-tride-text">{value}</p>
            </div>
            <div className={`p-2 rounded-xl ${bg}`}>
                {icon}
            </div>
        </div>
    )
}

function EmptyState({ message, icon }: { message: string, icon: React.ReactNode }) {
    return (
        <div className="text-center py-12 bg-tride-card/10 rounded-2xl border border-dashed border-tride-card/20 flex flex-col items-center justify-center">
            <div className="opacity-50 mb-3 text-tride-text/40">
                {icon}
            </div>
            <p className="text-tride-text/40">{message}</p>
        </div>
    )
}
