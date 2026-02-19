import { 
    BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart
} from 'recharts';
import { CloudRain, Sun, Moon, CloudLightning } from 'lucide-react';

const demandData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    demand: Math.floor(Math.random() * 1000) + 200,
    supply: Math.floor(Math.random() * 400) + 100,
}));

export function DemandPatternsTab() {
    return (
        <div className="space-y-8">
            {/* 24-Hour Demand Heatmap */}
            <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
                <div className="mb-8">
                    <h3 className="text-2xl font-black text-tride-text">24-Hour Demand Heatmap</h3>
                    <p className="text-sm text-tride-text-muted mt-1">Hourly service demand across all verticals</p>
                </div>
                
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={demandData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                            <XAxis 
                                dataKey="hour" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 10}} 
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#94a3b8', fontSize: 10}}
                            />
                            <Tooltip 
                                cursor={{fill: '#ffffff05'}}
                                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            {/* Demand bars using dashboard color (amber/yellow) */}
                            <Bar 
                                dataKey="demand" 
                                fill="#fbbf24" 
                                radius={[4, 4, 0, 0]} 
                                barSize={25}
                            />
                            {/* Supply line (green) */}
                            <Line 
                                type="monotone" 
                                dataKey="supply" 
                                stroke="#10b981" 
                                strokeWidth={3} 
                                dot={false} 
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Surge Pricing Analysis */}
                <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-tride-text">Surge Pricing Analysis</h3>
                    <div className="space-y-6">
                        {[
                            { zone: 'Airport Zone', stats: '12 drivers / 89 requests', surge: '2.1x', progress: 85 },
                            { zone: 'CBD', stats: '34 drivers / 156 requests', surge: '1.8x', progress: 70 },
                            { zone: 'University Area', stats: '23 drivers / 67 requests', surge: '1.5x', progress: 55 },
                            { zone: 'Industrial', stats: '45 drivers / 23 requests', surge: '1.0x', progress: 20 },
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-tride-text">{item.zone}</h4>
                                        <p className="text-[10px] text-tride-text-muted mt-0.5">{item.stats}</p>
                                    </div>
                                    <span className="text-xs font-black bg-red-500 text-white px-2 py-0.5 rounded-lg">{item.surge}</span>
                                </div>
                                <div className="h-1.5 bg-tride-hover rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Supply vs Demand Metrics */}
                <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-tride-text">Supply vs Demand</h3>
                    <div className="space-y-5">
                        {[
                            { label: 'Driver Supply Index', value: '82%', status: 'Balanced', color: 'text-blue-400' },
                            { label: 'Avg Wait Time', value: '4.2 min', status: 'Good', color: 'text-emerald-400' },
                            { label: 'Unfulfilled Requests', value: '3.2%', status: 'Low', color: 'text-emerald-400' },
                            { label: 'ETA Accuracy', value: '91%', status: 'Good', color: 'text-blue-400' },
                            { label: 'Route Optimization', value: '87%', status: 'Improving', color: 'text-purple-400' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center group">
                                <span className="text-sm text-tride-text-muted group-hover:text-tride-text transition-colors">{item.label}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-tride-text">{item.value}</span>
                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border border-tride-border bg-tride-hover/50 ${item.color}`}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weather Impact */}
                <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                    <h3 className="text-lg font-bold mb-6 text-tride-text">Weather Impact</h3>
                    <div className="space-y-4">
                        {[
                            { type: 'Sunny', cancel: '5%', surge: 'None', icon: <Sun size={18} />, active: true },
                            { type: 'Light Rain', cancel: '8%', surge: '1.3x', icon: <CloudRain size={18} />, active: false },
                            { type: 'Heavy Rain', cancel: '15%', surge: '2.0x', icon: <CloudLightning size={18} />, active: false },
                            { type: 'Night', cancel: '7%', surge: '1.1x', icon: <Moon size={18} />, active: false },
                        ].map((item, i) => (
                            <div key={i} className={`p-4 rounded-2xl border transition-all ${item.active ? 'bg-tride-hover/50 border-[#fbbf24]/30' : 'bg-transparent border-tride-border/50'}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className={item.active ? 'text-[#fbbf24]' : 'text-tride-text-muted'}>
                                            {item.icon}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-tride-text">{item.type}</h4>
                                            <p className="text-[10px] text-tride-text-muted">Cancel: {item.cancel}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-black ${item.active ? 'text-[#fbbf24]' : 'text-tride-text-muted'}`}>{item.surge}</div>
                                        <p className="text-[10px] text-tride-text-muted uppercase tracking-tighter">Surge</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
