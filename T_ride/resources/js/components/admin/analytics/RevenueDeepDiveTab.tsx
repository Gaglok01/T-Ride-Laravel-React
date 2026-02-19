import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const waterfallData = [
    { name: 'Gross Revenue', value: 3200, color: '#3b82f6' },
    { name: 'Platform Commission', value: 450, color: '#2563eb' },
    { name: 'Payment Fees', value: 65, color: '#2563eb' },
    { name: 'Refunds', value: 42, color: '#2563eb' },
    { name: 'Driver Payouts', value: 2200, color: '#3b82f6' },
    { name: 'Net Revenue', value: 443, color: '#3b82f6' },
];

export function RevenueDeepDiveTab() {
    return (
        <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
            <div className="mb-10">
                <h3 className="text-2xl font-black text-tride-text">Revenue Waterfall</h3>
                <p className="text-sm text-tride-text-muted mt-1">Breakdown: Gross → Commission → Refunds → Net</p>
            </div>
            
            <div className="h-[500px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={waterfallData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#94a3b8', fontSize: 12}}
                            tickFormatter={(v) => `$${v}K`}
                        />
                        <Tooltip 
                            cursor={{fill: '#ffffff10'}}
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '13px' }}
                        />
                        <Bar 
                            dataKey="value" 
                            radius={[8, 8, 0, 0]} 
                            barSize={80}
                        >
                            {waterfallData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Avg Order Value', value: '$24.50', trend: '+4.2%', sub: 'vs last month' },
                    { label: 'Customer Acquisition Cost', value: '$12.80', trend: '-2.1%', sub: 'Target: <$15.00' },
                    { label: 'Revenue per User', value: '$185.20', trend: '+12.5%', sub: 'All-time high' },
                ].map((stat, i) => (
                    <div key={i} className="bg-tride-hover/30 p-6 rounded-2xl border border-tride-border/50">
                        <p className="text-xs text-tride-text-muted font-bold uppercase tracking-widest mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h4 className="text-2xl font-black text-tride-text">{stat.value}</h4>
                            <div className={`text-xs font-bold px-2 py-1 rounded-lg ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {stat.trend}
                            </div>
                        </div>
                        <p className="text-[10px] text-tride-text-muted mt-2">{stat.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
