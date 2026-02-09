import { ScoreGauge } from "@/components/ScoreGauge";
import { DonutChart } from "@/components/DonutChart";
import { StatCard } from "@/components/ui";
import { Trophy, AlertTriangle } from "lucide-react";
import { Unit } from "@/lib/types"; // Need to ensure Unit has extended props or define locally
import { computeScores, trafficLight } from "@/lib/score";

// We need the type for unit with score
type UnitWithScore = Unit & {
    score: ReturnType<typeof computeScores>;
    rank: number;
};

interface SummaryViewProps {
    title: string;
    icon: React.ReactNode;
    units: UnitWithScore[];
    className?: string;
    isSplitView?: boolean;
}

export function SummaryView({ title, icon, units, className, isSplitView = false }: SummaryViewProps) {
    if (units.length === 0) {
        return (
            <div className={`bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center text-zinc-500 ${className}`}>
                <span className="text-3xl mb-2">∅</span>
                <p>No hay datos disponibles para {title}</p>
            </div>
        );
    }

    const total = units.length;
    const avg = units.reduce((acc, u) => acc + u.score.scoreTotal, 0) / total;
    const best = units[0]; // Assumes units are sorted by score desc
    const worst = units[total - 1];

    return (
        <section className={`space-y-4 ${className}`}>
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-zinc-800/50 text-purple-400">
                    {icon}
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white leading-none">{title}</h2>
                    <p className="text-zinc-500 text-xs mt-1">{total} negocios analizados</p>
                </div>
            </div>

            <div className={`grid gap-4 ${isSplitView ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}>

                {/* Row 1 in Split View: Gauge and Donut side by side? Or stacked? 
            If split view (half screen), 2 columns inside might be tight but doable.
        */}
                <div className={`grid gap-4 ${isSplitView ? "grid-cols-2" : "col-span-2 grid-cols-2"}`}>
                    {/* Avg Score Gauge */}
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        <div className="absolute top-2 left-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Promedio</div>
                        <div className={`w-full ${isSplitView ? "max-w-[180px]" : "max-w-[250px]"} py-2`}>
                            <ScoreGauge score={avg} size={isSplitView ? "md" : "lg"} />
                        </div>
                    </div>

                    {/* Distribution */}
                    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group hover:border-zinc-700 transition-colors">
                        <div className="absolute top-2 left-3 text-xs text-zinc-500 font-medium uppercase tracking-wider">Distribución</div>
                        <div className={`${isSplitView ? "scale-90" : "scale-100"} origin-center w-full`}>
                            <DonutChart units={units.map(u => ({ name: u.name, score: u.score.scoreTotal }))} />
                        </div>
                    </div>
                </div>

                <div className={`${isSplitView ? "grid grid-cols-2 gap-4" : "space-y-4"}`}>
                    <StatCard
                        icon={<Trophy size={18} className={best.score.scoreTotal > 0.6 ? "text-green-400" : "text-yellow-400"} />}
                        label="Líder"
                        value={best.name}
                        subValue={`${(best.score.scoreTotal * 100).toFixed(0)}%`}
                        tone={trafficLight(best.score.scoreTotal)}
                        description="Mayor puntaje"
                        className={isSplitView ? "h-full" : ""}
                    />
                    <StatCard
                        icon={<AlertTriangle size={18} className={worst.score.scoreTotal < 0.35 ? "text-red-400" : "text-yellow-400"} />}
                        label={trafficLight(worst.score.scoreTotal) === "red" ? "Requiere Atención" : "Menor Puntaje"}
                        value={worst.name}
                        subValue={`${(worst.score.scoreTotal * 100).toFixed(0)}%`}
                        tone={trafficLight(worst.score.scoreTotal)}
                        description={trafficLight(worst.score.scoreTotal) === "red" ? "Priorizar mejoras urgentes" : "Oportunidad de mejora"}
                        className={isSplitView ? "h-full" : ""}
                    />
                </div>
            </div>
        </section>
    );
}
