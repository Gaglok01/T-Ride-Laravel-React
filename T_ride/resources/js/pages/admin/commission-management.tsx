import { useState, useEffect } from "react"
import { AdminLayout } from "@/layouts/admin-layout"
import { 
    DollarSign, Percent, Car, Building, Package, TrendingUp, TrendingDown,
    Plus, Edit, Trash2, ToggleLeft, ToggleRight, Loader2, Calculator,
    PieChart, Clock, Users, Store
} from "lucide-react"
import { Button, IconButton } from "@/components/ui/button"
import { DeleteConfirmationModal } from "@/components/admin/DeleteConfirmationModal"
import { StatusConfirmationModal } from "@/components/admin/StatusConfirmationModal"
import { CommissionRuleModal } from "@/components/admin/CommissionRuleModal"
import { CommissionTierModal } from "@/components/admin/CommissionTierModal"
import { ProjectionsModal } from "@/components/admin/ProjectionsModal"
import commissionService, { 
    CommissionRule, CommissionTier, CommissionEarning, DashboardStats 
} from "@/services/commissionService"
import cityZoneService, { City } from "@/services/cityZoneService"
import { RevenueTrendChart } from "@/components/admin/RevenueTrendChart"

export default function CommissionManagementPage() {
    const [activeTab, setActiveTab] = useState("Overview")
    const [loading, setLoading] = useState(false)

    // Data states
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [rideRules, setRideRules] = useState<CommissionRule[]>([])
    const [deliveryRules, setDeliveryRules] = useState<CommissionRule[]>([])
    const [courierRules, setCourierRules] = useState<CommissionRule[]>([])
    const [vendorRules, setVendorRules] = useState<CommissionRule[]>([])
    const [driverTiers, setDriverTiers] = useState<CommissionTier[]>([])
    const [vendorTiers, setVendorTiers] = useState<CommissionTier[]>([])
    const [earnings, setEarnings] = useState<CommissionEarning[]>([])
    const [cities, setCities] = useState<City[]>([])

    // Delete Modal states
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<any>(null)
    const [deleteType, setDeleteType] = useState("")

    // Status Modal states
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false)
    const [itemToToggle, setItemToToggle] = useState<any>(null)

    // Rule Modal states
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState<CommissionRule | null>(null)
    const [currentRuleType, setCurrentRuleType] = useState<'ride' | 'delivery' | 'courier' | 'vendor'>('ride')

    // Tier Modal states
    const [isTierModalOpen, setIsTierModalOpen] = useState(false)
    const [editingTier, setEditingTier] = useState<CommissionTier | null>(null)
    const [currentTierType, setCurrentTierType] = useState<'driver' | 'vendor'>('driver')

    // Projections Modal state
    const [isProjectionsModalOpen, setIsProjectionsModalOpen] = useState(false)

    const tabs = [
        "Overview", "Ride Commissions", "Delivery Commissions", "Courier Commissions", 
        "Vendor Commissions", "Commission Tiers", "Earnings History"
    ]

    useEffect(() => {
        fetchData()
    }, [activeTab])

    // Fetch cities when modals are opened
    useEffect(() => {
        if (isRuleModalOpen && cities.length === 0) {
            cityZoneService.getCities().then(response => setCities(response.data))
        }
    }, [isRuleModalOpen])

    const fetchData = async () => {
        setLoading(true)
        try {
            switch (activeTab) {
                case "Overview":
                    const statsData = await commissionService.getDashboardStats()
                    const earningsDataOverview = await commissionService.getEarnings()
                    setStats(statsData)
                    setEarnings(earningsDataOverview)
                    break
                case "Ride Commissions":
                    const rides = await commissionService.getRules('ride')
                    setRideRules(rides)
                    break
                case "Delivery Commissions":
                    const delivery = await commissionService.getRules('delivery')
                    setDeliveryRules(delivery)
                    break
                case "Courier Commissions":
                    const courier = await commissionService.getRules('courier')
                    setCourierRules(courier)
                    break
                case "Vendor Commissions":
                    const vendor = await commissionService.getRules('vendor')
                    setVendorRules(vendor)
                    break
                case "Commission Tiers":
                    const dTiers = await commissionService.getTiers('driver')
                    const vTiers = await commissionService.getTiers('vendor')
                    setDriverTiers(dTiers)
                    setVendorTiers(vTiers)
                    break
                case "Earnings History":
                    const earningsData = await commissionService.getEarnings()
                    setEarnings(earningsData)
                    break
            }
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = (item: any, type: string) => {
        setItemToDelete(item)
        setDeleteType(type)
        setIsDeleteModalOpen(true)
    }

    const handleStatusToggle = (item: CommissionRule) => {
        setItemToToggle(item)
        setIsStatusModalOpen(true)
    }

    const confirmDelete = async () => {
        try {
            if (deleteType === 'rule') {
                await commissionService.deleteRule(itemToDelete.id)
                fetchData()
            } else if (deleteType === 'tier') {
                await commissionService.deleteTier(itemToDelete.id)
                fetchData()
            }
        } catch (error) {
            console.error("Error deleting:", error)
        }
        setIsDeleteModalOpen(false)
        setItemToDelete(null)
    }

    const confirmStatusToggle = async () => {
        try {
            const newStatus = itemToToggle.status === 'active' ? 'inactive' : 'active'
            await commissionService.updateRuleStatus(itemToToggle.id, newStatus)
            fetchData()
        } catch (error) {
            console.error("Error updating status:", error)
        }
        setIsStatusModalOpen(false)
        setItemToToggle(null)
    }

    // Rule Modal Handlers
    const openAddRuleModal = (type: 'ride' | 'delivery' | 'courier' | 'vendor') => {
        setCurrentRuleType(type)
        setEditingRule(null)
        setIsRuleModalOpen(true)
    }

    const openEditRuleModal = (rule: CommissionRule) => {
        setCurrentRuleType(rule.type)
        setEditingRule(rule)
        setIsRuleModalOpen(true)
    }

    const handleSaveRule = async (data: any) => {
        if (editingRule) {
            await commissionService.updateRule(editingRule.id, data)
        } else {
            await commissionService.createRule(data)
        }
        fetchData()
        setEditingRule(null)
    }

    // Tier Modal Handlers
    const openAddTierModal = (type: 'driver' | 'vendor') => {
        setCurrentTierType(type)
        setEditingTier(null)
        setIsTierModalOpen(true)
    }

    const openEditTierModal = (tier: CommissionTier) => {
        setCurrentTierType(tier.type)
        setEditingTier(tier)
        setIsTierModalOpen(true)
    }

    const handleSaveTier = async (data: any) => {
        if (editingTier) {
            await commissionService.updateTier(editingTier.id, data)
        } else {
            await commissionService.createTier(data)
        }
        fetchData()
        setEditingTier(null)
    }

    const formatCurrency = (value: number) => {
        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
        return `$${value.toFixed(2)}`
    }

    // Get the appropriate add action based on current tab
    const getHeaderAction = () => {
        switch (activeTab) {
            case "Ride Commissions":
                return (
                    <Button onClick={() => openAddRuleModal('ride')}>
                        <Plus size={18} />
                        Add Ride Rule
                    </Button>
                )
            case "Delivery Commissions":
                return (
                    <Button onClick={() => openAddRuleModal('delivery')}>
                        <Plus size={18} />
                        Add Delivery Rule
                    </Button>
                )
            case "Courier Commissions":
                return (
                    <Button onClick={() => openAddRuleModal('courier')}>
                        <Plus size={18} />
                        Add Courier Rule
                    </Button>
                )
            case "Vendor Commissions":
                return (
                    <Button onClick={() => openAddRuleModal('vendor')}>
                        <Plus size={18} />
                        Add Vendor Rule
                    </Button>
                )
            default:
                return (
                    <Button onClick={() => openAddRuleModal('ride')}>
                        <Plus size={18} />
                        Add Commission Rule
                    </Button>
                )
        }
    }

    return (
        <AdminLayout
            title="Commission Management"
            description="Configure platform fees and commission structures"
            actions={
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setIsProjectionsModalOpen(true)}>
                        <Calculator size={18} />
                        Calculate Projections
                    </Button>
                    {getHeaderAction()}
                </div>
            }
        >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatsCard 
                    label="Total Earned" 
                    value={formatCurrency(stats?.total_earned ?? 0)} 
                    trend={`${stats?.total_earned_trend !== undefined && stats.total_earned_trend >= 0 ? '+' : ''}${stats?.total_earned_trend ?? 0}%`} 
                    trendUp={(stats?.total_earned_trend ?? 0) >= 0} 
                    icon={<DollarSign size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Avg Commission" 
                    value={`${stats?.avg_commission ?? 0}%`} 
                    trend={`${stats?.avg_commission_trend !== undefined && stats.avg_commission_trend >= 0 ? '+' : ''}${stats?.avg_commission_trend ?? 0}%`} 
                    trendUp={(stats?.avg_commission_trend ?? 0) >= 0} 
                    icon={<Percent size={20} className="text-green-500" />} 
                    iconBg="bg-green-500/10"
                />
                <StatsCard 
                    label="Driver Commission" 
                    value={formatCurrency(stats?.driver_commission ?? 0)} 
                    trend={`${stats?.driver_commission_trend !== undefined && stats.driver_commission_trend >= 0 ? '+' : ''}${stats?.driver_commission_trend ?? 0}%`} 
                    trendUp={(stats?.driver_commission_trend ?? 0) >= 0} 
                    icon={<Car size={20} className="text-blue-400" />} 
                    iconBg="bg-blue-500/10"
                />
                <StatsCard 
                    label="Vendor Commission" 
                    value={formatCurrency(stats?.vendor_commission ?? 0)} 
                    trend={`${stats?.vendor_commission_trend !== undefined && stats.vendor_commission_trend >= 0 ? '+' : ''}${stats?.vendor_commission_trend ?? 0}%`} 
                    trendUp={(stats?.vendor_commission_trend ?? 0) >= 0} 
                    icon={<Building size={20} className="text-purple-500" />} 
                    iconBg="bg-purple-500/10"
                />
                <StatsCard 
                    label="Courier Commission" 
                    value={formatCurrency(stats?.courier_commission ?? 0)} 
                    trend={`${stats?.courier_commission_trend !== undefined && stats.courier_commission_trend >= 0 ? '+' : ''}${stats?.courier_commission_trend ?? 0}%`} 
                    trendUp={(stats?.courier_commission_trend ?? 0) >= 0} 
                    icon={<Package size={20} className="text-orange-500" />} 
                    iconBg="bg-orange-500/10"
                />
            </div>

            {/* Tabs */}


            {/* Main Content */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm min-h-[400px]">
                <div className="flex gap-1 p-4 border-b border-tride-border flex-wrap">
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "ghost"}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                ) : (
                    <>
                        {activeTab === "Overview" && <OverviewTab stats={stats} earnings={earnings} formatCurrency={formatCurrency} />}
                        {activeTab === "Ride Commissions" && <RulesTab rules={rideRules} title="Ride Commission Rules" subtitle="Configure commission rates for different ride types" onDelete={(item) => handleDelete(item, 'rule')} onStatusToggle={handleStatusToggle} onAdd={() => openAddRuleModal('ride')} onEdit={openEditRuleModal} />}
                        {activeTab === "Delivery Commissions" && <RulesTab rules={deliveryRules} title="Delivery Commission Rules" subtitle="Configure commission rates for delivery services" onDelete={(item) => handleDelete(item, 'rule')} onStatusToggle={handleStatusToggle} onAdd={() => openAddRuleModal('delivery')} onEdit={openEditRuleModal} />}
                        {activeTab === "Courier Commissions" && <RulesTab rules={courierRules} title="Courier Commission Rules" subtitle="Configure commission rates for courier services" onDelete={(item) => handleDelete(item, 'rule')} onStatusToggle={handleStatusToggle} onAdd={() => openAddRuleModal('courier')} onEdit={openEditRuleModal} />}
                        {activeTab === "Vendor Commissions" && <VendorRulesTab rules={vendorRules} onDelete={(item) => handleDelete(item, 'rule')} onStatusToggle={handleStatusToggle} onAdd={() => openAddRuleModal('vendor')} onEdit={openEditRuleModal} />}
                        {activeTab === "Commission Tiers" && <TiersTab driverTiers={driverTiers} vendorTiers={vendorTiers} onDelete={(item) => handleDelete(item, 'tier')} onAddDriverTier={() => openAddTierModal('driver')} onAddVendorTier={() => openAddTierModal('vendor')} onEdit={openEditTierModal} />}
                        {activeTab === "Earnings History" && <EarningsTab earnings={earnings} formatCurrency={formatCurrency} />}
                    </>
                )}
            </div>

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title={`Delete ${deleteType === 'rule' ? 'Commission Rule' : 'Commission Tier'}`}
                description={`Are you sure you want to delete this ${deleteType}?`}
                itemName={itemToDelete?.name}
            />

            <StatusConfirmationModal
                isOpen={isStatusModalOpen}
                onClose={() => setIsStatusModalOpen(false)}
                onConfirm={confirmStatusToggle}
                itemName={itemToToggle?.name}
                currentStatus={itemToToggle?.status?.toLowerCase()}
            />

            <CommissionRuleModal
                isOpen={isRuleModalOpen}
                onClose={() => { setIsRuleModalOpen(false); setEditingRule(null) }}
                onSave={handleSaveRule}
                initialData={editingRule}
                ruleType={currentRuleType}
                cities={cities}
            />

            <CommissionTierModal
                isOpen={isTierModalOpen}
                onClose={() => { setIsTierModalOpen(false); setEditingTier(null) }}
                onSave={handleSaveTier}
                initialData={editingTier}
                tierType={currentTierType}
            />

            <ProjectionsModal
                isOpen={isProjectionsModalOpen}
                onClose={() => setIsProjectionsModalOpen(false)}
            />
        </AdminLayout>
    )
}

