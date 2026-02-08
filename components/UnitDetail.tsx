"use client";
import { AreaDef, Unit, AreaId } from "@/lib/types";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui";
import { ScoreBreakdown } from "@/lib/types";
import { trafficLight } from "@/lib/score";
import { AreaRadarChart } from "@/components/AreaRadarChart";
import { InvestmentAnalysis } from "@/components/InvestmentAnalysis";
import { AiInsights } from "@/components/AiInsights";
import { AreaKpiSection } from "@/components/KpiCard";

const AREA_ICONS: Record<AreaId, string> = {
  ECONOMICO: "💰",
  OPERATIVO: "⚙️",
  SERVICIO: "⭐",
  MERCADEO: "📢",
  RRHH: "👥"
};

const AREA_DESCRIPTIONS: Record<AreaId, string> = {
  ECONOMICO: "Rentabilidad, ventas, costos y márgenes del negocio",
  OPERATIVO: "Eficiencia en operaciones, inventario y procesos",
  SERVICIO: "Calidad de atención, tiempos y satisfacción del cliente",
  MERCADEO: "Marketing, promociones y posicionamiento de marca",
  RRHH: "Gestión del talento, rotación y clima laboral"
};

export function UnitDetail({ unit, areas, breakdown, onBack }: {
  unit: Unit;
  areas: AreaDef[];
  breakdown: ScoreBreakdown;
  onBack?: () => void;
}) {
  const tone = trafficLight(breakdown.scoreTotal);
  const scorePercent = (breakdown.scoreTotal * 100).toFixed(0);

  const toneLabels = {
    green: { text: "Excelente", emoji: "🟢", gradient: "from-green-500 to-emerald-500" },
    yellow: { text: "Precaución", emoji: "🟡", gradient: "from-yellow-500 to-orange-500" },
    red: { text: "Crítico", emoji: "🔴", gradient: "from-red-500 to-rose-500" }
  };

  const label = toneLabels[tone];

  // Area performance data
  const areaPerformance = areas.map(a => {
    const s = breakdown.scoreByArea[a.id];
    const percent = s.possible > 0 ? (s.gained / s.possible) * 100 : 0;
    const areaTone: "green" | "yellow" | "red" = percent > 60 ? "green" : percent >= 35 ? "yellow" : "red";
    return {
      area: a,
      percent,
      tone: areaTone,
      icon: AREA_ICONS[a.id],
      description: AREA_DESCRIPTIONS[a.id]
    };
  }).sort((a, b) => b.percent - a.percent);

  // Filter KPIs by unit type for proper display
  const filteredKpiScored = breakdown.kpiScored.filter(k =>
    k.kpi.id.startsWith(unit.type)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-r ${label.gradient} opacity-5`} />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/20">
              {unit.type === "restaurant" ? "🍽️" : "🎉"}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{unit.name}</h2>
              <p className="text-zinc-400 mt-1">{unit.type === "restaurant" ? "Restaurante" : "Discoteca"}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl">{label.emoji}</span>
                <span className={`font-semibold ${tone === "green" ? "text-green-400" :
                    tone === "yellow" ? "text-yellow-400" : "text-red-400"
                  }`}>{label.text}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Main Score Circle */}
            <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center ${tone === "green" ? "bg-green-500/10 border-2 border-green-500" :
                tone === "yellow" ? "bg-yellow-500/10 border-2 border-yellow-500" :
                  "bg-red-500/10 border-2 border-red-500"
              }`}>
              <div className={`text-4xl font-bold ${tone === "green" ? "text-green-400" :
                  tone === "yellow" ? "text-yellow-400" : "text-red-400"
                }`}>
                {scorePercent}%
              </div>
              <div className="text-xs text-zinc-400">Score Total</div>
            </div>

            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-sm transition-colors"
              >
                ← Volver
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights + Investment Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <AiInsights
          unitName={unit.name}
          scoreTotal={breakdown.scoreTotal}
          scoreByArea={breakdown.scoreByArea}
          areas={areas}
          kpiScored={filteredKpiScored}
          unitType={unit.type}
          roiTir={unit.roiTir}
        />

        {/* Investment Analysis (if available) */}
        {unit.roiTir ? (
          <InvestmentAnalysis roiTir={unit.roiTir} unitName={unit.name} />
        ) : (
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center text-2xl">
                💰
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Análisis de Inversión</h3>
                <p className="text-zinc-500 text-sm">Datos no disponibles</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <span className="text-4xl mb-3">📊</span>
              <p>No hay datos de ROI/TIR para este negocio</p>
            </div>
          </div>
        )}
      </div>

      {/* Area Performance Visual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card>
          <CardHeader
            icon="🕸️"
            title="Mapa de Desempeño"
            subtitle="Vista panorámica de las 5 áreas de evaluación"
          />
          <CardBody>
            <AreaRadarChart areas={areas} scoreByArea={breakdown.scoreByArea} />
          </CardBody>
        </Card>

        {/* Area Summary Cards */}
        <Card>
          <CardHeader
            icon="📊"
            title="Resumen por Área"
            subtitle="Rendimiento de cada área estratégica"
          />
          <CardBody>
            <div className="space-y-3">
              {areaPerformance.map(({ area, percent, tone, icon, description }) => (
                <div key={area.id} className="p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-800/70 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <span className="font-medium text-white">{area.name}</span>
                        <div className="text-xs text-zinc-500">{(area.weight * 100).toFixed(0)}% del total</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-lg font-bold ${tone === "green" ? "bg-green-500/20 text-green-400" :
                        tone === "yellow" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                      }`}>
                      {percent.toFixed(0)}%
                    </div>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${tone === "green" ? "bg-gradient-to-r from-green-500 to-emerald-400" :
                          tone === "yellow" ? "bg-gradient-to-r from-yellow-500 to-orange-400" :
                            "bg-gradient-to-r from-red-500 to-rose-400"
                        }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Detailed KPIs by Area - Visual Cards instead of tables */}
      <h3 className="text-xl font-bold text-white flex items-center gap-2">
        <span>📋</span> Detalle de Indicadores por Área
      </h3>

      <div className="space-y-6">
        {areas.map(area => {
          const areaKPIs = filteredKpiScored.filter(k => k.kpi.areaId === area.id);
          const areaScore = breakdown.scoreByArea[area.id];
          if (areaKPIs.length === 0) return null;

          return (
            <AreaKpiSection
              key={area.id}
              areaId={area.id}
              areaName={area.name}
              kpis={areaKPIs.map(k => ({
                kpi: k.kpi,
                value: k.value,
                rawValue: k.rawValue,
                meets: k.meets,
                pointsGained: k.pointsGained,
                pointsPossible: k.pointsPossible
              }))}
              areaScore={areaScore}
            />
          );
        })}
      </div>
    </div>
  );
}
