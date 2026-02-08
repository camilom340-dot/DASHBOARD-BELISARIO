import { Card, Badge } from "@/components/ui";
import { trafficLight } from "@/lib/score";
export function TopCards({ avg, green, yellow, red, top, bottom }:{
  avg:number; green:number; yellow:number; red:number;
  top: { name: string; score: number } | null;
  bottom: { name: string; score: number } | null;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
      <Card className="p-4 md:col-span-2">
        <div className="text-xs text-zinc-500">Promedio score</div>
        <div className="mt-1 flex items-center gap-2">
          <div className="text-2xl font-semibold tabular-nums">{(avg*100).toFixed(0)}%</div>
          <Badge tone={trafficLight(avg)}>{avg.toFixed(4)}</Badge>
        </div>
      </Card>
      <Card className="p-4"><div className="text-xs text-zinc-500">Verde</div><div className="text-2xl font-semibold tabular-nums mt-1">{green}</div></Card>
      <Card className="p-4"><div className="text-xs text-zinc-500">Amarillo</div><div className="text-2xl font-semibold tabular-nums mt-1">{yellow}</div></Card>
      <Card className="p-4"><div className="text-xs text-zinc-500">Rojo</div><div className="text-2xl font-semibold tabular-nums mt-1">{red}</div></Card>
      <Card className="p-4">
        <div className="text-xs text-zinc-500">Top / Bottom</div>
        <div className="mt-2 text-sm">
          <div className="flex items-center justify-between gap-2"><span className="truncate">{top?.name ?? "-"}</span><span className="tabular-nums">{top ? (top.score*100).toFixed(0)+"%" : "-"}</span></div>
          <div className="flex items-center justify-between gap-2 mt-1 text-zinc-600"><span className="truncate">{bottom?.name ?? "-"}</span><span className="tabular-nums">{bottom ? (bottom.score*100).toFixed(0)+"%" : "-"}</span></div>
        </div>
      </Card>
    </div>
  );
}
