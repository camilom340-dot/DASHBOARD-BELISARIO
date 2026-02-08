"use client";
import { AreaDef, AreaId, RoiTirData } from "@/lib/types";
import { ScoreBreakdown } from "@/lib/types";
import clsx from "clsx";

interface AiInsightsProps {
    unitName: string;
    scoreTotal: number;
    scoreByArea: ScoreBreakdown["scoreByArea"];
    areas: AreaDef[];
    kpiScored: ScoreBreakdown["kpiScored"];
    unitType: "restaurant" | "disco";
    roiTir?: RoiTirData;
}

const AREA_NAMES: Record<AreaId, string> = {
    ECONOMICO: "Económico",
    OPERATIVO: "Operativo",
    SERVICIO: "Servicio",
    MERCADEO: "Mercadeo",
    RRHH: "RRHH"
};

// Dictionary of specific recommendations based on KPI names (partial match)
const KPI_RECOMMENDATIONS: Record<string, string[]> = {
    "VENTAS": [
        "Revisar estrategia de precios y mix de productos.",
        "Implementar promociones dirigidas en días de baja afluencia.",
        "Analizar ticket promedio vs. tráfico de clientes."
    ],
    "PRESUPUES": [
        "Ajustar presupuesto operativo a la realidad actual de ventas.",
        "Identificar desviaciones diarias para corrección inmediata.",
        "Revisar metas por turno/día."
    ],
    "COSTO": [
        "Auditar recetas estándar y porciones.",
        "Renegociar precios con proveedores clave.",
        "Revisar desperdicios y mermas en cocina/barra."
    ],
    "NOMINA": [
        "Optimizar horarios del personal según picos de venta.",
        "Evaluar productividad por empleado.",
        "Revisar estructura de horas extras."
    ],
    "GASTOS": [
        "Realizar control estricto de caja menor.",
        "Revisar contratos de servicios y mantenimientos.",
        "Implementar políticas de ahorro de energía/agua."
    ],
    "MARGEN": [
        "Impulsar venta de productos con mayor margen de contribución.",
        "Revisar estructura de costos fijos.",
        "Analizar rentabilidad por categoría de producto."
    ],
    "ROTACION": [
        "Mejorar plan de incentivos y clima laboral.",
        "Reforzar capacitación y onboarding.",
        "Realizar entrevistas de salida para detectar causas raíz."
    ],
    "SATISFACCION": [
        "Implementar encuestas de satisfacción en mesa.",
        "Capacitar al personal en protocolo de servicio.",
        "Reducir tiempos de espera en cocina/barra."
    ],
    "PROMEDIO": [
        "Capacitar meseros en venta sugestiva (upselling).",
        "Revisar ingeniería de menú para destacar platos rentables.",
        "Crear combos o maridajes atractivos."
    ],
    "COBERTURA": [
        "Revisar asignación de personal por zonas.",
        "Evaluar tiempos de atención en horas pico.",
        "Asegurar disponibilidad de herramientas de trabajo."
    ],
    "ACCIDENTAL": [
        "Reforzar capacitación en seguridad y salud en el trabajo.",
        "Revisar estado de equipos e instalaciones.",
        "Implementar pausas activas y uso correcto de EPP."
    ]
};

function getStatusEmoji(score: number): string {
    if (score > 0.6) return "🚀";
    if (score >= 0.35) return "⚠️";
    return "🔴";
}

function getStatusWord(score: number): string {
    if (score > 0.6) return "excelente";
    if (score >= 0.35) return "precaución";
    return "crítico";
}

// Generate overall health narrative including financial context
function generateHealthNarrative(unitName: string, scoreTotal: number, unitType: string, roiTir?: RoiTirData): string {
    const typeLabel = unitType === "restaurant" ? "restaurante" : "discoteca";
    const percent = (scoreTotal * 100).toFixed(0);
    let narrative = "";

    if (scoreTotal > 0.7) {
        narrative = `${unitName} es un ${typeLabel} modelo con un desempeño del ${percent}%, superando sus objetivos estratégicos.`;
    } else if (scoreTotal > 0.6) {
        narrative = `${unitName} muestra un desempeño sólido (${percent}%), cumpliendo la mayoría de sus metas operativas.`;
    } else if (scoreTotal >= 0.35) {
        narrative = `${unitName} opera bajo riesgo moderado (${percent}%), con áreas clave que requieren ajustes tácticos.`;
    } else {
        narrative = `${unitName} enfrenta una situación crítica (${percent}%) que demanda intervención inmediata en su estructura operativa.`;
    }

    // Determine financial impact context
    if (roiTir) {
        if (roiTir.roi < 0 && scoreTotal < 0.5) {
            narrative += " La baja eficiencia operativa está erosionando la rentabilidad y el retorno de la inversión.";
        } else if (roiTir.roi > 0.5 && scoreTotal < 0.5) {
            narrative += " A pesar de buenos retornos financieros, la operación presenta riesgos de sostenibilidad a largo plazo.";
        } else if (roiTir.roi > 0 && scoreTotal > 0.6) {
            narrative += " La excelencia operativa se está traduciendo directamente en salud financiera y retorno de inversión.";
        }
    }

    return narrative;
}

