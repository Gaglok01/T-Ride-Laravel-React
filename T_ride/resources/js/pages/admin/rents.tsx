import { useEffect, useState } from "react"
import { router } from "@inertiajs/react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Car, Key, CheckCircle, Settings, DollarSign, Download, Plus, Eye, Edit2, MoreVertical, Search, Trash2 } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import axios from "@/lib/axios"
import { VehicleModal } from "@/components/admin/VehicleModal"
import { StatusUpdateModal } from "@/components/admin/StatusUpdateModal"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
    const [isExporting, setIsExporting] = useState(false)

    // Status Update Modal
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [vehicleToUpdateStatus, setVehicleToUpdateStatus] = useState<Vehicle | null>(null)
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
    
    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)

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
            if (editingVehicle) {
                await axios.put(`/admin/fleet-vehicles/${editingVehicle.id}`, data)
            } else {
                await axios.post('/admin/fleet-vehicles', data)
            }
            setIsModalOpen(false)
            setEditingVehicle(null)
            fetchData() 
        } catch (error) {
            console.error("Failed to save vehicle", error)
            throw error 
        }
    }

    const confirmDelete = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle)
        setIsDeleteModalOpen(true)
    }

    const handleDeleteVehicle = async () => {
        if (!vehicleToDelete) return
        
        try {
            setIsDeleting(true)
            await axios.delete(`/admin/fleet-vehicles/${vehicleToDelete.id}`)
            fetchData()
            setIsDeleteModalOpen(false)
            setVehicleToDelete(null)
        } catch (error) {
            console.error("Failed to delete vehicle:", error)
            alert("Failed to delete vehicle. It may have active rentals.")
        } finally {
            setIsDeleting(false)
        }
    }

    const openStatusModal = (vehicle: Vehicle) => {
        setVehicleToUpdateStatus(vehicle)
        setIsStatusModalOpen(true)
    }

    const handleUpdateStatus = async (newStatus: string) => {
        if (!vehicleToUpdateStatus) return
        try {
            setIsUpdatingStatus(true)
            await axios.patch(`/admin/fleet-vehicles/${vehicleToUpdateStatus.id}/status`, {
                status: newStatus
            })
            fetchData()
            setIsStatusModalOpen(false)
            setVehicleToUpdateStatus(null)
        } catch (error) {
            console.error("Failed to update status:", error)
        } finally {
            setIsUpdatingStatus(false)
        }
    }

    const handleExport = async () => {
        if (activeTab !== "Fleet Vehicles") return

        try {
            setIsExporting(true)
            
            // Fetch all vehicles for export with current filters
            const params: any = { all: true }
            if (searchTerm) params.search = searchTerm

            const res = await axios.get('/admin/fleet-vehicles', { params })
            
            if (!res.data.status) {
                console.error("Failed to fetch export data")
                return
            }

            const allVehicles: Vehicle[] = res.data.data

            // Generate PDF
            const doc = new jsPDF()
            
            // Add title and branding
            doc.setFontSize(20)
            doc.setTextColor(40, 40, 40)
            doc.text("T-RIDE", 14, 20)
            
            doc.setFontSize(12)
            doc.setTextColor(100, 100, 100)
            doc.text("Fleet Management Report", 14, 28)
            
            // Add export date
            doc.setFontSize(10)
            doc.setTextColor(150, 150, 150)
            doc.text(`Generated on: ${new Date().toLocaleDateString("en-US", { 
                year: "numeric", 
                month: "long", 
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            })}`, 14, 35)

            // Add stats summary if available
            if (fleetStats) {
                doc.setFontSize(10)
                doc.setTextColor(60, 60, 60)
                doc.text(`Total Fleet: ${fleetStats.total_fleet} | Rented: ${fleetStats.rented_out} | Available: ${fleetStats.available}`, 14, 45)
            }

            // Prepare table data
            const tableData = allVehicles.map(vehicle => [
                vehicle.name,
                vehicle.plate_number,
                vehicle.type,
                vehicle.vin,
                `$${vehicle.daily_rate}`,
                vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1),
                vehicle.active_rental?.driver?.name || '-'
            ])

            // Generate table
            autoTable(doc, {
                head: [["Vehicle", "Plate No", "Type", "VIN", "Rate", "Status", "Rented To"]],
                body: tableData,
                startY: 52,
                theme: "grid",
                styles: {
                    fontSize: 8,
                    cellPadding: 3,
                },
                headStyles: {
                    fillColor: [245, 197, 24], // T-RIDE yellow
                    textColor: [0, 0, 0],
                    fontStyle: "bold",
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245],
                },
            })

            // Add footer
            const pageCount = doc.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10,
                    { align: "center" }
                )
                doc.text(
                    "T-RIDE Admin Panel - Confidential",
                    14,
                    doc.internal.pageSize.height - 10
                )
            }

            doc.save(`fleet_export_${new Date().toISOString().split("T")[0]}.pdf`)

        } catch (error) {
            console.error("Export failed:", error)
            alert("Failed to generate export. Please try again.")
        } finally {
            setIsExporting(false)
        }
    }

    const openEditModal = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle)
        setIsModalOpen(true)
    }

    return (
        <AdminLayout
            title="Rent Management"
            description="Vehicle rentals and fleet management"
            actions={
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                     <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={handleSearch}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" className="flex-1 sm:flex-none justify-center" onClick={handleExport} disabled={isExporting || activeTab !== "Fleet Vehicles"}>
                            {isExporting ? (
                                 <>
                                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download size={18} className="mr-2" />
                                    Export
                                </>
                            )}
                        </Button>
                        <Button variant="default" className="flex-1 sm:flex-none justify-center" onClick={() => { setEditingVehicle(null); setIsModalOpen(true); }}>
                            <Plus size={18} className="mr-2" />
                            Add Vehicle
                        </Button>
                    </div>
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
                                        id={vehicle.id}
                                        vehicleName={vehicle.name}
                                        vehicleSubtext={`VIN: ${vehicle.vin}`}
                                        plate={vehicle.plate_number}
                                        type={vehicle.type}
                                        rentedTo={vehicle.active_rental?.driver?.name || '—'}
                                        rate={`$${vehicle.daily_rate}/day`}
                                        due={vehicle.active_rental?.outstanding_amount ? `$${vehicle.active_rental.outstanding_amount}` : '—'}
                                        status={vehicle.status}
                                        onEdit={() => openEditModal(vehicle)}
                                        onDelete={() => confirmDelete(vehicle)}
                                        onToggleStatus={() => openStatusModal(vehicle)}
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
                initialData={editingVehicle}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteVehicle}
                title="Delete Vehicle"
                description="Are you sure you want to permanently delete this vehicle? This action cannot be undone."
                itemName={vehicleToDelete?.name}
                isLoading={isDeleting}
            />

            <StatusUpdateModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={handleUpdateStatus}
                currentStatus={vehicleToUpdateStatus?.status || "available"}
                isLoading={isUpdatingStatus}
                options={[
                    { label: "Available", value: "available" },
                    { label: "Rented", value: "rented" },
                    { label: "Maintenance", value: "maintenance" }
                ]}
                title="Update Vehicle Status"
                description="Select the new status for this vehicle."
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

function VehicleRow({ id, vehicleName, vehicleSubtext, plate, type, rentedTo, rate, due, status, onEdit, onDelete, onToggleStatus }: any) {
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
                <button 
                    onClick={onToggleStatus}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles} capitalize text-center min-w-[80px] inline-block cursor-pointer hover:opacity-80 transition-opacity`}
                    title="Click to update status"
                >
                    {status}
                </button>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1">
                    <IconButton tooltip="View Details" onClick={() => router.visit(`/admin/rents/${id}`)}>
                        <Eye size={16} />
                    </IconButton>
                    <IconButton tooltip="Edit" onClick={onEdit}>
                        <Edit2 size={16} />
                    </IconButton>
                    <IconButton tooltip="Delete" variant="danger" onClick={onDelete}>
                        <Trash2 size={16} />
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
