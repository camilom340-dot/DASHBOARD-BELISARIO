"use client";
import { RoiTirData } from "@/lib/types";
import clsx from "clsx";

interface InvestmentAnalysisProps {
    roiTir: RoiTirData;
    unitName: string;
}

// Circular gauge component for ROI/TIR
function CircularGauge({
    value,
    label,
    subtitle,
    maxValue = 1,
    size = 140,
    strokeWidth = 12,
    showPercent = true
}: {
    value: number;
    label: string;
    subtitle?: string;
    maxValue?: number;
    size?: number;
    strokeWidth?: number;
    showPercent?: boolean;
}) {
    const normalizedValue = Math.min(Math.max(value / maxValue, -1), 1);
    const isNegative = value < 0;
    const displayValue = Math.abs(value * 100);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.abs(normalizedValue) * circumference;

    const isGood = value >= (maxValue * 0.6); // 60% of max
    const isWarn = value >= 0;

    // Custom logic based on label if needed, or pass colors
    const color = value >= (maxValue === 1 ? 0.5 : maxValue === 0.05 ? 0.015 : 0.15) ? "#22c55e" : value >= 0 ? "#f59e0b" : "#ef4444";
    const bgColor = value >= (maxValue === 1 ? 0.5 : maxValue === 0.05 ? 0.015 : 0.15) ? "rgba(34, 197, 94, 0.1)" : value >= 0 ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)";

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background circle */}
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
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color }}>
                        {isNegative ? "-" : ""}{displayValue.toFixed(1)}{showPercent ? "%" : ""}
                    </span>
                </div>
            </div>
            <div className="mt-2 text-center">
                <div className="text-white font-semibold text-sm">{label}</div>
                {subtitle && <div className="text-zinc-500 text-xs">{subtitle}</div>}
            </div>
        </div>
    );
}

// Recovery timeline component
function RecoveryTimeline({ months, roi }: { months?: number; roi: number }) {
    if (!months) return null;

    const recovered = roi >= 1;
    const progress = Math.min(roi * 100, 100);

    return (
        <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-zinc-400 text-sm">Recuperación de Inversión</span>
                <span className={clsx(
                    "text-sm font-semibold",
                    recovered ? "text-green-400" : "text-yellow-400"
                )}>
                    {recovered ? "✅ Recuperada" : `⏳ ${months} meses`}
                </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                    className={clsx(
                        "h-full rounded-full transition-all duration-1000",
                        recovered ? "bg-gradient-to-r from-green-500 to-emerald-400" : "bg-gradient-to-r from-yellow-500 to-orange-400"
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex justify-between mt-1 text-xs text-zinc-500">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
        </div>
    );
}

// AI-generated investment insight
function getInvestmentInsight(roiTir: RoiTirData, unitName: string): string {
    const { roi, tirAnnual, recoveryMonths } = roiTir;

    if (roi >= 2) {
        return `🚀 ${unitName} es una inversión excepcional con un retorno del ${(roi * 100).toFixed(0)}%. La inversión original ya se ha duplicado.`;
    } else if (roi >= 1) {
        return `✅ ${unitName} ha recuperado la inversión inicial. Con un ROI del ${(roi * 100).toFixed(0)}%, el negocio está generando ganancias netas.`;
    } else if (roi >= 0.5) {
        return `📈 ${unitName} va por buen camino. Ya se ha recuperado el ${(roi * 100).toFixed(0)}% de la inversión${recoveryMonths ? `, estimando recuperación completa en ${recoveryMonths} meses` : ""}.`;
    } else if (tirAnnual > 0 || roiTir.tirMensual > 0) {
        return `⏳ ${unitName} está en fase de crecimiento. El TIR positivo indica que la inversión es viable, pero tomará más tiempo recuperarla.`;
    } else {
        return `⚠️ ${unitName} requiere atención. El TIR negativo sugiere que se necesitan ajustes operativos para mejorar la rentabilidad.`;
    }
}

export function InvestmentAnalysis({ roiTir, unitName }: InvestmentAnalysisProps) {
    const insight = getInvestmentInsight(roiTir, unitName);

    return (
        <div className="glass-card p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center text-2xl">
                    💰
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">Análisis de Inversión</h3>
                    <p className="text-zinc-500 text-sm">ROI y TIR del negocio</p>
                </div>
            </div>

            {/* Gauges Grid */}
            <div className="grid grid-cols-2 gap-6 mb-6">
                <CircularGauge
                    value={roiTir.roi}
                    label="ROI Total"
                    subtitle="Retorno acumulado"
                    maxValue={1}
                />
                <CircularGauge
                    value={roiTir.tirMensual}
                    label="TIR Mensual"
                    subtitle="Rendimiento mensual"
                    maxValue={0.05}
                />
            </div>

            {/* Recovery Timeline */}
            <RecoveryTimeline months={roiTir.recoveryMonths} roi={roiTir.roi} />

            {/* AI Insight */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                <div className="flex items-start gap-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                        <div className="text-xs text-purple-400 font-semibold mb-1">ANÁLISIS INTELIGENTE</div>
                        <p className="text-white text-sm leading-relaxed">{insight}</p>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 rounded-xl bg-zinc-800/50 text-center">
                    <div className={clsx(
                        "text-3xl font-bold",
                        roiTir.roi >= 1 ? "text-green-400" : roiTir.roi >= 0.5 ? "text-yellow-400" : "text-red-400"
                    )}>
                        {(roiTir.roi * 100).toFixed(0)}%
                    </div>
                    <div className="text-zinc-500 text-sm mt-1">ROI Acumulado</div>
                </div>
                <div className="p-4 rounded-xl bg-zinc-800/50 text-center">
                    <div className="text-3xl font-bold text-purple-400">
                        {roiTir.recoveryMonths || "N/A"}
                        {roiTir.recoveryMonths && <span className="text-lg">m</span>}
                    </div>
                    <div className="text-zinc-500 text-sm mt-1">Meses Recuperación</div>
                </div>
            </div>
        </div>
    );
}
