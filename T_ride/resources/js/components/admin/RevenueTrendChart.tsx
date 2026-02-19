import { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { BarChart3 } from 'lucide-react';

interface RevenueTrendChartProps {
    data: any[];
    title?: string;
    dataKey?: string;
    xAxisKey?: string;
    color?: string;
    height?: number | string;
    className?: string;
}

export function RevenueTrendChart({ 
    data, 
    title = "Revenue Trend", 
    dataKey = "total", 
    xAxisKey = "month", 
    color = "#fbbf24",
    height = 256,
    className = ""
}: RevenueTrendChartProps) {
    const processedData = useMemo(() => {
        if (!data || data.length === 0) {
            return Array.from({ length: 7 }).map((_, i) => ({
                [xAxisKey]: "",
                [dataKey]: 0
            }));
        }
        
        return data.map(item => ({
            ...item,
            [dataKey]: Number(item[dataKey]) || 0
        }));
    }, [data, xAxisKey, dataKey]);

    const hasData = useMemo(() => {
        return processedData.some(item => item[dataKey] > 0);
    }, [processedData, dataKey]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-tride-card/95 backdrop-blur-sm border border-tride-border/50 rounded-xl px-4 py-3 shadow-xl">
                    <p className="text-[10px] text-tride-text-muted uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-lg font-bold text-tride-yellow">
                        ${Number(payload[0].value).toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className={`bg-tride-card border border-tride-border rounded-3xl overflow-hidden ${className}`}>
            {title && (
                <div className="px-6 pt-6 pb-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-tride-yellow/10 flex items-center justify-center">
                        <BarChart3 size={18} className="text-tride-yellow" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-tride-text">{title}</h3>
                        <p className="text-[10px] text-tride-text-muted uppercase tracking-wider">Last 7 days performance</p>
                    </div>
                </div>
            )}
            <div className="px-6 pb-6" style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData}>
                        <defs>
                            <linearGradient id={`colorGradient-${(title || '').replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity={0.25}/>
                                <stop offset="50%" stopColor={color} stopOpacity={0.08}/>
                                <stop offset="100%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} vertical={false} />
                        <XAxis 
                            dataKey={xAxisKey} 
                            stroke="transparent" 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                            dy={10}
                        />
                        <YAxis 
                            stroke="transparent" 
                            tickLine={false} 
                            axisLine={false} 
                            domain={[0, hasData ? 'auto' : 100]}
                            tickFormatter={(value) => {
                                if (value >= 1000) return `$${value/1000}k`;
                                return `$${value}`;
                            }} 
                            tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '6 6', strokeOpacity: 0.4 }} />
                        <Area 
                            type="monotone" 
                            dataKey={dataKey} 
                            stroke={color} 
                            strokeWidth={2.5}
                            fillOpacity={1} 
                            fill={`url(#colorGradient-${(title || '').replace(/\s+/g, '')})`} 
                            dot={false}
                            activeDot={{ r: 5, fill: color, stroke: '#1a1a2e', strokeWidth: 3 }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
