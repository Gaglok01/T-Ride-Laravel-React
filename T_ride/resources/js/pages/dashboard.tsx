import { type BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { Head, Link } from '@inertiajs/react';
import { 
    LayoutDashboard, 
    Car, 
    ShoppingBag, 
    AlertCircle, 
    DollarSign, 
    Activity, 
    ArrowUpRight, 
    ArrowDownRight,
    Users,
    MapPin,
    Clock,
    Briefcase
} from "lucide-react";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer 
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    total_revenue: string;
    active_drivers: number;
    active_trips: number;
    pending_issues: number;
}

interface EarningData {
    name: string;
    earnings: number;
}

interface LiveActivity {
    id: string;
    user: string;
    driver: string;
    type: 'Ride' | 'Delivery';
    status: string;
    time: string;
}

interface EarningsSummary {
    this_week: number;
    week_change: number;
    this_month: number;
    month_change: number;
    this_quarter: number;
    quarter_change: number;
    all_time: number;
}

export default function Dashboard() {
    const [stats, setStats] = useState<any[]>([]);
    const [chartData, setChartData] = useState<EarningData[]>([]);
    const [earningsSummary, setEarningsSummary] = useState<EarningsSummary | null>(null);
    const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/admin/dashboard/stats');
            if (response.data.status) {
                const data = response.data.data;
                setStats(data.stats);
                setChartData(data.earningsChart);
                setEarningsSummary(data.earningsSummary);
                setLiveActivity(data.liveActivity);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        } finally {
            setLoading(false);
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const styles = {
            completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            on_the_way: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
        };
        const style = styles[status as keyof typeof styles] || "bg-gray-500/10 text-gray-400 border-gray-500/20";

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${style} capitalize`}>
                {status.replace(/_/g, ' ')}
            </span>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            
            <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-sm">
                            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <span className="text-sm font-medium text-gray-400">{stat.title}</span>
                                {stat.icon === 'dollar' && <DollarSign className="h-4 w-4 text-emerald-400" />}
                                {stat.icon === 'car' && <Car className="h-4 w-4 text-blue-400" />}
                                {stat.icon === 'trip' && <Activity className="h-4 w-4 text-purple-400" />}
                                {stat.icon === 'issue' && <AlertCircle className="h-4 w-4 text-amber-400" />}
                            </div>
                            <div className="text-2xl font-bold text-white">{stat.value}</div>
                            <p className="text-xs text-gray-400">
                                {stat.trend.startsWith('+') ? (
                                    <span className="text-emerald-400 flex items-center gap-1">
                                        <ArrowUpRight className="h-3 w-3" /> {stat.trend} from last month
                                    </span>
                                ) : stat.trend === 'Now' ? (
                                    <span className="text-blue-400 font-medium">Live currently</span>
                                ) : (
                                    <span className="text-amber-400 flex items-center gap-1">
                                        <ArrowDownRight className="h-3 w-3" /> {stat.trend} pending
                                    </span>
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    
                    {/* Weekly Revenue Chart */}
                    <div className="col-span-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-white mb-4">Weekly Revenue Overview</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#888" 
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis 
                                            stroke="#888" 
                                            tickLine={false} 
                                            axisLine={false} 
                                            tickFormatter={(value) => `$${value}`} 
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fbbf24' }} 
                                            formatter={(value: any) => [`$${value}`, 'Earnings']}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="earnings" 
                                            stroke="#fbbf24" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorEarnings)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Active Stats Links */}
                        <div className="grid grid-cols-2 gap-px border-t border-white/10 bg-white/5">
                            <Link 
                                href="/rides" 
                                className="group flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Active Rides</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {stats.find(s => s.title === 'Active Trips')?.value || '0'}
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <Car className="h-5 w-5 text-blue-400" />
                                </div>
                            </Link>
                            <Link 
                                href="/delivery-orders" 
                                className="group flex items-center justify-between p-6 hover:bg-white/5 transition-colors border-l border-white/10"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">Active Couriers</p>
                                    <p className="text-2xl font-bold text-white mt-1">
                                        {/* Assuming half of active trips are couriers for now or verify data */}
                                        {stats.length > 2 ? Math.floor(parseInt(stats[2].value)/2) : '0'} 
                                    </p>
                                </div>
                                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                                    <ShoppingBag className="h-5 w-5 text-yellow-500" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Earnings Summary & Live Activity */}
                    <div className="col-span-3 space-y-4">
                        
                        {/* Earnings Summary Card */}
                        {earningsSummary && (
                            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-emerald-400" />
                                    Earnings Summary
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">This Month</span>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-white">${earningsSummary.this_month.toFixed(2)}</div>
                                            <div className={`text-xs ${earningsSummary.month_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                {earningsSummary.month_change > 0 ? '+' : ''}{earningsSummary.month_change}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                        <span className="text-gray-400">Total Balance</span>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-tride-yellow">${earningsSummary.all_time.toFixed(2)}</div>
                                            <div className="text-xs text-gray-400">Lifetime Earnings</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recent Activity List */}
                        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex-1">
                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-400" />
                                Live Activity
                            </h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                                {liveActivity.length > 0 ? (
                                    liveActivity.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activity.type === 'Ride' ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    {activity.type === 'Ride' ? <Car size={14} /> : <ShoppingBag size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{activity.user}</p>
                                                    <p className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Briefcase size={10} /> {activity.driver}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <StatusBadge status={activity.status} />
                                                <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                                                    <Clock size={10} /> {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-4">No recent activity</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
