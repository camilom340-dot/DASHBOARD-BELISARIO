export type UnitType = "restaurant" | "disco";
export type AreaId = "ECONOMICO" | "OPERATIVO" | "SERVICIO" | "MERCADEO" | "RRHH";
export type Operator = ">" | ">=" | "<" | "<=";

export interface AreaDef { id: AreaId; name: string; weight: number; order: number; }
export interface KpiDef { id: string; areaId: AreaId; name: string; weightInArea: number; operator: Operator; param: number; format?: "percent" | "currency" | "ratio" | "number"; description?: string; }
export interface KpiResult { kpiId: string; value: number | null; rawValue?: number | string | null; }

export interface RoiTirData {
  tirAnnual: number;      // TIR Anual (e.g., 0.28 = 28%)
  tirMensual: number;     // TIR Mensual
  roi: number;            // ROI (e.g., 2.09 = 209%)
  recoveryMonths?: number; // Período de recuperación en meses
}

export interface Unit { id: string; name: string; type: UnitType; excelScore?: number; roiTir?: RoiTirData; }
export interface UnitPeriodData { unit: Unit; results: Record<string, KpiResult>; }
export interface ScoreBreakdown {
  scoreTotal: number;
  scoreByArea: Record<AreaId, { gained: number; possible: number; coverage: number }>;
  kpiScored: Array<{ kpi: KpiDef; value: number | null; rawValue?: number | string | null; meets: boolean | null; pointsPossible: number; pointsGained: number; pointsLost: number; }>;
}
