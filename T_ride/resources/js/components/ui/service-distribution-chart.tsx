import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Rides', value: 48, color: '#3B82F6' },
  { name: 'Food Delivery', value: 28, color: '#2563EB' },
  { name: 'Courier', value: 15, color: '#10B981' },
  { name: 'Rentals', value: 9, color: '#F59E0B' },
];

export function ServiceDistributionChart() {
  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl h-full flex flex-col shadow-sm">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-tride-text">Service Distribution</h3>
        <p className="text-sm text-tride-text-muted">Revenue by service type</p>
      </div>

      <div className="flex-1 min-h-[220px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-tride-text-muted">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-tride-text">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
