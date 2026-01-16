import { Modal, ModalButton } from "@/components/ui/modal"
import { AlertTriangle, Info } from "lucide-react"

interface StatusConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  currentStatus?: string
  isLoading?: boolean
}

export function StatusConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Change Status", 
  description = "Are you sure you want to change the status of this item?",
  itemName,
  currentStatus,
  isLoading = false
}: StatusConfirmationModalProps) {
    // Determine if we are "activating" (positive action) or "deactivating" (negative action)
    const isCurrentlyInactive = currentStatus === 'inactive' || currentStatus === 'Closed' || currentStatus === 'closed';
    
    // Determine text based on context
    let actionLabel = isCurrentlyInactive ? "Activate" : "Deactivate"
    let targetStatusLabel = isCurrentlyInactive ? "Active" : "Inactive"
    const isPositiveAction = isCurrentlyInactive

    if (currentStatus === 'Open' || currentStatus === 'Closed' || currentStatus === 'open' || currentStatus === 'closed') {
        actionLabel = isCurrentlyInactive ? "Open" : "Close"
        targetStatusLabel = isCurrentlyInactive ? "Open" : "Closed"
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            icon={<Info size={20} className="text-tride-yellow" />}
            size="sm"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </ModalButton>
                    <ModalButton 
                        variant={isPositiveAction ? "primary" : "danger"} 
                        onClick={onConfirm} 
                        isLoading={isLoading} 
                        loadingText="Updating..."
                    >
                        {actionLabel}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                 <p className="text-white/70">
                    You are ensuring that 
                    {itemName && <span className="text-white font-bold"> {itemName} </span>}
                    will be marked as 
                    <span className={`font-bold ${isPositiveAction ? 'text-green-400' : 'text-red-400'}`}>
                         {` ${targetStatusLabel}`}
                    </span>.
                 </p>
            </div>
        </Modal>
    )
}
