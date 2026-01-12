import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Filter, Plus, Eye, Edit, MoreVertical, Star, Car, Bike, Truck, FileText, Router, Trash2 } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { DriverModal } from "@/components/admin/DriverModal"
import axios from "@/lib/axios"

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
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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

  const handleDeleteDriver = async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this driver?")) return
      
      try {
          await axios.delete(`/admin/drivers/${id}`)
          fetchData()
      } catch (error) {
          console.error("Failed to delete driver:", error)
          alert("Failed to delete driver. Please try again.")
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

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    driver.driver_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout
      title="Driver Management"
      description="Manage drivers, couriers, and delivery partners"
      actions={
        <div className="flex items-center gap-3">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                    type="text" 
                    placeholder="Search drivers..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-64"
                />
            </div>
          <Button variant="secondary">
            <Filter size={18} />
            Filter
          </Button>
          <Button onClick={openCreateModal}>
            <Plus size={18} />
            Add Driver
          </Button>
        </div>
      }
    >
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard label="Total Drivers" value={drivers.length.toString()} trend="+6.2%" trendUp={true} icon={<Car size={24} />} />
        <StatsCard label="Online Now" value="0" trend="+0%" trendUp={true} icon={<div className="w-6 h-6 rounded-full border-2 border-green-500 relative flex items-center justify-center"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div></div>} />
        <StatsCard label="Pending Docs" value="0" trend="-0%" trendUp={false} icon={<FileText size={24} />} />
        <StatsCard label="Avg Rating" value="0.0" trend="+0.0" trendUp={true} icon={<Star size={24} />} />
      </div>

      {/* Main Content Area */}
      <div className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-white/5 overflow-x-auto">
          <TabButton label="All Drivers" active />
          {/* We can implement filtering logic for tabs later */}
          <TabButton label="Ride Drivers" />
          <TabButton label="Couriers" />
          <TabButton label="Delivery" />
          <TabButton label="Pending Approval" />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 text-left text-white/40 text-sm">
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
            <tbody className="divide-y divide-white/5">
                {loading ? (
                    <tr>
                        <td colSpan={8} className="text-center py-8 text-white/50">Loading drivers...</td>
                    </tr>
                ) : filteredDrivers.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="text-center py-8 text-white/50">No drivers found.</td>
                    </tr>
                ) : (
                    filteredDrivers.map(driver => (
                        <DriverRow 
                            key={driver.id} 
                            driver={driver} 
                            onEdit={() => openEditModal(driver)} 
                            onDelete={() => handleDeleteDriver(driver.id)}
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
    </AdminLayout>
  )
}

function StatsCard({ label, value, trend, trendUp, icon }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/5 p-6 rounded-3xl flex items-start justify-between">
            <div>
                <p className="text-white/50 text-sm font-medium mb-1">{label}</p>
                <div className="text-3xl font-bold mb-2">{value}</div>
                <div className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'} flex items-center gap-1`}>
                    <span className="text-lg">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white">
                {icon}
            </div>
        </div>
    )
}

function TabButton({ label, active }: { label: string, active?: boolean }) {
    return (
        <button className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${active ? 'bg-white text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
            {label}
        </button>
    )
}

function DriverRow({ driver, onEdit, onDelete }: { driver: Driver, onEdit: () => void, onDelete: () => void }) {
    return (
        <tr className="hover:bg-white/5 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden">
                        {driver.image ? (
                             <img src={`/storage/${driver.image}`} alt={driver.name} className="w-full h-full object-cover" />
                        ) : (
                            driver.name.charAt(0)
                        )}
                    </div>
                    <div>
                        <div className="font-bold">{driver.name}</div>
                        <div className="text-xs text-white/50">{driver.driver_id}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-medium">
                    {driver.type?.type_name || 'Unknown'}
                </span>
            </td>
            <td className="px-6 py-4 text-sm text-white/70">{driver.vehicle_model || '-'}</td>
            <td className="px-6 py-4 font-mono text-sm">{driver.trips}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                    <Star size={14} fill="currentColor" /> {Number(driver.rating || 0).toFixed(1)}
                </div>
            </td>
            <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    driver.status === 'Active' || driver.status === 'Online' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                    : 'bg-white/5 text-white/50 border border-white/10'
                }`}>
                    {driver.status}
                </span>
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
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <IconButton tooltip="View">
                        <Eye size={16} />
                    </IconButton>
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
