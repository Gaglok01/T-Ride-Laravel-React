import React from 'react';
import { TrendingUp, Users, Clock, ShieldCheck, Star, MessageSquare } from 'lucide-react';

const userGrowth = [
    { month: 'Jan 2025', count: '4,560', width: '92%' },
    { month: 'Dec 2024', count: '3,890', width: '80%' },
    { month: 'Nov 2024', count: '4,120', width: '85%' },
    { month: 'Oct 2024', count: '3,450', width: '70%' },
    { month: 'Sep 2024', count: '3,780', width: '78%' },
    { month: 'Aug 2024', count: '3,200', width: '65%' },
];

const engagementMetrics = [
    { label: 'Daily Active Users (DAU)', value: '12,345', trend: '+5.2%', trendUp: true },
    { label: 'Weekly Active Users (WAU)', value: '28,900', trend: '+8.1%', trendUp: true },
    { label: 'Monthly Active Users (MAU)', value: '32,456', trend: '+12.3%', trendUp: true },
    { label: 'Avg Session Duration', value: '8.5 min', trend: '+0.8 min', trendUp: true },
    { label: 'Avg Rides/User/Month', value: '4.2', trend: '+0.3', trendUp: true },
    { label: 'Retention Rate (30d)', value: '72%', trend: '+3%', trendUp: true },
    { label: 'Referral Conversion', value: '18%', trend: '+2%', trendUp: true },
    { label: 'Support Tickets/User', value: '0.02', trend: '-0.01', trendUp: false },
];

export function UserActivityTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* User Growth Column */}
            <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-tride-text">User Growth</h3>
                    <p className="text-sm text-tride-text-muted mt-1">Registration trends over the last 6 months</p>
                </div>
                <div className="space-y-6">
                    {userGrowth.map((item, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-tride-text-muted">{item.month}</span>
                                <span className="text-sm font-semibold text-tride-yellow">{item.count} users</span>
                            </div>
                            <div className="h-2 bg-tride-hover rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-tride-yellow rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: item.width }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* User Engagement Column */}
            <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-tride-text">User Engagement</h3>
                    <p className="text-sm text-tride-text-muted mt-1">Activity metrics</p>
                </div>
                <div className="space-y-4">
                    {engagementMetrics.map((metric, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-tride-border rounded-2xl bg-tride-hover/30 hover:border-tride-yellow/50 transition-all group">
                            <span className="text-sm font-medium text-tride-text-muted group-hover:text-tride-text">{metric.label}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-tride-text">{metric.value}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${metric.trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {metric.trend}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
