import { useState, useEffect } from "react"
import { Calculator, TrendingUp, Percent, Calendar, DollarSign, BarChart3 } from "lucide-react"
import { Modal, ModalButton, ModalError, ModalInput, ModalSelect } from "@/components/ui/modal"
import commissionService from "@/services/commissionService"

interface ProjectionsModalProps {
    isOpen: boolean
    onClose: () => void
}

interface ProjectionResult {
    current: { monthly_revenue: number; monthly_commission: number; base_rate: number }
    projected: { total_revenue: number; total_commission: number; new_rate: number }
    growth: { revenue_growth_percent: number; commission_growth_percent: number }
    monthly_breakdown: { month: number; projected_revenue: number; projected_commission: number }[]
}

export function ProjectionsModal({ isOpen, onClose }: ProjectionsModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [calculated, setCalculated] = useState(false)

    // Form States
    const [growthRate, setGrowthRate] = useState("10")
    const [months, setMonths] = useState("6")
    const [rateAdjustment, setRateAdjustment] = useState("0")

    // Result States
    const [result, setResult] = useState<ProjectionResult | null>(null)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setGrowthRate("10")
            setMonths("6")
            setRateAdjustment("0")
            setResult(null)
            setCalculated(false)
            setError("")
            setLoading(false)
        }
    }, [isOpen])

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
        if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
        return `$${value.toFixed(2)}`
    }

    const handleCalculate = async () => {
        const growth = parseFloat(growthRate)
        const monthCount = parseInt(months)
        const adjustment = parseFloat(rateAdjustment)

        if (isNaN(growth) || isNaN(monthCount) || isNaN(adjustment)) {
            setError("Please enter valid numbers for all fields.")
            return
        }

        if (monthCount < 1 || monthCount > 24) {
            setError("Months must be between 1 and 24.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const projectionResult = await commissionService.calculateProjections({
                growth_rate: growth,
                months: monthCount,
                rate_adjustment: adjustment
            })
            setResult(projectionResult)
            setCalculated(true)
        } catch (err: any) {
            console.error(err)
            if (err.response?.data?.message) {
                setError(err.response.data.message)
            } else {
                setError("Failed to calculate projections. Please try again.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Calculate Projections"
            description="Forecast future commission earnings based on growth scenarios"
            icon={<Calculator size={20} />}
            size="xl"
            footer={
                <>
                    <ModalButton variant="secondary" onClick={onClose} disabled={loading}>
                        Close
                    </ModalButton>
                    <ModalButton 
                        variant="primary" 
                        onClick={handleCalculate} 
                        isLoading={loading}
                        loadingText="Calculating..."
                    >
                        {loading ? "Calculating..." : "Calculate Projections"}
                    </ModalButton>
                </>
            }
        >
            <div className="space-y-6">
                <ModalError message={error} />

                {/* Input Parameters */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                        <BarChart3 size={16} />
                        Projection Parameters
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ModalInput
                            label="Expected Growth Rate (%)"
                            icon={<TrendingUp size={16} />}
                            type="number"
                            placeholder="e.g. 10"
                            value={growthRate}
                            onChange={setGrowthRate}
                            required
                        />
                        <ModalInput
                            label="Projection Period (Months)"
                            icon={<Calendar size={16} />}
                            type="number"
                            placeholder="e.g. 6"
                            value={months}
                            onChange={setMonths}
                            required
                        />
                        <ModalInput
                            label="Commission Rate Adjustment (%)"
                            icon={<Percent size={16} />}
                            type="number"
                            placeholder="e.g. 5 or -5"
                            value={rateAdjustment}
                            onChange={setRateAdjustment}
                        />
                    </div>
                </div>

                {/* Results Section */}
                {calculated && result && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Current vs Projected Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current Stats */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <h4 className="text-sm font-semibold text-white/50 mb-3">Current Monthly Stats</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Monthly Revenue</span>
                                        <span className="font-bold text-white">{formatCurrency(result.current.monthly_revenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Monthly Commission</span>
                                        <span className="font-bold text-white">{formatCurrency(result.current.monthly_commission)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Avg Commission Rate</span>
                                        <span className="font-bold text-blue-400">{result.current.base_rate}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Projected Stats */}
                            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-4">
                                <h4 className="text-sm font-semibold text-blue-400 mb-3">
                                    Projected ({months} Months Total)
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Total Revenue</span>
                                        <span className="font-bold text-white">{formatCurrency(result.projected.total_revenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">Total Commission</span>
                                        <span className="font-bold text-green-400">{formatCurrency(result.projected.total_commission)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/70">New Commission Rate</span>
                                        <span className="font-bold text-purple-400">{result.projected.new_rate}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Growth Indicators */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className={`p-4 rounded-xl border ${result.growth.revenue_growth_percent >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className="text-sm text-white/50 mb-1">Revenue Growth</div>
                                <div className={`text-2xl font-bold ${result.growth.revenue_growth_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.growth.revenue_growth_percent >= 0 ? '+' : ''}{result.growth.revenue_growth_percent}%
                                </div>
                            </div>
                            <div className={`p-4 rounded-xl border ${result.growth.commission_growth_percent >= 0 ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                                <div className="text-sm text-white/50 mb-1">Commission Growth</div>
                                <div className={`text-2xl font-bold ${result.growth.commission_growth_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {result.growth.commission_growth_percent >= 0 ? '+' : ''}{result.growth.commission_growth_percent}%
                                </div>
                            </div>
                        </div>

                        {/* Monthly Breakdown */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                            <h4 className="text-sm font-semibold text-white/70 mb-3">Monthly Breakdown</h4>
                            <div className="overflow-x-auto max-h-48">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/10 text-left text-white/50">
                                            <th className="py-2 px-3">Month</th>
                                            <th className="py-2 px-3">Projected Revenue</th>
                                            <th className="py-2 px-3">Projected Commission</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {result.monthly_breakdown.map((item) => (
                                            <tr key={item.month} className="hover:bg-white/5">
                                                <td className="py-2 px-3 text-white/70">Month {item.month}</td>
                                                <td className="py-2 px-3 text-white">{formatCurrency(item.projected_revenue)}</td>
                                                <td className="py-2 px-3 text-green-400">{formatCurrency(item.projected_commission)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {!calculated && (
                    <div className="flex flex-col items-center justify-center py-12 text-white/40">
                        <Calculator size={48} className="mb-4 opacity-50" />
                        <p className="text-center">Enter your projection parameters above and click<br/>"Calculate Projections" to see the forecast.</p>
                    </div>
                )}
            </div>
        </Modal>
    )
}
