import { ArrowUpRight, Star, MapPin } from 'lucide-react';

export function GeographicIntelligenceTab() {
    const cityPerformance = [
        { city: 'Accra', trips: '45,678', revenue: '$890K', drivers: '2,456', fare: '$18.50', rating: '4.7', growth: '+12%', economics: '$19.48/trip' },
        { city: 'Lagos', trips: '58,900', revenue: '$1,250K', drivers: '3,890', fare: '$22.30', rating: '4.5', growth: '+18%', economics: '$21.22/trip' },
        { city: 'Nairobi', trips: '38,200', revenue: '$720K', drivers: '2,890', fare: '$16.80', rating: '4.6', growth: '+8%', economics: '$18.85/trip' },
        { city: 'Cape Town', trips: '22,100', revenue: '$540K', drivers: '1,567', fare: '$24.50', rating: '4.8', growth: '+5%', economics: '$24.43/trip' },
        { city: 'Cairo', trips: '31,500', revenue: '$620K', drivers: '2,345', fare: '$19.70', rating: '4.4', growth: '+15%', economics: '$19.68/trip' },
        { city: 'Casablanca', trips: '18,700', revenue: '$350K', drivers: '1,234', fare: '$17.20', rating: '4.3', growth: '+22%', economics: '$18.72/trip' },
    ];

    return (
        <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
            <div className="mb-10">
                <h3 className="text-2xl font-black text-tride-text">City Performance Comparison</h3>
            </div>

            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-tride-text-muted text-[10px] uppercase font-black tracking-widest border-b border-tride-border pb-4">
                            <th className="px-4 py-4 text-left">City</th>
                            <th className="px-4 py-4 text-center">Monthly Trips</th>
                            <th className="px-4 py-4 text-center">Revenue</th>
                            <th className="px-4 py-4 text-center">Active Drivers</th>
                            <th className="px-4 py-4 text-center">Avg Fare</th>
                            <th className="px-4 py-4 text-center">Satisfaction</th>
                            <th className="px-4 py-4 text-center">Growth</th>
                            <th className="px-4 py-4 text-right">Unit Economics</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-tride-border/30">
                        {cityPerformance.map((item, i) => (
                            <tr key={i} className="hover:bg-tride-hover/30 transition-colors group">
                                <td className="px-4 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:bg-[#fbbf24]/20 group-hover:text-[#fbbf24] transition-colors">
                                            <MapPin size={16} />
                                        </div>
                                        <span className="font-bold text-tride-text group-hover:text-[#fbbf24] transition-colors">{item.city}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-6 text-center font-bold text-tride-text">{item.trips}</td>
                                <td className="px-4 py-6 text-center font-black text-tride-text">{item.revenue}</td>
                                <td className="px-4 py-6 text-center text-tride-text-muted font-medium">{item.drivers}</td>
                                <td className="px-4 py-6 text-center text-tride-text-muted font-medium">{item.fare}</td>
                                <td className="px-4 py-6 text-center">
                                    <div className="flex items-center justify-center gap-1 font-bold text-amber-500">
                                        <Star size={14} fill="currentColor" />
                                        {item.rating}
                                    </div>
                                </td>
                                <td className="px-4 py-6 text-center">
                                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 font-black text-xs">
                                        <ArrowUpRight size={14} />
                                        {item.growth}
                                    </div>
                                </td>
                                <td className="px-4 py-6 text-right">
                                    <span className="inline-block px-3 py-1 rounded-full bg-blue-600 text-white font-black text-xs">
                                        {item.economics}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-12 p-8 bg-gradient-to-br from-[#fbbf24]/20 to-transparent border border-[#fbbf24]/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#fbbf24] rounded-2xl flex items-center justify-center text-black">
                        <Star size={32} fill="currentColor" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-tride-text">Top Performing City: Lagos</h4>
                        <p className="text-sm text-tride-text-muted mt-1">Lagos has seen a 118% increase in unit economics over the last 6 months.</p>
                    </div>
                </div>
                <button className="px-6 py-3 bg-[#fbbf24] text-black font-black rounded-xl hover:shadow-lg transition-all active:scale-95 shadow-[#fbbf24]/20">
                    View Market Deep Dive
                </button>
            </div>
        </div>
    );
}
