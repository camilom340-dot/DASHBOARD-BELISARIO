import { AreaDef, AreaId, KpiDef, ScoreBreakdown, UnitPeriodData } from "@/lib/types";
export type MissingMode = "excel" | "normalized";

export function trafficLight(scoreTotal: number): "green" | "yellow" | "red" {
  if (scoreTotal > 0.60) return "green";
  if (scoreTotal >= 0.35) return "yellow";
  return "red";
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/**
 * Compute scores from Excel CALIFICACION values.
 * CALIFICACION values are already the points gained (e.g., 0.045, 0.195)
 * We sum them directly to get the area and total scores.
 */
export function computeScores(unitData: UnitPeriodData, areas: AreaDef[], kpis: KpiDef[], mode: MissingMode): ScoreBreakdown {
  const scoreByArea = {} as ScoreBreakdown["scoreByArea"];
  areas.forEach(a => {
    scoreByArea[a.id] = { gained: 0, possible: 0, coverage: 0 };
  });

  const kpisByArea: Record<AreaId, KpiDef[]> = { ECONOMICO: [], OPERATIVO: [], SERVICIO: [], MERCADEO: [], RRHH: [] };
  for (const k of kpis) kpisByArea[k.areaId].push(k);

  const kpiScored: ScoreBreakdown["kpiScored"] = [];

  for (const area of areas) {
    const list = kpisByArea[area.id] ?? [];
    let evaluableCount = 0;
    const totalCount = list.length;
    let areaPossible = 0;

    // Sum the CALIFICACION values (they are already points)
    for (const k of list) {
      const kpiResult = unitData.results[k.id];
      const calificacion = kpiResult?.value ?? null;
      const rawValue = kpiResult?.rawValue ?? null;

      // Points possible is based on area weight and KPI weight
      const kpiMaxPoints = area.weight * k.weightInArea;

      let pointsGained = 0;
      let meets = false;

      if (calificacion !== null && Number.isFinite(calificacion)) {
        evaluableCount++;
        pointsGained = calificacion;
        areaPossible += kpiMaxPoints;
        meets = pointsGained > 0;
      } else {
        // Missing value logic update:
        // Do NOT add to areaPossible. Treat as "N/A" rather than 0.
        // This prevents units without specific KPIs (e.g. Marketing) from getting 0% score in that area.
      }

      // If missing, we don't add to pointsPossible, effectively creating "N/A" behavior
      // But we still track pointsLost relative to hypothetical max? 
      // Current interface expects pointsLost.
      const pointsLost = Math.max(0, kpiMaxPoints - pointsGained);

      scoreByArea[area.id].gained += pointsGained;

      kpiScored.push({
        kpi: k,
        value: calificacion, // keeps null if missing
        rawValue: rawValue ?? null, // Actual indicator value or null
        meets,
        pointsPossible: kpiMaxPoints,
        pointsGained,
        pointsLost
      });
    }

    scoreByArea[area.id].possible = areaPossible;
    scoreByArea[area.id].coverage = totalCount === 0 ? 1 : evaluableCount / totalCount;
  }

  // Calculate total score based on what was possible
  let totalGained = 0;
  let totalPossible = 0;

  for (const a of areas) {
    totalGained += scoreByArea[a.id].gained;
    totalPossible += scoreByArea[a.id].possible;
  }

  // Score is percentage of possible points achieved
  let finalScore = totalPossible > 0 ? totalGained / totalPossible : 0;

  // OVERRIDE: If unit has an explicit Total Score from Excel, use that!
  if (unitData.unit.excelScore !== undefined && mode === "excel") {
    finalScore = unitData.unit.excelScore;
  }

  return { scoreTotal: clamp01(finalScore), scoreByArea, kpiScored };
}
