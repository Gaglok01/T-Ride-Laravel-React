import { useEffect, useState } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Car, Key, CheckCircle, Settings, DollarSign, Download, Plus, Eye, Edit2, MoreVertical, Search } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import axios from "@/lib/axios"
import { VehicleModal } from "@/components/admin/VehicleModal"

interface FleetStats {
    total_fleet: number
    rented_out: number
    available: number
    in_maintenance: number
    monthly_revenue: number
}

interface PaymentStats {
    total_collected: number
    pending: number
    overdue: number
    this_week: number
}

interface Vehicle {
    id: number
    name: string
    year: number
    vin: string
    plate_number: string
    type: string
    daily_rate: number
    status: string
    active_rental: {
        driver: { name: string }
        outstanding_amount: number
    } | null
}

interface Rental {
    id: number
    contract_id: string
    driver: { name: string }
    vehicle: { name: string, plate_number: string }
    start_date: string
    end_date: string
    status: string
}

interface RentPayment {
    id: number
    transaction_id: string
    amount: number
    status: string
    date: string
    rental: {
        driver: { name: string }
        vehicle: { name: string }
    }
}

interface MaintenanceRecord {
    id: number
    vehicle: { name: string, plate_number: string }
    description: string
    cost: number
    status: string
    date: string
}

