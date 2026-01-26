import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, Car, Calendar, DollarSign, Settings, FileText, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface VehicleDetail {
    id: number
    name: string
    year: number
    vin: string
    plate_number: string
    type: string
    daily_rate: number
    status: string
    image?: string
    active_rental?: {
        id: number
        driver: { name: string, id: number }
        start_date: string
        end_date: string
        outstanding_amount: number
    }
    rental_history?: {
        id: number
        driver: { name: string }
        start_date: string
        end_date: string
        status: string
        amount: number
    }[]
    maintenance_history?: {
        id: number
        date: string
        description: string
        cost: number
        status: string
    }[]
    stats?: {
        total_earnings: number
        total_maintenance_cost: number
        total_trips: number
    }
}

export default function ViewRent({ id }: { id: number }) {
    const [vehicle, setVehicle] = useState<VehicleDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Overview")

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                // Assuming this endpoint exists based on convention
                const res = await axios.get(`/admin/fleet-vehicles/${id}`)
                if (res.data.status) {
                    setVehicle(res.data.data)
                }
            } catch (error) {
                console.error("Failed to fetch vehicle details:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchVehicle()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Vehicle Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!vehicle) {
        return (
            <AdminLayout title="Vehicle Details" description="Not found">
                <div className="text-center text-white/50 py-12">
                    <Car size={48} className="mx-auto mb-4 opacity-50" />
                    Vehicle not found
                </div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Vehicle Details"
            description={`View details for ${vehicle.name} (${vehicle.plate_number})`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/rents" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Fleet
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-tride-card border border-tride-card/20 rounded-3xl p-6">
                        <div className="aspect-video w-full bg-tride-hover rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                            {vehicle.image ? (
                                <img src={`/storage/${vehicle.image}`} alt={vehicle.name} className="w-full h-full object-cover" />
                            ) : (
                                <Car size={64} className="text-tride-text-muted" />
                            )}
                        </div>
                        
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-tride-text">{vehicle.name}</h2>
                                <p className="text-tride-text-muted font-mono">{vehicle.vin}</p>
                            </div>
                            <StatusBadge status={vehicle.status} />
                        </div>

                        <div className="space-y-3 pt-4 border-t border-white/5">
                            <InfoRow label="Year" value={vehicle.year.toString()} />
                            <InfoRow label="Plate Number" value={vehicle.plate_number} />
                            <InfoRow label="Type" value={vehicle.type} />
                            <InfoRow label="Daily Rate" value={`$${vehicle.daily_rate}`} highlight />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <StatCard 
                            label="Total Earnings" 
                            value={`$${vehicle.stats?.total_earnings.toLocaleString() || '0'}`} 
                            icon={<DollarSign size={16} className="text-green-400" />}
                            bg="bg-green-500/10"
                        />
                         <StatCard 
                            label="Maintenance" 
                            value={`$${vehicle.stats?.total_maintenance_cost.toLocaleString() || '0'}`} 
                            icon={<Settings size={16} className="text-red-400" />}
                            bg="bg-red-500/10"
                        />
                    </div>
                </div>

                {/* Right Column: Details & History */}
                <div className="lg:col-span-2">
                    {/* Tabs */}
                    <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit">
                        {["Overview", "Rental History", "Maintenance"].map((tab) => (
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

                    <div className="bg-tride-card border border-white/5 rounded-3xl p-6 min-h-[400px]">
                        {activeTab === "Overview" && (
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-tride-text mb-4">Current Status</h3>
                                {vehicle.active_rental ? (
                                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-tride-text">Active Rental Contract</h4>
                                                <p className="text-blue-200/60 text-sm">Contract #{vehicle.active_rental.id}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <InfoBox label="Driver" value={vehicle.active_rental.driver.name} />
                                            <InfoBox label="Start Date" value={vehicle.active_rental.start_date} />
                                            <InfoBox label="End Date" value={vehicle.active_rental.end_date} />
                                            <InfoBox label="Outstanding" value={`$${vehicle.active_rental.outstanding_amount}`} highlightColor="text-red-400" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-tride-hover rounded-2xl border border-dashed border-white/10">
                                        <CheckCircle size={32} className="mx-auto mb-2 text-green-400 opacity-50" />
                                        <p className="text-tride-text">Vehicle is currently available</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "Rental History" && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 text-left text-tride-text/40 text-sm">
                                            <th className="px-4 py-3 font-medium">Driver</th>
                                            <th className="px-4 py-3 font-medium">Dates</th>
                                            <th className="px-4 py-3 font-medium">Amount</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {vehicle.rental_history?.length ? (
                                            vehicle.rental_history.map((rent) => (
                                                <tr key={rent.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-4 py-3 text-white">{rent.driver.name}</td>
                                                    <td className="px-4 py-3 text-white/60 text-sm">
                                                        {rent.start_date} - {rent.end_date}
                                                    </td>
                                                    <td className="px-4 py-3 text-green-400 font-medium">${rent.amount}</td>
                                                    <td className="px-4 py-3">
                                                        <span className="bg-white/10 text-white/70 px-2 py-1 rounded text-xs">
                                                            {rent.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-8 text-center text-white/40">No history found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === "Maintenance" && (
                             <div className="overflow-x-auto">
                             <table className="w-full">
                                 <thead>
                                     <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                         <th className="px-4 py-3 font-medium">Date</th>
                                         <th className="px-4 py-3 font-medium">Description</th>
                                         <th className="px-4 py-3 font-medium">Cost</th>
                                         <th className="px-4 py-3 font-medium">Status</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5">
                                     {vehicle.maintenance_history?.length ? (
                                         vehicle.maintenance_history.map((record) => (
                                             <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                                 <td className="px-4 py-3 text-white/60 text-sm">{record.date}</td>
                                                 <td className="px-4 py-3 text-white">{record.description}</td>
                                                 <td className="px-4 py-3 text-red-400 font-medium">${record.cost}</td>
                                                 <td className="px-4 py-3">
                                                     <span className="bg-white/10 text-white/70 px-2 py-1 rounded text-xs">
                                                         {record.status}
                                                     </span>
                                                 </td>
                                             </tr>
                                         ))
                                     ) : (
                                         <tr>
                                             <td colSpan={4} className="px-4 py-8 text-center text-white/40">No maintenance records found.</td>
                                         </tr>
                                     )}
                                 </tbody>
                             </table>
                         </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status.toLowerCase()
    let styles = "bg-white/10 text-white/50 border-white/10"
    
    if (normalized === 'rented') styles = "bg-blue-600/20 text-blue-400 border-blue-600/20"
    else if (normalized === 'available') styles = "bg-green-500/20 text-green-400 border-green-500/20"
    else if (normalized === 'maintenance') styles = "bg-red-500/20 text-red-400 border-red-500/20"

    return (
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${styles}`}>
            {status}
        </span>
    )
}

function InfoRow({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) {
    return (
        <div className="flex justify-between items-center py-1">
            <span className="text-tride-text-muted text-sm">{label}</span>
            <span className={`text-sm font-medium ${highlight ? 'text-green-400' : 'text-tride-text'}`}>{value}</span>
        </div>
    )
}

function StatCard({ label, value, icon, bg }: any) {
    return (
        <div className="bg-tride-card border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <div>
                <p className="text-tride-text-muted text-xs font-medium uppercase mb-1">{label}</p>
                <p className="text-xl font-bold text-tride-text">{value}</p>
            </div>
            <div className={`p-2 rounded-xl ${bg}`}>
                {icon}
            </div>
        </div>
    )
}

function InfoBox({ label, value, highlightColor = "text-white" }: any) {
    return (
        <div className="bg-black/20 rounded-xl p-3">
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <p className={`font-medium ${highlightColor}`}>{value}</p>
        </div>
    )
}
