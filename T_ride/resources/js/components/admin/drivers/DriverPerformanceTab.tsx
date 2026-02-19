import React from 'react';
import { Star, MapPin } from 'lucide-react';

const topPerformers = [
    { rank: '#1', name: 'Kwame Asante', trips: '1245 trips', location: 'Accra', rating: '4.9' },
    { rank: '#2', name: 'Grace Wanjiku', trips: '2340 trips', location: 'Nairobi', rating: '4.8' },
    { rank: '#3', name: 'Chidi Okonkwo', trips: '987 trips', location: 'Lagos', rating: '4.7' },
    { rank: '#4', name: 'Amara Diallo', trips: '432 trips', location: 'Kampala', rating: '4.6' },
    { rank: '#5', name: 'David Mensah', trips: '567 trips', location: 'Accra', rating: '4.5' },
];

const performanceMetrics = [
    { label: 'Acceptance Rate', value: '87%' },
    { label: 'Completion Rate', value: '95%' },
    { label: 'On-Time Arrival', value: '82%' },
    { label: 'Cancellation Rate', value: '3.2%' },
    { label: 'Customer Satisfaction', value: '4.7/5' },
    { label: 'Response Time', value: '12s' },
];

export function DriverPerformanceTab() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Top Performers Column */}
            <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-tride-text">Top Performers</h3>
                    <p className="text-sm text-tride-text-muted mt-1">This month's best rated drivers</p>
                </div>
                <div className="space-y-4">
                    {topPerformers.map((driver, i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-tride-border rounded-2xl bg-tride-hover/30 hover:border-tride-yellow/50 transition-all group">
                            <div className="flex items-center gap-4">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    i === 0 ? 'bg-amber-100 text-amber-600' : 'bg-tride-hover text-tride-text-muted'
                                }`}>
                                    {driver.rank}
                                </span>
                                <div>
                                    <h4 className="font-semibold text-tride-text">{driver.name}</h4>
                                    <div className="flex items-center gap-2 text-xs text-tride-text-muted">
                                        <span>{driver.trips}</span>
                                        <span>•</span>
                                        <div className="flex items-center gap-0.5">
                                            <MapPin size={10} /> {driver.location}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-amber-500 font-bold">
                                <Star size={14} fill="currentColor" />
                                {driver.rating}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance Metrics Column */}
            <div className="bg-tride-card border border-tride-border p-6 rounded-3xl shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-tride-text">Performance Metrics</h3>
                    <p className="text-sm text-tride-text-muted mt-1">Fleet-wide averages</p>
                </div>
                <div className="space-y-6">
                    {performanceMetrics.map((metric, i) => (
                        <div key={i}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-tride-text-muted">{metric.label}</span>
                                <span className="text-sm font-semibold text-tride-text">{metric.value}</span>
                            </div>
                            <div className="h-2 bg-tride-hover rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: metric.value.includes('/') ? '94%' : metric.value }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