export default function RentPage() {
    const [fleetStats, setFleetStats] = useState<FleetStats | null>(null)
    const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null)
    
    // Data states
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [rentals, setRentals] = useState<Rental[]>([])
    const [payments, setPayments] = useState<RentPayment[]>([])
    const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([])

    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("Fleet Vehicles")
    const [searchTerm, setSearchTerm] = useState("")
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchData()
    }, [activeTab, searchTerm])

    const fetchData = async () => {
        setLoading(true)
        try {
            const params: any = {}
            if (searchTerm) params.search = searchTerm

            if (activeTab === "Fleet Vehicles") {
                const res = await axios.get('/admin/fleet-vehicles', { params })
                if (res.data.status) {
                    setFleetStats(res.data.stats)
                    setVehicles(res.data.data)
                }
            } else if (activeTab === "Active Rentals") {
                const res = await axios.get('/admin/active-rentals', { params })
                if (res.data.status) setRentals(res.data.data)
            } else if (activeTab === "Rent Payments") {
                const res = await axios.get('/admin/rent-payments', { params })
                if (res.data.status) {
                    setPaymentStats(res.data.stats)
                    setPayments(res.data.data)
                }
            } else if (activeTab === "Contracts") {
                const res = await axios.get('/admin/contracts', { params })
                if (res.data.status) setRentals(res.data.data)
            } else if (activeTab === "Maintenance") {
                const res = await axios.get('/admin/maintenance', { params })
                if (res.data.status) setMaintenance(res.data.data)
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
    }

    const handleSaveVehicle = async (data: any) => {
        try {
            await axios.post('/admin/fleet-vehicles', data)
            setIsModalOpen(false)
            fetchData() 
        } catch (error) {
            console.error("Failed to save vehicle", error)
            throw error 
        }
    }

    return (
        <AdminLayout
            title="Rent Management"
            description="Vehicle rentals and fleet management"
            actions={
                <div className="flex items-center gap-3">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-64"
                        />
                    </div>
                    <Button variant="secondary">
                        <Download size={18} className="mr-2" />
                        Export
                    </Button>
                    <Button variant="default" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} className="mr-2" />
                        Add Vehicle
                    </Button>
                </div>
            }
        >
            {/* Navigation Tabs */}
            <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-2xl w-fit">
                {["Fleet Vehicles", "Active Rentals", "Rent Payments", "Contracts", "Maintenance"].map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "secondary" : "ghost"}
                        className={activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white"}
                        onClick={() => { setActiveTab(tab); setSearchTerm(""); }}
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Stats Row - Conditional */}
            {activeTab === "Fleet Vehicles" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                    <StatsCard
                        label="Total Fleet"
                        value={fleetStats?.total_fleet.toLocaleString() || "0"}
                        trend="+12.2%"
                        trendUp={true}
                        icon={<Car size={20} className="text-blue-500" />}
                        iconBg="bg-blue-500/10"
                    />
                    <StatsCard
                        label="Rented Out"
                        value={fleetStats?.rented_out.toLocaleString() || "0"}
                        trend="+8.1%"
                        trendUp={true}
                        icon={<Key size={20} className="text-blue-400" />}
                        iconBg="bg-blue-500/10"
                    />
                    <StatsCard
                        label="Available"
                        value={fleetStats?.available.toLocaleString() || "0"}
                        trend="-5.3%"
                        trendUp={false}
                        icon={<CheckCircle size={20} className="text-blue-500" />}
                        iconBg="bg-blue-500/10"
                    />
                    <StatsCard
                        label="In Maintenance"
                        value={fleetStats?.in_maintenance.toLocaleString() || "0"}
                        trend="+2.1%"
                        trendUp={true}
                        icon={<Settings size={20} className="text-blue-500" />}
                        iconBg="bg-blue-500/10"
                    />
                    <StatsCard
                        label="Monthly Revenue"
                        value={`$${fleetStats?.monthly_revenue.toLocaleString() || "0"}`}
                        trend="+18.5%"
                        trendUp={true}
                        icon={<DollarSign size={20} className="text-blue-500" />}
                        iconBg="bg-blue-500/10"
                    />
                </div>
            )}

            {activeTab === "Rent Payments" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                        label="Total Collected"
                        value={`$${paymentStats?.total_collected.toLocaleString() || "0"}`}
                        trend="+10%"
                        trendUp={true}
                        icon={<DollarSign size={20} className="text-green-500" />}
                        iconBg="bg-green-500/10"
                    />
                    <StatsCard
                        label="Pending"
                        value={`$${paymentStats?.pending.toLocaleString() || "0"}`}
                        trend=""
                        trendUp={true}
                        icon={<ClockIcon size={20} className="text-orange-500" />}
                        iconBg="bg-orange-500/10"
                    />
                    <StatsCard
                        label="Overdue"
                        value={`$${paymentStats?.overdue.toLocaleString() || "0"}`}
                        trend="+2%"
                        trendUp={false}
                        icon={<AlertCircleIcon size={20} className="text-red-500" />}
                        iconBg="bg-red-500/10"
                    />
                    <StatsCard
                        label="This Week"
                        value={`$${paymentStats?.this_week.toLocaleString() || "0"}`}
                        trend="+5%"
                        trendUp={true}
                        icon={<TrendingUpIcon size={20} className="text-blue-500" />}
                        iconBg="bg-blue-500/10"
                    />
                </div>
            )}


            {/* Main Content Area */}
            <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    {/* Render different tables based on Tab */}
                    {activeTab === "Fleet Vehicles" ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                    <th className="px-6 py-4 font-medium">Vehicle</th>
                                    <th className="px-6 py-4 font-medium">Plate No.</th>
                                    <th className="px-6 py-4 font-medium">Type</th>
                                    <th className="px-6 py-4 font-medium">Rented To</th>
                                    <th className="px-6 py-4 font-medium">Daily Rate</th>
                                    <th className="px-6 py-4 font-medium">Rent Due</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && <tr><td colSpan={8} className="px-6 py-4 text-center text-white/40">Loading...</td></tr>}
                                {!loading && vehicles.map((vehicle) => (
                                    <VehicleRow
                                        key={vehicle.id}
                                        vehicleName={vehicle.name}
                                        vehicleSubtext={`VIN: ${vehicle.vin}`}
                                        plate={vehicle.plate_number}
                                        type={vehicle.type}
                                        rentedTo={vehicle.active_rental?.driver?.name || '—'}
                                        rate={`$${vehicle.daily_rate}/day`}
                                        due={vehicle.active_rental?.outstanding_amount ? `$${vehicle.active_rental.outstanding_amount}` : '—'}
                                        status={vehicle.status}
                                    />
                                ))}
                                {!loading && vehicles.length === 0 && <tr><td colSpan={8} className="px-6 py-4 text-center text-white/40">No vehicles found.</td></tr>}
                            </tbody>
                        </table>
                    ) : (activeTab === "Active Rentals" || activeTab === "Contracts") ? (
                         <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                    <th className="px-6 py-4 font-medium">Contract ID</th>
                                    <th className="px-6 py-4 font-medium">Driver</th>
                                    <th className="px-6 py-4 font-medium">Vehicle</th>
                                    <th className="px-6 py-4 font-medium">Start Date</th>
                                    <th className="px-6 py-4 font-medium">End Date</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading && <tr><td colSpan={7} className="px-6 py-4 text-center text-white/40">Loading...</td></tr>}
                                {!loading && rentals.map((rental) => (
                                    <tr key={rental.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm">{rental.contract_id || `#RENT-${rental.id}`}</td>
                                        <td className="px-6 py-4 font-medium">{rental.driver?.name}</td>
                                        <td className="px-6 py-4 font-medium">{rental.vehicle?.name} ({rental.vehicle?.plate_number})</td>
                                        <td className="px-6 py-4">{rental.start_date || 'N/A'}</td>
                                        <td className="px-6 py-4">{rental.end_date || 'N/A'}</td>
                                        <td className="px-6 py-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{rental.status}</span></td>
                                        <td className="px-6 py-4 text-right">
                                            <IconButton tooltip="View"><Eye size={16} /></IconButton>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && rentals.length === 0 && <tr><td colSpan={7} className="px-6 py-4 text-center text-white/40">No records found.</td></tr>}
                            </tbody>
                        </table>
                    ) : activeTab === "Rent Payments" ? (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Transaction ID</th>
                                    <th className="px-6 py-4 font-medium">Driver</th>
                                    <th className="px-6 py-4 font-medium">Vehicle</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                 {loading && <tr><td colSpan={6} className="px-6 py-4 text-center text-white/40">Loading...</td></tr>}
                                 {!loading && payments.map((payment) => (
                                     <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{payment.date || 'N/A'}</td>
                                        <td className="px-6 py-4 font-mono text-sm">{payment.transaction_id || `TXN-${payment.id}`}</td>
                                        <td className="px-6 py-4 font-medium">{payment.rental?.driver?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4">{payment.rental?.vehicle?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 font-bold text-green-400">${payment.amount}</td>
                                        <td className="px-6 py-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{payment.status}</span></td>
                                     </tr>
                                 ))}
                                 {!loading && payments.length === 0 && <tr><td colSpan={6} className="px-6 py-4 text-center text-white/40">No payments found.</td></tr>}
                            </tbody>
                        </table>
                    ) : activeTab === "Maintenance" ? (
                         <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 text-left text-white/40 text-sm">
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Vehicle</th>
                                    <th className="px-6 py-4 font-medium">Description</th>
                                    <th className="px-6 py-4 font-medium">Cost</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                 {loading && <tr><td colSpan={5} className="px-6 py-4 text-center text-white/40">Loading...</td></tr>}
                                 {!loading && maintenance.map((record) => (
                                     <tr key={record.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">{record.date || 'N/A'}</td>
                                        <td className="px-6 py-4 font-medium">{record.vehicle?.name || 'Unknown'} ({record.vehicle?.plate_number})</td>
                                        <td className="px-6 py-4">{record.description}</td>
                                        <td className="px-6 py-4 text-red-300">-${record.cost}</td>
                                        <td className="px-6 py-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{record.status}</span></td>
                                     </tr>
                                 ))}
                                 {!loading && maintenance.length === 0 && <tr><td colSpan={5} className="px-6 py-4 text-center text-white/40">No records found.</td></tr>}
                            </tbody>
                        </table>
                    ) : null}
                </div>
            </div>

            <VehicleModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveVehicle}
            />
        </AdminLayout>
    )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string }) {
    return (
        <div className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-start justify-between">
            <div>
                <p className="text-white/50 text-xs font-medium mb-1">{label}</p>
                <div className="text-2xl font-bold mb-2">{value}</div>
                <div className={`text-xs font-medium ${trendUp ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                    <span className="text-sm">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}

function VehicleRow({ vehicleName, vehicleSubtext, plate, type, rentedTo, rate, due, status }: any) {
    let statusStyles = ""
    const normalizedStatus = status.toLowerCase()

    if (normalizedStatus === 'rented') statusStyles = "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
    else if (normalizedStatus === 'available') statusStyles = "bg-white/10 text-white/70 border border-white/10"
    else if (normalizedStatus === 'maintenance') statusStyles = "bg-red-500/20 text-red-500 border border-red-500/20"
    else statusStyles = "bg-white/5 text-white/70 border border-white/10"

    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Car size={18} className="text-white/40" />
                    </div>
                    <div>
                        <div className="font-medium text-white">{vehicleName}</div>
                        <div className="text-xs text-white/40 font-mono">{vehicleSubtext}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 font-mono text-sm">{plate}</td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-medium text-white/60">
                    {type}
                </span>
            </td>
            <td className="px-6 py-4 font-medium">{rentedTo}</td>
            <td className="px-6 py-4 font-medium">{rate}</td>
            <td className="px-6 py-4 font-medium text-red-400">{due !== '—' ? due : <span className="text-white/20">—</span>}</td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles} capitalize text-center min-w-[80px] inline-block`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <IconButton tooltip="View Details">
                        <Eye size={16} />
                    </IconButton>
                    <IconButton tooltip="Edit">
                        <Edit2 size={16} />
                    </IconButton>
                    <IconButton tooltip="More">
                        <MoreVertical size={16} />
                    </IconButton>
                </div>
            </td>
        </tr>
    )
}

// Icons for Payment Stats
function ClockIcon({size, className}: any) { return <div className={className}>🕒</div> } 
function AlertCircleIcon({size, className}: any) { return <div className={className}>⚠️</div> }
function TrendingUpIcon({size, className}: any) { return <div className={className}>📈</div> }
