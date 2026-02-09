import { SummaryView } from "@/components/SummaryView";
import { Histogram } from "@/components/Histogram";
import { BusinessGrid } from "@/components/BusinessCard";
import { BarChart3, FileSpreadsheet } from "lucide-react";
import { Unit } from "@/lib/types"; // Need to ensure type exists
import { ParsedScorecard } from "@/lib/excelParser"; // Need areas

// We need the type for unit with score
type UnitWithScore = any; // Will fix type in file

interface DashboardSectionProps {
    title: string;
    icon: React.ReactNode;
    units: UnitWithScore[];
    areas: ParsedScorecard["areas"]; // passed from parent
    isSplitView?: boolean;
    onSelectUnit: (id: string) => void;
    selectedUnitId: string | null;
}

export function DashboardSection({ title, icon, units, areas, isSplitView = false, onSelectUnit, selectedUnitId }: DashboardSectionProps) {
    return (
        <div className="space-y-8">
            {/* 1. Summary View */}
            <SummaryView
                title={title}
                icon={icon}
                units={units}
                isSplitView={isSplitView}
            />

            {/* 2. Histogram */}
            <section className="space-y-4 pt-4">
                <div className="flex items-center gap-3">
                    <BarChart3 className="text-purple-400" />
                    <h2 className="text-xl font-bold text-white">Distribución</h2>
                </div>
                <p className="text-zinc-500 text-sm">Distribución de scores en {title}</p>
                <Histogram units={units.map(u => ({ name: u.name, score: u.score.scoreTotal }))} />
            </section>

            {/* 3. Grid / Ranking */}
            <section className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileSpreadsheet className="text-purple-400" size={20} />
                        Ranking {title}
                    </h2>
                </div>

                <BusinessGrid
                    rows={units.map(u => ({
                        unitId: u.id,
                        unitName: u.name,
                        type: u.type,
                        scoreTotal: u.score.scoreTotal,
                        scoreByArea: u.score.scoreByArea,
                        rank: u.rank, // Note: rank might need re-calculation relative to this subset? 
                        // If we pass filtered units, u.rank is global rank or pre-calculated?
                        // In page.tsx, rank is calculated once for all units. 
                        // For split view, maybe user wants rank within category?
                        // Currently u.rank comes from global calculation.
                        // Let's keep it simple for now or re-calc if needed.
                        roiTir: u.roiTir
                    }))}
                    areas={areas}
                    selectedUnitId={selectedUnitId}
                    onSelect={onSelectUnit}
                    isSplitView={isSplitView} // Need to pass this to grid to adjust columns?
                />
            </section>
        </div>
    );
}
