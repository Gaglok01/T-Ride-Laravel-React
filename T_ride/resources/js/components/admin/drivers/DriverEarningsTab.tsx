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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-tride-border">
                    <h3 className="text-lg font-semibold text-tride-text">Driver Earnings Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">Driver</th>
                                <th className="px-6 py-4 font-medium">Trips</th>
                                <th className="px-6 py-4 font-medium">Gross Earnings</th>
                                <th className="px-6 py-4 font-medium">Commission</th>
                                <th className="px-6 py-4 font-medium">Bonuses</th>
                                <th className="px-6 py-4 font-medium">Tips</th>
                                <th className="px-6 py-4 font-medium">Net Payout</th>
                                <th className="px-6 py-4 font-medium">Last Payout</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {earnings.map((row, i) => (
                                <tr key={i} className="hover:bg-tride-hover transition-colors text-sm">
                                    <td className="px-6 py-4 font-medium text-tride-text">{row.driver}</td>
                                    <td className="px-6 py-4 text-tride-text-muted">{row.trips}</td>
                                    <td className="px-6 py-4 font-medium text-tride-text">{row.gross}</td>
                                    <td className="px-6 py-4 text-red-500">{row.commission}</td>
                                    <td className="px-6 py-4 text-green-500">{row.bonuses}</td>
                                    <td className="px-6 py-4 text-green-500">{row.tips}</td>
                                    <td className="px-6 py-4 font-bold text-tride-text">{row.net}</td>
                                    <td className="px-6 py-4 text-tride-text-muted">{row.lastPayout}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-4 py-1.5 bg-tride-hover border border-tride-border rounded-xl text-xs font-semibold hover:bg-tride-border transition-colors">
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
