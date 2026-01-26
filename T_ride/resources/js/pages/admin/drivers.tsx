import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Filter, Plus, Eye, Edit, MoreVertical, Star, Car, Bike, Truck, FileText, Router, Trash2, Download } from "lucide-react"
import { Link } from "@inertiajs/react"
import { Button, IconButton } from "@/components/ui/button"
import { DriverModal } from "@/components/admin/DriverModal"
import axios from "@/lib/axios"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { StatusConfirmationModal } from "@/components/admin/StatusConfirmationModal"
import { ModalInput, ModalSelect } from "@/components/ui/modal"
import { Check, X } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

interface Driver {
  id: number
  driver_id: string
  name: string
  email?: string
  phone_number?: string
  status: string
  rating: number
  trips: number
  vehicle_model: string
  type?: {
    type_name: string
    id: number
  }
  documents?: string
  image?: string
  user?: {
    email: string
    phone_number: string
  }
}

interface Type {
  id: number
  type_name: string
  status?: string
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
        setIsExporting(true)
        const params: any = { 
            all: true,
            search: searchTerm
        }
        if (activeTab !== "All Drivers") params.type = activeTab
        if (appliedFilters.status !== "All") params.status = appliedFilters.status
        if (appliedFilters.driverId) params.driver_id = appliedFilters.driverId

        const response = await axios.get("/admin/drivers", { params })
        
        let exportData: Driver[] = []
        if (response.data.success && Array.isArray(response.data.data)) {
            exportData = response.data.data
        } else if (response.data.data && Array.isArray(response.data.data.data)) {
             exportData = response.data.data.data
        } else if (Array.isArray(response.data)) {
             exportData = response.data
        }

        const doc = new jsPDF()
        doc.setFontSize(20)
        doc.setTextColor(40, 40, 40)
        doc.text("T-RIDE", 14, 20)
        
        doc.setFontSize(12)
        doc.setTextColor(100, 100, 100)
        doc.text("Driver Management Report", 14, 28)
        
