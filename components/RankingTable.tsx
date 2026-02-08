import clsx from "clsx";
import { AreaDef, AreaId, UnitType } from "@/lib/types";
import { Badge } from "@/components/ui";
import { trafficLight } from "@/lib/score";

export function RankingTable({ areas, rows, onSelect, selectedUnitId }:{
  areas: AreaDef[];
  rows: Array<{ unitId: string; unitName: string; type: UnitType; scoreTotal: number; scoreByArea: Record<AreaId, { gained: number; possible: number; coverage: number }>; }>;
  onSelect:(unitId:string)=>void;
  selectedUnitId?: string | null;
}) {
  return (
    <div className="overflow-auto">
      <table className="min-w-[980px] w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500">
            <th className="text-left font-medium p-2">Unidad</th>
            <th className="text-left font-medium p-2">Tipo</th>
            <th className="text-left font-medium p-2">Score</th>
            {areas.map(a => <th key={a.id} className="text-left font-medium p-2">{a.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const tone = trafficLight(r.scoreTotal);
            return (
              <tr key={r.unitId} className={clsx("border-t border-zinc-100 hover:bg-zinc-50 cursor-pointer", selectedUnitId === r.unitId && "bg-zinc-50")} onClick={() => onSelect(r.unitId)}>
                <td className="p-2 font-medium text-zinc-900">{r.unitName}</td>
                <td className="p-2 text-zinc-700">{r.type === "restaurant" ? "Restaurante" : "Discoteca"}</td>
                <td className="p-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={tone}>{(r.scoreTotal*100).toFixed(0)}%</Badge>
                    <span className="text-xs text-zinc-500 tabular-nums">{r.scoreTotal.toFixed(4)}</span>
                  </div>
                </td>
                {areas.map(a => {
                  const s = r.scoreByArea[a.id];
                  const ratio = s.possible > 0 ? s.gained / s.possible : 0;
                  return <td key={a.id} className="p-2 tabular-nums">{(ratio*100).toFixed(0)}%</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
