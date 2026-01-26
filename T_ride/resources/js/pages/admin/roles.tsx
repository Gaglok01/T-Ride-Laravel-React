import { useState } from "react"
import { Head } from "@inertiajs/react"
import { AdminLayout } from "@/layouts/admin-layout"
import { Shield, Plus, Edit2, Trash2 } from "lucide-react"
import { RoleModal } from "@/components/admin/RoleModal"
import { Button, IconButton } from "@/components/ui/button"

// Mock data for design purposes
const MOCK_ROLES = [
  {
    id: 1,
    name: "Super Admin",
    permissions: [
      "user.view", "user.create", "user.edit", "user.delete",
      "ride.view", "ride.edit",
      "vendor.view", "vendor.manage",
      "finance.view", "finance.manage",
      "settings.view", "settings.edit"
    ]
  },
  {
    id: 2,
    name: "Fleet Manager",
    permissions: [
      "driver.view", "driver.create", "driver.edit",
      "vehicle.view", "vehicle.create", "vehicle.edit",
      "ride.view", "ride.assign"
    ]
  },
  {
    id: 3,
    name: "Support Agent",
    permissions: [
      "user.view",
      "ride.view",
      "ticket.view", "ticket.respond"
    ]
  },
  {
    id: 4,
    name: "Finance Officer",
    permissions: [
      "finance.view", "finance.export",
      "payout.view", "payout.process"
    ]
  }
]

export default function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<any>(null)

  const handleOpenModal = (role?: any) => {
    setEditingRole(role || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingRole(null)
  }

  const handleSaveRole = (roleData: any) => {
    // In a real app, you would make an API call here
    console.log("Saving role:", roleData)
    // Close modal after saving
    handleCloseModal()
  }

  return (
    <AdminLayout 
      title="Roles & Permissions" 
      description="Manage user roles and access controls"
      actions={
        <div className="w-full sm:w-auto">
            <Button onClick={() => handleOpenModal()} className="w-full sm:w-auto justify-center">
              <Plus size={20} className="mr-2" />
              Add Role
            </Button>
        </div>
      }
    >
      <Head title="Roles & Permissions - T-RIDE Admin" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ROLES.map(role => (
          <div key={role.id} className="bg-tride-card border border-tride-border rounded-2xl p-6 hover:border-tride-yellow/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-tride-yellow/10 flex items-center justify-center text-tride-yellow">
                  <Shield size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-tride-text capitalize">{role.name}</h3>
                  <p className="text-sm text-tride-text-muted">{role.permissions.length} Permissions</p>
                </div>
              </div>
              <div className="flex gap-2">
                <IconButton 
                  onClick={() => handleOpenModal(role)} 
                  tooltip="Edit Role"
                >
                  <Edit2 size={16} />
                </IconButton>
                <IconButton variant="danger" tooltip="Delete Role">
                  <Trash2 size={16} />
                </IconButton>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-medium text-tride-text-muted uppercase tracking-wider mb-2">Access Capabilities</p>
              <div className="flex flex-wrap gap-2">
                {role.permissions.slice(0, 5).map((permission, index) => (
                  <span key={index} className="text-xs bg-tride-hover text-tride-text-muted px-2 py-1 rounded-md border border-tride-border">
                    {permission}
                  </span>
                ))}
                {role.permissions.length > 5 && (
                  <span className="text-xs bg-tride-hover text-tride-text-muted px-2 py-1 rounded-md border border-tride-border">
                    +{role.permissions.length - 5} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <RoleModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRole}
        initialData={editingRole}
      />
    </AdminLayout>
  )
}
