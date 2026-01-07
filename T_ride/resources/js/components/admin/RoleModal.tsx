"use client"

import { useState, useEffect } from "react"
import { Shield, Edit2, Check, Search } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput } from "@/components/ui/modal"

interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (roleData: any) => void
  initialData?: any
}

// Mock permissions for the UI
const AVAILABLE_PERMISSIONS = [
  { id: 1, name: "user.view" }, { id: 2, name: "user.create" }, { id: 3, name: "user.edit" }, { id: 4, name: "user.delete" },
  { id: 5, name: "ride.view" }, { id: 6, name: "ride.edit" }, { id: 7, name: "ride.assign" },
  { id: 8, name: "driver.view" }, { id: 9, name: "driver.create" }, { id: 10, name: "driver.edit" },
  { id: 11, name: "vendor.view" }, { id: 12, name: "vendor.manage" },
  { id: 13, name: "finance.view" }, { id: 14, name: "finance.export" },
  { id: 15, name: "settings.view" }, { id: 16, name: "settings.edit" }
]

export function RoleModal({ isOpen, onClose, onSave, initialData }: RoleModalProps) {
  const [roleName, setRoleName] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  // Reset or load data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setRoleName(initialData.name)
        setSelectedPermissions(initialData.permissions || [])
      } else {
        setRoleName("")
        setSelectedPermissions([])
      }
      setSearchQuery("")
      setError("")
      setIsSaving(false)
    }
  }, [isOpen, initialData])

  const handleSave = async () => {
    if (!roleName.trim()) {
      setError("Role name is required")
      return
    }

    setIsSaving(true)
    
    // Simulate API call
    setTimeout(() => {
      onSave({ name: roleName, permissions: selectedPermissions })
      setIsSaving(false)
      onClose()
    }, 800)
  }

  const togglePermission = (name: string) => {
    setSelectedPermissions(prev => 
      prev.includes(name) 
        ? prev.filter(p => p !== name)
        : [...prev, name]
    )
  }

  const filteredPermissions = AVAILABLE_PERMISSIONS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Role" : "Create New Role"}
      description="Set up role details and permissions"
      icon={initialData ? <Edit2 size={20} /> : <Shield size={20} />}
      size="lg"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose}>
            Cancel
          </ModalButton>
          <ModalButton 
            variant="primary" 
            onClick={handleSave}
            isLoading={isSaving}
            loadingText="Saving..."
          >
            {initialData ? "Save Changes" : "Create Role"}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-6">
        <ModalError message={error} />

        <ModalInput
          label="Role Name"
          value={roleName}
          onChange={setRoleName}
          placeholder="e.g. Operations Manager"
          required
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-300">Permissions</label>
            <div className="text-xs text-gray-500">
              {selectedPermissions.length} selected
            </div>
          </div>

          {/* Search Permissions */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search permissions..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-tride-dark border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-tride-yellow/50 placeholder-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
            {filteredPermissions.map(permission => (
              <label 
                key={permission.id} 
                className={`relative flex items-center justify-between p-3 rounded-xl border cursor-pointer group transition-all duration-200 ${
                  selectedPermissions.includes(permission.name)
                    ? "bg-tride-yellow/10 border-tride-yellow text-white"
                    : "bg-tride-dark border-white/5 hover:border-white/20 text-gray-400 hover:text-gray-300"
                }`}
              >
                <span className="text-sm font-medium pr-8 break-words leading-tight">
                  {permission.name}
                </span>
                
                <div className={`absolute right-3 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  selectedPermissions.includes(permission.name)
                    ? "bg-tride-yellow border-tride-yellow scale-110"
                    : "border-gray-600 group-hover:border-gray-500"
                }`}>
                  {selectedPermissions.includes(permission.name) && (
                    <Check size={14} className="text-black stroke-[3]" />
                  )}
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={selectedPermissions.includes(permission.name)}
                  onChange={() => togglePermission(permission.name)}
                />
              </label>
            ))}
            
            {filteredPermissions.length === 0 && (
              <div className="col-span-2 text-center py-8 text-gray-500 bg-white/5 rounded-xl border border-white/5 border-dashed">
                No permissions found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
