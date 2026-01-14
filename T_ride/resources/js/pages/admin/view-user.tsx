import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { ArrowLeft, User, Phone, Mail, Calendar, DollarSign, Star, MapPin, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link, usePage } from "@inertiajs/react"
import axios from "@/lib/axios"

interface UserData {
    id: number
    name: string
    email: string
    phone_number?: string
    status: string
    wallet_balance: number
    photo?: string
    created_at: string
    // Mock additional data if API doesn't provide it yet
    rides_count?: number
    rating?: number
}

export default function ViewUser({ id }: { id: number }) {
    const [user, setUser] = useState<UserData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await axios.get(`/admin/users/${id}`)
                if (res.data.status) {
                    setUser(res.data.user)
                }
            } catch (error) {
                console.error("Failed to fetch user:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [id])

    if (loading) {
        return (
            <AdminLayout title="User Details" description="Loading...">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin h-8 w-8 border-4 border-tride-yellow border-t-transparent rounded-full"></div>
                </div>
            </AdminLayout>
        )
    }

    if (!user) {
         return (
            <AdminLayout title="User Details" description="Not found">
                <div className="text-center text-white/50 py-12">User not found</div>
            </AdminLayout>
        )
    }

    return (
        <AdminLayout
            title="User Profile"
            description={`Details for ${user.name}`}
            actions={
                <Link href="/admin/users">
                    <Button variant="secondary">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Users
                    </Button>
                </Link>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6 lg:col-span-1 h-fit">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-3xl font-bold mb-4 overflow-hidden outline outline-4 outline-white/5">
                            {user.photo ? (
                                <img src={`/storage/${user.photo}`} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${
                            user.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/20' : 
                            user.status === 'suspended' ? 'bg-red-500/20 text-red-400 border-red-500/20' : 
                            'bg-gray-500/20 text-white/50 border-white/10'
                        }`}>
                            {user.status}
                        </span>

                        <div className="w-full mt-8 space-y-4">
                            <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
                            <InfoRow icon={<Phone size={16} />} label="Phone" value={user.phone_number || "N/A"} />
                            <InfoRow icon={<Calendar size={16} />} label="Joined" value={new Date(user.created_at).toLocaleDateString()} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatBox label="Wallet Balance" value={`$${Number(user.wallet_balance || 0).toFixed(2)}`} icon={<DollarSign size={20} />} color="text-green-400" bg="bg-green-400/10" />
                        <StatBox label="Total Rides" value={user.rides_count?.toString() || "0"} icon={<MapPin size={20} />} color="text-blue-400" bg="bg-blue-400/10" />
                        <StatBox label="Rating" value={user.rating?.toFixed(1) || "5.0"} icon={<Star size={20} />} color="text-yellow-400" bg="bg-yellow-400/10" />
                    </div>

                    {/* Recent Activity Mockup */}
                    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                             <Shield size={18} className="text-tride-yellow" />
                             Recent Activity
                        </h3>
                        {/* Placeholder for future rides list */}
                        <div className="text-center py-8 text-white/40 border border-dashed border-white/10 rounded-xl">
                            No recent rides found.
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex items-center gap-3 text-white/60">
                {icon}
                <span className="text-sm">{label}</span>
            </div>
            <span className="text-sm font-medium text-white/90 truncate max-w-[150px]">{value}</span>
        </div>
    )
}

function StatBox({ label, value, icon, color, bg }: { label: string, value: string, icon: any, color: string, bg: string }) {
    return (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between">
            <div>
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className={`p-3 rounded-xl ${bg} ${color}`}>
                {icon}
            </div>
        </div>
    )
}
