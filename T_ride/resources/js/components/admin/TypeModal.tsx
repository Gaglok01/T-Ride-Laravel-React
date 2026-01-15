"use client"

import { useState, useEffect } from "react"
import { Users, Plus } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput } from "@/components/ui/modal"

interface Type {
  id: number
  type_name: string
  created_at?: string
  updated_at?: string
}

interface TypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FormData) => Promise<void>
  initialData?: Type | null
}

export function TypeModal({ isOpen, onClose, onSave, initialData }: TypeModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form States
  const [typeName, setTypeName] = useState("")

  // Reset or populate form when modal opens/initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setTypeName(initialData.type_name)
      } else {
        setTypeName("")
      }
      setError("")
      setLoading(false)
    }
  }, [isOpen, initialData])

  const handleSubmit = async () => {
    if (!typeName) {
      setError("Please enter a type name.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("type_name", typeName)
      
      // If editing, we might need to handle the update logic in the parent component
      // but usually for FormData updates we might just use PUT key-value pairs
      // For consistency with other modals, we pass FormData
      
      await onSave(formData)
      onClose()
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Type" : "Add New Type"}
      description={initialData ? "Update the driver type details." : "Create a new driver type."}
      icon={<Users size={20} />}
      size="md"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </ModalButton>
          <ModalButton 
            variant="primary" 
            onClick={handleSubmit} 
            isLoading={loading}
            loadingText={initialData ? "Updating..." : "Creating..."}
          >
            {initialData ? "Update Type" : "Create Type"}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalError message={error} />

        <ModalInput
          label="Type Name"
          icon={<Users size={16} />}
          placeholder="e.g. Ride Driver, Courier"
          value={typeName}
          onChange={setTypeName}
          required
        />
      </div>
    </Modal>
  )
}
