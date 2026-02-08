import clsx from "clsx";
import { AreaDef, AreaId } from "@/lib/types";

function cellTone(ratio: number) {
  if (ratio >= 0.75) return "bg-emerald-100 text-emerald-900";
  if (ratio >= 0.55) return "bg-amber-100 text-amber-900";
  return "bg-rose-100 text-rose-900";
}

export function Heatmap({ areas, rows, onSelect, selectedUnitId }:{
  areas: AreaDef[];
  rows: Array<{ unitId: string; unitName: string; byArea: Record<AreaId, { gained: number; possible: number; coverage: number }>; }>;
  onSelect:(unitId:string)=>void;
  selectedUnitId?: string | null;
}) {
  return (
    <div className="overflow-auto">
      <table className="min-w-[780px] w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500">
            <th className="text-left font-medium p-2">Unidad</th>
            {areas.map(a => <th key={a.id} className="text-left font-medium p-2">{a.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.unitId} className={clsx("border-t border-zinc-100 hover:bg-zinc-50 cursor-pointer", selectedUnitId === r.unitId && "bg-zinc-50")} onClick={() => onSelect(r.unitId)}>
              <td className="p-2 font-medium text-zinc-900">{r.unitName}</td>
              {areas.map(a => {
                const cell = r.byArea[a.id];
                const ratio = cell.possible > 0 ? cell.gained / cell.possible : 0;
                const cov = cell.coverage;
                return (
                  <td key={a.id} className="p-2">
                    <div className={clsx("rounded-lg px-2 py-1 inline-flex items-center gap-2", cellTone(ratio))}>
                      <span className="tabular-nums">{(ratio*100).toFixed(0)}%</span>
                      <span className="text-[11px] opacity-70">cov {(cov*100).toFixed(0)}%</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
