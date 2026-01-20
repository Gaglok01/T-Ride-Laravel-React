import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Search, Plus, Edit2, Trash2, Car, Info, Users } from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { TypeModal } from "@/components/admin/TypeModal"
import axios from "@/lib/axios"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { StatusConfirmationModal } from "@/components/admin/StatusConfirmationModal"

interface Type {
  id: number
  type_name: string
  service_type: 'ride' | 'delivery' | 'courier'
  type_custom_id?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export default function TypesPage() {
  const [types, setTypes] = useState<Type[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState<Type | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [typeToDelete, setTypeToDelete] = useState<Type | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Status Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
  const [typeToToggle, setTypeToToggle] = useState<Type | null>(null)
  const [isToggling, setIsToggling] = useState(false)

  useEffect(() => {
    fetchTypes()
  }, [])

  const fetchTypes = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/admin/types")
      // Handle both array and object wrapper responses
      const data = Array.isArray(response.data) ? response.data : (response.data.data || [])
      setTypes(data)
    } catch (error) {
      console.error("Failed to fetch types:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData: FormData) => {
    try {
      if (editingType) {
        // Update
        await axios.put(`/admin/types/${editingType.id}`, {
            type_name: formData.get("type_name"),
            service_type: formData.get("service_type"),
        })
      } else {
        // Create
        await axios.post("/admin/types", formData)
      }
      fetchTypes()
      setIsModalOpen(false)
       setEditingType(null)
    } catch (error) {
      console.error("Failed to save type:", error)
      throw error // Re-throw to be caught by modal
    }
  }

  const confirmDelete = (type: Type) => {
    setTypeToDelete(type)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteType = async () => {
    if (!typeToDelete) return

    try {
      setIsDeleting(true)
      await axios.delete(`/admin/types/${typeToDelete.id}`)
      fetchTypes()
      setIsDeleteModalOpen(false)
      setTypeToDelete(null)
    } catch (error) {
      console.error("Failed to delete type:", error)
      alert("Failed to delete type")
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmToggleStatus = (type: Type) => {
    setTypeToToggle(type)
    setIsStatusModalOpen(true)
  }

  const handleToggleStatus = async () => {
    if (!typeToToggle) return

    try {
      setIsToggling(true)
      const newStatus = typeToToggle.status === 'active' ? 'inactive' : 'active'
      await axios.put(`/admin/types/${typeToToggle.id}`, {
          status: newStatus
      })
      fetchTypes()
      setIsStatusModalOpen(false)
      setTypeToToggle(null)
    } catch (error) {
       console.error("Failed to update type status:", error)
       alert("Failed to update status")
    } finally {
      setIsToggling(false)
    }
  }

  const openCreateModal = () => {
    setEditingType(null)
    setIsModalOpen(true)
  }

  const openEditModal = (type: Type) => {
    setEditingType(type)
    setIsModalOpen(true)
  }

  const filteredTypes = types.filter(type => 
    type.type_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout
      title="Driver Types"
      description="Manage driver categories available on the platform"
      actions={
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Search types..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-tride-yellow transition-colors w-full sm:w-64"
            />
          </div>
          <Button onClick={openCreateModal} className="flex-1 sm:flex-none justify-center">
            <Plus size={18} />
            Add Driver Type
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="text-white/50 text-center py-12">Loading types...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTypes.map((type) => (
            <div key={type.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-tride-yellow/30 transition-all duration-300 group relative overflow-hidden">
                <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-blue-500 bg-opacity-20 flex items-center justify-center text-white ring-1 ring-white/10`}>
                    <Users size={24} />
                </div>
                <div className="flex gap-2">
                    <IconButton tooltip="Edit Type" onClick={() => openEditModal(type)}>
                    <Edit2 size={16} />
                    </IconButton>
                    <IconButton variant="danger" tooltip="Delete Type" onClick={() => confirmDelete(type)}>
                    <Trash2 size={16} />
                    </IconButton>
                </div>
                </div>

                <h3 className="text-xl font-bold mb-2">{type.type_name}</h3>
                <div className="flex gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        type.service_type === 'ride' ? 'bg-blue-500/10 text-blue-400' :
                        type.service_type === 'delivery' ? 'bg-green-500/10 text-green-400' :
                        'bg-purple-500/10 text-purple-400'
                    }`}>
                        {type.service_type}
                    </span>
                </div>
                <p className="text-white/50 text-sm mb-6">ID: {type.type_custom_id || type.id}</p>

                <div className="flex items-center justify-between">
                <button 
                  onClick={() => confirmToggleStatus(type)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                    type.status === 'active' 
                    ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' 
                    : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                  }`}
                >
                    {type.status === 'active' ? 'Active' : 'Inactive'}
                </button>
                <span className="text-xs text-white/30">
                    {type.created_at ? new Date(type.created_at).toLocaleDateString() : 'N/A'}
                </span>
                </div>
            </div>
            ))}

            {/* Add New Card Placeholder */}
            <button 
                onClick={openCreateModal}
                className="border-2 border-dashed border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-white/30 hover:text-tride-yellow hover:border-tride-yellow/50 hover:bg-tride-yellow/5 transition-all duration-300 min-h-[200px]"
            >
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-tride-yellow/20">
                <Plus size={32} />
            </div>
            <span className="font-bold text-lg">Create New Driver Type</span>
            </button>
        </div>
      )}

      <TypeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSave}
        initialData={editingType}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteType}

        title="Delete Driver Type"
        description="Are you sure you want to permanently delete this driver type? This may affect drivers assigned to this type."
        itemName={typeToDelete?.type_name}
        isLoading={isDeleting}
      />

      <StatusConfirmationModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onConfirm={handleToggleStatus}
        itemName={typeToToggle?.type_name}
        currentStatus={typeToToggle?.status}
        isLoading={isToggling}
      />
    </AdminLayout>
  )
}
