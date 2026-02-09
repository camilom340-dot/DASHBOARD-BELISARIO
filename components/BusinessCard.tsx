"use client";
import { trafficLight } from "@/lib/score";
import { AreaDef, AreaId, RoiTirData } from "@/lib/types";
import clsx from "clsx";

interface BusinessCardProps {
    rank: number;
    unitId: string;
    unitName: string;
    type: "restaurant" | "disco";
    scoreTotal: number;
    scoreByArea: Record<AreaId, { gained: number; possible: number; coverage: number }>;
    areas: AreaDef[];
    isSelected: boolean;
    onClick: () => void;
    roiTir?: RoiTirData;
}

const AREA_ICONS: Record<AreaId, string> = {
    ECONOMICO: "💰",
    OPERATIVO: "⚙️",
    SERVICIO: "⭐",
    MERCADEO: "📢",
    RRHH: "👥"
};

export function BusinessCard({
    rank,
    unitId,
    unitName,
    type,
    scoreTotal,
    scoreByArea,
    areas,
    isSelected,
    onClick,
    roiTir
}: BusinessCardProps) {
    const tone = trafficLight(scoreTotal);
    const percent = (scoreTotal * 100).toFixed(0);

    const toneColors = {
        green: { bg: "rgba(34, 197, 94, 0.1)", border: "#22c55e", text: "#22c55e" },
        yellow: { bg: "rgba(245, 158, 11, 0.1)", border: "#f59e0b", text: "#f59e0b" },
        red: { bg: "rgba(239, 68, 68, 0.1)", border: "#ef4444", text: "#ef4444" }
    };

    const colors = toneColors[tone];

    const getMedal = (r: number) => {
        if (r === 1) return "🥇";
        if (r === 2) return "🥈";
        if (r === 3) return "🥉";
        return `${r}`;
    };

    return (
        <div
            onClick={onClick}
            className={clsx(
                "glass-card p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02]",
                isSelected && "ring-2 ring-purple-500 animate-pulse-glow"
            )}
        >
            <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold bg-zinc-800">
                    {getMedal(rank)}
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">{type === "restaurant" ? "🍽️" : "🎉"}</span>
                        <span className="font-semibold text-white truncate">{unitName}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">
                        {type === "restaurant" ? "Restaurante" : "Discoteca"}
                    </div>

                    {/* Mini Area Bars */}
                    <div className="mt-3 grid grid-cols-5 gap-1">
                        {areas.map(a => {
                            const s = scoreByArea[a.id];
                            const areaPercent = s.possible > 0 ? (s.gained / s.possible) * 100 : 0;
                            const areaTone = areaPercent > 60 ? "green" : areaPercent >= 35 ? "yellow" : "red";
                            return (
                                <div key={a.id} className="text-center group relative">
                                    <div className="text-xs mb-1">{AREA_ICONS[a.id]}</div>
                                    <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                                        <div
                                            className={clsx(
                                                "h-full rounded-full transition-all duration-500",
                                                areaTone === "green" && "bg-green-500",
                                                areaTone === "yellow" && "bg-yellow-500",
                                                areaTone === "red" && "bg-red-500"
                                            )}
                                            style={{ width: `${areaPercent}%` }}
                                        />
                                    </div>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        {a.name}: {areaPercent.toFixed(0)}%
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ROI/TIR Badges */}
                    {roiTir && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            <div className={clsx(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1",
                                roiTir.roi >= 1 ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                    roiTir.roi >= 0.5 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                        "bg-red-500/20 text-red-400 border border-red-500/30"
                            )}>
                                <span>📈</span>
                                <span>ROI: {(roiTir.roi * 100).toFixed(0)}%</span>
                            </div>
                            <div className={clsx(
                                "px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1",
                                roiTir.tirMensual > 0.015 ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                                    roiTir.tirMensual > 0 ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                                        "bg-red-500/20 text-red-400 border border-red-500/30"
                            )}>
                                <span>💹</span>
                                <span>TIR: {(roiTir.tirMensual * 100).toFixed(2)}%</span>
                            </div>
                            {roiTir.recoveryMonths && (
                                <div className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                                    <span>⏱️</span>
                                    <span>{roiTir.recoveryMonths}m</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Score */}
                <div
                    className="px-4 py-2 rounded-xl text-center"
                    style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
                >
                    <div className="text-2xl font-bold" style={{ color: colors.text }}>
                        {percent}%
                    </div>
                    <div className="text-[10px] uppercase tracking-wide" style={{ color: colors.text }}>
                        Score
                    </div>
                </div>
            </div>
        </div>
    );
}

// Business Grid Component
interface BusinessGridProps {
    areas: AreaDef[];
    rows: Array<{
        unitId: string;
        unitName: string;
        type: "restaurant" | "disco";
        scoreTotal: number;
        scoreByArea: Record<AreaId, { gained: number; possible: number; coverage: number }>;
        roiTir?: RoiTirData;
    }>;
    selectedUnitId: string | null;
    onSelect: (id: string) => void;
}

export function BusinessGrid({ areas, rows, selectedUnitId, onSelect }: BusinessGridProps) {
    if (rows.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                No hay negocios para mostrar
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rows.map((r, i) => (
                <BusinessCard
                    key={r.unitId}
                    rank={i + 1}
                    unitId={r.unitId}
                    unitName={r.unitName}
                    type={r.type}
                    scoreTotal={r.scoreTotal}
                    scoreByArea={r.scoreByArea}
                    areas={areas}
                    isSelected={r.unitId === selectedUnitId}
                    onClick={() => onSelect(r.unitId)}
                    roiTir={r.roiTir}
                />
            ))}
        </div>
    );
}
