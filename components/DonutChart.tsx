"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { trafficLight } from "@/lib/score";

interface DonutChartProps {
    units: { name: string; score: number }[];
}

export function DonutChart({ units }: DonutChartProps) {
    const greenUnits = units.filter(u => trafficLight(u.score) === "green");
    const yellowUnits = units.filter(u => trafficLight(u.score) === "yellow");
    const redUnits = units.filter(u => trafficLight(u.score) === "red");

    const data = [
        { name: "Sólido", value: greenUnits.length, units: greenUnits, color: "#22c55e", icon: "🟢" },
        { name: "Estable", value: yellowUnits.length, units: yellowUnits, color: "#f59e0b", icon: "🟡" },
        { name: "SOS", value: redUnits.length, units: redUnits, color: "#ef4444", icon: "🔴" }
    ].filter(d => d.value >= 0); // Keep all to show 0 if needed, or filter? User wants to see names.

    const totalUnits = units.length;

    // If all are 0? No, we always have units if stats exist.

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            const percent = totalUnits > 0 ? ((item.value / totalUnits) * 100).toFixed(0) : 0;
            return (
                <div className="bg-black border border-zinc-800 shadow-xl rounded-xl p-3 max-w-[200px] z-[9999] relative" style={{ backgroundColor: '#000000', opacity: 1 }}>
                    <div className="flex items-center gap-2">
                        <span>{item.icon}</span>
                        <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <div className="text-2xl font-bold mt-1" style={{ color: item.color }}>
                        {item.value} negocios
                    </div>
                    <div className="text-zinc-400 text-sm mb-2">{percent}% del total</div>

                    {/* List names */}
                    <div className="text-xs text-zinc-300 border-t border-zinc-700 pt-2 space-y-1 max-h-[150px] overflow-y-auto">
                        {item.units.map((u: any) => (
                            <div key={u.name} className="truncate">• {u.name} ({(u.score * 100).toFixed(0)}%)</div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    const mostCommon = data.reduce((a, b) => a.value >= b.value ? a : b);

    return (
        <div className="relative">
            <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="85%"
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text Removed */}
            </div>

            {/* Legend with Names */}
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-green-400 font-bold text-sm">{greenUnits.length} Sólidos {'>'}60%</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 max-h-[100px] overflow-y-auto w-full px-1 scrollbar-hide">
                        {greenUnits.map(u => (
                            <div key={u.name} className="truncate leading-tight mb-0.5">{u.name}</div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <span className="text-yellow-400 font-bold text-sm">{yellowUnits.length} Estable 35-60%</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 max-h-[100px] overflow-y-auto w-full px-1 scrollbar-hide">
                        {yellowUnits.map(u => (
                            <div key={u.name} className="truncate leading-tight mb-0.5">{u.name}</div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 mb-1">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-red-400 font-bold text-sm">{redUnits.length} SOS {'<'}35%</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 max-h-[100px] overflow-y-auto w-full px-1 scrollbar-hide">
                        {redUnits.map(u => (
                            <div key={u.name} className="truncate leading-tight mb-0.5">{u.name}</div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Insight */}
            <div className="mt-4 p-3 rounded-xl text-center" style={{ backgroundColor: `${mostCommon.color}15`, border: `1px solid ${mostCommon.color}30` }}>
                <span style={{ color: mostCommon.color }} className="font-medium text-sm">
                    {mostCommon.icon} La mayoría está en estado {mostCommon.name.toLowerCase()}
                </span>
            </div>
        </div>
    );
}
