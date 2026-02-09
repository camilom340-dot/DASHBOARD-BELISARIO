import * as XLSX from "xlsx";
import { AreaDef, AreaId, KpiDef, Operator, Unit, UnitPeriodData, RoiTirData } from "@/lib/types";

export const DEFAULT_AREAS: AreaDef[] = [
  { id: "ECONOMICO", name: "Económico", weight: 0.65, order: 1 },
  { id: "OPERATIVO", name: "Operativo", weight: 0.10, order: 2 },
  { id: "SERVICIO", name: "Servicio", weight: 0.10, order: 3 },
  { id: "MERCADEO", name: "Mercadeo", weight: 0.10, order: 4 },
  { id: "RRHH", name: "RRHH", weight: 0.05, order: 5 },
];

const AREA_ALIASES: Record<AreaId, RegExp[]> = {
  ECONOMICO: [/ECONOM/i, /ECONÓM/i],
  OPERATIVO: [/OPERATIV/i],
  SERVICIO: [/SERVIC/i],
  MERCADEO: [/MERCAD/i],
  RRHH: [/RRHH/i, /R\s*R\s*H\s*H/i, /TALENTO/i],
};

const asString = (v: any) => String(v ?? "").trim();

function asNumber(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === 'number') return v; // Already a number
  const s = String(v).trim();
  if (/^SI$/i.test(s)) return 1;
  if (/^NO$/i.test(s)) return 0;

  // Handle percentages
  if (s.endsWith('%')) {
    const num = parseFloat(s.replace('%', ''));
    return isFinite(num) ? num / 100 : null;
  }

  // Handle commas as decimal separators if needed, but be careful with thousands
  // simple approach: replace comma with dot if it looks like a decimal
  const cleaned = s.replace(/,/g, ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function detectOperator(text: string): Operator {
  const t = text.replace(/\s+/g, "");
  if (t.includes(">=")) return ">=";
  if (t.includes("<=")) return "<=";
  if (t.includes(">")) return ">";
  if (t.includes("<")) return "<";
  return ">=";
}

type SheetMatrix = any[][];

function sheetToMatrix(ws: XLSX.WorkSheet): SheetMatrix {
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");
  const out: any[][] = [];
  for (let r = range.s.r; r <= range.e.r; r++) {
    const row: any[] = [];
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      row.push(ws[addr]?.v ?? null);
    }
    out.push(row);
  }
  return out;
}

interface UnitColumn {
  unitId: string;
  unitName: string;
  calificacionCol: number;
}

function getUnitColumns(matrix: SheetMatrix, logs: string[]): { units: Unit[]; cols: UnitColumn[] } {
  // Based on debug output:
  // Row 0: Sheet title ("RESTAURANTES" or "DISCOTECAS")
  // Row 1: Unit names at cols 6, 8, 10... (BELISARIO, CABRA ANDALUZ, etc.)
  // Row 2: Headers INDICADOR/CALIFICACION
  // CALIFICACION is at cols 7, 9, 11...
  const nameRowIdx = 1;  // Unit names are in Row 1, not Row 0
  const headerRowIdx = 2;

  const headerRow = matrix[headerRowIdx]?.map(asString) || [];
  const nameRow = matrix[nameRowIdx] || [];

  // DEBUG: Log what's in these rows
  logs.push(`getUnitColumns: nameRow(${nameRowIdx}) first 12 cols: ${nameRow.slice(0, 12).map((v: any, i: number) => `C${i}=${JSON.stringify(v)}`).join(" | ")}`);
  logs.push(`getUnitColumns: headerRow(${headerRowIdx}) first 12 cols: ${headerRow.slice(0, 12).map((v: any, i: number) => `C${i}=${JSON.stringify(v)}`).join(" | ")}`);

  const cols: UnitColumn[] = [];
  const units: Unit[] = [];

  // Find CALIFICACION columns - unit name is at c-1 in nameRow
  for (let c = 0; c < headerRow.length; c++) {
    if (/^CALIFICACI[OÓ]N$/i.test(headerRow[c])) {
      // Unit name is in column c-1 of the name row
      const unitName = asString(nameRow[c - 1]);
      logs.push(`  Found CALIFICACION at col ${c}, nameRow[${c - 1}] = "${unitName}"`);

      if (!unitName || unitName.length < 2) {
        logs.push(`    SKIPPED: empty or short name`);
        continue;
      }
      if (/PESO|AREA|INDICADOR|PARAM/i.test(unitName)) {
        logs.push(`    SKIPPED: filtered word`);
        continue;
      }

      const unitId = unitName.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_áéíóúñ]/gi, "");

      if (!cols.find(x => x.unitId === unitId)) {
        cols.push({ unitId, unitName, calificacionCol: c });
        units.push({ id: unitId, name: unitName, type: "restaurant" });
        logs.push(`    ADDED unit: ${unitName}`);
      }
    }
  }

  return { units, cols };
}

