"use client";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";
import { AreaDef, AreaId } from "@/lib/types";

interface AreaRadarChartProps {
    areas: AreaDef[];
    scoreByArea: Record<AreaId, { gained: number; possible: number; coverage: number }>;
}

const AREA_COLORS: Record<AreaId, string> = {
    ECONOMICO: "#3b82f6",
    OPERATIVO: "#8b5cf6",
    SERVICIO: "#22c55e",
    MERCADEO: "#f59e0b",
    RRHH: "#ec4899"
};

const AREA_ICONS: Record<AreaId, string> = {
    ECONOMICO: "💰",
    OPERATIVO: "⚙️",
    SERVICIO: "⭐",
    MERCADEO: "📢",
    RRHH: "👥"
};

export function AreaRadarChart({ areas, scoreByArea }: AreaRadarChartProps) {
    const data = areas.map(a => {
        const s = scoreByArea[a.id];
        const percent = s.possible > 0 ? (s.gained / s.possible) * 100 : 0;
        return {
            area: a.name,
            areaId: a.id,
            value: Math.round(percent),
            fullMark: 100,
            weight: `${(a.weight * 100).toFixed(0)}%`,
            icon: AREA_ICONS[a.id]
        };
    });

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const item = payload[0].payload;
            return (
                <div className="glass-card p-3">
                    <div className="flex items-center gap-2 text-white font-semibold">
                        <span>{item.icon}</span>
                        <span>{item.area}</span>
                    </div>
                    <div className="text-2xl font-bold mt-1" style={{ color: AREA_COLORS[item.areaId as AreaId] }}>
                        {item.value}%
                    </div>
                    <div className="text-zinc-400 text-xs">Peso: {item.weight}</div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                    <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
                    <PolarAngleAxis
                        dataKey="area"
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: "#71717a", fontSize: 10 }}
                        tickCount={5}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Radar
                        name="Score"
                        dataKey="value"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.4}
                        strokeWidth={2}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Area Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-2">
                {areas.map(a => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                        <span>{AREA_ICONS[a.id]}</span>
                        <span className="text-zinc-400">{a.name}</span>
                        <span className="text-zinc-600">({(a.weight * 100).toFixed(0)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
