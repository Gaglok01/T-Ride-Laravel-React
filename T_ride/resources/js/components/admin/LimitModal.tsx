
import { useState, useEffect } from "react"
import { DollarSign, Activity, Settings } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput } from "@/components/ui/modal"

interface LimitModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData: any
}

export function LimitModal({ isOpen, onClose, onSave, initialData }: LimitModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [amount, setAmount] = useState("")
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        if (isOpen && initialData) {
            setAmount(initialData.amount ? initialData.amount.toString() : "")
            setIsActive(initialData.is_active ?? true)
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!amount) {
            setError("Please enter an amount.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                amount: parseFloat(amount),
                is_active: isActive
            }

            await onSave(data)
            onClose()
        } catch (err: any) {
            console.error(err)
            const errorMsg = err.response?.data?.message || err.message || "Something went wrong"
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

    if (!initialData) return null

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Transaction Limit"
            description={`Update limit for ${initialData.name || initialData.limit_type}.`}
            icon={<Settings size={20} />}
            size="sm"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </ModalButton>
                    <ModalButton
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={loading}
                        loadingText="Updating..."
                    >
                        Update Limit
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalInput
                    label="Limit Amount ($)"
                    icon={<DollarSign size={16} />}
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={setAmount}
                    required
                />

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-white/60" />
                        <span className="text-sm font-medium text-white">Enable Limit</span>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={isActive}
                        onClick={() => setIsActive(!isActive)}
                        className={`
                            relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tride-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-tride-dark
                            ${isActive ? 'bg-tride-yellow' : 'bg-neutral-700'}
                        `}
                    >
                        <span
                            className={`
                                pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform
                                ${isActive ? 'translate-x-5' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>
            </div>
        </Modal>
    )
}
