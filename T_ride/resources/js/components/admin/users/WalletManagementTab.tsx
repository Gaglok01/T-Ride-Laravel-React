import React from 'react';
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, RefreshCcw } from 'lucide-react';

const walletStats = [
    { label: 'Total Wallet Balance', value: '$1,245,678', trend: '+15.2%', trendUp: true, icon: <Wallet size={20} />, iconBg: 'bg-tride-yellow/10 text-tride-yellow' },
    { label: "Today's Top-ups", value: '$23,456', trend: '+8.5%', trendUp: true, icon: <CreditCard size={20} />, iconBg: 'bg-tride-yellow/10 text-tride-yellow' },
    { label: "Today's Spend", value: '$18,900', trend: '+12.1%', trendUp: true, icon: <ArrowDownLeft size={20} />, iconBg: 'bg-tride-yellow/10 text-tride-yellow' },
    { label: 'Avg Balance', value: '$27.30', trend: '+$2.10', trendUp: true, icon: <RefreshCcw size={20} />, iconBg: 'bg-tride-yellow/10 text-tride-yellow' },
];

const transactions = [
    { id: 'WTX-90001', user: 'John Doe', type: 'Top-up', amount: '+$50.00', balance: '$175.50', method: 'Card', time: '2m ago', status: 'Success' },
    { id: 'WTX-90002', user: 'Sarah Wilson', type: 'Ride Payment', amount: '-$12.50', balance: '$327.50', method: 'Wallet', time: '15m ago', status: 'Success' },
    { id: 'WTX-90003', user: 'Chris Lee', type: 'Refund', amount: '+$8.00', balance: '$23.00', method: 'System', time: '1h ago', status: 'Success' },
    { id: 'WTX-90004', user: 'Tom Brown', type: 'Top-up', amount: '+$100.00', balance: '$167.50', method: 'Mobile Money', time: '2h ago', status: 'Success' },
    { id: 'WTX-90005', user: 'Amy Chen', type: 'Delivery Payment', amount: '-$22.00', balance: '$67.00', method: 'Wallet', time: '3h ago', status: 'Success' },
    { id: 'WTX-90006', user: 'Jane Smith', type: 'Promo Credit', amount: '+$15.00', balance: '$60.00', method: 'System', time: '4h ago', status: 'Success' },
];

export function WalletManagementTab() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Wallet Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {walletStats.map((stat, i) => (
                    <div key={i} className="bg-tride-card border border-tride-border p-5 rounded-3xl flex items-start justify-between shadow-sm">
                        <div>
                            <p className="text-tride-text-muted text-xs font-medium mb-1">{stat.label}</p>
                            <h4 className="text-2xl font-bold text-tride-text mb-2">{stat.value}</h4>
                            <div className={`text-xs font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'} flex items-center gap-1`}>
                                <span>{stat.trendUp ? '↗' : '↘'}</span> {stat.trend}
                            </div>
                        </div>
                        <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-tride-border">
                    <h3 className="text-lg font-semibold text-tride-text">Wallet Transactions</h3>
                    <p className="text-sm text-tride-text-muted">Recent wallet top-ups, deductions, and transfers</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">Transaction ID</th>
                                <th className="px-6 py-4 font-medium">User</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Balance After</th>
                                <th className="px-6 py-4 font-medium">Method</th>
                                <th className="px-6 py-4 font-medium">Time</th>
                                <th className="px-6 py-4 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {transactions.map((tx, i) => (
                                <tr key={i} className="hover:bg-tride-hover transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm text-tride-text-muted">{tx.id}</td>
                                    <td className="px-6 py-4 font-medium text-tride-text">{tx.user}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-tride-hover px-2 py-1 rounded text-xs text-tride-text border border-tride-border">
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 font-medium ${tx.amount.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                        {tx.amount}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tride-text">{tx.balance}</td>
                                    <td className="px-6 py-4 text-sm text-tride-text-muted">{tx.method}</td>
                                    <td className="px-6 py-4 text-sm text-tride-text-muted">{tx.time}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
                                            {tx.status}
                                        </span>
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
