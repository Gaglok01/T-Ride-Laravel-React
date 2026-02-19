import React from 'react';
import { Target, AlertCircle, CheckCircle2 } from 'lucide-react';

const kpis = [
    { label: 'Avg Pickup Time', value: '4.2 min', target: '5 min', status: 'On Target', progress: 84, color: 'bg-emerald-500' },
    { label: 'Avg Trip Duration', value: '18 min', target: '15 min', status: 'Attention', progress: 120, color: 'bg-[#fbbf24]' },
    { label: 'Cancellation Rate', value: '8.5%', target: '< 10%', status: 'On Target', progress: 85, color: 'bg-emerald-500' },
    { label: 'Driver Accept Rate', value: '85%', target: '> 80%', status: 'On Target', progress: 85, color: 'bg-emerald-500' },
    { label: 'App Crash Rate', value: '0.2%', target: '< 0.5%', status: 'On Target', progress: 40, color: 'bg-emerald-500' },
    { label: 'Support Response', value: '12 min', target: '< 15 min', status: 'On Target', progress: 80, color: 'bg-emerald-500' },
    { label: 'Payment Success', value: '98.7%', target: '> 99%', status: 'Attention', progress: 99.7, color: 'bg-[#fbbf24]' },
    { label: 'Rating Average', value: '4.7', target: '> 4.5', status: 'On Target', progress: 94, color: 'bg-emerald-500' },
];

export function KPIScorecardTab() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
                <div key={i} className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`p-2 rounded-xl bg-opacity-10 ${kpi.status === 'On Target' ? 'bg-emerald-500 text-emerald-500' : 'bg-[#fbbf24] text-[#fbbf24]'}`}>
                            <Target size={20} />
                        </div>
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            kpi.status === 'On Target' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-tride-hover text-tride-text-muted border border-tride-border'
                        }`}>
                            {kpi.status}
                        </span>
                    </div>
                    
                    <div className="mb-4">
                        <h4 className="text-3xl font-black text-tride-text group-hover:text-[#fbbf24] transition-colors">{kpi.value}</h4>
                        <p className="text-sm font-bold text-tride-text-muted mt-1">{kpi.label}</p>
                        <p className="text-[10px] text-tride-text-muted/60 mt-1 uppercase font-bold tracking-widest">Target: {kpi.target}</p>
                    </div>

                    <div className="h-1.5 bg-tride-hover rounded-full overflow-hidden">
                        <div 
                            className={`h-full ${kpi.color} rounded-full transition-all duration-1000 ease-out`} 
                            style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
