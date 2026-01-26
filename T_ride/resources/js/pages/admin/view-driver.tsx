import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, User, Phone, Mail, Car, Star, FileText, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "@inertiajs/react"
import axios from "@/lib/axios"

interface DriverData {
    id: number
    driver_id: string
    name: string
    // Since API might not return user details nested yet, we handle optional
    user?: {
        email: string
        phone_number: string
    }
    type?: {
        type_name: string
    }
    status: string
    image?: string
    vehicle_model: string
    trips: number
    rating: number
    documents: string[]
    created_at: string
}

export default function ViewDriver({ id }: { id: number }) {
    const [driver, setDriver] = useState<DriverData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDriver = async () => {
            try {
                const res = await axios.get(`/admin/drivers/${id}`)
                if (res.data.success) {
                    setDriver(res.data.data)
                }
            } catch (error) {
                console.error("Failed to fetch driver:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchDriver()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="Driver Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!driver) {
         return (
            <AdminLayout title="Driver Details" description="Not found">
                <div className="text-center text-white/50 py-12">Driver not found</div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="Driver Profile"
            description={`Details for ${driver.driver_id}`}
            actions={
                <div className="w-full sm:w-auto">
                    <Link href="/admin/drivers" className="w-full sm:w-auto">
                        <Button variant="secondary" className="w-full sm:w-auto justify-center">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Drivers
                        </Button>
                    </Link>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-tride-card border border-tride-border rounded-3xl p-6 lg:col-span-1 h-fit">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-tride-hover flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden outline outline-4 outline-tride-hover text-tride-text-muted">
                            {driver.image ? (
                                <img src={`/storage/${driver.image}`} alt={driver.name} className="w-full h-full object-cover" />
                            ) : (
                                <Car size={40} />
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-tride-text mb-1">{driver.name}</h2>
                        <p className="text-tride-text-muted text-sm mb-4">{driver.driver_id}</p>
                        
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                            driver.status === 'Active' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                            'bg-tride-hover text-tride-text-muted border-tride-border'
                        }`}>
                            {driver.status}
                        </span>

                        <div className="w-full mt-8 space-y-4">
                            {driver.user && (
                                <>
                                    <InfoRow icon={<Mail size={16} />} label="Email" value={driver.user.email} />
                                    <InfoRow icon={<Phone size={16} />} label="Phone" value={driver.user.phone_number} />
                                </>
                            )}
                            <InfoRow icon={<Car size={16} />} label="Vehicle" value={driver.vehicle_model} />
                            <InfoRow icon={<FileText size={16} />} label="Type" value={driver.type?.type_name || 'N/A'} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatBox label="Total Trips" value={driver.trips.toString()} icon={<Car size={20} />} color="text-tride-yellow" bg="bg-yellow-500/10" />
                        <StatBox label="Rating" value={Number(driver.rating).toFixed(1)} icon={<Star size={20} />} color="text-yellow-400" bg="bg-yellow-400/10" />
                        <StatBox label="Documents" value={driver.documents?.length ? "Verified" : "Pending"} icon={<FileText size={20} />} color={driver.documents?.length ? "text-green-400" : "text-red-400"} bg={driver.documents?.length ? "bg-green-500/10" : "bg-red-500/10"} />
                    </div>

                    {/* Documents Section */}
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                         <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-tride-text">
                             <FileText size={18} className="text-tride-text-muted" />
                             Documents & Licenses
                        </h3>
                        {driver.documents && driver.documents.length > 0 ? (
                            <div className="space-y-3">
                                {driver.documents.map((doc, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-tride-hover rounded-xl border border-tride-border hover:border-tride-yellow/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-tride-text text-sm">Document #{idx + 1}</p>
                                                <p className="text-xs text-tride-text-muted">Verified</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-lg border border-green-500/20 font-medium">Valid</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-8 text-tride-text-muted border border-dashed border-tride-border rounded-xl bg-tride-hover">
                                <XCircle size={32} className="mx-auto mb-2 opacity-50 text-red-400" />
                                No documents submitted.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-tride-hover rounded-xl border border-tride-border">
            <div className="flex items-center gap-3 text-tride-text-muted">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-sm font-medium text-tride-text truncate max-w-[150px]">{value}</span>
        </div>
    )
}

function StatBox({ label, value, icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) {
    return (
        <div className="bg-tride-card border border-tride-border rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold text-tride-text">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                {icon}
            </div>
        </div>
    )
}
