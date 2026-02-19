import React from 'react';
import { TrendingDown, Users } from 'lucide-react';

const funnelSteps = [
    { step: 1, label: 'App Downloads', value: '250,000', percentage: '100%', drop: null, color: 'bg-blue-500', width: '100%' },
    { step: 2, label: 'Registrations', value: '125,000', percentage: '50%', drop: '-50%', color: 'bg-blue-500/80', width: '50%' },
    { step: 3, label: 'Phone Verified', value: '100,000', percentage: '40%', drop: '-20%', color: 'bg-blue-500/70', width: '40%' },
    { step: 4, label: 'First Booking', value: '75,000', percentage: '30%', drop: '-25%', color: 'bg-blue-500/60', width: '30%' },
    { step: 5, label: 'First Completed Trip', value: '60,000', percentage: '24%', drop: '-20%', color: 'bg-blue-500/50', width: '24%' },
    { step: 6, label: 'Second Trip (within 7d)', value: '45,000', percentage: '18%', drop: '-25%', color: 'bg-blue-500/40', width: '18%' },
    { step: 7, label: 'Weekly Active (30d)', value: '30,000', percentage: '12%', drop: '-33%', color: 'bg-blue-500/30', width: '12%' },
];

export function ConversionFunnelTab() {
    return (
        <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
            <div className="mb-10">
                <h3 className="text-2xl font-black text-tride-text">User Conversion Funnel</h3>
                <p className="text-sm text-tride-text-muted mt-1">From download to retained user — identify drop-off points</p>
            </div>

            <div className="space-y-6">
                {funnelSteps.map((step, i) => (
                    <div key={i} className="relative group">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-xs font-black border border-blue-500/20">
                                    {step.step}
                                </div>
                                <span className="font-bold text-tride-text group-hover:text-blue-500 transition-colors">{step.label}</span>
                            </div>
                            <div className="flex items-center gap-6">
                                {step.drop && (
                                    <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                                        <TrendingDown size={14} />
                                        {step.drop}
                                    </div>
                                )}
                                <div className="text-right min-w-[120px]">
                                    <span className="font-black text-tride-text">{step.value}</span>
                                    <span className="text-xs text-tride-text-muted ml-2">({step.percentage})</span>
                                </div>
                            </div>
                        </div>
                        <div className="h-2.5 bg-tride-hover rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${step.color} rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: step.width }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Users size={24} />
                </div>
                <div>
                    <h4 className="font-black text-tride-text mb-1">Funnel Insight</h4>
                    <p className="text-sm text-tride-text-muted">The largest drop-off (50%) occurs between Download and Registration. Consider optimizing the onboarding flow or simplifying the registration form.</p>
                </div>
            </div>
        </div>
    );
}
