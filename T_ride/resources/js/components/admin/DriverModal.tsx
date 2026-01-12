import { useState, useEffect } from "react"
import { User, Mail, Phone, Lock, Car, FileText, Upload, Plus } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface Type {
  id: number
  type_name: string
}

interface DriverData {
    id?: number
    name: string
    email?: string
    phone_number?: string
    vehicle_model?: string
    type?: {
        id: number
        type_name: string
    }
    documents?: string
    image?: string
    user?: {
        email: string
        phone_number: string
    }
}


interface DriverModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FormData) => Promise<void>
  types: Type[]
  initialData?: DriverData | null
}

export function DriverModal({ isOpen, onClose, onSave, types, initialData }: DriverModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form States
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [typeId, setTypeId] = useState("")
  const [vehicleModel, setVehicleModel] = useState("")
  const [documents, setDocuments] = useState("")
  const [image, setImage] = useState<File | null>(null)

  // Reset/Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        console.log("initialData", initialData)
        setName(initialData.name || "")
        // Populate email and phone from User relationship if available, else fallback to direct fields
        setEmail(initialData.user?.email || initialData.email || "")
        setPhone(initialData.user?.phone_number || initialData.phone_number || "")
        
        // Handle nested type
        const tId = initialData.type?.id ? initialData.type.id.toString() : ""
        setTypeId(tId)
        setVehicleModel(initialData.vehicle_model || "")
        // Documents might be array or string, handle as string for now if it's text input
        setDocuments(initialData.documents || "")
        setPassword("") 
      } else {
        setName("")
        setEmail("")
        setPhone("")
        setPassword("")
        setTypeId("")
        setVehicleModel("")
        setDocuments("")
        setImage(null)
      }
      setError("")
      setLoading(false)
    }
  }, [isOpen, initialData])

  const handleSubmit = async () => {
    if (!name || !email || !phone || !typeId) {
       setError("Please fill in all required fields.")
       return
    }
    
    if (!initialData && !password) {
      setError("Password is required for new drivers.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("phone_number", phone)
      if (password) {
          formData.append("password", password)
      }
      formData.append("type_id", typeId)
      formData.append("vehicle_model", vehicleModel)
      formData.append("documents", documents)
      
      if (image) {
        formData.append("image", image)
      }
      
      // If editing, we might need method spoofing for Laravel if using POST
      if (initialData) {
          formData.append("_method", "PUT")
      }

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
      title={initialData ? "Edit Driver" : "Add New Driver"}
      description={initialData ? "Update driver details." : "Create a new driver account with vehicle details."}
      icon={initialData ? <Car size={20} /> : <Plus size={20} />}
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
            {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Driver" : "Create Driver")}
          </ModalButton>
        </>
      }
    >
      <div className="space-y-4">
        <ModalError message={error} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput
            label="Full Name"
            icon={<User size={16} />}
            placeholder="John Doe"
            value={name}
            onChange={setName}
            required
          />
          <ModalInput
            label="Phone Number"
            icon={<Phone size={16} />}
            placeholder="+92 300 1234567"
            value={phone}
            onChange={setPhone}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput
            label="Email Address"
            icon={<Mail size={16} />}
            type="email"
            placeholder="driver@example.com"
            value={email}
            onChange={setEmail}
            required
          />
          <ModalInput
            label="Password"
            icon={<Lock size={16} />}
            type="password"
            placeholder={initialData ? "Leave blank to keep current" : "Min. 6 characters"}
            value={password}
            onChange={setPassword}
            required={!initialData}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalSelect
            label="Vehicle Type"
            placeholder="Select Vehicle Type"
            value={typeId}
            onChange={setTypeId}
            options={types.map(t => ({ label: t.type_name, value: t.id }))}
            required
            icon={<Car size={16} />}
          />

           <ModalInput
            label="Vehicle Model"
            icon={<Car size={16} />}
            placeholder="e.g. Toyota Corolla 2022"
            value={vehicleModel}
            onChange={setVehicleModel}
          />
        </div>
        
        <ModalInput
            label="Documents / License No"
            icon={<FileText size={16} />}
            placeholder="Enter license number or details"
            value={documents}
            onChange={setDocuments}
        />

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Driver Photo
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-tride-yellow/30 transition-colors cursor-pointer relative">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    {image ? (
                        <>
                             <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-2">
                                <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                             </div>
                             <span className="text-emerald-400 font-medium text-sm">{image.name}</span>
                        </>
                    ) : (
                        initialData?.image ? (
                           <>
                             <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-2">
                                <img src={`/storage/${initialData.image}`} alt="Current" className="w-full h-full object-cover" />
                             </div>
                             <span className="text-gray-400 text-sm">Click to change</span>
                           </>
                        ) : (
                          <>
                              <Upload size={24} className="mb-1 opacity-50" />
                              <span className="text-sm">Click to upload image</span>
                              <span className="text-xs opacity-50">(JPG, PNG, max 2MB)</span>
                          </>
                        )
                    )}
                </div>
            </div>
        </div>

      </div>
    </Modal>
  )
}
