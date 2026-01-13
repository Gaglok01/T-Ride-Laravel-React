import { Modal, ModalButton } from "@/components/ui/modal"
import { AlertTriangle } from "lucide-react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  description?: string
  itemName?: string
  isLoading?: boolean
}

export function DeleteConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Item", 
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  isLoading = false
}: DeleteConfirmationModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            description={description}
            icon={<AlertTriangle size={20} className="text-red-500" />}
            size="sm"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </ModalButton>
                    <ModalButton variant="danger" onClick={onConfirm} isLoading={isLoading} loadingText="Deleting...">
                        Delete
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                 <p className="text-white/70">
                    This action is <span className="text-red-400 font-bold">irreversible</span>. 
                    Please confirm that you want to permanently remove this record from the database.
                 </p>
                 
                {itemName && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm flex items-center justify-center font-mono">
                        {itemName}
                    </div>
                )}
            </div>
        </Modal>
    )
}
