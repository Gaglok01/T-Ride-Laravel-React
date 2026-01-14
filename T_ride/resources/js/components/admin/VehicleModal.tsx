import { useState, useEffect } from "react"
import { Car, Calendar, FileText, Hash, DollarSign, Activity, Settings, Plus, Edit } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface VehicleModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: any
}

export function VehicleModal({ isOpen, onClose, onSave, initialData }: VehicleModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [name, setName] = useState("")
    const [year, setYear] = useState(new Date().getFullYear().toString())
    const [vin, setVin] = useState("")
    const [plateNumber, setPlateNumber] = useState("")
    const [type, setType] = useState("")
    const [dailyRate, setDailyRate] = useState("")
    const [status, setStatus] = useState("available")

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setYear(initialData.year ? initialData.year.toString() : new Date().getFullYear().toString())
                setVin(initialData.vin || "")
                setPlateNumber(initialData.plate_number || "")
                setType(initialData.type || "")
                setDailyRate(initialData.daily_rate ? initialData.daily_rate.toString() : "")
                setStatus(initialData.status || "available")
            } else {
                setName("")
                setYear(new Date().getFullYear().toString())
                setVin("")
                setPlateNumber("")
                setType("")
                setDailyRate("")
                setStatus("available")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !year || !vin || !plateNumber || !type || !dailyRate || !status) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const vehicleData = {
                name,
                year: parseInt(year),
                vin,
                plate_number: plateNumber,
                type,
                daily_rate: parseFloat(dailyRate),
                status
            }

            await onSave(vehicleData)
            onClose()
        } catch (err: any) {
            console.error(err)
            const errorMsg = err.response?.data?.message || err.message || "Something went wrong"
            // If validation errors exist, maybe append them? For now, standard message.
            if (err.response?.data?.errors) {
                 const firstErrorKey = Object.keys(err.response.data.errors)[0];
                 setError(err.response.data.errors[firstErrorKey][0]);
            } else {
                setError(errorMsg)
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Vehicle" : "Add Vehicle"}
            description={initialData ? "Update vehicle details." : "Add a new vehicle to the fleet."}
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
                        loadingText={initialData ? "Updating..." : "Saving..."}
                    >
                        {loading ? (initialData ? "Updating..." : "Saving...") : (initialData ? "Update Vehicle" : "Save Vehicle")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Vehicle Name"
                        icon={<Car size={16} />}
                        placeholder="e.g. Toyota Camry"
                        value={name}
                        onChange={setName}
                        required
                    />
                    <ModalInput
                        label="Year"
                        icon={<Calendar size={16} />}
                        type="number"
                        placeholder="e.g. 2023"
                        value={year}
                        onChange={setYear}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="VIN"
                        icon={<FileText size={16} />}
                        placeholder="Vehicle Identification Number"
                        value={vin}
                        onChange={setVin}
                        required
                    />
                    <ModalInput
                        label="Plate Number"
                        icon={<Hash size={16} />}
                        placeholder="e.g. ABC 123"
                        value={plateNumber}
                        onChange={setPlateNumber}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Type"
                        icon={<Settings size={16} />} // Generic icon or maybe Car
                        placeholder="e.g. Sedan, SUV"
                        value={type}
                        onChange={setType}
                        required
                    />
                    <ModalInput
                        label="Daily Rate ($)"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="0.00"
                        value={dailyRate}
                        onChange={setDailyRate}
                        required
                    />
                </div>

                <ModalSelect
                    label="Status"
                    placeholder="Select Status"
                    value={status}
                    onChange={setStatus}
                    options={[
                        { label: "Available", value: "available" },
                        { label: "Rented", value: "rented" },
                        { label: "Maintenance", value: "maintenance" }
                    ]}
                    required
                    icon={<Activity size={16} />}
                />
            </div>
        </Modal>
    )
}
