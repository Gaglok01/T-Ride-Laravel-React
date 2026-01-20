import { useState, useEffect } from "react"
import { CreditCard, DollarSign, Activity, Settings, Plus, Globe, Lock, Key, Percent, Hash } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"

interface PaymentProviderModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (data: any) => Promise<void>
    initialData?: any
}

export function PaymentProviderModal({ isOpen, onClose, onSave, initialData }: PaymentProviderModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [name, setName] = useState("")
    const [type, setType] = useState("")
    const [apiKey, setApiKey] = useState("")
    const [secretKey, setSecretKey] = useState("")
    const [transactionFee, setTransactionFee] = useState("")
    const [transactionLimit, setTransactionLimit] = useState("")
    const [country, setCountry] = useState("")
    const [status, setStatus] = useState("active")
    const [isActive, setIsActive] = useState(true)

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name || "")
                setType(initialData.type || "")
                setApiKey(initialData.api_key || "")
                setSecretKey(initialData.secret_key || "")
                setTransactionFee(initialData.transaction_fee ? initialData.transaction_fee.toString() : "")
                setTransactionLimit(initialData.transaction_limit ? initialData.transaction_limit.toString() : "")
                setCountry(initialData.country || "")
                setStatus(initialData.status || "active")
                setIsActive(initialData.is_active ?? true)
            } else {
                setName("")
                setType("")
                setApiKey("")
                setSecretKey("")
                setTransactionFee("")
                setTransactionLimit("")
                setCountry("")
                setStatus("active")
                setIsActive(true)
            }
            setError("")
            setLoading(false)
        }
    }, [isOpen, initialData])

    const handleSubmit = async () => {
        if (!name || !type) {
            setError("Please fill in required fields (Name, Type).")
            return
        }

        setLoading(true)
        setError("")

        try {
            const providerData: any = {
                name,
                type,
                api_key: apiKey || null,
                secret_key: secretKey || null,
                country: country || null,
                transaction_fee: transactionFee ? parseFloat(transactionFee) : null,
                transaction_limit: transactionLimit ? parseFloat(transactionLimit) : null,
                status,
                is_active: isActive
            }

            await onSave(providerData)
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
            title={initialData ? "Edit Provider" : "Add Provider"}
            description={initialData ? "Update payment provider details." : "Add a new payment provider."}
            icon={initialData ? <Settings size={20} /> : <Plus size={20} />}
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
                        {loading ? (initialData ? "Updating..." : "Saving...") : (initialData ? "Update Provider" : "Save Provider")}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <ModalError message={error} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Provider Name"
                        icon={<CreditCard size={16} />}
                        placeholder="e.g. Stripe, PayPal"
                        value={name}
                        onChange={setName}
                        required
                    />
                    <ModalSelect
                        label="Type"
                        placeholder="Select Type"
                        value={type}
                        onChange={setType}
                        options={[
                            { label: "Card Processing", value: "card" },
                            { label: "Mobile Money", value: "mobile_money" },
                            { label: "Digital Wallet", value: "wallet" },
                            { label: "Bank Transfer", value: "bank_transfer" }
                        ]}
                        required
                        icon={<Settings size={16} />}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="API Key"
                        icon={<Key size={16} />}
                        placeholder="Public API Key"
                        value={apiKey}
                        onChange={setApiKey}
                    />
                    <ModalInput
                        label="Secret Key"
                        icon={<Lock size={16} />}
                        placeholder="Secret API Key"
                        type="password"
                        value={secretKey}
                        onChange={setSecretKey}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Transaction Fee (%)"
                        icon={<Percent size={16} />}
                        placeholder="e.g. 2.9"
                        type="number"
                        value={transactionFee}
                        onChange={setTransactionFee}
                    />
                    <ModalInput
                        label="Transaction Limit ($)"
                        icon={<DollarSign size={16} />}
                        placeholder="e.g. 10000"
                        type="number"
                        value={transactionLimit}
                        onChange={setTransactionLimit}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ModalInput
                        label="Country (Optional)"
                        icon={<Globe size={16} />}
                        placeholder="e.g. Global, Ghana, Kenya"
                        value={country}
                        onChange={setCountry}
                    />
                    <ModalSelect
                        label="Status"
                        placeholder="Select Status"
                        value={status}
                        onChange={setStatus}
                        options={[
                            { label: "Active", value: "active" },
                            { label: "Inactive", value: "inactive" },
                            { label: "Maintenance", value: "maintenance" }
                        ]}
                        required
                        icon={<Activity size={16} />}
                    />
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                        <Activity size={16} className="text-white/60" />
                        <span className="text-sm font-medium text-white">Enable Provider</span>
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
