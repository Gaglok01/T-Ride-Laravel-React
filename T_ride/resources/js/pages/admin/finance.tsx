import { useState, useEffect, useCallback } from 'react';
import { Head } from '@inertiajs/react';
import { AdminLayout } from '@/layouts/admin-layout';
import { 
    DollarSign, TrendingUp,
    Activity, ArrowUpRight, ArrowDownRight, RefreshCcw,
    Download, Calendar, AlertCircle, Wallet, CreditCard, ChevronDown, Check,
    Car, Package, ShoppingBag, Filter, Search, User, Briefcase,
    X, PieChart, BarChart3, Receipt, Loader2
} from 'lucide-react';
import { RevenueTrendChart } from '@/components/admin/RevenueTrendChart';
import { Button } from '@/components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuTrigger, 
    DropdownMenuContent, 
    DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ModalSelect } from "@/components/ui/modal";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axios from 'axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
    ResponsiveContainer, PieChart as RePieChart, Pie, Cell 
} from 'recharts';

// --- Interfaces ---

interface FinanceStats {
    total_revenue: number;
    net_profit: number;
    gross_margin: number;
    pending_payouts: number;
    processed_today: number;
    failed_transactions: number;
    trends: {
        revenue: string;
        profit: string;
        margin: string;
        payouts: string;
        processed: string;
        failed: string;
    }
}

interface ServiceRevenue {
    ride_revenue: number;
    courier_revenue: number;
    delivery_revenue: number;
    rental_revenue: number;
    ride_trips: number;
    courier_deliveries: number;
    delivery_orders: number;
    rental_active: number;
    trends: {
        ride_revenue: string;
        courier_revenue: string;
        delivery_revenue: string;
        rental_revenue: string;
    }
}

interface Transaction {
    id: string;
    type: string;
    user: { name: string; avatar?: string };
    order_id: string;
    amount: number;
    fee: number;
    net: number;
    method: string;
    status: string;
    date: string;
}

interface DriverPayout {
    id: string;
    driver: { name: string; id: string; avatar?: string };
    earnings: number;
    commission: number;
    deductions: number;
    net_payout: number;
    period: string;
    status: string;
}

interface VendorSettlement {
    id: string;
    vendor: { name: string; avatar?: string };
    total_sales: number;
    commission: number;
    commission_rate: string;
    refunds: number;
    net_settlement: number;
    period: string;
    status: string;
}

interface WalletStats {
    total_balance: number;
    active_wallets: number;
    todays_topups: number;
    todays_withdrawals: number;
    trends: {
        balance: string;
        active: string;
        topups: string;
        withdrawals: string;
    }
}

interface WalletTransaction {
    id: string;
    user: { name: string; avatar?: string };
    transaction: string;
    amount: number;
    balance_after: number;
    method: string;
    reference: string;
    date: string;
}

interface QuickStat {
    label: string;
    value: string;
    change: string;
    isPositive: boolean;
}

interface PaymentMethod {
    name: string;
    value: number;
    color: string;
}

interface PendingAction {
    label: string;
    count: number;
    color: string;
}

interface RevenueDistItem {
    name: string;
    value: number;
    amount: number;
    color: string;
}

// --- API Helper ---
const api = axios.create({
    baseURL: '/api/admin/finance',
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Accept': 'application/json',
    }
});

// --- Main Component ---

