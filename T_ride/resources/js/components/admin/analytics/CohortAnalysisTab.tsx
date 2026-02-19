export function CohortAnalysisTab() {
    const cohorts = [
        { month: 'Sep 2025', size: '1,245', m0: 100, m1: 68, m2: 52, m3: 41, m4: 35 },
        { month: 'Oct 2025', size: '1,560', m0: 100, m1: 72, m2: 55, m3: 44, m4: null },
        { month: 'Nov 2025', size: '1,890', m0: 100, m1: 70, m2: 54, m3: null, m4: null },
        { month: 'Dec 2025', size: '2,100', m0: 100, m1: 74, m2: null, m3: null, m4: null },
        { month: 'Jan 2026', size: '2,450', m0: 100, m1: null, m2: null, m3: null, m4: null },
    ];

    const getHeatmapColor = (value: number | null) => {
        if (value === null) return 'bg-tride-hover/20 text-transparent';
        if (value === 100) return 'bg-emerald-500 text-white';
        if (value >= 70) return 'bg-emerald-500/80 text-white font-bold';
        if (value >= 50) return 'bg-emerald-500/60 text-white font-bold';
        if (value >= 40) return 'bg-amber-400/80 text-black font-bold';
        if (value >= 30) return 'bg-amber-400/60 text-black font-bold';
        return 'bg-amber-400/40 text-black font-bold';
    };

    return (
        <div className="space-y-8">
            {/* Cohort Retention Table */}
            <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm overflow-hidden">
                <div className="mb-8">
                    <h3 className="text-2xl font-black text-tride-text">Cohort Retention Analysis</h3>
                    <p className="text-sm text-tride-text-muted mt-1">Monthly user retention rates by signup cohort (% of users still active)</p>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full">
                        <thead>
                            <tr className="text-tride-text-muted text-xs uppercase font-black tracking-widest border-b border-tride-border">
                                <th className="px-4 py-4 text-left">Cohort</th>
                                <th className="px-4 py-4 text-center">Month 0</th>
                                <th className="px-4 py-4 text-center">Month 1</th>
                                <th className="px-4 py-4 text-center">Month 2</th>
                                <th className="px-4 py-4 text-center">Month 3</th>
                                <th className="px-4 py-4 text-center">Month 4</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-tride-border/30">
                            {cohorts.map((cohort, i) => (
                                <tr key={i} className="group">
                                    <td className="px-4 py-4">
                                        <div className="font-bold text-tride-text">{cohort.month}</div>
                                        <div className="text-[10px] text-tride-text-muted">Users: {cohort.size}</div>
                                    </td>
                                    <td className="p-1 px-2">
                                        <div className={`py-4 rounded-xl text-center text-xs font-black transition-transform group-hover:scale-[1.02] ${getHeatmapColor(cohort.m0)}`}>
                                            {cohort.m0}%
                                        </div>
                                    </td>
                                    <td className="p-1 px-2">
                                        <div className={`py-4 rounded-xl text-center text-xs font-black transition-transform group-hover:scale-[1.02] ${getHeatmapColor(cohort.m1)}`}>
                                            {cohort.m1 ? `${cohort.m1}%` : '—'}
                                        </div>
                                    </td>
                                    <td className="p-1 px-2">
                                        <div className={`py-4 rounded-xl text-center text-xs font-black transition-transform group-hover:scale-[1.02] ${getHeatmapColor(cohort.m2)}`}>
                                            {cohort.m2 ? `${cohort.m2}%` : '—'}
                                        </div>
                                    </td>
                                    <td className="p-1 px-2">
                                        <div className={`py-4 rounded-xl text-center text-xs font-black transition-transform group-hover:scale-[1.02] ${getHeatmapColor(cohort.m3)}`}>
                                            {cohort.m3 ? `${cohort.m3}%` : '—'}
                                        </div>
                                    </td>
                                    <td className="p-1 px-2">
                                        <div className={`py-4 rounded-xl text-center text-xs font-black transition-transform group-hover:scale-[1.02] ${getHeatmapColor(cohort.m4)}`}>
                                            {cohort.m4 ? `${cohort.m4}%` : '—'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Churn Risk Segments */}
                <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
                    <h3 className="text-xl font-bold mb-8 text-tride-text">Churn Risk Segments</h3>
                    <div className="space-y-8">
                        {[
                            { label: 'High Risk', sub: 'No ride in 14d', count: '12,450', progress: 35, color: 'bg-red-500', action: 'Win-back campaign' },
                            { label: 'Medium Risk', sub: '1 ride in 30d', count: '8,901', progress: 25, color: 'bg-amber-400', action: 'Promo push' },
                            { label: 'Low Risk', sub: 'Active weekly', count: '45,678', progress: 85, color: 'bg-blue-500', action: 'Loyalty rewards' },
                            { label: 'Power Users', sub: 'Daily usage', count: '22,050', progress: 60, color: 'bg-blue-600', action: 'Premium tier' },
                        ].map((item, i) => (
                            <div key={i} className="group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="text-sm font-black text-tride-text group-hover:text-[#fbbf24] transition-colors">{item.label} <span className="text-[10px] text-tride-text-muted font-medium ml-1">({item.sub})</span></h4>
                                        <p className="text-[10px] text-tride-text-muted mt-1 uppercase font-bold tracking-wider">Recommended: {item.action}</p>
                                    </div>
                                    <span className="text-sm font-black text-tride-text">{item.count}</span>
                                </div>
                                <div className="h-1.5 bg-tride-hover rounded-full overflow-hidden">
                                    <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${item.progress}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Lifetime Value */}
                <div className="bg-tride-card border border-tride-border p-8 rounded-3xl shadow-sm">
                    <h3 className="text-xl font-bold mb-8 text-tride-text">User Lifetime Value</h3>
                    <div className="space-y-4">
                        {[
                            { segment: 'Premium Riders', stats: '45 avg trips • 18 mo tenure', value: '$285' },
                            { segment: 'Regular Riders', stats: '22 avg trips • 12 mo tenure', value: '$120' },
                            { segment: 'Delivery Users', stats: '35 avg trips • 10 mo tenure', value: '$95' },
                            { segment: 'Courier Senders', stats: '18 avg trips • 14 mo tenure', value: '$180' },
                            { segment: 'Multi-service', stats: '68 avg trips • 24 mo tenure', value: '$420' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-4 bg-tride-hover/20 rounded-2xl border border-tride-border/50 hover:bg-tride-hover/50 hover:border-[#fbbf24]/30 transition-all group">
                                <div>
                                    <h4 className="text-sm font-bold text-tride-text group-hover:text-[#fbbf24] transition-colors">{item.segment}</h4>
                                    <p className="text-[10px] text-tride-text-muted mt-1">{item.stats}</p>
                                </div>
                                <div className="text-xl font-black text-blue-500">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
