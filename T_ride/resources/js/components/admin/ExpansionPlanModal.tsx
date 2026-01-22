import { useState, useEffect } from "react"
import { Globe, MapPin, TrendingUp, Calendar, FileText, Plus, Pencil } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect, ModalTextarea } from "@/components/ui/modal"

interface ExpansionPlanData {
    id?: number
    city_name: string
    country: string
    stage: 'research' | 'partnerships' | 'licensing' | 'launch_prep' | 'launched'
    progress: number
    target_launch_date?: string
    notes?: string
}

interface ExpansionPlanModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: ExpansionPlanData | null
}

export function ExpansionPlanModal({ isOpen, onClose, onSave, initialData }: ExpansionPlanModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [cityName, setCityName] = useState("")
    const [country, setCountry] = useState("")
    const [stage, setStage] = useState<'research' | 'partnerships' | 'licensing' | 'launch_prep' | 'launched'>("research")
    const [progress, setProgress] = useState("0")
    const [targetLaunchDate, setTargetLaunchDate] = useState("")
    const [notes, setNotes] = useState("")

    // Reset/Populate form when modal opens
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setCityName(initialData.city_name || "")
                setCountry(initialData.country || "")
                setStage(initialData.stage || "research")
                setProgress(initialData.progress ? initialData.progress.toString() : "0")
                setTargetLaunchDate(initialData.target_launch_date || "")
                setNotes(initialData.notes || "")
            } else {
                setCityName("")
                setCountry("")
                setStage("research")
                setProgress("0")
                setTargetLaunchDate("")
                setNotes("")
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!cityName || !country) {
            setError("City name and country are required.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                city_name: cityName,
                country,
                stage,
                progress: parseInt(progress) || 0,
                target_launch_date: targetLaunchDate || null,
                notes: notes || null
            }
            await onSave(data)
            onClose()
        } catch (err: any) {
            console.error(err)
            if (err.response?.data?.errors) {
                const firstErrorKey = Object.keys(err.response.data.errors)[0]
                setError(err.response.data.errors[firstErrorKey][0])
            } else if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Something went wrong. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={initialData ? "Edit Expansion Plan" : "Add Expansion Plan"}
            description={initialData ? "Update expansion plan details." : "Add a new city to the expansion pipeline."}
            icon={initialData ? <Pencil size={20} /> : <Plus size={20} />}
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
                        {loading ? (initialData ? "Updating..." : "Creating...") : (initialData ? "Update Plan" : "Add Plan")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="City Name"
                        icon={<MapPin size={16} />}
                        placeholder="e.g. Kumasi"
                        value={cityName}
                        onChange={setCityName}
                        required
                    />
                    <ModalInput
                        label="Country"
                        icon={<Globe size={16} />}
                        placeholder="e.g. Ghana"
                        value={country}
                        onChange={setCountry}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalSelect
                        label="Stage"
                        placeholder="Select Stage"
                        value={stage}
                        onChange={(val) => setStage(val as 'research' | 'partnerships' | 'licensing' | 'launch_prep' | 'launched')}
                        options={[
                            { label: "Research", value: "research" },
                            { label: "Partnerships", value: "partnerships" },
                            { label: "Licensing", value: "licensing" },
                            { label: "Launch Prep", value: "launch_prep" },
                            { label: "Launched", value: "launched" }
                        ]}
                        required
                        icon={<TrendingUp size={16} />}
                    />

                    <ModalInput
                        label="Progress (%)"
                        icon={<TrendingUp size={16} />}
                        type="number"
                        placeholder="0-100"
                        value={progress}
                        onChange={setProgress}
                        required
                    />
                </div>

                <ModalInput
                    label="Target Launch Date"
                    icon={<Calendar size={16} />}
                    type="date"
                    value={targetLaunchDate}
                    onChange={setTargetLaunchDate}
                />

                <ModalTextarea
                    label="Notes"
                    placeholder="Additional notes about this expansion..."
                    value={notes}
                    onChange={setNotes}
                    rows={3}
                />
            </div>
        </Modal>
    )
}