export default function FinanceDashboard() {
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [serviceRevenue, setServiceRevenue] = useState<ServiceRevenue | null>(null);
    const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [driverPayouts, setDriverPayouts] = useState<DriverPayout[]>([]);
    const [vendorSettlements, setVendorSettlements] = useState<VendorSettlement[]>([]);
    const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [revenueDistribution, setRevenueDistribution] = useState<RevenueDistItem[]>([]);
    const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
    const [activeTab, setActiveTab] = useState('Overview');
    const [dateRange, setDateRange] = useState('this_month');
    const [loading, setLoading] = useState(true);
    
    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [tempFilters, setTempFilters] = useState({ status: "all" });

    // Pagination states
    const [txPage, setTxPage] = useState(1);
    const [txLastPage, setTxLastPage] = useState(1);
    const [txTotal, setTxTotal] = useState(0);
    const [payoutPage, setPayoutPage] = useState(1);
    const [payoutLastPage, setPayoutLastPage] = useState(1);
    const [settlementPage, setSettlementPage] = useState(1);
    const [settlementLastPage, setSettlementLastPage] = useState(1);
    const [walletTxPage, setWalletTxPage] = useState(1);
    const [walletTxLastPage, setWalletTxLastPage] = useState(1);

    // Date range labels
    const dateRangeLabels: Record<string, string> = {
        'today': 'Today',
        'yesterday': 'Yesterday',
        'this_week': 'This Week',
        'this_month': 'This Month',
        'last_month': 'Last Month',
        'this_year': 'This Year',
    };

    // Fetch top-level stats
    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get('/stats', { params: { range: dateRange } });
            setStats(res.data);
        } catch (e) {
            console.error('Error fetching stats:', e);
        }
    }, [dateRange]);

    // Fetch service revenue
    const fetchServiceRevenue = useCallback(async () => {
        try {
            const res = await api.get('/service-revenue', { params: { range: dateRange } });
            setServiceRevenue(res.data);
        } catch (e) {
            console.error('Error fetching service revenue:', e);
        }
    }, [dateRange]);

    // Fetch overview data (trend, distribution, quick stats, payment methods, pending actions)
    const fetchOverviewData = useCallback(async () => {
        try {
            const [trendRes, distRes, quickRes, methodRes, pendingRes] = await Promise.all([
                api.get('/revenue-trend', { params: { range: dateRange } }),
                api.get('/revenue-distribution', { params: { range: dateRange } }),
                api.get('/quick-stats', { params: { range: dateRange } }),
                api.get('/payment-methods', { params: { range: dateRange } }),
                api.get('/pending-actions'),
            ]);
            setTrendData(trendRes.data);
            setRevenueDistribution(distRes.data);
            setQuickStats(quickRes.data);
            setPaymentMethods(methodRes.data);
            setPendingActions(pendingRes.data);
        } catch (e) {
            console.error('Error fetching overview data:', e);
        }
    }, [dateRange]);

    // Fetch transactions
    const fetchTransactions = useCallback(async () => {
        try {
            const res = await api.get('/transactions', {
                params: {
                    search: searchQuery || undefined,
                    status: statusFilter !== 'all' ? statusFilter : undefined,
                    page: txPage,
                    per_page: 15,
                }
            });
            setTransactions(res.data.data);
            setTxLastPage(res.data.last_page);
            setTxTotal(res.data.total);
        } catch (e) {
            console.error('Error fetching transactions:', e);
        }
    }, [searchQuery, statusFilter, txPage]);

    // Fetch driver payouts
    const fetchDriverPayouts = useCallback(async () => {
        try {
            const res = await api.get('/driver-payouts', {
                params: { page: payoutPage, per_page: 15 }
            });
            setDriverPayouts(res.data.data);
            setPayoutLastPage(res.data.last_page);
        } catch (e) {
            console.error('Error fetching driver payouts:', e);
        }
    }, [payoutPage]);

    // Fetch vendor settlements
    const fetchVendorSettlements = useCallback(async () => {
        try {
            const res = await api.get('/vendor-settlements', {
                params: { page: settlementPage, per_page: 15 }
            });
            setVendorSettlements(res.data.data);
            setSettlementLastPage(res.data.last_page);
        } catch (e) {
            console.error('Error fetching vendor settlements:', e);
        }
    }, [settlementPage]);

    // Fetch wallet stats
    const fetchWalletStats = useCallback(async () => {
        try {
            const res = await api.get('/wallet-stats');
            setWalletStats(res.data);
        } catch (e) {
            console.error('Error fetching wallet stats:', e);
        }
    }, []);

    // Fetch wallet transactions
    const fetchWalletTransactions = useCallback(async () => {
        try {
            const res = await api.get('/wallet-transactions', {
                params: { page: walletTxPage, per_page: 15 }
            });
            setWalletTransactions(res.data.data);
            setWalletTxLastPage(res.data.last_page);
        } catch (e) {
            console.error('Error fetching wallet transactions:', e);
        }
    }, [walletTxPage]);

    // Initial load + date range change
    useEffect(() => {
        setLoading(true);
        Promise.all([fetchStats(), fetchServiceRevenue()]).finally(() => setLoading(false));
    }, [fetchStats, fetchServiceRevenue]);

    // Tab-based data fetching
    useEffect(() => {
        if (activeTab === 'Overview') {
            fetchOverviewData();
        } else if (activeTab === 'Transactions') {
            fetchTransactions();
        } else if (activeTab === 'Driver Payouts') {
            fetchDriverPayouts();
        } else if (activeTab === 'Vendor Settlements') {
            fetchVendorSettlements();
        } else if (activeTab === 'User Wallets') {
            fetchWalletStats();
            fetchWalletTransactions();
        }
    }, [activeTab, fetchOverviewData, fetchTransactions, fetchDriverPayouts, fetchVendorSettlements, fetchWalletStats, fetchWalletTransactions]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    // Debounced search for transactions
    useEffect(() => {
        if (activeTab !== 'Transactions') return;
        const timeout = setTimeout(() => {
            setTxPage(1);
            fetchTransactions();
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchQuery, statusFilter]);

    return (
        <AdminLayout
            title="Finance Dashboard"
            description="Revenue, payouts, and financial analytics"
            actions={
                <div className="flex gap-2">
                    <DropdownMenu>
                         <DropdownMenuTrigger asChild>
                            <Button variant="secondary">
                                <span className="mr-2">{dateRangeLabels[dateRange] || 'This Month'}</span>
                                <ChevronDown size={14} />
                            </Button>
                         </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-tride-card border-tride-border text-tride-text">
                            {Object.entries(dateRangeLabels).map(([key, label]) => (
                                <DropdownMenuItem 
                                    key={key} 
                                    className="hover:bg-tride-hover focus:bg-tride-hover cursor-pointer"
                                    onClick={() => setDateRange(key)}
                                >
                                    {dateRange === key && <Check size={14} className="mr-2" />}
                                    {label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="secondary">
                        <Calendar size={18} />
                        Custom Range
                    </Button>
                    <Button variant="secondary">
                        <Download size={18} />
                        Export Reports
                    </Button>
                </div>
            }
        >
            <Head title="Finance Dashboard" />
            
            {/* Top Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                <StatsCard 
                    label="Total Revenue" 
                    value={stats ? formatCurrency(stats.total_revenue) : "$0"} 
                    trend={stats?.trends.revenue || "+0%"} 
                    trendUp={true}
                    icon={<DollarSign size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                    loading={loading}
                />
                <StatsCard 
                    label="Net Profit" 
                    value={stats ? formatCurrency(stats.net_profit) : "$0"} 
                    trend={stats?.trends.profit || "+0%"} 
                    trendUp={true}
                    icon={<TrendingUp size={20} className="text-emerald-500" />} 
                    iconBg="bg-emerald-500/10"
                    loading={loading}
                />
                <StatsCard 
                    label="Gross Margin" 
                    value={stats ? `${stats.gross_margin}%` : "0%"} 
                    trend={stats?.trends.margin || "+0%"} 
                    trendUp={true}
                    icon={<Activity size={20} className="text-purple-500" />} 
                    iconBg="bg-purple-500/10"
                    loading={loading}
                />
                <StatsCard 
                    label="Pending Payouts" 
                    value={stats ? formatCurrency(stats.pending_payouts) : "$0"} 
                    trend={stats?.trends.payouts || "+0%"} 
                    trendUp={false}
                    icon={<RefreshCcw size={20} className="text-orange-500" />} 
                    iconBg="bg-orange-500/10"
                    loading={loading}
                />
                <StatsCard 
                    label="Processed Today" 
                    value={stats ? formatCurrency(stats.processed_today) : "$0"} 
                    trend={stats?.trends.processed || "+0%"} 
                    trendUp={true}
                    icon={<Check size={20} className="text-blue-500" />} 
                    iconBg="bg-blue-500/10"
                    loading={loading}
                />
                <StatsCard 
                    label="Failed Transactions" 
                    value={stats?.failed_transactions.toString() || "0"} 
                    trend={stats?.trends.failed || "0"} 
                    trendUp={false}
                    icon={<AlertCircle size={20} className="text-red-500" />} 
                    iconBg="bg-red-500/10"
                    loading={loading}
                />
            </div>

            {/* Service Revenue Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <ServiceStatsCard 
                    label="Ride Revenue"
                    value={serviceRevenue?.ride_revenue || 0}
                    subtext={`${serviceRevenue?.ride_trips?.toLocaleString() || 0} trips`}
                    trend={serviceRevenue?.trends.ride_revenue || '+0%'}
                    icon={<Car size={20} className="text-blue-500" />}
                    iconBg="bg-blue-500/10"
                    loading={loading}
                />
                <ServiceStatsCard 
                    label="Courier Revenue"
                    value={serviceRevenue?.courier_revenue || 0}
                    subtext={`${serviceRevenue?.courier_deliveries?.toLocaleString() || 0} deliveries`}
                    trend={serviceRevenue?.trends.courier_revenue || '+0%'}
                    icon={<Package size={20} className="text-emerald-500" />}
                    iconBg="bg-emerald-500/10"
                    loading={loading}
                />
                <ServiceStatsCard 
                    label="Delivery Revenue"
                    value={serviceRevenue?.delivery_revenue || 0}
                    subtext={`${serviceRevenue?.delivery_orders?.toLocaleString() || 0} orders`}
                    trend={serviceRevenue?.trends.delivery_revenue || '+0%'}
                    icon={<ShoppingBag size={20} className="text-orange-500" />}
                    iconBg="bg-orange-500/10"
                    loading={loading}
                />
                <ServiceStatsCard 
                    label="Rental Revenue"
                    value={serviceRevenue?.rental_revenue || 0}
                    subtext={`${serviceRevenue?.rental_active?.toLocaleString() || 0} active rentals`}
                    trend={serviceRevenue?.trends.rental_revenue || '+0%'}
                    icon={<CreditCard size={20} className="text-purple-500" />}
                    iconBg="bg-purple-500/10"
                    loading={loading}
                />
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-1 mb-6 bg-tride-card p-1 rounded-2xl w-fit border border-tride-border overflow-x-auto max-w-full">
                {["Overview", "Transactions", "Driver Payouts", "Vendor Settlements", "User Wallets", "Financial Reports", "Tax & Compliance"].map((tab) => (
                    <Button
                        key={tab}
                        variant={activeTab === tab ? "default" : "ghost"}
                        onClick={() => setActiveTab(tab)}
                        className="rounded-xl whitespace-nowrap"
                    >
                        {tab}
                    </Button>
                ))}
            </div>

            {/* Content Area */}
            <div className="space-y-6 animate-in fade-in duration-300">
                {activeTab === "Overview" && (<div className="space-y-6">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Revenue Trend Chart */}
                        <div className="lg:col-span-2">
                             <RevenueTrendChart 
                                data={trendData} 
                                title="Revenue Trend"
                                height={300}
                            />
                        </div>

                         {/* Revenue Distribution Chart */}
                        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex flex-col items-center">
                            <h3 className="text-lg font-semibold mb-6 text-tride-text w-full text-left">Revenue Distribution</h3>
                             <div className="h-48 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                     <RePieChart>
                                         <Pie 
                                            data={revenueDistribution} 
                                            innerRadius={55} 
                                            outerRadius={75} 
                                            paddingAngle={5} 
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {revenueDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                     </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <PieChart size={24} className="text-tride-text-muted mx-auto mb-1 opacity-50" />
                                    <span className="text-[10px] text-tride-text-muted block">By service type</span>
                                </div>
                             </div>
                             <div className="flex flex-wrap gap-4 justify-center mt-4 w-full">
                                 {revenueDistribution.map((item) => (
                                     <div key={item.name} className="flex items-center gap-2">
                                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                         <span className="text-xs text-tride-text-muted">{item.name}</span>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    </div>

                    {/* Bottom Cards Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                         {/* Quick Stats */}
                         <div className="bg-tride-card border border-tride-border p-6 rounded-3xl">
                            <h3 className="text-lg font-semibold mb-6 text-tride-text">Quick Stats</h3>
                            <div className="space-y-5">
                                {quickStats.length > 0 ? quickStats.map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <span className="text-sm text-tride-text-muted group-hover:text-tride-text  transition-colors">{stat.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-tride-text">{stat.value}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${stat.isPositive ? 'bg-tride-border text-tride-text' : 'bg-red-500/10 text-red-500'}`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-tride-text-muted text-sm">No data available</div>
                                )}
                            </div>
                         </div>

                         {/* Payment Methods */}
                         <div className="bg-tride-card border border-tride-border p-6 rounded-3xl">
                            <h3 className="text-lg font-semibold mb-6 text-tride-text">Payment Methods</h3>
                            <div className="space-y-5">
                                 {paymentMethods.length > 0 ? paymentMethods.map((method, i) => {
                                     const maxValue = Math.max(...paymentMethods.map(m => m.value), 1);
                                     return (
                                     <div key={i}>
                                         <div className="flex justify-between text-sm mb-2">
                                             <span className="text-tride-text-muted">{method.name}</span>
                                             <span className="font-bold text-tride-text">{formatCurrency(method.value)}</span>
                                         </div>
                                         <div className="h-1.5 bg-tride-hover rounded-full overflow-hidden">
                                             <div className={`h-full ${method.color} rounded-full`} style={{ width: `${(method.value / maxValue) * 100}%` }}></div>
                                         </div>
                                     </div>
                                     );
                                 }) : (
                                    <div className="text-center py-8 text-tride-text-muted text-sm">No data available</div>
                                 )}
                            </div>
                         </div>

                         {/* Pending Actions */}
                         <div className="bg-tride-card border border-tride-border p-6 rounded-3xl">
                            <h3 className="text-lg font-semibold mb-6 text-tride-text">Pending Actions</h3>
                            <div className="space-y-3">
                                {pendingActions.length > 0 ? pendingActions.map((action, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 border border-tride-border rounded-xl hover:bg-tride-hover/30 transition-colors cursor-pointer group">
                                        <span className="text-sm text-tride-text-muted group-hover:text-tride-text transition-colors">{action.label}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md min-w-[24px] text-center ${
                                            action.label === 'Pending payouts' || action.label === 'Failed transactions' 
                                            ? 'bg-red-600 text-white' 
                                            : action.label === 'Refund requests' 
                                                ? 'bg-tride-hover text-tride-text border border-tride-border'
                                                : 'bg-tride-hover text-tride-text-muted'
                                            }`}>
                                            {action.count}
                                        </span>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-tride-text-muted text-sm">No pending actions</div>
                                )}
                            </div>
                         </div>
                    </div>
                </div>)}

                {activeTab === "Vendor Settlements" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <h3 className="text-lg font-semibold text-tride-text">Vendor Settlements</h3>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <RefreshCcw size={16} /> Process Settlements
                            </Button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-tride-text-muted border-b border-tride-border bg-tride-hover/50">
                                        <th className="px-4 py-3 text-left">Vendor</th>
                                        <th className="px-4 py-3 text-left">Total Sales</th>
                                        <th className="px-4 py-3 text-left">Commission</th>
                                        <th className="px-4 py-3 text-left">Refunds</th>
                                        <th className="px-4 py-3 text-left">Net Settlement</th>
                                        <th className="px-4 py-3 text-left">Period</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vendorSettlements.length > 0 ? vendorSettlements.map((item) => (
                                        <tr key={item.id} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors">
                                            <td className="px-4 py-4 font-medium text-tride-text">{item.vendor.name}</td>
                                            <td className="px-4 py-4 text-tride-text">{formatCurrency(item.total_sales)}</td>
                                            <td className="px-4 py-4 text-tride-text-muted">{formatCurrency(item.commission)} ({item.commission_rate})</td>
                                            <td className="px-4 py-4 text-tride-text-muted">{formatCurrency(item.refunds)}</td>
                                            <td className="px-4 py-4 font-bold text-green-500">{formatCurrency(item.net_settlement)}</td>
                                            <td className="px-4 py-4 text-tride-text-muted">{item.period}</td>
                                            <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                                            <td className="px-4 py-4 text-right">
                                                <button className="text-sm font-medium text-tride-text hover:underline">View Details</button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-tride-text-muted">No vendor settlements found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {settlementLastPage > 1 && (
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-tride-border">
                                <span className="text-sm text-tride-text-muted">Page {settlementPage} of {settlementLastPage}</span>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" disabled={settlementPage <= 1} onClick={() => setSettlementPage(p => p - 1)}>Previous</Button>
                                    <Button variant="secondary" size="sm" disabled={settlementPage >= settlementLastPage} onClick={() => setSettlementPage(p => p + 1)}>Next</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "User Wallets" && (
                    <div className="space-y-6">
                         {/* Wallet Stats */}
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatsCard 
                                label="Total Wallet Balance" 
                                value={walletStats ? formatCurrency(walletStats.total_balance) : "$0"} 
                                trend={walletStats?.trends.balance || "+0%"} 
                                trendUp={true}
                                icon={<Wallet size={20} className="text-blue-500" />} 
                                iconBg="bg-blue-500/10"
                            />
                            <StatsCard 
                                label="Active Wallets" 
                                value={walletStats?.active_wallets.toLocaleString() || "0"} 
                                trend={walletStats?.trends.active || "+0"} 
                                trendUp={true}
                                icon={<User size={20} className="text-blue-500" />} 
                                iconBg="bg-blue-500/10"
                            />
                            <StatsCard 
                                label="Today's Top-ups" 
                                value={walletStats ? formatCurrency(walletStats.todays_topups) : "$0"} 
                                trend={walletStats?.trends.topups || "+0%"} 
                                trendUp={true}
                                icon={<ArrowUpRight size={20} className="text-blue-500" />} 
                                iconBg="bg-blue-500/10"
                            />
                            <StatsCard 
                                label="Today's Withdrawals" 
                                value={walletStats ? formatCurrency(walletStats.todays_withdrawals) : "$0"} 
                                trend={walletStats?.trends.withdrawals || "+0%"} 
                                trendUp={false}
                                icon={<ArrowDownRight size={20} className="text-blue-500" />} 
                                iconBg="bg-blue-500/10"
                            />
                        </div>

                        {/* Wallet Transactions */}
                        <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                            <h3 className="text-lg font-semibold text-tride-text mb-6">User Wallet Transactions</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-tride-text-muted border-b border-tride-border bg-tride-hover/50">
                                            <th className="px-4 py-3 text-left">User</th>
                                            <th className="px-4 py-3 text-left">Transaction</th>
                                            <th className="px-4 py-3 text-left">Amount</th>
                                            <th className="px-4 py-3 text-left">Balance After</th>
                                            <th className="px-4 py-3 text-left">Method</th>
                                            <th className="px-4 py-3 text-left">Reference</th>
                                            <th className="px-4 py-3 text-left">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {walletTransactions.length > 0 ? walletTransactions.map((tx) => (
                                            <tr key={tx.id} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors">
                                                <td className="px-4 py-4 font-medium text-tride-text">{tx.user.name}</td>
                                                <td className="px-4 py-4">
                                                    <span className="bg-tride-hover px-2 py-1 rounded text-xs border border-tride-border">{tx.transaction}</span>
                                                </td>
                                                <td className={`px-4 py-4 font-bold ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-4 text-tride-text">${tx.balance_after.toFixed(2)}</td>
                                                <td className="px-4 py-4 text-tride-text-muted">{tx.method}</td>
                                                <td className="px-4 py-4 text-tride-text-muted font-mono text-xs">{tx.reference}</td>
                                                <td className="px-4 py-4 text-tride-text-muted">{tx.date}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={7} className="px-4 py-12 text-center text-tride-text-muted">No wallet transactions found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {/* Pagination */}
                            {walletTxLastPage > 1 && (
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-tride-border">
                                    <span className="text-sm text-tride-text-muted">Page {walletTxPage} of {walletTxLastPage}</span>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" size="sm" disabled={walletTxPage <= 1} onClick={() => setWalletTxPage(p => p - 1)}>Previous</Button>
                                        <Button variant="secondary" size="sm" disabled={walletTxPage >= walletTxLastPage} onClick={() => setWalletTxPage(p => p + 1)}>Next</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === "Financial Reports" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ReportCard 
                            title="Daily Revenue Report" 
                            description="Revenue breakdown by service type"
                            icon={<BarChart3 size={24} className="text-blue-500" />}
                            color="bg-blue-500/10"
                        />
                         <ReportCard 
                            title="Weekly Payout Summary" 
                            description="Driver and vendor payouts"
                            icon={<Briefcase size={24} className="text-blue-500" />}
                            color="bg-blue-500/10"
                        />
                         <ReportCard 
                            title="Monthly P&L Statement" 
                            description="Profit and loss analysis"
                            icon={<DollarSign size={24} className="text-blue-500" />}
                            color="bg-blue-500/10"
                        />
                         <ReportCard 
                            title="Transaction Report" 
                            description="All transactions with details"
                            icon={<CreditCard size={24} className="text-blue-500" />}
                            color="bg-blue-500/10"
                        />
                         <ReportCard 
                            title="Commission Report" 
                            description="Commission earnings by category"
                            icon={<PieChart size={24} className="text-blue-500" />}
                            color="bg-blue-500/10"
                        />
                         <ReportCard 
                            title="Tax Summary" 
                            description="Tax collected and payable"
                            icon={<Receipt size={24} className="text-blue-500" />}
                            color="bg-blue-500/10"
                        />
                    </div>
                )}

                {activeTab === "Transactions" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-tride-text">All Transactions</h3>
                                <p className="text-sm text-tride-text-muted mt-1">{txTotal} total transactions</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-tride-text-muted" />
                                    <Input 
                                        placeholder="Search transactions..." 
                                        className="pl-9 w-48 md:w-64" 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="relative">
                                    <Button 
                                        variant={showFilters ? "default" : "secondary"}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <Filter size={16} /> Filter
                                    </Button>
                                    {showFilters && (
                                        <div className="absolute right-0 mt-3 w-72 bg-tride-card border border-tride-border rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between border-b border-tride-border pb-3">
                                                    <h3 className="font-semibold text-tride-text">Filter Transactions</h3>
                                                    <button onClick={() => setShowFilters(false)} className="text-tride-text-muted hover:text-tride-text transition-colors"><X size={18} /></button>
                                                </div>
                                                <div className="space-y-4">
                                                    <ModalSelect
                                                        label="Status"
                                                        value={tempFilters.status}
                                                        onChange={(val) => setTempFilters({...tempFilters, status: val})}
                                                        options={[
                                                            { label: "All Statuses", value: "all" },
                                                            { label: "Completed", value: "completed" },
                                                            { label: "Pending", value: "pending" },
                                                            { label: "Failed", value: "failed" }
                                                        ]}
                                                    />
                                                </div>
                                                <div className="pt-4 grid grid-cols-2 gap-3">
                                                    <Button onClick={() => { setStatusFilter("all"); setTempFilters({ status: "all" }); setShowFilters(false) }} variant="secondary" className="w-full justify-center">
                                                        <X size={16} /> Clear
                                                    </Button>
                                                    <Button onClick={() => { setStatusFilter(tempFilters.status); setShowFilters(false) }} variant="default" className="w-full justify-center">
                                                        <Check size={16} /> Apply
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-tride-text-muted border-b border-tride-border bg-tride-hover/50">
                                        <th className="px-4 py-3 text-left">Transaction ID</th>
                                        <th className="px-4 py-3 text-left">Type</th>
                                        <th className="px-4 py-3 text-left">User</th>
                                        <th className="px-4 py-3 text-left">Amount</th>
                                        <th className="px-4 py-3 text-left">Fee</th>
                                        <th className="px-4 py-3 text-left">Net</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.length > 0 ? transactions.map((tx) => (
                                        <tr key={tx.id} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors">
                                            <td className="px-4 py-4 font-mono text-tride-text-muted">{tx.id}</td>
                                            <td className="px-4 py-4"><span className="bg-tride-hover px-2 py-1 rounded text-xs font-mono">{tx.type}</span></td>
                                            <td className="px-4 py-4 font-medium text-tride-text">{tx.user.name}</td>
                                            <td className="px-4 py-4 font-bold text-tride-text">{formatCurrency(tx.amount)}</td>
                                            <td className="px-4 py-4 text-tride-text-muted">{formatCurrency(tx.fee)}</td>
                                            <td className="px-4 py-4 font-bold text-emerald-500">{formatCurrency(tx.net)}</td>
                                            <td className="px-4 py-4"><StatusBadge status={tx.status} /></td>
                                            <td className="px-4 py-4 text-right text-tride-text-muted">{tx.date}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-tride-text-muted">No transactions found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {txLastPage > 1 && (
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-tride-border">
                                <span className="text-sm text-tride-text-muted">Page {txPage} of {txLastPage} ({txTotal} total)</span>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" disabled={txPage <= 1} onClick={() => setTxPage(p => p - 1)}>Previous</Button>
                                    <Button variant="secondary" size="sm" disabled={txPage >= txLastPage} onClick={() => setTxPage(p => p + 1)}>Next</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                
                {activeTab === "Driver Payouts" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-tride-text">Driver Payouts</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary"><RefreshCcw size={16} /> Recalculate All</Button>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Check size={16} /> Process All Pending</Button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-tride-text-muted border-b border-tride-border bg-tride-hover/50">
                                        <th className="px-4 py-3 text-left">Driver</th>
                                        <th className="px-4 py-3 text-left">Earnings</th>
                                        <th className="px-4 py-3 text-left">Commission</th>
                                        <th className="px-4 py-3 text-left">Deductions</th>
                                        <th className="px-4 py-3 text-left">Net Payout</th>
                                        <th className="px-4 py-3 text-left">Period</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {driverPayouts.length > 0 ? driverPayouts.map((p) => (
                                        <tr key={p.id} className="border-b border-tride-border/50 hover:bg-tride-hover/30 transition-colors">
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8 bg-tride-hover">
                                                        <AvatarFallback>{p.driver.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-tride-text">{p.driver.name}</div>
                                                        <div className="text-xs text-tride-text-muted">{p.driver.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-tride-text">{formatCurrency(p.earnings)}</td>
                                            <td className="px-4 py-4 text-tride-text-muted">{formatCurrency(p.commission)}</td>
                                            <td className="px-4 py-4 text-tride-text-muted">{formatCurrency(p.deductions)}</td>
                                            <td className="px-4 py-4 font-bold text-emerald-500">{formatCurrency(p.net_payout)}</td>
                                            <td className="px-4 py-4 text-tride-text-muted">{p.period}</td>
                                            <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    {p.status === 'Pending' && <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">Process</Button>}
                                                    {p.status === 'Completed' && <Button size="sm" variant="ghost" className="h-8 text-xs">View</Button>}
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={8} className="px-4 py-12 text-center text-tride-text-muted">No driver payouts found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        {payoutLastPage > 1 && (
                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-tride-border">
                                <span className="text-sm text-tride-text-muted">Page {payoutPage} of {payoutLastPage}</span>
                                <div className="flex gap-2">
                                    <Button variant="secondary" size="sm" disabled={payoutPage <= 1} onClick={() => setPayoutPage(p => p - 1)}>Previous</Button>
                                    <Button variant="secondary" size="sm" disabled={payoutPage >= payoutLastPage} onClick={() => setPayoutPage(p => p + 1)}>Next</Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "Tax & Compliance" && (
                    <div className="bg-tride-card border border-tride-border rounded-3xl p-6">
                        <div className="text-center py-16">
                            <Receipt size={48} className="text-tride-text-muted mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold text-tride-text mb-2">Tax & Compliance</h3>
                            <p className="text-tride-text-muted max-w-md mx-auto">Tax and compliance management features are coming soon. This section will include tax filing, compliance reports, and regulatory requirements.</p>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

// --- Helper Components ---

function StatsCard({ label, value, trend, trendUp, icon, iconBg, loading }: { label: string, value: string, trend: string, trendUp: boolean, icon: React.ReactNode, iconBg: string, loading?: boolean }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl relative overflow-hidden hover:bg-tride-hover/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-tride-hover/50 rounded-xl flex items-center justify-center">
                    {icon}
                </div>
                 <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                    trend === "Now"
                    ? "bg-blue-500/10 text-blue-500"
                    : trendUp
                        ? "bg-green-500/10 text-green-500"
                        : "bg-red-500/10 text-red-500"
                }`}>
                    {trend}
                </span>
            </div>
            <p className="text-xs text-tride-text-muted font-medium mb-1">{label}</p>
            {loading ? (
                <div className="h-8 w-24 bg-tride-hover/50 animate-pulse rounded-lg"></div>
            ) : (
                <h3 className="text-2xl font-bold text-tride-text">{value}</h3>
            )}
        </div>
    )
}

function ServiceStatsCard({ label, value, subtext, trend, icon, iconBg, loading }: { label: string, value: number, subtext: string, trend: string, icon: React.ReactNode, iconBg: string, loading?: boolean }) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-center justify-between shadow-sm hover:shadow-md transition-all hover:bg-tride-hover/30">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${iconBg}`}>{icon}</div>
                <div>
                    {loading ? (
                        <div className="h-7 w-24 bg-tride-hover/50 animate-pulse rounded-lg mb-1"></div>
                    ) : (
                        <div className="text-2xl font-bold text-tride-text">{formatCurrency(value)}</div>
                    )}
                     <div className="text-xs text-tride-text-muted">{label}</div>
                     <div className="text-[10px] text-tride-text-muted mt-0.5">{subtext}</div>
                </div>
            </div>
             <div className="text-xs font-medium bg-tride-hover/50 px-2 py-1 rounded-lg border border-tride-border/50">
                {trend}
            </div>
        </div>
    )
}

function ReportCard({ title, description, icon, color }: { title: string, description: string, icon: React.ReactNode, color: string }) {
    return (
        <div className="bg-tride-card border border-tride-border p-6 rounded-3xl flex items-start gap-4 hover:border-blue-500/50 transition-colors group">
            <div className={`p-3 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-tride-text mb-1">{title}</h4>
                <p className="text-sm text-tride-text-muted mb-4">{description}</p>
                <button className="text-sm font-medium text-blue-500 hover:text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Generate Report <ArrowUpRight size={14} />
                </button>
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const s = status.toLowerCase();
    let style = "bg-tride-hover text-tride-text-muted";
    
    if (s === 'completed') style = "bg-blue-600/10 text-blue-600";
    else if (s === 'pending') style = "bg-orange-500/10 text-orange-500";
    else if (s === 'processing') style = "bg-tride-hover text-tride-text border border-tride-border";
    else if (s === 'failed') style = "bg-red-500/10 text-red-500";
    
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${style} capitalize`}>
            {status}
        </span>
    );
}
