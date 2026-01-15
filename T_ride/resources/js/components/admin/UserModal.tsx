import { useState, useEffect } from "react"
import { User, Mail, Phone, Lock, Wallet, Upload, UserPlus, UserCog } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface UserData {
    id?: number
    name: string
    email: string
    phone_number?: string
    status: string
    wallet_balance?: number
    photo?: string
    roles?: { name: string }[]
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: FormData) => Promise<void>
  initialData?: UserData | null
}

export function UserModal({ isOpen, onClose, onSave, initialData }: UserModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form States
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState("active")
  const [role, setRole] = useState("rider")
  const [walletBalance, setWalletBalance] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)

  // Reset/Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || "")
        setEmail(initialData.email || "")
        setPhone(initialData.phone_number || "")
        setStatus(initialData.status || "active")
        // Check roles if available, otherwise default to rider
        const userRole = initialData.roles && initialData.roles.length > 0 ? initialData.roles[0].name : "rider"
        setRole(userRole)
        setWalletBalance(initialData.wallet_balance?.toString() || "0")
        setPassword("")
        setPhoto(null)
      } else {
        setName("")
        setEmail("")
        setPhone("")
        setPassword("")
        setStatus("active")
        setRole("rider")
        setWalletBalance("0")
        setPhoto(null)
      }
      setError("")
      setLoading(false)
    }
  }, [isOpen, initialData])

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
       setError("Please fill in all required fields (Name, Email, Phone).")
       return
    }
    
    if (!initialData && !password) {
      setError("Password is required for new users.")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    // Password length validation for new users
    if (!initialData && password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("phone_number", phone)
      formData.append("status", status)
      formData.append("role", role)
      formData.append("wallet_balance", walletBalance || "0")
      
      if (password) {
        formData.append("password", password)
      }
      
      if (photo) {
        formData.append("photo", photo)
      }
      
      // If editing, we might need method spoofing for Laravel
      if (initialData) {
        formData.append("_method", "PUT")
      }

      await onSave(formData)
      onClose()
    } catch (err: any) {
      console.error(err)
      // Handle validation errors from backend
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors
        const firstError = Object.values(errors)[0]
        setError(Array.isArray(firstError) ? firstError[0] : firstError as string)
      } else {
        setError(err.response?.data?.message || err.message || "Something went wrong")
      }
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Suspended", value: "suspended" },
    { label: "Inactive", value: "inactive" }
  ]

  const roleOptions = [
    { label: "Rider", value: "rider" },
    { label: "Customer", value: "customer" },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit User" : "Add New User"}
      description={initialData ? "Update user account details." : "Create a new user account."}
      icon={initialData ? <UserCog size={20} /> : <UserPlus size={20} />}
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
            {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update User" : "Create User")}
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
            placeholder="user@example.com"
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
            label="Status"
            placeholder="Select Status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
            required
            icon={<User size={16} />}
          />
          <ModalSelect
            label="Role"
            placeholder="Select Role"
            value={role}
            onChange={setRole}
            options={roleOptions}
            required
            icon={<UserCog size={16} />}
          />
          <ModalInput
            label="Wallet Balance"
            icon={<Wallet size={16} />}
            type="number"
            placeholder="0.00"
            value={walletBalance}
            onChange={setWalletBalance}
          />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User Photo
            </label>
            <div className="border-2 border-dashed border-white/10 rounded-xl p-4 text-center hover:border-tride-yellow/30 transition-colors cursor-pointer relative">
                <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    {photo ? (
                        <>
                             <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-2">
                                <img src={URL.createObjectURL(photo)} alt="Preview" className="w-full h-full object-cover" />
                             </div>
                             <span className="text-emerald-400 font-medium text-sm">{photo.name}</span>
                        </>
                    ) : (
                        initialData?.photo ? (
                           <>
                             <div className="w-16 h-16 rounded-full overflow-hidden bg-white/5 mb-2">
                                <img src={`/storage/${initialData.photo}`} alt="Current" className="w-full h-full object-cover" />
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
