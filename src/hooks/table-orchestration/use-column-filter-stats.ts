import { useMemo } from "react";
import type {
  ColumnFilterConfig,
  FilterColumnStats,
  FilterStatsSlice,
} from "../../components/data-table/filter-types";
import { computeColumnStats } from "../../lib/filter-stats";

/**
 * Stats per filter, keyed by column id — or `${columnId}:${sub.key}` for each
 * sub-filter of a compound filter. Keys without stats are omitted.
 */
function computeFilterStats<TRow extends object>(
  rows: TRow[],
  filterConfigs: Record<string, ColumnFilterConfig>,
): Record<string, FilterColumnStats> {
  const result: Record<string, FilterColumnStats> = {};
  for (const [columnId, cfg] of Object.entries(filterConfigs)) {
    if (cfg.type === "compound" && cfg.subFilters) {
      for (const sub of cfg.subFilters) {
        const s = computeColumnStats(rows, sub.field, {
          type: sub.type,
          label: sub.label,
          options: sub.options,
        });
        if (s) result[`${columnId}:${sub.key}`] = s;
      }
    } else {
      const s = computeColumnStats(rows, cfg.fieldName ?? columnId, cfg);
      if (s) result[columnId] = s;
    }
  }
  return result;
}

/**
 * `all` stats come from every row; `filtered` from the filtered rows, or
 * `null` while no column filter or search is applied.
 */
export function useColumnFilterStats<TRow extends object>(
  rows: TRow[],
  filteredRows: TRow[],
  filterConfigs: Record<string, ColumnFilterConfig>,
  isFiltered: boolean,
): Record<string, FilterStatsSlice> {
  const allStats = useMemo(() => computeFilterStats(rows, filterConfigs), [rows, filterConfigs]);
  const filteredStats = useMemo(
    () => (isFiltered ? computeFilterStats(filteredRows, filterConfigs) : null),
    [filteredRows, filterConfigs, isFiltered],
  );
  return useMemo(() => {
    const result: Record<string, FilterStatsSlice> = {};
    for (const [key, all] of Object.entries(allStats)) {
      result[key] = { all, filtered: filteredStats?.[key] ?? null };
    }
    return result;
  }, [allStats, filteredStats]);
}
