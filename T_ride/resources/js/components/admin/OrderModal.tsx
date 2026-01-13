import { useState, useEffect } from "react"
import { Package, User, Truck, DollarSign, List, Activity, Plus, Edit } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { CreateOrderRequest, Order } from "@/services/orderService"

interface OrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateOrderRequest) => Promise<void>
  initialData?: Order | null
}

export function OrderModal({ isOpen, onClose, onSave, initialData }: OrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form States
  const [sender, setSender] = useState("")
  const [recipient, setRecipient] = useState("")
  const [packageType, setPackageType] = useState("Small")
  const [courier, setCourier] = useState("")
  const [fee, setFee] = useState("")
  const [status, setStatus] = useState("In Transit")

  // Reset/Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setSender(initialData.sender)
        setRecipient(initialData.recipient)
        setPackageType(initialData.package_type)
        setCourier(initialData.courier)
        setFee(String(initialData.fee))
        setStatus(initialData.status)
      } else {
        setSender("")
        setRecipient("")
        setPackageType("Small")
        setCourier("")
        setFee("")
        setStatus("Pending")
      }
      setError("")
      setLoading(false)
    }
  }, [isOpen, initialData])

  const handleSubmit = async () => {
    if (!sender || !recipient || !packageType || !courier || !fee || !status) {
       setError("Please fill in all required fields.")
       return
    }

    setLoading(true)
    setError("")

    try {
      const orderData: CreateOrderRequest = {
        sender,
        recipient,
        package_type: packageType,
        courier,
        fee,
        status
      }

      await onSave(orderData)
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
      title={initialData ? "Edit Order" : "Create New Order"}
      description={initialData ? "Update order details." : "Enter the details for the new courier order."}
      icon={initialData ? <Edit size={20} /> : <Plus size={20} />}
      size="lg"
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
            {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Order" : "Create Order")}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalError message={error} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput
            label="Sender"
            icon={<User size={16} />}
            placeholder="Sender Name"
            value={sender}
            onChange={setSender}
            required
          />
          <ModalInput
            label="Recipient"
            icon={<User size={16} />}
            placeholder="Recipient Name"
            value={recipient}
            onChange={setRecipient}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <ModalSelect
            label="Package Type"
            placeholder="Select Type"
            value={packageType}
            onChange={setPackageType}
            options={[
                { label: "Small", value: "Small" },
                { label: "Medium", value: "Medium" },
                { label: "Large", value: "Large" },
                { label: "Document", value: "Document" }
            ]}
            required
            icon={<Package size={16} />}
          />
          <ModalInput
            label="Courier"
            icon={<Truck size={16} />}
            placeholder="Courier Name"
            value={courier}
            onChange={setCourier}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput
            label="Fee ($)"
            icon={<DollarSign size={16} />}
            type="number"
            placeholder="0.00"
            value={fee}
            onChange={setFee}
            required
          />
           <ModalSelect
            label="Status"
            placeholder="Select Status"
            value={status}
            onChange={setStatus}
            options={[
                { label: "Pending", value: "Pending" },
                { label: "In Transit", value: "In Transit" },
                { label: "Delivered", value: "Delivered" },
                { label: "Cancelled", value: "Cancelled" }
            ]}
            required
            icon={<Activity size={16} />}
          />
        </div>
      </div>
    </Modal>
  )
}
