import { useState, useEffect } from "react"
import { Modal, ModalButton, ModalError, ModalSelect } from "@/components/ui/modal"
import { RefreshCw } from "lucide-react"

interface StatusUpdateModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newStatus: string) => Promise<void>
  currentStatus?: string
  isLoading?: boolean
  options?: { label: string, value: string }[]
  title?: string
  description?: string
}

export function StatusUpdateModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentStatus = "active",
  isLoading = false,
  options = [
    { label: "Active", value: "active" },
    { label: "Suspended", value: "suspended" },
    { label: "Inactive", value: "inactive" }
  ],
  title = "Update Status",
  description = "Select the new status."
}: StatusUpdateModalProps) {
  const [status, setStatus] = useState(currentStatus)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      setStatus(currentStatus)
      setError("")
    }
  }, [isOpen, currentStatus])

  const handleConfirm = async () => {
    try {
      await onConfirm(status)
      onClose()
    } catch (err) {
      setError("Failed to update status")
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      icon={<RefreshCw size={20} />}
      size="sm"
      footer={
        <>
          <ModalButton variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </ModalButton>
          <ModalButton 
            variant="primary" 
            onClick={handleConfirm} 
            isLoading={isLoading}
            loadingText="Updating..."
          >
            Update
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalError message={error} />
        
        <ModalSelect
          label="New Status"
          value={status}
          onChange={setStatus}
          options={options}
          required
        />
      </div>
    </Modal>
  )
}