// Generate area-specific insights with correlations
function generateAreaInsights(
    scoreByArea: ScoreBreakdown["scoreByArea"],
    areas: AreaDef[]
): Array<{ areaId: AreaId; insight: string; tone: "good" | "warning" | "bad" }> {
    const insights: Array<{ areaId: AreaId; insight: string; tone: "good" | "warning" | "bad" }> = [];

    // Calculate percentages
    const areaStats = areas.map(a => {
        const s = scoreByArea[a.id];
        return {
            area: a,
            // Use null to indicate N/A (no possible points)
            percent: s.possible > 0 ? (s.gained / s.possible) : null
        };
    })
        .filter(stat => stat.percent !== null) // Exclude N/A areas
        .sort((a, b) => (b.percent as number) - (a.percent as number));

    if (areaStats.length === 0) return insights;

    const best = areaStats[0];
    const worst = areaStats[areaStats.length - 1];

    // Insight 1: Best Area
    if (best.percent! > 0.6) {
        insights.push({
            areaId: best.area.id,
            insight: `Fortaleza Clave: ${AREA_NAMES[best.area.id]} lidera con ${(best.percent! * 100).toFixed(0)}%, impulsando el desempeño general.`,
            tone: "good"
        });
    }

    // Insight 2: Worst Area
    if (worst.percent! < 0.4) {
        insights.push({
            areaId: worst.area.id,
            insight: `Punto Crítico: ${AREA_NAMES[worst.area.id]} es el eslabón más débil (${(worst.percent! * 100).toFixed(0)}%), frenando el crecimiento.`,
            tone: "bad"
        });
    }

    // Insight 3: Strategic Correlations
    // Default to 1 (perfect) if missing to avoid false alarms
    const hr = areaStats.find(a => a.area.id === "RRHH")?.percent ?? 1;
    const service = areaStats.find(a => a.area.id === "SERVICIO")?.percent ?? 1;
    const operational = areaStats.find(a => a.area.id === "OPERATIVO")?.percent ?? 1;
    const economic = areaStats.find(a => a.area.id === "ECONOMICO")?.percent ?? 1;

    if (hr < 0.5 && service < 0.5) {
        insights.push({
            areaId: "RRHH",
            insight: "Correlación Detectada: Falencias en RRHH podrían estar impactando directamente la calidad del servicio al cliente.",
            tone: "warning"
        });
    } else if (operational < 0.5 && economic < 0.5) {
        insights.push({
            areaId: "OPERATIVO",
            insight: "Impacto Financiero: Ineficiencias operativas parecen estar afectando negativamente la rentabilidad del negocio.",
            tone: "bad"
        });
    }

    return insights;
}

// Generate specific, actionable recommendations
function generateRecommendations(
    kpiScored: ScoreBreakdown["kpiScored"],
    scoreTotal: number
): string[] {
    const recommendations: string[] = [];

    // 1. Identify ALL failures, not just critical ones
    // Sort by points lost (impact) and then by strategic weight
    const failures = kpiScored
        .filter(k => k.meets === false) // Any unmet KPI
        .sort((a, b) => {
            // Priority 1: Points lost (Impact on score)
            if (b.pointsLost !== a.pointsLost) return b.pointsLost - a.pointsLost;
            // Priority 2: Strategic Weight
            return b.kpi.weightInArea - a.kpi.weightInArea;
        });

    // Take top 3 failures to generate specific advice
    const topFailures = failures.slice(0, 3);

    topFailures.forEach(fail => {
        // Find specific advice based on KPI name keyword
        const key = Object.keys(KPI_RECOMMENDATIONS).find(k => fail.kpi.name.toUpperCase().includes(k));

        if (key) {
            // Rotate advice based on KPI ID length to give variety across different units/KPIs
            const adviceList = KPI_RECOMMENDATIONS[key];
            const index = fail.kpi.name.length % adviceList.length;
            const advice = adviceList[index];
            recommendations.push(`Acción en ${fail.kpi.name}: ${advice}`);
        } else {
            // Generic advice if no keyword match
            recommendations.push(`Analizar causas raíz del bajo desempeño en "${fail.kpi.name}" y definir metas correctivas.`);
        }
    });

    // 2. Add strategic advice if list is short or score is low
    if (scoreTotal < 0.6 && recommendations.length < 4) {
        recommendations.push("Establecer comités semanales de seguimiento a estos indicadores críticos.");
    }

    // 3. Fallback for excellent scores but with some minor issues
    if (recommendations.length === 0 && scoreTotal < 1) {
        // Find "Warning" KPIs (met but barely) - purely hypothetically, 
        // or just general improvement advice for the lowest scoring area
        recommendations.push("Mantener la excelencia actual y documentar casos de éxito para el equipo.");
        recommendations.push("Evaluar nuevas oportunidades de optimización en costos operativos.");
    }

    return recommendations.slice(0, 5); // Limit to top 5 items
}

