"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

interface HistogramProps {
  units: { name: string; score: number }[];
}

export function Histogram({ units }: HistogramProps) {
  // Create bins: 0-10, 10-20, ..., 90-100
  const bins = [
    { range: "0-10%", min: 0, max: 0.1, count: 0, color: "#ef4444", units: [] as string[] },
    { range: "10-20%", min: 0.1, max: 0.2, count: 0, color: "#ef4444", units: [] as string[] },
    { range: "20-30%", min: 0.2, max: 0.3, count: 0, color: "#f97316", units: [] as string[] },
    { range: "30-40%", min: 0.3, max: 0.4, count: 0, color: "#f97316", units: [] as string[] },
    { range: "40-50%", min: 0.4, max: 0.5, count: 0, color: "#eab308", units: [] as string[] },
    { range: "50-60%", min: 0.5, max: 0.6, count: 0, color: "#eab308", units: [] as string[] },
    { range: "60-70%", min: 0.6, max: 0.7, count: 0, color: "#84cc16", units: [] as string[] },
    { range: "70-80%", min: 0.7, max: 0.8, count: 0, color: "#22c55e", units: [] as string[] },
    { range: "80-90%", min: 0.8, max: 0.9, count: 0, color: "#22c55e", units: [] as string[] },
    { range: "90-100%", min: 0.9, max: 1.01, count: 0, color: "#22c55e", units: [] as string[] }
  ];

  for (const u of units) {
    const s = u.score;
    for (const b of bins) {
      if (s >= b.min && s < b.max) {
        b.count++;
        b.units.push(u.name);
        break;
      }
    }
  }

  const avg = units.length > 0 ? units.reduce((a, b) => a + b.score, 0) / units.length : 0;
  const avgPercent = (avg * 100).toFixed(0);

  const maxBin = bins.reduce((a, b) => a.count >= b.count ? a : b);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-black border border-zinc-800 shadow-xl rounded-xl p-3 min-w-[150px] z-[9999] relative" style={{ backgroundColor: '#000000', opacity: 1 }}>
          <div className="text-white font-medium mb-1">{item.range}</div>
          <div className="text-2xl font-bold" style={{ color: item.color }}>
            {item.count} negocios
          </div>
          {item.units.length > 0 && (
            <div className="mt-2 pt-2 border-t border-zinc-800 text-xs text-zinc-400 max-h-[150px] overflow-y-auto">
              {item.units.map((name: string) => (
                <div key={name} className="truncate">• {name}</div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <XAxis
              dataKey="range"
              tick={{ fill: "#71717a", fontSize: 10 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={{ stroke: "#3f3f46" }}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={{ stroke: "#3f3f46" }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {bins.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Insights */}
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50">
          <span className="text-2xl">📊</span>
          <div>
            <div className="text-white font-medium">Promedio General</div>
            <div className="text-zinc-400 text-sm">
              El promedio de todos los negocios es <span className="text-purple-400 font-semibold">{avgPercent}%</span>
            </div>
          </div>
        </div>

        {maxBin.count > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: `${maxBin.color}15` }}>
            <span className="text-2xl">📈</span>
            <div>
              <div className="text-white font-medium">Concentración</div>
              <div className="text-zinc-400 text-sm">
                La mayoría de negocios (<span style={{ color: maxBin.color }} className="font-semibold">{maxBin.count}</span>) están en el rango <span style={{ color: maxBin.color }} className="font-semibold">{maxBin.range}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
