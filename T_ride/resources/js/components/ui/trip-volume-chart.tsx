import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '0:00', trips: 96 },
  { time: '1:00', trips: 106 },
  { time: '2:00', trips: 122 },
  { time: '3:00', trips: 132 },
  { time: '4:00', trips: 156 },
  { time: '5:00', trips: 142 },
  { time: '6:00', trips: 145 },
  { time: '7:00', trips: 147 },
  { time: '8:00', trips: 145 },
  { time: '9:00', trips: 122 },
  { time: '10:00', trips: 120 },
  { time: '11:00', trips: 112 },
  { time: '12:00', trips: 82 },
  { time: '13:00', trips: 70 },
  { time: '14:00', trips: 70 },
  { time: '15:00', trips: 45 },
  { time: '16:00', trips: 30 },
  { time: '17:00', trips: 40 },
  { time: '18:00', trips: 45 },
  { time: '19:00', trips: 44 },
  { time: '20:00', trips: 48 },
  { time: '21:00', trips: 56 },
  { time: '22:00', trips: 70 },
  { time: '23:00', trips: 88 },
];

export function TripVolumeChart() {
  return (
    <div className="bg-tride-card border border-tride-border p-6 rounded-3xl h-[400px] flex flex-col shadow-sm">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-tride-text">Today's Trip Volume</h3>
        <p className="text-sm text-tride-text-muted">Hourly trips and online drivers</p>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
            <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                interval={3}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#6B7280', fontSize: 12 }} 
                ticks={[0, 40, 80, 120, 160]}
            />
            <Tooltip 
                cursor={{ fill: 'rgba(248, 184, 3, 0.05)' }}
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '12px', color: '#fff' }}
            />
            <Bar 
                dataKey="trips" 
                fill="#fbbf24" 
                radius={[4, 4, 0, 0]} 
                barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