interface KpiRow {
  areaId: AreaId;
  rowIdx: number;
  name: string;
  weightInArea: number;
  operator: Operator;
  param: number;
}

interface KpiScanResult {
  rows: KpiRow[];
  logs: string[];
}

function scanKpiRows(matrix: SheetMatrix): KpiScanResult {
  const rows: KpiRow[] = [];
  const logs: string[] = [];
  let currentArea: AreaId | null = null;

  // Data starts at row 2 (index 2), NOT row 3!
  // Row 0: Unit names
  // Row 1: Headers (INDICADOR, CALIFICACION, etc)
  // Row 2+: Data with Area names in col 2
  for (let r = 2; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.length < 7) continue;

    // DEBUG: Log first 10 cols of first 5 data rows
    if (r < 7) {
      const cols = row.slice(0, 10).map((v: any, i: number) => `C${i}=${JSON.stringify(v)}`).join(" | ");
      logs.push(`DEBUG Row ${r}: ${cols}`);
    }

    // ACTUAL Column structure (from debug):
    // C0: PESO_AREA (0.65)
    // C1: AREA_NAME ("ECONOMICO")
    // C2: PESO_KPI (0.07)
    // C3: KPI_NAME ("CRECIMIENTO VENTAS")
    // C4: OPERATOR (">")
    // C5: PARAMETER (0.03)
    // C6: INDICADOR for unit 1
    // C7: CALIFICACION for unit 1
    const areaName = asString(row[1]);     // C1: Area name
    const kpiWeight = asNumber(row[2]);    // C2: KPI weight  
    const kpiName = asString(row[3]);      // C3: KPI name
    const operator = asString(row[4]);     // C4: Operator
    const param = asNumber(row[5]);        // C5: Parameter

    // Check if this row defines a new area
    for (const areaId of Object.keys(AREA_ALIASES) as AreaId[]) {
      if (AREA_ALIASES[areaId].some(rx => rx.test(areaName))) {
        currentArea = areaId;
        logs.push(`Row ${r}: Found Area "${areaId}" (matched "${areaName}")`);
        break;
      }
    }

    if (!currentArea) {
      if (r < 20) logs.push(`Row ${r} skipped: No area active yet. areaName="${areaName}"`);
      continue;
    }

    // Validate this is a KPI row
    if (!kpiName || kpiName.length < 2) {
      continue;
    }
    if (/TOTAL|CALIFICACI|INDICADOR|^PESO$/i.test(kpiName)) {
      continue;
    }
    // We expect a valid weight
    if (kpiWeight === null || kpiWeight <= 0 || kpiWeight > 1) {
      if (!/TOTAL/i.test(kpiName)) {
        logs.push(`Row ${r} skipped: Invalid weight ${kpiWeight} for "${kpiName}" in ${currentArea}`);
      }
      continue;
    }

    logs.push(`Row ${r} ADDED: ${kpiName} (${currentArea}) W=${kpiWeight}`);

    rows.push({
      areaId: currentArea,
      rowIdx: r,
      name: kpiName,
      weightInArea: kpiWeight,
      operator: detectOperator(operator),
      param: param ?? 0
    });
  }

  // Remove duplicates
  const seen = new Set<string>();
  const uniqueRows = rows.filter(x => {
    const key = `${x.areaId}::${x.name.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { rows: uniqueRows, logs };
}

export interface ParsedScorecard {
  areas: AreaDef[];
  kpis: KpiDef[];
  units: Unit[];
  unitData: UnitPeriodData[];
  debugLogs: string[];
}

export function parseBelisarioExcel(file: ArrayBuffer): ParsedScorecard {
  const wb = XLSX.read(file, { type: "array" });
  const wsRest = wb.Sheets["RESTAURANTES"];
  const wsDisco = wb.Sheets["DISCOTECAS"];
  if (!wsRest && !wsDisco) throw new Error("No encontré hojas 'RESTAURANTES' ni 'DISCOTECAS'.");

  const areas = DEFAULT_AREAS;
  const kpis: KpiDef[] = [];
  const units: Unit[] = [];
  const unitData: UnitPeriodData[] = [];
  const allLogs: string[] = [];

  function parseSheet(ws: XLSX.WorkSheet, type: Unit["type"]) {
    const matrix = sheetToMatrix(ws);
    const { units: sheetUnits, cols } = getUnitColumns(matrix, allLogs);
    sheetUnits.forEach(u => (u.type = type));

    const { rows: kpiRows, logs } = scanKpiRows(matrix);
    allLogs.push(`--- Sheet ${type} ---`);
    allLogs.push(`Found ${sheetUnits.length} units: ${sheetUnits.map(u => u.name).join(", ")}`);
    allLogs.push(...logs);

    // Add KPIs if not already present
    for (const r of kpiRows) {
      const id = `${type}_${r.areaId}_${r.name}`.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_áéíóúñ]/gi, "");
      if (!kpis.find(k => k.id === id)) {
        kpis.push({
          id,
          areaId: r.areaId,
          name: r.name,
          weightInArea: r.weightInArea,
          operator: r.operator,
          param: r.param
        });
      }
    }

    // Extract data for each unit
    for (const u of sheetUnits) {
      const col = cols.find(c => c.unitId === u.id);
      if (!col) continue;

      const results: UnitPeriodData["results"] = {};

      for (const r of kpiRows) {
        const id = `${type}_${r.areaId}_${r.name}`.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_áéíóúñ]/gi, "");
        const rawScore = matrix[r.rowIdx]?.[col.calificacionCol];
        const rawIndicador = matrix[r.rowIdx]?.[col.calificacionCol - 1]; // Column before score is Indicator
        const value = asNumber(rawScore);
        if (value !== null) {
          // Add to unit.excelScore (Sum of points)
          if (!u.excelScore) u.excelScore = 0;
          u.excelScore += value;

          if (u.name.includes("WAN") || u.name.includes("POSADA")) {
            allLogs.push(`AUDIT ${u.name}: +${value.toFixed(4)} from ${r.name} (Total: ${u.excelScore.toFixed(4)})`);
          }
        }

        // DEBUG: Log all Mercadeo values or suspicious zeros to find missing data
        if (r.areaId === "MERCADEO" || (value === 0 && r.weightInArea > 0.05)) {
          if (r.areaId === "MERCADEO") {
            allLogs.push(`DEBUG MERCADEO: ${u.name} - ${r.name} (R${r.rowIdx}:C${col.calificacionCol}) Score="${rawScore}" Ind="${rawIndicador}" Val=${value} TotalScore=${(u.excelScore || 0).toFixed(4)}`);
          }
        }

        // DEBUG SPECIFIC ISSUES
        if ((u.name.includes("SAN LUCAS") && r.areaId === "SERVICIO") ||
          (u.name.includes("FABULOSA") && r.areaId === "MERCADEO")) {
          allLogs.push(`DEBUG DATA: ${u.name} [${r.areaId}] ${r.name} (Row ${r.rowIdx}, Col ${col.calificacionCol}) Score="${rawScore}" Ind="${rawIndicador}" Val=${value}`);
        }

        results[id] = { kpiId: id, value, rawValue: rawIndicador };
      }

      if (!units.find(x => x.id === u.id)) {
        units.push(u);
      }
      unitData.push({ unit: u, results });
    }

    // After scanning all KPIs, unit.excelScore holds the SUM.
    // If it's still 0 (and no KPIs found?), it remains 0.
    for (const u of sheetUnits) {
      allLogs.push(`FINAL SUMMATION SCORE for ${u.name}: ${u.excelScore?.toFixed(4)} (${(u.excelScore ?? 0) * 100}%)`);
    }
  }

  if (wsRest) parseSheet(wsRest, "restaurant");
  if (wsDisco) parseSheet(wsDisco, "disco");

  // Normalize weights within each area, SEPARATELY for Restaurant and Disco
  const sumsRest: Record<AreaId, number> = { ECONOMICO: 0, OPERATIVO: 0, SERVICIO: 0, MERCADEO: 0, RRHH: 0 };
  const sumsDisco: Record<AreaId, number> = { ECONOMICO: 0, OPERATIVO: 0, SERVICIO: 0, MERCADEO: 0, RRHH: 0 };

  for (const k of kpis) {
    if (k.id.includes("restaurant")) sumsRest[k.areaId] += k.weightInArea;
    else if (k.id.includes("disco")) sumsDisco[k.areaId] += k.weightInArea;
  }

  for (const k of kpis) {
    let sum = 0;
    if (k.id.includes("restaurant")) sum = sumsRest[k.areaId];
    else if (k.id.includes("disco")) sum = sumsDisco[k.areaId];

    if (sum > 0) {
      k.weightInArea = k.weightInArea / sum;
    }
  }
  // Parse ROI/TIR sheet if it exists
  const wsRoiTir = wb.Sheets["ROI   TIR"];
  if (wsRoiTir) {
    const roiMatrix = sheetToMatrix(wsRoiTir);
    allLogs.push("--- Parsing ROI/TIR Sheet ---");
    allLogs.push(`Active Units in System: ${units.map(u => u.name).join(", ")}`);

    // Scan for business blocks (name followed by INVERSION row)
    for (let r = 0; r < roiMatrix.length - 1; r++) {
      const cellC2 = roiMatrix[r]?.[2];
      const nextRowC2 = roiMatrix[r + 1]?.[2];

      if (cellC2 && typeof cellC2 === 'string' && nextRowC2 === 'INVERSION') {
        const businessName = String(cellC2).trim().toUpperCase();
        allLogs.push(`ROI/TIR: Found business "${businessName}" at row ${r}`);

        // Look for TIR and ROI in next 8 rows
        let tirAnnual: number | null = null;
        let tirMensual: number | null = null;
        let roi: number | null = null;
        let recoveryMonths: number | undefined = undefined;

        // Collect explicit orphans to smart assign later
        const tirOrphans: number[] = [];

        for (let offset = 2; offset <= 8; offset++) {
          const label = roiMatrix[r + offset]?.[2];
          const value = roiMatrix[r + offset]?.[3];
          const suffix = roiMatrix[r + offset]?.[4];
          const extraCol = roiMatrix[r + offset]?.[5];

          if (label === 'TIR' && typeof value === 'number') {
            const suffixStr = String(suffix || '').toUpperCase();
            // Debug log
            allLogs.push(`DEBUG TIR [${businessName}]: Val=${value} Suffix=${suffixStr}`);

            if (suffixStr.includes('ANNUAL') || suffixStr.includes('ANUAL')) {
              tirAnnual = value;
            } else if (suffixStr.includes('MES') || suffixStr.includes('MENSUAL')) {
              tirMensual = value;
            } else {
              tirOrphans.push(value);
            }

          } else if (label === 'ROI' && typeof value === 'number') {
            roi = value;

            // Check Col 4 (suffix) for the "Real TIR" (e.g. 2.60%)
            // It might come as a string "2,60%" or a raw number 0.026
            const potentialTir = roiMatrix[r + offset]?.[4];
            const parsedTir = asNumber(potentialTir);

            if (parsedTir !== null) {
              // User wants EXACTLY this value as the main TIR. 
              // We'll assign it to tirMensual which is what's displayed next to ROI usually
              tirMensual = parsedTir;
            }

            // Try to extract recovery months from extraCol (Col 5) or suffix if parsing failed
            const recoveryStr = String(extraCol || suffix || '');
            const match = recoveryStr.match(/(\d+)\s*MESES?/i);
            if (match) {
              recoveryMonths = parseInt(match[1], 10);
            }
          }
        }

        // Assign orphans if slots are explicit slots are missing
        if (tirOrphans.length > 0) {
          // Sort orphans by ABSOLUTE value descending
          tirOrphans.sort((a, b) => Math.abs(b) - Math.abs(a));

          if (tirAnnual === null && tirOrphans.length > 0) tirAnnual = tirOrphans[0];
          if (tirMensual === null && tirOrphans.length > 0) tirMensual = tirOrphans[1] ?? tirOrphans[0];
        }


        if (tirAnnual !== null && roi !== null) {
          const roiTirData: RoiTirData = {
            tirAnnual,
            tirMensual: tirMensual ?? 0,
            roi,
            recoveryMonths
          };

          // Find ALL matching units (handle combined entries like "SUPER 8 Y CIEN FUEGOS")
          const matchedUnits = units.filter(u => {
            const uName = u.name.toUpperCase().replace(/\s+/g, ' ').trim();
            const bName = businessName.replace(/\s+/g, ' ').trim();

            // 1. Direct or partial match
            const isDirectMatch = uName === bName ||
              uName.includes(bName) ||
              bName.includes(uName) ||
              (uName.startsWith(bName.split(' ')[0]) && bName.split(' ')[0].length > 3);

            // 2. Handle combined names in Excel (e.g. "SUPER 8 Y CIEN FUEGOS")
            // Check if businessName has " Y " (split indicator)
            const isCombinedMatch = bName.includes(" Y ") && bName.split(/\s+Y\s+/).some(part => {
              const cleanPart = part.trim();
              if (cleanPart.length < 3) return false;

              // Special mapping: "CIEN FUEGOS" matches "100 FUEGOS"
              if (cleanPart === "CIEN FUEGOS" && (uName.includes("100 FUEGOS") || uName.includes("CIEN FUEGOS"))) return true;

              return uName.includes(cleanPart) || cleanPart.includes(uName);
            });

            // 3. FORCE MATCH for known hard cases if generic logic fails
            // If the Excel row is "SUPER 8 Y CIEN FUEGOS", match anything that looks like Super 8 or 100 Fuegos
            if (bName.includes("SUPER 8") && bName.includes("CIEN FUEGOS")) {
              if (uName.includes("SUPER 8") || uName.includes("100 FUEGOS") || uName.includes("CIEN FUEGOS")) return true;
            }

            return isDirectMatch || isCombinedMatch;
          });

          if (matchedUnits.length > 0) {
            matchedUnits.forEach(matched => {
              matched.roiTir = roiTirData;
              allLogs.push(`  Matched to unit "${matched.name}" - TIR Annual: ${(tirAnnual! * 100).toFixed(1)}%, ROI: ${(roi! * 100).toFixed(0)}%`);
            });
          } else {
            allLogs.push(`  WARNING: No matching unit found for "${businessName}"`);
          }
        }
      }
    }
  }

  return { areas, kpis, units, unitData, debugLogs: allLogs };
}
