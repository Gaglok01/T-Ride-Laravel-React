import { useState, useEffect } from "react"
import { User, Mail, Phone, Lock, Car, FileText, Upload, Plus, Users, CreditCard, ShieldCheck, AlertTriangle, MapPin, Search } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import { PlacesAutocompleteInput } from "@/components/ui/places-autocomplete-input"
import { GoogleMap, Marker } from "@react-google-maps/api"
import { useGoogleMaps } from "@/providers/GoogleMapsProvider"

interface Type {
  id: number
  type_name: string
  status?: string
}

interface DriverData {
    id?: number
    name: string
    email?: string
    phone_number?: string
    vehicle_model?: string
    location?: string
    cnic?: string
    license_number?: string
    background_check_status?: string
    type?: {
        id: number
        type_name: string
    }
    lat?: number
    lng?: number
    documents?: string
    image?: string
    user?: {
        email: string
        phone_number: string
        lat?: number
        lng?: number
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
  const [location, setLocation] = useState("")
  const [cnic, setCnic] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [documents, setDocuments] = useState("")
  const [image, setImage] = useState<File | null>(null)
  
  const [lat, setLat] = useState<number | undefined>(undefined)
  const [lng, setLng] = useState<number | undefined>(undefined)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  
  const { isLoaded } = useGoogleMaps()

  // Validation states
  const [cnicError, setCnicError] = useState("")
  const [licenseError, setLicenseError] = useState("")

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
        setLocation(initialData.location || "")
        setCnic(initialData.cnic || "")
        setLicenseNumber(initialData.license_number || "")
        // Documents might be array or string, handle as string for now if it's text input
        setDocuments(initialData.documents || "")
        setPassword("") 
        
        const rawLat = initialData.user?.lat || initialData.lat
        const rawLng = initialData.user?.lng || initialData.lng
        
        setLat(rawLat ? Number(rawLat) : undefined)
        setLng(rawLng ? Number(rawLng) : undefined)
      } else {
        setName("")
        setEmail("")
        setPhone("")
        setPassword("")
        setTypeId("")
        setVehicleModel("")
        setLocation("")
        setCnic("")
        setLicenseNumber("")
        setDocuments("")
        setImage(null)
        setLat(undefined)
        setLng(undefined)
      }
      setError("")
      setCnicError("")
      setLicenseError("")
      setLoading(false)
    }
  }, [isOpen, initialData])

  // CNIC format validation (13 digits: XXXXX-XXXXXXX-X)
  const validateCnic = (value: string): boolean => {
    if (!value) return true // optional if license provided
    const cleaned = value.replace(/-/g, '')
    return /^\d{13}$/.test(cleaned)
  }

  // License format validation 
  const validateLicense = (value: string): boolean => {
    if (!value) return true // optional if cnic provided
    const cleaned = value.replace(/[-\s]/g, '')
    return cleaned.length >= 5 && /^[A-Za-z0-9]+$/.test(cleaned)
  }

  // Format CNIC as user types (XXXXX-XXXXXXX-X)
  const handleCnicChange = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '').slice(0, 13)
    
    // Format as XXXXX-XXXXXXX-X
    let formatted = digits
    if (digits.length > 5) {
      formatted = digits.slice(0, 5) + '-' + digits.slice(5)
    }
    if (digits.length > 12) {
      formatted = digits.slice(0, 5) + '-' + digits.slice(5, 12) + '-' + digits.slice(12)
    }
    
    setCnic(formatted)
    
    if (formatted && !validateCnic(formatted)) {
      setCnicError("CNIC must be 13 digits (e.g., 12345-1234567-1)")
    } else {
      setCnicError("")
    }
  }

  const handleLicenseChange = (value: string) => {
    setLicenseNumber(value)
    
    if (value && !validateLicense(value)) {
      setLicenseError("License must be at least 5 alphanumeric characters")
    } else {
      setLicenseError("")
    }
  }

  const handleSubmit = async () => {
    if (!name || !email || !phone || !typeId) {
       setError("Please fill in all required fields.")
       return
    }
    
    if (!initialData && !password) {
      setError("Password is required for new drivers.")
      return
    }

    // 🔹 At least one of CNIC or License required
    if (!cnic && !licenseNumber) {
      setError("Either CNIC or License Number is required. Please provide at least one.")
      return
    }

    // 🔹 Validate CNIC format
    if (cnic && !validateCnic(cnic)) {
      setError("Invalid CNIC format. Must be 13 digits (e.g., 12345-1234567-1).")
      return
    }

    // 🔹 Validate License format
    if (licenseNumber && !validateLicense(licenseNumber)) {
      setError("Invalid License Number. Must be at least 5 alphanumeric characters.")
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
      formData.append("location", location)
      if (lat) formData.append("lat", lat.toString())
      if (lng) formData.append("lng", lng.toString())
      formData.append("cnic", cnic.replace(/-/g, '')) // Send without dashes
      formData.append("license_number", licenseNumber)
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

  // Background check status badge
  const BackgroundStatusBadge = ({ status }: { status?: string }) => {
    if (!status || status === 'not_checked') return null
    
    const styles = {
      pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      verified: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      failed: "bg-red-500/10 text-red-400 border-red-500/20",
    }
    const icons = {
      pending: <AlertTriangle size={12} />,
      verified: <ShieldCheck size={12} />,
      failed: <AlertTriangle size={12} />,
    }
    const style = styles[status as keyof typeof styles] || ""
    const icon = icons[status as keyof typeof icons]
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
        {icon} Background: {status.replace(/_/g, ' ')}
      </span>
    )
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

        {/* Background Check Status (edit mode only) */}
        {initialData?.background_check_status && initialData.background_check_status !== 'not_checked' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
            <ShieldCheck size={16} className="text-tride-yellow" />
            <span className="text-sm text-gray-300">Background Check:</span>
            <BackgroundStatusBadge status={initialData.background_check_status} />
          </div>
        )}

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
            label="Driver Type"
            placeholder="Select Driver Type"
            value={typeId}
            onChange={setTypeId}
            options={types
                .filter(t => t.status === 'active' || (initialData?.type?.id === t.id))
                .map(t => ({ label: t.type_name, value: t.id }))
            }
            required
            icon={<Users size={16} />}
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <PlacesAutocompleteInput
                label="Location"
                placeholder="Search location..."
                value={location}
                onChange={setLocation}
                onPlaceSelect={(place) => {
                  setLocation(place.address)
                  setLat(place.lat)
                  setLng(place.lng)
                }}
              />
            </div>
            <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="h-[50px] px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
            >
                <MapPin size={16} />
            </button>
          </div>
        </div>

        {/* CNIC & License Section */}
        <div className="border border-tride-yellow/20 rounded-xl p-4 bg-tride-yellow/5">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-tride-yellow" />
            <span className="text-sm font-medium text-tride-yellow">Identity Verification</span>
            <span className="text-xs text-gray-400">(At least one required)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ModalInput
                label="CNIC Number"
                icon={<CreditCard size={16} />}
                placeholder="12345-1234567-1"
                value={cnic}
                onChange={handleCnicChange}
              />
              {cnicError && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> {cnicError}
                </p>
              )}
            </div>
            <div>
              <ModalInput
                label="License Number"
                icon={<FileText size={16} />}
                placeholder="e.g. DL-12345"
                value={licenseNumber}
                onChange={handleLicenseChange}
              />
              {licenseError && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle size={10} /> {licenseError}
                </p>
              )}
            </div>
          </div>

          {!cnic && !licenseNumber && (
            <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
              <AlertTriangle size={10} /> Please provide at least CNIC or License Number for background verification.
            </p>
          )}
        </div>
        
        <ModalInput
            label="Documents / Additional Info"
            icon={<FileText size={16} />}
            placeholder="Enter any additional document details"
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
      
      {/* Map Picker Modal */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Select Location on Map"
        size="xl"
        footer={
            <>
              <ModalButton variant="secondary" onClick={() => setIsMapModalOpen(false)}>
                Cancel
              </ModalButton>
              <ModalButton variant="primary" onClick={() => setIsMapModalOpen(false)}>
                Confirm Location
              </ModalButton>
            </>
        }
      >
        <div className="space-y-4">
            <PlacesAutocompleteInput
                label="Search for location"
                placeholder="Type to search..."
                value={location}
                onChange={setLocation}
                onPlaceSelect={(place) => {
                    setLocation(place.address)
                    setLat(place.lat)
                    setLng(place.lng)
                }}
            />
            
            <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10 relative">
                {isLoaded ? (
                    <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={(lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) 
                            ? { lat: Number(lat), lng: Number(lng) } 
                            : { lat: 31.5204, lng: 74.3587 }}
                        zoom={15}
                        onClick={(e) => {
                            if (e.latLng) {
                                const newLat = e.latLng.lat()
                                const newLng = e.latLng.lng()
                                setLat(newLat)
                                setLng(newLng)
                                
                                // Geocode to get address string
                                const geocoder = new google.maps.Geocoder()
                                geocoder.geocode({ location: { lat: newLat, lng: newLng } }, (results, status) => {
                                    if (status === 'OK' && results?.[0]) {
                                        setLocation(results[0].formatted_address)
                                    }
                                })
                            }
                        }}
                        options={{
                            styles: darkMapStyles,
                            disableDefaultUI: false,
                        }}
                    >
                        {lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng)) && (
                            <Marker position={{ lat: Number(lat), lng: Number(lng) }} />
                        )}
                    </GoogleMap>
                ) : (
                    <div className="h-full flex items-center justify-center text-white/50">
                        Loading Map...
                    </div>
                )}
            </div>
        </div>
      </Modal>
    </Modal>
  )
}

const darkMapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
]
