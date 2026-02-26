import React from 'react';
import { DollarSign, TrendingUp, Clock, Award } from 'lucide-react';

const earningStats = [
    { label: 'Total Payouts (MTD)', value: '$456,789', trend: '+18%', trendUp: true, icon: <DollarSign size={20} />, iconBg: 'bg-blue-500/10 text-blue-500' },
    { label: 'Avg Driver Earning', value: '$1,245', trend: '+$120', trendUp: true, icon: <TrendingUp size={20} />, iconBg: 'bg-green-500/10 text-green-500' },
    { label: 'Pending Payouts', value: '$23,456', trend: 'Due today', trendUp: true, icon: <Clock size={20} />, iconBg: 'bg-amber-500/10 text-amber-500' },
    { label: 'Top Earner', value: '$4,560', trend: 'DRV-1007', trendUp: true, icon: <Award size={20} />, iconBg: 'bg-indigo-500/10 text-indigo-500' },
];

const earnings = [
    { driver: 'Kwame Asante', trips: 1245, gross: '$12,450', commission: '-$1,867', bonuses: '+$145', tips: '+$274', net: '$11,002', lastPayout: 'Jan 28' },
    { driver: 'Grace Wanjiku', trips: 2340, gross: '$8,560', commission: '-$1,284', bonuses: '+$102', tips: '+$85', net: '$7,463', lastPayout: 'Jan 28' },
    { driver: 'Chidi Okonkwo', trips: 987, gross: '$9,870', commission: '-$1,480', bonuses: '+$15', tips: '+$252', net: '$8,657', lastPayout: 'Jan 28' },
    { driver: 'Amara Diallo', trips: 432, gross: '$5,670', commission: '-$850', bonuses: '+$131', tips: '+$88', net: '$5,039', lastPayout: 'Jan 28' },
];

export function DriverEarningsTab() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-6">
                {earningStats.map((stat, i) => (
                    <div key={i} className="bg-tride-card border border-tride-border p-5 rounded-3xl flex items-start justify-between shadow-sm">
                        <div>
                            <p className="text-tride-text-muted text-xs font-medium mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-bold text-tride-text mb-2">{stat.value}</h4>
                            <div className={`text-xs font-medium ${stat.trendUp ? 'text-green-500' : 'text-amber-500'} flex items-center gap-1`}>
                                {stat.trend}
                            </div>
                        </div>
                        <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Earnings Breakdown */}
            <div className="border-t border-tride-border pt-6">
                <div className="px-6 mb-4">
                    <h3 className="text-lg font-black text-tride-text uppercase tracking-tight">Driver Earnings Breakdown</h3>
                    <p className="text-[11px] text-tride-text-muted font-bold">Monitor and process driver payouts</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-[11px] bg-tride-hover font-black uppercase tracking-wider">
                                <th className="px-6 py-4 whitespace-nowrap text-xs font-black">Driver</th>
                                <th className="px-6 py-4 whitespace-nowrap">Trips</th>
                                <th className="px-6 py-4 whitespace-nowrap">Gross Earnings</th>
                                <th className="px-6 py-4 whitespace-nowrap">Commission</th>
                                <th className="px-6 py-4 whitespace-nowrap">Bonuses</th>
                                <th className="px-6 py-4 whitespace-nowrap">Tips</th>
                                <th className="px-6 py-4 whitespace-nowrap">Net Payout</th>
                                <th className="px-6 py-4 whitespace-nowrap">Last Payout</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {earnings.map((row, i) => (
                                <tr key={i} className="hover:bg-tride-hover transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-tride-text text-[13px]">{row.driver}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-black text-tride-text-muted font-mono">{row.trips}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-black text-tride-text">{row.gross}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-black text-red-500">{row.commission}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-black text-green-500">{row.bonuses}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-black text-green-500">{row.tips}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[12px] font-black text-tride-text">{row.net}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[11px] font-bold text-tride-text-muted">{row.lastPayout}</td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <button className="px-3 py-1 bg-tride-yellow text-black rounded-lg text-[10px] font-black uppercase tracking-tight hover:scale-105 transition-transform">
                                            Pay Now
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
