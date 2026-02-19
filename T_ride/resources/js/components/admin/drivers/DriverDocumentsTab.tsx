import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, AlertCircle, Eye, Check, X } from 'lucide-react';

const docStats = [
    { label: 'All Verified', value: '2,156', trend: '+45', trendUp: true, icon: <ShieldCheck size={20} />, iconBg: 'bg-green-500/10 text-green-500' },
    { label: 'Pending Review', value: '45', trend: '-8', trendUp: false, icon: <Clock size={20} />, iconBg: 'bg-blue-500/10 text-blue-500' },
    { label: 'Expiring Soon', value: '23', trend: '+5', trendUp: true, icon: <AlertTriangle size={20} />, iconBg: 'bg-amber-500/10 text-amber-500' },
    { label: 'Rejected', value: '12', trend: '-3', trendUp: false, icon: <AlertCircle size={20} />, iconBg: 'bg-red-500/10 text-red-500' },
];

const documents = [
    { driver: 'Amara Diallo', type: "Driver's License", submitted: '2h ago', expiry: '2026-03-15', autoCheck: 'Passed', status: 'Pending' },
    { driver: 'Patience Akua', type: 'Vehicle Insurance', submitted: '5h ago', expiry: '2025-06-30', autoCheck: 'Failed - Blurry', status: 'Rejected' },
    { driver: 'New Driver #1', type: 'National ID', submitted: '1d ago', expiry: '2028-01-01', autoCheck: 'Passed', status: 'Pending' },
    { driver: 'David Mensah', type: 'Vehicle Inspection', submitted: '3d ago', expiry: '2025-02-28', autoCheck: 'Passed', status: 'Expiring' },
    { driver: 'New Driver #2', type: 'Criminal Background', submitted: '1d ago', expiry: 'N/A', autoCheck: 'Pending', status: 'Under Review' },
];

export function DriverDocumentsTab() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {docStats.map((stat, i) => (
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

            {/* Verification Queue */}
            <div className="bg-tride-card border border-tride-border rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-tride-border">
                    <h3 className="text-lg font-semibold text-tride-text">Document Verification Queue</h3>
                    <p className="text-sm text-tride-text-muted">Review and approve driver documents</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-tride-border text-left text-tride-text-muted text-sm bg-tride-hover">
                                <th className="px-6 py-4 font-medium">Driver</th>
                                <th className="px-6 py-4 font-medium">Document Type</th>
                                <th className="px-6 py-4 font-medium">Submitted</th>
                                <th className="px-6 py-4 font-medium">Expiry Date</th>
                                <th className="px-6 py-4 font-medium">Auto-Check</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border">
                            {documents.map((doc, i) => (
                                <tr key={i} className="hover:bg-tride-hover transition-colors">
                                    <td className="px-6 py-4 font-medium text-tride-text">{doc.driver}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-tride-hover px-3 py-1 rounded-full text-xs text-tride-text border border-tride-border font-medium">
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-tride-text-muted">{doc.submitted}</td>
                                    <td className="px-6 py-4 text-sm text-tride-text-muted font-mono">{doc.expiry}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            doc.autoCheck.includes('Passed') ? 'bg-green-500/10 text-green-500' : 
                                            doc.autoCheck.includes('Failed') ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                                        }`}>
                                            {doc.autoCheck}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                            doc.status === 'Pending' ? 'bg-amber-500/20 text-amber-500' :
                                            doc.status === 'Rejected' ? 'bg-red-500/20 text-red-500' :
                                            doc.status === 'Expiring' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'
                                        }`}>
                                            {doc.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="text-tride-text-muted hover:text-tride-text text-sm font-medium">View</button>
                                            <button className="text-green-500 hover:text-green-600 text-sm font-medium">Approve</button>
                                            <button className="text-red-500 hover:text-red-600 text-sm font-medium">Reject</button>
                                        </div>
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