        doc.setFontSize(10)
        doc.setTextColor(150, 150, 150)
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35)

        const tableData = exportData.map(d => [
            d.driver_id,
            d.name,
            d.email || '-',
            d.phone_number || '-',
            d.type?.type_name || '-',
            d.status,
            d.rating?.toString() || '0',
            d.trips?.toString() || '0'
        ])

        autoTable(doc, {
            head: [["ID", "Name", "Email", "Phone", "Type", "Status", "Rating", "Trips"]],
            body: tableData,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [245, 197, 24], textColor: [0, 0, 0] }
        })
        
        doc.save(`drivers_export_${Date.now()}.pdf`)

    } catch (e) {
        console.error("Export failed:", e)
        alert("Failed to export drivers.")
    } finally {
        setIsExporting(false)
    }
  }

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filtering States
  const [showFilters, setShowFilters] = useState(false)
  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
      status: "All",
      driverId: ""
  })
  // Temporary filters (local state for dropdown)
  const [tempFilters, setTempFilters] = useState({
      status: "All",
      driverId: ""
  })
  
  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [driverToToggle, setDriverToToggle] = useState<Driver | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  const [activeTab, setActiveTab] = useState("All Drivers")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [driversRes, typesRes] = await Promise.all([
        axios.get("/admin/drivers"),
        axios.get("/admin/types")
      ])
      
      if (driversRes.data.success) {
        setDrivers(driversRes.data.data)
      }
      
      // Handle Types Response (Direct array or wrapped in data)
      const typesResult = typesRes.data;
      if (Array.isArray(typesResult)) {
        setTypes(typesResult);
      } else if (typesResult?.data && Array.isArray(typesResult.data)) {
        setTypes(typesResult.data);
      } else if (typesResult?.success && Array.isArray(typesResult.data)) {
         setTypes(typesResult.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDriver = async (formData: FormData) => {
    try {
        if (editingDriver) {
            // Update
            await axios.post(`/admin/drivers/${editingDriver.id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
        } else {
            // Create
            await axios.post("/admin/drivers", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
        }
        fetchData()
        setIsModalOpen(false)
        setEditingDriver(null)
    } catch (error) {
        console.error("Failed to save driver:", error)
        throw error // Re-throw to be caught by modal
    }
  }

  const confirmDelete = (driver: Driver) => {
    setDriverToDelete(driver)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteDriver = async () => {
      if (!driverToDelete) return
      
      try {
          setIsDeleting(true)
          await axios.delete(`/admin/drivers/${driverToDelete.id}`)
          fetchData()
          setIsDeleteModalOpen(false)
          setDriverToDelete(null)
      } catch (error) {
          console.error("Failed to delete driver:", error)
          alert("Failed to delete driver. Please try again.")
      } finally {
          setIsDeleting(false)
      }
  }

  const openCreateModal = () => {
      setEditingDriver(null)
      setIsModalOpen(true)
  }

  const openEditModal = (driver: Driver) => {
      setEditingDriver(driver)
      setIsModalOpen(true)
  }

  const filteredDrivers = drivers.filter(driver => {
    // 1. Global Search (Name or ID) - kept as generic
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          driver.driver_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    // 2. Status Filter (Applied on 'Apply' click)
    const matchesStatus = appliedFilters.status === "All" || driver.status === appliedFilters.status

    // 3. Specific Driver ID Filter (Applied on 'Apply' click)
    const matchesDriverId = appliedFilters.driverId === "" || driver.driver_id.toLowerCase().includes(appliedFilters.driverId.toLowerCase())

    // 4. Type Filter (Controlled by Tabs)
    const matchesType = activeTab === "All Drivers" || driver.type?.type_name === activeTab

    return matchesSearch && matchesStatus && matchesType && matchesDriverId
  })

  // Clear all filters
  const clearFilters = () => {
    setAppliedFilters({ status: "All", driverId: "" })
    setTempFilters({ status: "All", driverId: "" })
    setShowFilters(false)
  }

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters(tempFilters)
    setShowFilters(false)
  }

  const confirmToggleStatus = (driver: Driver) => {
    setDriverToToggle(driver)
    setIsStatusModalOpen(true)
  }

  const handleToggleStatus = async () => {
    if (!driverToToggle) return

    try {
      setIsToggling(true)
      const newStatus = driverToToggle.status === 'Active' ? 'Inactive' : 'Active'
      
      // Use PATCH endpoint specific for status update
      await axios.patch(`/admin/drivers/${driverToToggle.id}/status`, {
          status: newStatus
      })
      
      fetchData()
      setIsStatusModalOpen(false)
      setDriverToToggle(null)
    } catch (error) {
       console.error("Failed to update driver status:", error)
       alert("Failed to update status")
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <AdminLayout
      title="Driver Management"
      description="Manage drivers, couriers, and delivery partners"
      actions={
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" size={18} />
                <input 
                    type="text" 
                    placeholder="Search drivers..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-tride-card border border-tride-border rounded-full pl-10 pr-4 py-2 text-sm text-tride-text placeholder-tride-text-muted focus:outline-none focus:border-tride-yellow transition-colors w-full md:w-64"
                />
            </div>
            <div className="flex gap-2 flex-wrap">
                <div className="relative">
                    <Button 
                        variant={showFilters ? "default" : "secondary"}
                        onClick={() => {
                            // Reset temp filters to match current applied filters when opening
                            if (!showFilters) {
                                setTempFilters(appliedFilters)
                            }
                            setShowFilters(!showFilters)
                        }}
                    >
                        <Filter size={18} />
                        Filter
                    </Button>
                    
                    {/* Filter Dropdown Panel */}
                    {showFilters && (
                        <div className="absolute top-full right-0 mt-3 w-80 bg-tride-card border border-tride-border rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="space-y-5">
                                <div className="flex items-center justify-between border-b border-tride-border pb-3">
                                    <h3 className="font-semibold text-tride-text">Filter Drivers</h3>
                                    <button onClick={() => setShowFilters(false)} className="text-tride-text-muted hover:text-tride-text transition-colors">
                                        <span className="sr-only">Close</span>
                                        <X size={18} />
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                     <ModalSelect
                                        label="Status"
                                        value={tempFilters.status}
                                        onChange={(val) => setTempFilters({...tempFilters, status: val})}
                                        options={[
                                            { label: "All Statuses", value: "All" },
                                            { label: "Active", value: "Active" },
                                            { label: "Inactive", value: "Inactive" }
                                        ]}
                                    />
                                    
                                    <ModalInput
                                        label="Driver ID"
                                        placeholder="e.g. DRV-01"
                                        value={tempFilters.driverId}
                                        onChange={(val) => setTempFilters({...tempFilters, driverId: val})}
                                    />
                                </div>

                                <div className="pt-4 grid grid-cols-2 gap-3">
                                     <Button 
                                        onClick={clearFilters}
                                        variant="secondary"
                                        className="w-full justify-center"
                                     >
                                        <X size={16} />
                                        Clear
                                     </Button>
                                     <Button 
                                        onClick={applyFilters} 
                                        variant="default"
                                        className="w-full justify-center"
                                     >
                                        <Check size={16} />
                                        Apply
                                     </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
                    {isExporting ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                            Exporting...
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            Export
                        </>
                    )}
                </Button>
                <Button onClick={openCreateModal}>
                    <Plus size={18} />
                    Add Driver
                </Button>
            </div>
        </div>
      }
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard label="Total Drivers" value={drivers.length.toString()} trend="+6.2%" trendUp={true} icon={<Car size={24} className="text-blue-500" />} iconBg="bg-blue-500/10" />
        <StatsCard label="Online Now" value="0" trend="+0%" trendUp={true} icon={<div className="w-6 h-6 rounded-full border-2 border-green-500 relative flex items-center justify-center"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div></div>} iconBg="bg-green-500/10" />
        <StatsCard label="Pending Docs" value="0" trend="-0%" trendUp={false} icon={<FileText size={24} className="text-orange-500" />} iconBg="bg-orange-500/10" />
        <StatsCard label="Avg Rating" value="0.0" trend="+0.0" trendUp={true} icon={<Star size={24} className="text-yellow-500" />} iconBg="bg-yellow-500/10" />
      </div>

      {/* Main Content Area */}
      <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
        {/* Tabs */}
        <div className="flex gap-1 p-4 border-b border-tride-border flex-wrap">

            {["All Drivers", ...types.map(t => t.type_name)].map((tab) => (
                <Button
                    key={tab}
                    variant={activeTab === tab ? "default" : "ghost"}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab}
                </Button>
            ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                <th className="px-6 py-4 font-medium">Driver</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Vehicle</th>
                <th className="px-6 py-4 font-medium">Trips</th>
                <th className="px-6 py-4 font-medium">Rating</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Documents</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tride-border">
                {loading ? (
                    <tr>
                        <td colSpan={8} className="text-center py-8 text-tride-text-muted">Loading drivers...</td>
                    </tr>
                ) : filteredDrivers.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="text-center py-8 text-tride-text-muted">No drivers found.</td>
                    </tr>
                ) : (
                    filteredDrivers.map(driver => (
                        <DriverRow 
                            key={driver.id} 
                            driver={driver} 
                            onEdit={() => openEditModal(driver)} 
                            onDelete={() => confirmDelete(driver)}
                            onToggleStatus={() => confirmToggleStatus(driver)}
                        />
                    ))
                )}
            </tbody>
          </table>
        </div>
      </div>

      <DriverModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveDriver}
        types={types}
        initialData={editingDriver}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteDriver}
        title="Delete Driver"
        description="Are you sure you want to permanently delete this driver account?"
        itemName={driverToDelete?.name}
        isLoading={isDeleting}
      />

      <StatusConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        itemName={driverToToggle?.name}
        currentStatus={driverToToggle?.status?.toLowerCase()} // Modal expects lowercase usually for checking 'inactive'
        isLoading={isToggling}
      />
    </AdminLayout>
  )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg?: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-sm font-medium mb-1">{label}</p>
                <div className="text-3xl font-bold text-tride-text mb-2">{value}</div>
                <div className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-lg">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-12 h-12 ${iconBg || 'bg-tride-hover'} rounded-2xl flex items-center justify-center text-tride-text`}>
                {icon}
            </div>
        </div>
    )
}



function DriverRow({ driver, onEdit, onDelete, onToggleStatus }: { driver: Driver, onEdit: () => void, onDelete: () => void, onToggleStatus: () => void }) {
    return (
        <tr className="hover:bg-tride-hover transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-tride-hover rounded-full flex items-center justify-center text-lg font-bold text-tride-text overflow-hidden">
                        {driver.image ? (
                             <img src={`/storage/${driver.image}`} alt={driver.name} className="w-full h-full object-cover" />
                        ) : (
                            driver.name.charAt(0)
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-tride-text">{driver.name}</div>
                        <div className="text-xs text-tride-text-muted">{driver.driver_id}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-tride-border text-xs font-medium text-tride-text">
                    {driver.type?.type_name || 'Unknown'}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-tride-text-muted">{driver.vehicle_model || '-'}</td>
            <td className="px-6 py-4 font-mono text-sm text-tride-text">{driver.trips}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                    <Star size={14} fill="currentColor" /> {Number(driver.rating || 0).toFixed(1)}
                </div>
            </td>
            <td className="px-6 py-4">

                <button 
                  onClick={onToggleStatus}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                    driver.status === 'Active'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/20 hover:bg-blue-500/30' 
                    : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                  }`}
                >
                    {driver.status}
                </button>
            </td>

            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    driver.documents 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/20' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/20'
                }`}>
                    {driver.documents ? 'Submitted' : 'Missing'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/drivers/${driver.id}`}>
                        <IconButton tooltip="View">
                            <Eye size={16} />
                        </IconButton>
                    </Link>
                    <IconButton tooltip="Edit" onClick={onEdit}>
                        <Edit size={16} />
                    </IconButton>
                    <IconButton tooltip="Delete" variant="danger" onClick={onDelete}>
                         <Trash2 size={16} />
                     </IconButton>
                </div>
            </td>
        </tr>
    )
}
