"use client";
import { KpiDef, AreaId } from "@/lib/types";
import clsx from "clsx";

interface KpiCardProps {
    kpi: KpiDef;
    value: number | null;
    rawValue?: number | string | null;
    meets: boolean | null;
    pointsGained: number;
    pointsPossible: number;
}

const AREA_COLORS: Record<AreaId, { bg: string; border: string; icon: string }> = {
    ECONOMICO: { bg: "from-emerald-500/20 to-green-500/20", border: "border-emerald-500/30", icon: "💰" },
    OPERATIVO: { bg: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30", icon: "⚙️" },
    SERVICIO: { bg: "from-yellow-500/20 to-orange-500/20", border: "border-yellow-500/30", icon: "⭐" },
    MERCADEO: { bg: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/30", icon: "📢" },
    RRHH: { bg: "from-red-500/20 to-rose-500/20", border: "border-red-500/30", icon: "👥" }
};

// Mini circular progress for each KPI
function MiniGauge({ percent, meets }: { percent: number; meets: boolean | null }) {
    const size = 44;
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(percent / 100, 1) * circumference;

    const color = meets === true ? "#22c55e" : meets === false ? "#ef4444" : "#6b7280";

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {meets === true && <span className="text-green-400 text-sm">✓</span>}
                {meets === false && <span className="text-red-400 text-sm">✗</span>}
                {meets === null && <span className="text-zinc-500 text-xs">N/A</span>}
            </div>
        </div>
    );
}

export function KpiCard({ kpi, value, rawValue, meets, pointsGained, pointsPossible }: KpiCardProps) {
    const areaStyle = AREA_COLORS[kpi.areaId];
    const isNA = value === null;
    const percent = pointsPossible > 0 ? (pointsGained / pointsPossible) * 100 : 0;

    // Format the raw value for display
    const formatValue = (val: number | string | null | undefined): string => {
        if (val === null || val === undefined || val === "") return "Sin dato";
        if (typeof val === "number") {
            if (val < 10 && val > -10) return (val * 100).toFixed(1) + "%";
            return val.toLocaleString("es-CO");
        }
        return String(val);
    };

    const formatOperator = (op: string): string => {
        const map: Record<string, string> = {
            ">": "mayor que",
            ">=": "mayor o igual que",
            "<": "menor que",
            "<=": "menor o igual que"
        };
        return map[op] || op;
    };

    return (
        <div className={clsx(
            "p-4 rounded-xl border bg-gradient-to-br transition-all duration-300 hover:scale-[1.02]",
            areaStyle.bg,
            areaStyle.border
        )}>
            <div className="flex items-start gap-3">
                {/* Gauge */}
                <MiniGauge percent={percent} meets={meets} />

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">{kpi.name}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                        Meta: {formatOperator(kpi.operator)} {kpi.param < 1 && kpi.param > 0 ? (kpi.param * 100) + "%" : kpi.param}
                    </div>

                    {/* Value display */}
                    <div className="mt-2 flex items-center justify-between">
                        <div className={clsx(
                            "text-lg font-bold",
                            meets === true ? "text-green-400" : meets === false ? "text-red-400" : "text-zinc-500"
                        )}>
                            {formatValue(rawValue ?? value)}
                        </div>

                        {!isNA && (
                            <div className="text-xs font-bold flex items-center justify-end">
                                <span className="text-zinc-300">{(pointsGained * 100).toFixed(1)}</span>
                                <span className="text-zinc-500 mx-1">/</span>
                                <span className="text-zinc-500">{(pointsPossible * 100).toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Collapsible area section with KPI cards
interface AreaKpiSectionProps {
    areaId: AreaId;
    areaName: string;
    kpis: Array<{
        kpi: KpiDef;
        value: number | null;
        rawValue?: number | string | null;
        meets: boolean | null;
        pointsGained: number;
        pointsPossible: number;
    }>;
    areaScore: { gained: number; possible: number };
}

export function AreaKpiSection({ areaId, areaName, kpis, areaScore }: AreaKpiSectionProps) {
    const areaStyle = AREA_COLORS[areaId];
    const percent = areaScore.possible > 0 ? (areaScore.gained / areaScore.possible) * 100 : 0;
    const tone = percent > 60 ? "green" : percent >= 35 ? "yellow" : "red";

    // Count stats
    const passed = kpis.filter(k => k.meets === true).length;
    const failed = kpis.filter(k => k.meets === false).length;
    const na = kpis.filter(k => k.meets === null).length;

    return (
        <div className="glass-card p-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{areaStyle.icon}</span>
                    <div>
                        <h4 className="text-white font-semibold">{areaName}</h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span className="text-green-400">✓ {passed}</span>
                            <span className="text-red-400">✗ {failed}</span>
                            {na > 0 && <span className="text-zinc-500">N/A {na}</span>}
                        </div>
                    </div>
                </div>
                <div className={clsx(
                    "px-3 py-1.5 rounded-lg text-lg font-bold",
                    tone === "green" && "bg-green-500/20 text-green-400",
                    tone === "yellow" && "bg-yellow-500/20 text-yellow-400",
                    tone === "red" && "bg-red-500/20 text-red-400"
                )}>
                    {percent.toFixed(0)}%
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-4">
                <div
                    className={clsx(
                        "h-full rounded-full transition-all duration-700",
                        tone === "green" && "bg-gradient-to-r from-green-500 to-emerald-400",
                        tone === "yellow" && "bg-gradient-to-r from-yellow-500 to-orange-400",
                        tone === "red" && "bg-gradient-to-r from-red-500 to-rose-400"
                    )}
                    style={{ width: `${percent}%` }}
                />
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {kpis.map((k, idx) => (
                    <KpiCard
                        key={idx}
                        kpi={k.kpi}
                        value={k.value}
                        rawValue={k.rawValue}
                        meets={k.meets}
                        pointsGained={k.pointsGained}
                        pointsPossible={k.pointsPossible}
                    />
                ))}
            </div>
        </div>
    );
}
