"use client";

import { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import { parseBelisarioExcel, ParsedScorecard } from "@/lib/excelParser";
import { computeScores, trafficLight, MissingMode } from "@/lib/score";
import { ScoreGauge } from "@/components/ScoreGauge";
import { DonutChart } from "@/components/DonutChart";
import { StatCard } from "@/components/ui";
import { Histogram } from "@/components/Histogram";
import { BusinessGrid } from "@/components/BusinessCard";
import { UnitDetail } from "@/components/UnitDetail";
import { Trophy, AlertTriangle, BarChart3, Upload, FileSpreadsheet, Activity, Trash2 } from "lucide-react";
import clsx from "clsx";

export default function Page() {
  const [parsedData, setParsedData] = useState<ParsedScorecard | null>(null);
  const [mode, setMode] = useState<MissingMode>("excel");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "restaurant" | "disco">("restaurant");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buff = await file.arrayBuffer();
      const parsed = parseBelisarioExcel(buff);
      console.log("Parsed Data:", parsed);
      setParsedData(parsed);
      setSelectedUnitId(null);
    } catch (err) {
      console.error(err);
      alert("Error al leer el archivo. Asegúrate de que sea el Excel correcto.");
    }
  };

  const scores = useMemo(() => {
    if (!parsedData) return {};
    const out: Record<string, ReturnType<typeof computeScores>> = {};
    parsedData.unitData.forEach((ud) => {
      out[ud.unit.id] = computeScores(ud, parsedData.areas, parsedData.kpis, mode);
    });
    return out;
  }, [parsedData, mode]);

  const unitsWithScore = useMemo(() => {
    if (!parsedData) return [];
    return parsedData.units
      .map((u) => {
        const s = scores[u.id];
        return { ...u, score: s };
      })
      .sort((a, b) => b.score.scoreTotal - a.score.scoreTotal)
      .map((u, i) => ({ ...u, rank: i + 1 }));
  }, [parsedData, scores]);

  const filteredUnits = useMemo(() => {
    return unitsWithScore.filter((u) => {
      if (filterType !== "all" && u.type !== filterType) return false;
      if (searchQuery && !u.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [unitsWithScore, filterType, searchQuery]);

  const stats = useMemo(() => {
    if (filteredUnits.length === 0) return null;
    const total = filteredUnits.length;
    const avg = filteredUnits.reduce((acc, u) => acc + u.score.scoreTotal, 0) / total;

    // Traffic light is now calculated inside DonutChart, but we still need counts for stats?
    // Actually stats was just used for DonutChart props. We don't need green/yellow/red here anymore for DonutChart.
    // But we might need them? No, DonutChart takes `units`.
    // Best/Worst are still needed.

    return { total, avg, best: filteredUnits[0], worst: filteredUnits[total - 1] };
  }, [filteredUnits]);

  // View: Unit Detail
  if (selectedUnitId && parsedData) {
    const u = unitsWithScore.find(x => x.id === selectedUnitId);
    if (u) {
      return (
        <UnitDetail
          unit={u}
          areas={parsedData.areas}
          breakdown={u.score}
          onBack={() => setSelectedUnitId(null)}
        />
      );
    }
  }

  // View: Main Dashboard
  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            Dashboard Scorecard
          </h1>
          <p className="text-zinc-400 mt-1">Análisis de desempeño del Grupo Belisario</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => setMode("excel")}
              className={clsx("px-3 py-1.5 rounded-md text-sm transition-all", mode === "excel" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300")}
            >
              Tal cual Excel
            </button>
            <div className="w-[1px] bg-zinc-800 my-1 mx-1" />
            <button
              onClick={() => setMode("normalized")}
              className={clsx("px-3 py-1.5 rounded-md text-sm transition-all", mode === "normalized" ? "gradient-bg text-white shadow-sm font-medium" : "text-zinc-500 hover:text-zinc-300")}
            >
              Normalizado
            </button>
          </div>

          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".xlsx,.xls"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="gradient-btn flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-all active:scale-95"
            >
              <Upload size={18} />
              {parsedData ? "Cargar otro Excel" : "Subir Excel"}
            </button>

            {parsedData && (
              <button
                onClick={() => {
                  if (confirm("¿Estás seguro de borrar los datos y volver al inicio?")) {
                    setParsedData(null);
                  }
                }}
                className="ml-2 p-2.5 rounded-xl bg-zinc-800 hover:bg-red-900/30 text-zinc-400 hover:text-red-400 transition-colors border border-transparent hover:border-red-900/50"
                title="Reiniciar todo"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Tabs Filter */}
      {parsedData && (
        <div className="flex justify-center">
          <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800">
            {[
              { id: "all", label: "Vista General", icon: "📊" },
              { id: "restaurant", label: "Restaurantes", icon: "🍽️" },
              { id: "disco", label: "Discotecas", icon: "🎉" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={clsx(
                  "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  filterType === tab.id
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State / Welcome */}
      {!parsedData && (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
          <div className="w-24 h-24 rounded-3xl gradient-bg flex items-center justify-center shadow-2xl shadow-purple-900/40 mb-4 animate-pulse-slow">
            <FileSpreadsheet size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Carga tu archivo Excel</h2>
          <p className="text-zinc-400 max-w-md mx-auto leading-relaxed">
            Sube el archivo 'SABANA BELISARIO ACUMULADA.xlsx' para generar el dashboard con análisis visual de todos los negocios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left mt-8 max-w-4xl w-full">
            {[
              { num: 1, title: "Sube el Excel", desc: "Haz clic en 'Subir Excel' y selecciona el archivo." },
              { num: 2, title: "Visualiza el resumen", desc: "Verás gráficos con el desempeño de todos los negocios." },
              { num: 3, title: "Analiza cada negocio", desc: "Haz clic en cualquier negocio para ver su análisis detallado." }
            ].map(step => (
              <div key={step.num} className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold mb-3">
                  {step.num}
                </div>
                <h3 className="text-white font-medium mb-1">{step.title}</h3>
                <p className="text-xs text-zinc-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      {parsedData && stats && (
        <>
          {/* Overview Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Activity className="text-purple-400" />
              <h2 className="text-xl font-bold text-white">
                {filterType === "all" ? "Resumen General" : filterType === "restaurant" ? "Resumen Restaurantes" : "Resumen Discotecas"}
              </h2>
            </div>
            <p className="text-zinc-500 text-sm">Vista panorámica del desempeño de {stats.total} negocios</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 flex items-center justify-center">
                <div className="w-full max-w-[250px]">
                  <ScoreGauge score={stats.avg} size="lg" />
                </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6">
                <DonutChart
                  units={filteredUnits.map(u => ({ name: u.name, score: u.score.scoreTotal }))}
                />
              </div>

              <div className="space-y-4">
                <StatCard
                  icon={<Trophy size={20} className="text-yellow-400" />}
                  label="Mejor Negocio"
                  value={stats.best.name}
                  subValue={`${(stats.best.score.scoreTotal * 100).toFixed(0)}% score`}
                  tone="green"
                  description="Negocio con mayor puntaje en el ranking"
                />
                <StatCard
                  icon={<AlertTriangle size={20} className="text-yellow-400" />}
                  label="Requiere Atención"
                  value={stats.worst.name}
                  subValue={`${(stats.worst.score.scoreTotal * 100).toFixed(0)}% score`}
                  tone="red"
                  description="Negocio con menor puntaje, priorizar mejoras"
                />
              </div>
            </div>
          </section>

          {/* Histogram Section */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="text-purple-400" />
              <h2 className="text-xl font-bold text-white">Distribución de Scores</h2>
            </div>
            <p className="text-zinc-500 text-sm">¿Cómo se distribuyen los negocios según su puntaje?</p>

            <Histogram units={filteredUnits.map(u => ({ name: u.name, score: u.score.scoreTotal }))} />
          </section>

          {/* Business Grid Section */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="text-purple-400" size={20} />
                  Ranking de Negocios
                </h2>
                <p className="text-zinc-500 text-sm mt-1">Haz clic en un negocio para ver su análisis detallado</p>
              </div>

              <div className="flex gap-3">
                {/* REMOVED DROPDOWN FILTER HERE, MOVED TO TABS */}

                <input
                  type="text"
                  placeholder="Buscar negocio..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-sm rounded-lg px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 w-48"
                />
              </div>
            </div>

            <BusinessGrid
              rows={filteredUnits.map(u => ({
                unitId: u.id,
                unitName: u.name,
                type: u.type,
                scoreTotal: u.score.scoreTotal,
                scoreByArea: u.score.scoreByArea,
                rank: u.rank,
                roiTir: u.roiTir
              }))}
              areas={parsedData.areas}
              selectedUnitId={selectedUnitId}
              onSelect={setSelectedUnitId}
            />
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-zinc-500 text-sm pb-8">
        <p>Dashboard de Análisis de Desempeño • Grupo Belisario</p>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> &gt;60% Excelente</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> 35-60% Precaución</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> &lt;35% Crítico</span>
        </div>
      </footer>

      {parsedData && (
        <div className="mt-8 p-4 bg-black/50 text-xs font-mono text-zinc-400 overflow-auto max-h-96 whitespace-pre">
          <h3 className="text-white font-bold mb-2">DEBUG INFO (Para soporte)</h3>

          {parsedData.debugLogs && parsedData.debugLogs.length > 0 && (
            <div className="mb-4 p-2 bg-zinc-900 border border-zinc-700 rounded text-zinc-300">
              <strong className="block mb-2 text-purple-400">LOGS DEL PARSER:</strong>
              <div className="max-h-60 overflow-y-auto text-[10px] space-y-0.5">
                {parsedData.debugLogs.map((log, i) => (
                  <div key={i} className={log.includes("skipped") ? "text-red-400/70" : "text-green-400/70"}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

          <strong className="block mb-2 text-purple-400">DATA JSON:</strong>
          {JSON.stringify({
            unitsCount: parsedData.units.length,
            areasCount: parsedData.areas.length,
            kpisCount: parsedData.kpis.length,
            firstUnit: parsedData.units[0],
            firstUnitData: parsedData.unitData[0]?.results ?
              Object.entries(parsedData.unitData[0].results).slice(0, 5).map(([k, v]) => ({ k, val: v.value }))
              : "No results",
            firstUnitScore: parsedData.units.length > 0 ? scores[parsedData.units[0].id] : "N/A",
            sampleKPI: parsedData.kpis[0]
          }, null, 2)}
        </div>
      )}
    </div>
  );
}