// ==================== TAB COMPONENTS ====================

function OverviewTab({ stats, earnings, formatCurrency }: { stats: DashboardStats | null, earnings: CommissionEarning[], formatCurrency: (val: number) => string }) {
    const serviceStats = stats?.service_stats ?? {
        standard_rides: { rate: 0, volume: 0, earned: 0 },
        premium_rides: { rate: 0, volume: 0, earned: 0 },
        food_delivery: { rate: 0, volume: 0, earned: 0 },
        courier_services: { rate: 0, volume: 0, earned: 0 },
    }

    const revenueBreakdown = stats?.revenue_breakdown ?? {
        rides: 0,
        rides_percent: 0,
        delivery: 0,
        delivery_percent: 0,
        courier: 0,
        courier_percent: 0,
        total: 0,
    }

    return (
        <div className="p-6">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Commission Revenue Chart */}
                <div className="lg:col-span-2">
                    <RevenueTrendChart 
                        data={earnings}
                        title="Commission Revenue"
                        dataKey="commission_earned"
                        xAxisKey="period"
                        height={300}
                        color="#10b981" // Custom color like green for commission
                    />
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-tride-card border border-tride-border rounded-2xl p-6 shadow-sm">
                    <h3 className="font-semibold text-lg mb-4 text-tride-text">Revenue Breakdown</h3>
                    <div className="h-40 flex items-center justify-center text-tride-text-muted border-2 border-dashed border-tride-border rounded-xl mb-4 bg-tride-hover">
                        <PieChart size={48} />
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span className="text-sm text-tride-text-muted">Rides</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-tride-text">{formatCurrency(revenueBreakdown.rides)}</span>
                                <span className="text-tride-text-muted text-sm ml-2">{revenueBreakdown.rides_percent ?? 0}%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500" />
                                <span className="text-sm text-tride-text-muted">Delivery</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-tride-text">{formatCurrency(revenueBreakdown.delivery)}</span>
                                <span className="text-tride-text-muted text-sm ml-2">{revenueBreakdown.delivery_percent ?? 0}%</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-orange-500" />
                                <span className="text-sm text-tride-text-muted">Courier</span>
                            </div>
                            <div className="text-right">
                                <span className="font-bold text-tride-text">{formatCurrency(revenueBreakdown.courier)}</span>
                                <span className="text-tride-text-muted text-sm ml-2">{revenueBreakdown.courier_percent ?? 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ServiceCard 
                    title="Standard Rides" 
                    rate={serviceStats.standard_rides.rate}
                    volume={formatCurrency(serviceStats.standard_rides.volume)}
                    earned={formatCurrency(serviceStats.standard_rides.earned)}
                />
                <ServiceCard 
                    title="Premium Rides" 
                    rate={serviceStats.premium_rides.rate}
                    volume={formatCurrency(serviceStats.premium_rides.volume)}
                    earned={formatCurrency(serviceStats.premium_rides.earned)}
                />
                <ServiceCard 
                    title="Food Delivery" 
                    rate={serviceStats.food_delivery.rate}
                    volume={formatCurrency(serviceStats.food_delivery.volume)}
                    earned={formatCurrency(serviceStats.food_delivery.earned)}
                />
                <ServiceCard 
                    title="Courier Services" 
                    rate={serviceStats.courier_services.rate}
                    volume={formatCurrency(serviceStats.courier_services.volume)}
                    earned={formatCurrency(serviceStats.courier_services.earned)}
                />
            </div>
        </div>
    )
}

