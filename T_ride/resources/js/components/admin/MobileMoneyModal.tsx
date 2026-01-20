
import { useState, useEffect } from "react"
import { Smartphone, Globe, DollarSign, Percent, Activity, Box, Plus } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface ProviderOption {
    label: string
    value: number
}

interface MobileMoneyModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    providers: ProviderOption[]
}

export function MobileMoneyModal({ isOpen, onClose, onSave, providers }: MobileMoneyModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    // Form States
    const [paymentProviderId, setPaymentProviderId] = useState("")
    const [name, setName] = useState("")
    const [country, setCountry] = useState("")
    const [transactionLimit, setTransactionLimit] = useState("")
    const [feePercentage, setFeePercentage] = useState("")
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setPaymentProviderId("")
            setName("")
            setCountry("")
            setTransactionLimit("")
            setFeePercentage("")
            setIsActive(true)
            setError("")
            setLoading(false)
        }
    }, [isOpen])

    const handleSubmit = async () => {
        if (!paymentProviderId || !name || !country || !transactionLimit || !feePercentage) {
            setError("Please fill in all required fields.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const data = {
                payment_provider_id: parseInt(paymentProviderId),
                name,
                country,
                transaction_limit: parseFloat(transactionLimit),
                fee_percentage: parseFloat(feePercentage),
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Add Mobile Money Provider"
            description="Configure a new mobile money option."
            icon={<Smartphone size={20} />}
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
                        loadingText="Saving..."
                    >
                        Save Provider
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <ModalSelect
                    label="Linked Payment Provider"
                    placeholder="Select a provider (e.g. Flutterwave)"
                    value={paymentProviderId}
                    onChange={setPaymentProviderId} // ModalSelect onChange returns string value of option
                    options={providers.map(p => ({ label: p.label, value: p.value }))}
                    required
                    icon={<Box size={16} />}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Service Name"
                        icon={<Smartphone size={16} />}
                        placeholder="e.g. MTN MoMo"
                        value={name}
                        onChange={setName}
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
                    <ModalInput
                        label="Transaction Limit"
                        icon={<DollarSign size={16} />}
                        type="number"
                        placeholder="0.00"
                        value={transactionLimit}
                        onChange={setTransactionLimit}
                        required
                    />
                    <ModalInput
                        label="Fee Percentage"
                        icon={<Percent size={16} />}
                        type="number"
                        placeholder="e.g. 1.5"
                        value={feePercentage}
                        onChange={setFeePercentage}
                        required
                    />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-white/60" />
                        <span className="text-sm font-medium text-white">Enable Service</span>
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