export function AiInsights({
    unitName,
    scoreTotal,
    scoreByArea,
    areas,
    kpiScored,
    unitType,
    roiTir
}: AiInsightsProps) {
    const healthNarrative = generateHealthNarrative(unitName, scoreTotal, unitType, roiTir);
    const areaInsights = generateAreaInsights(scoreByArea, areas);
    const recommendations = generateRecommendations(kpiScored, scoreTotal);

    const statusEmoji = getStatusEmoji(scoreTotal);
    const statusWord = getStatusWord(scoreTotal);

    return (
        <div className="glass-card p-6 border border-white/5 bg-gradient-to-b from-zinc-800/50 to-black/50 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20">
                    🧠
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">Análisis Estratégico IA</h3>
                    <p className="text-zinc-400 text-sm">Diagnóstico inteligente en tiempo real</p>
                </div>
            </div>

            {/* Main Health Status */}
            <div className={clsx(
                "p-5 rounded-2xl mb-6 border transition-colors duration-300",
                scoreTotal > 0.6 && "bg-green-500/5 border-green-500/20",
                scoreTotal >= 0.35 && scoreTotal <= 0.6 && "bg-yellow-500/5 border-yellow-500/20",
                scoreTotal < 0.35 && "bg-red-500/5 border-red-500/20"
            )}>
                <div className="flex gap-4">
                    <span className="text-4xl filter drop-shadow-md">{statusEmoji}</span>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className={clsx(
                                "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
                                scoreTotal > 0.6 && "bg-green-500/10 text-green-400",
                                scoreTotal >= 0.35 && scoreTotal <= 0.6 && "bg-yellow-500/10 text-yellow-400",
                                scoreTotal < 0.35 && "bg-red-500/10 text-red-400"
                            )}>
                                {statusWord}
                            </span>
                        </div>
                        <p className="text-zinc-100 text-sm leading-relaxed font-medium opacity-90">{healthNarrative}</p>
                    </div>
                </div>
            </div>

            {/* Insights & Recommendations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Insights Column */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
                        <span>📊</span> Hallazgos Clave
                    </h4>
                    <div className="space-y-3">
                        {areaInsights.length > 0 ? areaInsights.map((insight, idx) => (
                            <div
                                key={idx}
                                className={clsx(
                                    "p-3 rounded-xl text-sm border-l-4 shadow-sm",
                                    insight.tone === "good" && "bg-zinc-800/50 border-green-500 text-zinc-200",
                                    insight.tone === "warning" && "bg-zinc-800/50 border-yellow-500 text-zinc-200",
                                    insight.tone === "bad" && "bg-zinc-800/50 border-red-500 text-zinc-200"
                                )}
                            >
                                {insight.insight}
                            </div>
                        )) : (
                            <div className="text-zinc-500 text-sm italic p-2">Sin hallazgos significativos.</div>
                        )}
                    </div>
                </div>

                {/* Recommendations Column */}
                <div>
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
                        <span>🛡️</span> Plan de Acción
                    </h4>
                    <ul className="space-y-3">
                        {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                            <li key={idx} className="flex gap-3 text-sm p-3 rounded-xl bg-violet-500/5 border border-violet-500/10">
                                <span className="text-violet-400 font-bold mt-px">{(idx + 1)}.</span>
                                <span className="text-zinc-200">{rec}</span>
                            </li>
                        )) : (
                            <li className="text-zinc-500 text-sm italic p-2">Mantener curso actual.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