function ServiceCard({ title, rate, volume, earned }: { title: string, rate: number, volume: string, earned: string }) {
    return (
        <div className="bg-tride-card border border-tride-border rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold mb-4 text-tride-text">{title}</h4>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-tride-text-muted text-sm">Rate</span>
                    <span className="text-blue-500 font-bold">{rate}%</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-tride-text-muted text-sm">Volume</span>
                    <span className="font-medium text-tride-text">{volume}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-tride-text-muted text-sm">Earned</span>
                    <span className="text-green-500 font-bold">{earned}</span>
                </div>
            </div>
        </div>
    )
}

function RulesTab({ rules, title, subtitle, onDelete, onStatusToggle, onAdd, onEdit }: { rules: CommissionRule[], title: string, subtitle: string, onDelete: (item: CommissionRule) => void, onStatusToggle: (item: CommissionRule) => void, onAdd: () => void, onEdit: (item: CommissionRule) => void }) {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-tride-text">{title}</h2>
                    <p className="text-tride-text-muted text-sm">{subtitle}</p>
                </div>
                <Button onClick={onAdd}>
                    <Plus size={16} />
                    Add Rule
                </Button>
            </div>

            {rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/40">
                    <Percent size={48} className="mb-4 opacity-50" />
                    <p>No commission rules found. Add your first rule to get started.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-4 py-3 font-medium">Ride Type</th>
                                <th className="px-4 py-3 font-medium">Base Rate</th>
                                <th className="px-4 py-3 font-medium">Min Commission</th>
                                <th className="px-4 py-3 font-medium">Max Commission</th>
                                <th className="px-4 py-3 font-medium">Surge Multiplier</th>
                                <th className="px-4 py-3 font-medium">City</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-tride-hover transition-colors">
                                    <td className="px-4 py-4 font-medium text-tride-text">{rule.name}</td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">
                                            {rule.base_rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-tride-text-muted">${rule.min_commission ? Number(rule.min_commission).toFixed(2) : '0.00'}</td>
                                    <td className="px-4 py-4 text-tride-text-muted">${rule.max_commission ? Number(rule.max_commission).toFixed(2) : '∞'}</td>
                                    <td className="px-4 py-4 text-tride-text-muted">{rule.surge_multiplier || 'Same Rate'}</td>
                                    <td className="px-4 py-4 text-blue-500">{rule.city?.name || 'All Cities'}</td>
                                    <td className="px-4 py-4">
                                        <button 
                                            onClick={() => onStatusToggle(rule)}
                                            className="flex items-center gap-1"
                                        >
                                            {rule.status === 'active' ? (
                                                <ToggleRight size={24} className="text-blue-500" />
                                            ) : (
                                                <ToggleLeft size={24} className="text-white/30" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton tooltip="Edit" onClick={() => onEdit(rule)}>
                                                <Edit size={16} />
                                            </IconButton>
                                            <IconButton tooltip="Delete" variant="danger" onClick={() => onDelete(rule)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function VendorRulesTab({ rules, onDelete, onStatusToggle, onAdd, onEdit }: { rules: CommissionRule[], onDelete: (item: CommissionRule) => void, onStatusToggle: (item: CommissionRule) => void, onAdd: () => void, onEdit: (item: CommissionRule) => void }) {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Vendor Commission Rates</h2>
                    <p className="text-white/50 text-sm">Commission rates for restaurants and shops</p>
                </div>
                <Button onClick={onAdd}>
                    <Plus size={16} />
                    Add Vendor Rule
                </Button>
            </div>

            {rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/40">
                    <Store size={48} className="mb-4 opacity-50" />
                    <p>No vendor commission rules found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-4 py-3 font-medium">Vendor Category</th>
                                <th className="px-4 py-3 font-medium">Standard Rate</th>
                                <th className="px-4 py-3 font-medium">Featured Rate</th>
                                <th className="px-4 py-3 font-medium">New Vendor Rate</th>
                                <th className="px-4 py-3 font-medium">Promo Period</th>
                                <th className="px-4 py-3 font-medium">Vendors Count</th>
                                <th className="px-4 py-3 font-medium">Monthly Revenue</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {rules.map((rule) => (
                                <tr key={rule.id} className="hover:bg-tride-hover transition-colors">
                                    <td className="px-4 py-4 font-medium text-tride-text">{rule.name}</td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                            {rule.base_rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-tride-text-muted">{rule.attributes?.featured_rate || 30}%</td>
                                    <td className="px-4 py-4">
                                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-bold">
                                            {rule.attributes?.new_vendor_rate || 15}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-tride-text-muted">{rule.attributes?.promo_period || '30 days'}</td>
                                    <td className="px-4 py-4 text-tride-text-muted">{rule.attributes?.vendors_count || 0}</td>
                                    <td className="px-4 py-4 text-green-500">${((rule.attributes?.monthly_revenue || 0) / 1000).toFixed(0)}K</td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <IconButton tooltip="Edit" onClick={() => onEdit(rule)}>
                                                <Edit size={16} />
                                            </IconButton>
                                            <IconButton tooltip="Delete" variant="danger" onClick={() => onDelete(rule)}>
                                                <Trash2 size={16} />
                                            </IconButton>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function TiersTab({ driverTiers, vendorTiers, onDelete, onAddDriverTier, onAddVendorTier, onEdit }: { driverTiers: CommissionTier[], vendorTiers: CommissionTier[], onDelete: (item: CommissionTier) => void, onAddDriverTier: () => void, onAddVendorTier: () => void, onEdit: (item: CommissionTier) => void }) {
    return (
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Driver Commission Tiers */}
            <div className="bg-tride-card border border-tride-border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-tride-text">Driver Commission Tiers</h3>
                        <p className="text-tride-text-muted text-sm">Performance-based commission rates</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onAddDriverTier}>
                        <Plus size={14} />
                        Add
                    </Button>
                </div>
                
                <div className="space-y-3">
                    {driverTiers.length === 0 ? (
                        <div className="text-center text-white/40 py-8">
                            <Users size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No driver tiers found</p>
                        </div>
                    ) : (
                        driverTiers.map((tier) => (
                            <TierCard 
                                key={tier.id}
                                tier={tier}
                                name={tier.name}
                                range={`${tier.min_threshold}-${tier.max_threshold || '∞'} trips/month`}
                                rate={`${tier.rate}%`}
                                count={`${Math.floor(Math.random() * 2000) + 500} drivers`}
                                rateColor="text-blue-400 bg-blue-500/20"
                                onDelete={() => onDelete(tier)}
                                onEdit={() => onEdit(tier)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Vendor Loyalty Tiers */}
            <div className="bg-tride-card border border-tride-border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-tride-text">Vendor Loyalty Tiers</h3>
                        <p className="text-tride-text-muted text-sm">Volume-based commission discounts</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={onAddVendorTier}>
                        <Plus size={14} />
                        Add
                    </Button>
                </div>
                
                <div className="space-y-3">
                    {vendorTiers.length === 0 ? (
                        <div className="text-center text-white/40 py-8">
                            <Store size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No vendor tiers found</p>
                        </div>
                    ) : (
                        vendorTiers.map((tier) => (
                            <TierCard 
                                key={tier.id}
                                tier={tier}
                                name={tier.name}
                                range={`${tier.min_threshold}-${tier.max_threshold || '∞'} orders/month`}
                                rate={`${tier.rate > 0 ? '-' : ''}${Math.abs(tier.rate)}%`}
                                count={`${Math.floor(Math.random() * 400) + 50} vendors`}
                                rateColor={tier.rate < 0 ? "text-green-400 bg-green-500/20" : "text-white/50 bg-white/10"}
                                onDelete={() => onDelete(tier)}
                                onEdit={() => onEdit(tier)}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function TierCard({ tier, name, range, rate, count, rateColor, onDelete, onEdit }: { tier: CommissionTier, name: string, range: string, rate: string, count: string, rateColor: string, onDelete: () => void, onEdit: () => void }) {
    return (
        <div className="bg-tride-card border border-tride-border p-4 rounded-xl hover:bg-tride-hover transition-colors shadow-sm">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-semibold text-tride-text">{name}</div>
                    <div className="text-xs text-blue-500">{range}</div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${rateColor}`}>
                        {rate}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-white/50">{count}</div>
                <div className="flex items-center gap-1">
                    <IconButton tooltip="Edit" onClick={onEdit}>
                        <Edit size={12} />
                    </IconButton>
                    <IconButton tooltip="Delete" variant="danger" onClick={onDelete}>
                        <Trash2 size={12} />
                    </IconButton>
                </div>
            </div>
        </div>
    )
}

function EarningsTab({ earnings, formatCurrency }: { earnings: CommissionEarning[], formatCurrency: (val: number) => string }) {
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold">Earnings History</h2>
                    <p className="text-white/50 text-sm">Monthly commission earnings breakdown</p>
                </div>
            </div>

            {earnings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/40">
                    <Clock size={48} className="mb-4 opacity-50" />
                    <p>No earnings data found.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-4 py-3 font-medium">Period</th>
                                <th className="px-4 py-3 font-medium">Rides Revenue</th>
                                <th className="px-4 py-3 font-medium">Delivery Revenue</th>
                                <th className="px-4 py-3 font-medium">Courier Revenue</th>
                                <th className="px-4 py-3 font-medium">Total Revenue</th>
                                <th className="px-4 py-3 font-medium">Commission Earned</th>
                                <th className="px-4 py-3 font-medium">Avg Rate</th>
                                <th className="px-4 py-3 font-medium">Growth</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {earnings.map((earning) => (
                                <tr key={earning.id} className="hover:bg-tride-hover transition-colors">
                                    <td className="px-4 py-4 font-medium text-blue-500">{earning.period}</td>
                                    <td className="px-4 py-4 text-white/70">{formatCurrency(Number(earning.rides_revenue))}</td>
                                    <td className="px-4 py-4 text-white/70">{formatCurrency(Number(earning.delivery_revenue))}</td>
                                    <td className="px-4 py-4 text-white/70">{formatCurrency(Number(earning.courier_revenue))}</td>
                                    <td className="px-4 py-4 font-medium">{formatCurrency(Number(earning.total_revenue))}</td>
                                    <td className="px-4 py-4 text-green-400 font-bold">{formatCurrency(Number(earning.commission_earned))}</td>
                                    <td className="px-4 py-4 text-white/70">{earning.avg_rate}%</td>
                                    <td className="px-4 py-4">
                                        <span className={`flex items-center gap-1 ${Number(earning.growth_percentage) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {Number(earning.growth_percentage) >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                            {Number(earning.growth_percentage) >= 0 ? '+' : ''}{earning.growth_percentage}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

function StatsCard({ label, value, trend, trendUp, icon, iconBg }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg?: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start justify-between shadow-sm">
            <div>
                <p className="text-tride-text-muted text-sm font-medium mb-1">{label}</p>
                <div className="text-3xl font-bold text-tride-text mb-2">{value}</div>
                <div className={`text-sm font-medium ${trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                    <span className="text-lg">{trendUp ? '↗' : '↘'}</span> {trend}
                </div>
            </div>
            <div className={`w-12 h-12 ${iconBg || 'bg-tride-hover'} rounded-2xl flex items-center justify-center text-tride-text`}>
                {icon}
            </div>
        </div>
    )
}
