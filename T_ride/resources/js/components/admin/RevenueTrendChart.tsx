import { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

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
    height = 256, // h-64 = 16rem = 256px
    className = ""
}: RevenueTrendChartProps) {
    const processedData = useMemo(() => {
        // If data is missing or empty, return placeholder 0-value data
        if (!data || data.length === 0) {
            return Array.from({ length: 7 }).map((_, i) => ({
                [xAxisKey]: "", // Empty label
                [dataKey]: 0
            }));
        }
        
        // Ensure values are numbers and handle nulls
        return data.map(item => ({
            ...item,
            [dataKey]: Number(item[dataKey]) || 0
        }));
    }, [data, xAxisKey, dataKey]);

    // Calculate if we have any positive data to adjust domain if needed
    const hasData = useMemo(() => {
        return processedData.some(item => item[dataKey] > 0);
    }, [processedData, dataKey]);

    return (
        <div className={`bg-tride-card border border-tride-border p-6 rounded-3xl ${className}`}>
            {title && <h3 className="text-lg font-semibold mb-6 text-tride-text">{title}</h3>}
            <div style={{ height: typeof height === 'number' ? `${height}px` : height, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={processedData}>
                        <defs>
                            <linearGradient id={`colorGradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} opacity={0.1} />
                        <XAxis 
                            dataKey={xAxisKey} 
                            stroke="#888" 
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis 
                            stroke="#888" 
                            tickLine={false} 
                            axisLine={false} 
                            domain={[0, hasData ? 'auto' : 100]} // Ensure chart doesn't collapse if all 0
                            tickFormatter={(value) => {
                                if (value >= 1000) return `$${value/1000}k`;
                                return `$${value}`;
                            }} 
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                            itemStyle={{ color: color }}
                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, title]}
                            cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey={dataKey} 
                            stroke={color} 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill={`url(#colorGradient-${title.replace(/\s+/g, '')})`} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
