import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { PieChart as PieChartIcon, TrendingUp, Users, Activity, BarChart3, Star } from 'lucide-react';

const revenueData = [
    { name: 'Jul', rides: 1.2, delivery: 0.8, courier: 0.4, rentals: 0.1 },
    { name: 'Aug', rides: 1.4, delivery: 0.9, courier: 0.5, rentals: 0.2 },
    { name: 'Sep', rides: 1.6, delivery: 1.1, courier: 0.6, rentals: 0.2 },
    { name: 'Oct', rides: 1.8, delivery: 1.3, courier: 0.7, rentals: 0.3 },
    { name: 'Nov', rides: 2.1, delivery: 1.5, courier: 0.8, rentals: 0.4 },
    { name: 'Dec', rides: 2.4, delivery: 1.8, courier: 1.1, rentals: 0.5 },
    { name: 'Jan', rides: 2.8, delivery: 2.1, courier: 1.4, rentals: 0.6 },
];

const distributionData = [
    { name: 'Rides', value: 48, color: '#3b82f6', amount: '$1.45M' },
    { name: 'Food Delivery', value: 28, color: '#2563eb', amount: '$1.05M' },
    { name: 'Courier', value: 15, color: '#10b981', amount: '$0.58M' },
    { name: 'Rentals', value: 9, color: '#f59e0b', amount: '$0.10M' },
];

const radarData = [
    { subject: 'Revenue', A: 120, fullMark: 150 },
    { subject: 'User Growth', A: 98, fullMark: 150 },
    { subject: 'Retention', A: 86, fullMark: 150 },
    { subject: 'NPS', A: 99, fullMark: 150 },
    { subject: 'Driver Util', A: 85, fullMark: 150 },
    { subject: 'Compliance', A: 110, fullMark: 150 },
];

export function OverviewTab() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Trend Stacked Area */}
                <div className="lg:col-span-2 bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-xl font-black text-tride-text">Revenue Trend by Service</h3>
                        <p className="text-sm text-tride-text-muted mt-1">Monthly revenue breakdown across all verticals</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRides" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorDelivery" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v}M`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="rides" stackId="1" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRides)" />
                                <Area type="monotone" dataKey="delivery" stackId="1" stroke="#10b981" fillOpacity={1} fill="url(#colorDelivery)" />
                                <Area type="monotone" dataKey="courier" stackId="1" stroke="#2563eb" fillOpacity={1} fill="#2563eb33" />
                                <Area type="monotone" dataKey="rentals" stackId="1" stroke="#f59e0b" fillOpacity={1} fill="#f59e0b33" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue Distribution Pie */}
                <div className="bg-tride-card border border-tride-border p-8 rounded-3xl flex flex-col items-center">
                    <div className="w-full mb-8">
                        <h3 className="text-xl font-black text-tride-text">Revenue Distribution</h3>
                    </div>
                    <div className="h-48 w-full relative mb-12">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={distributionData} 
                                    innerRadius={60} 
                                    outerRadius={85} 
                                    paddingAngle={5} 
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {distributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <PieChartIcon size={24} className="text-tride-text-muted mx-auto mb-1 opacity-50" />
                            <span className="text-[10px] text-tride-text-muted uppercase font-bold tracking-widest block">By vertical</span>
                        </div>
                    </div>
                    <div className="w-full space-y-4">
                        {distributionData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-medium text-tride-text-muted group-hover:text-tride-text transition-colors">{item.name}</span>
                                </div>
                                <span className="text-sm font-black text-tride-text">{item.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Radar Chart */}
                <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-tride-text">Business Health Radar</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="subject" tick={{fill: '#94a3b8', fontSize: 10}} />
                                <Radar name="Health" dataKey="A" stroke="#fbbf24" fill="#fbbf24" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Peak Hours Indicators */}
                <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-tride-text">Peak Hours</h3>
                    <div className="space-y-5">
                        {[
                            { label: '7-9 AM', value: '15.234', progress: 85, color: 'bg-blue-500' },
                            { label: '12-2 PM', value: '12.456', progress: 70, color: 'bg-blue-400' },
                            { label: '5-8 PM', value: '18.789', progress: 95, color: 'bg-blue-600' },
                            { label: '9-11 PM', value: '8.456', progress: 45, color: 'bg-blue-300' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-tride-text-muted font-bold">{item.label}</span>
                                    <span className="font-bold text-tride-text">{item.value} rps</span>
                                </div>
                                <div className="h-1.5 bg-tride-hover rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Acquisition */}
                <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-tride-text">User Acquisition</h3>
                    <div className="space-y-5">
                        {[
                            { label: 'Organic', value: '12.345', progress: 65, color: 'bg-emerald-500' },
                            { label: 'Referral', value: '8.901', progress: 45, color: 'bg-emerald-400' },
                            { label: 'Paid Ads', value: '4.567', progress: 25, color: 'bg-emerald-600' },
                            { label: 'Social', value: '1.890', progress: 10, color: 'bg-emerald-300' },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-tride-text-muted font-bold">{item.label}</span>
                                    <span className="font-bold text-tride-text">{item.value}</span>
                                </div>
                                <div className="h-1.5 bg-tride-hover rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Retention Metrics */}
                <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold mb-6 text-tride-text">Retention Metrics</h3>
                    <div className="flex-1 flex flex-col justify-center gap-6">
                        <div className="text-center">
                            <div className="text-4xl font-black text-tride-text">67%</div>
                            <div className="text-[10px] text-tride-text-muted uppercase font-bold tracking-widest mt-1">30-Day Retention</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-tride-hover/30 p-3 rounded-2xl border border-tride-border/50 text-center">
                                <div className="text-lg font-black text-tride-text">45%</div>
                                <div className="text-[8px] text-tride-text-muted uppercase font-bold">60-Day</div>
                            </div>
                            <div className="bg-tride-hover/30 p-3 rounded-2xl border border-tride-border/50 text-center">
                                <div className="text-lg font-black text-tride-text">32%</div>
                                <div className="text-[8px] text-tride-text-muted uppercase font-bold">90-Day</div>
                            </div>
                        </div>
                        <div className="mt-2 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-center">
                            <div className="text-blue-400 font-black text-xl">$45.20</div>
                            <div className="text-[10px] text-blue-400/70 uppercase font-bold tracking-wider">LTV per User</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
