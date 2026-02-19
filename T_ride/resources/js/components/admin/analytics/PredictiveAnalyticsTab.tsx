import React from 'react';
import { Zap, Activity, TrendingUp, Sparkles, Brain } from 'lucide-react';

const forecasts = [
    { month: 'February 2026', value: '$3.45M', trend: '+8.5%', confidence: '92%' },
    { month: 'March 2026', value: '$3.72M', trend: '+7.8%', confidence: '85%' },
    { month: 'April 2026', value: '$3.95M', trend: '+6.2%', confidence: '78%' },
];

const aiInsights = [
    { priority: 'High', impact: '+$180K/mo', text: 'Lagos showing 3x growth potential — consider doubling driver incentives', color: 'bg-blue-500' },
    { priority: 'Medium', impact: '+$45K/mo', text: 'Courier service underperforming in Cape Town — demand exists but supply is low', color: 'bg-tride-hover' },
    { priority: 'High', impact: '+$65K/mo', text: 'Weekend dinner delivery demand up 40% — surge pricing opportunity', color: 'bg-blue-500' },
    { priority: 'Medium', impact: 'Save $22K/mo', text: 'Airport zone driver wait times increasing — optimize queue management', color: 'bg-tride-hover' },
    { priority: 'Low', impact: '+$30K/mo', text: 'Referral program ROI declining — refresh incentive structure', color: 'bg-tride-hover' },
];

export function PredictiveAnalyticsTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Revenue Forecast column */}
            <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-10">
                    <Zap size={20} className="text-[#fbbf24]" />
                    <h3 className="text-xl font-black text-tride-text">Revenue Forecast (Next 90 Days)</h3>
                </div>

                <div className="space-y-6">
                    {forecasts.map((f, i) => (
                        <div key={i} className="p-6 bg-tride-hover/20 border border-tride-border/50 rounded-2xl hover:border-[#fbbf24]/30 transition-all group">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-tride-text-muted">{f.month}</span>
                                <div className="px-3 py-1 bg-tride-card border border-tride-border rounded-lg text-[10px] font-black text-tride-text-muted">
                                    Confidence: <span className="text-emerald-500">{f.confidence}</span>
                                </div>
                            </div>
                            <div className="flex items-end gap-3">
                                <h4 className="text-3xl font-black text-tride-text group-hover:text-[#fbbf24] transition-colors">{f.value}</h4>
                                <div className="flex items-center gap-1 text-emerald-500 text-sm font-bold mb-1">
                                    <TrendingUp size={16} />
                                    {f.trend}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 p-6 bg-[#fbbf24]/5 border border-[#fbbf24]/10 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#fbbf24]/10 rounded-lg text-[#fbbf24]">
                            <Brain size={20} />
                        </div>
                        <p className="text-xs font-bold text-tride-text-muted italic">"Predicted revenue growth overall: 22.5% for Q1 2026"</p>
                    </div>
                </div>
            </div>

            {/* AI-Powered Insights column */}
            <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
                <div className="flex items-center gap-2 mb-10">
                    <Activity size={20} className="text-blue-500" />
                    <h3 className="text-xl font-black text-tride-text">AI-Powered Insights</h3>
                </div>

                <div className="space-y-4">
                    {aiInsights.map((insight, i) => (
                        <div key={i} className="p-5 border border-tride-border/50 rounded-2xl flex flex-col gap-3 hover:bg-tride-hover/30 transition-all border-l-4" style={{ borderLeftColor: i % 2 === 0 ? '#3b82f6' : 'transparent' }}>
                            <div className="flex justify-between items-center">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    insight.priority === 'High' ? 'bg-blue-500 text-white' : 'bg-tride-hover text-tride-text-muted'
                                }`}>
                                    {insight.priority}
                                </span>
                                <span className={`text-xs font-black ${insight.impact.startsWith('+') ? 'text-emerald-500' : 'text-blue-500'}`}>
                                    {insight.impact}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-tride-text leading-relaxed">
                                {insight.text}
                            </p>
                        </div>
                    ))}
                </div>

                <button className="w-full mt-8 py-4 bg-tride-dark border border-tride-border rounded-xl text-xs font-black text-tride-text-muted hover:text-tride-text hover:bg-tride-hover transition-all flex items-center justify-center gap-2 group">
                    <Sparkles size={14} className="group-hover:text-[#fbbf24] transition-colors" />
                    Explore More Insights
                </button>
            </div>
        </div>
    );
}
