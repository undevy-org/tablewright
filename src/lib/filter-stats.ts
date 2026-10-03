import type { ColumnFilterConfig, FilterColumnStats } from "../components/data-table/filter-types";

function getField(row: object, fieldName: string): unknown {
  return (row as Record<string, unknown>)[fieldName];
}

export function computeColumnStats(
  rows: object[],
  fieldName: string,
  config: Pick<ColumnFilterConfig, "type" | "label" | "options">,
): FilterColumnStats | null {
  switch (config.type) {
    case "number-range": {
      let min = Infinity;
      let max = -Infinity;
      for (const row of rows) {
        const val = getField(row, fieldName);
        if (typeof val === "number" && Number.isFinite(val)) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
      if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
      return { type: "number-range", min, max };
    }

    case "text": {
      const seen = new Set<string>();
      const samples: string[] = [];
      for (const row of rows) {
        const val = getField(row, fieldName);
        if (typeof val === "string" && val.length > 0) {
          if (!seen.has(val)) {
            seen.add(val);
            if (samples.length < 3) samples.push(val);
          }
        }
      }
      if (seen.size === 0) return null;
      return { type: "text", samples, totalUnique: seen.size };
    }

    case "date": {
      const valueField = `${fieldName}Value`;
      let min = Infinity;
      let max = -Infinity;
      for (const row of rows) {
        const val = getField(row, valueField);
        if (typeof val === "number" && val > 0) {
          if (val < min) min = val;
          if (val > max) max = val;
        }
      }
      if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
      const toDateStr = (ts: number) => new Date(ts).toISOString().slice(0, 10);
      return { type: "date", min: toDateStr(min), max: toDateStr(max) };
    }

    case "enum": {
      const counts: Record<string, number> = {};
      if (config.options) {
        for (const opt of config.options) counts[opt.value] = 0;
      }
      for (const row of rows) {
        const val = getField(row, fieldName);
        const key = typeof val === "boolean" ? String(val) : typeof val === "string" ? val : null;
        if (key !== null && key in counts) counts[key]++;
      }
      return { type: "enum", counts };
    }

    default:
      return null;
  }
}
