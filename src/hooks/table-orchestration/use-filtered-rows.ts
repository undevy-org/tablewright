import { useMemo } from "react";
import type { ActiveFilter, ViewPreset } from "../../components/data-table/filter-types";

/** Rows after the preset's custom filter, the submitted search and column filters, then sorted. */
export function useFilteredRows<TRow extends object, TViewKey extends string>({
  rows,
  activePreset,
  searchQuery,
  columnFilters,
  currentSort,
  filterRow,
  getSearchText,
  getSortValue,
}: {
  rows: TRow[];
  activePreset: ViewPreset<TRow, TViewKey>;
  searchQuery: string;
  columnFilters: ActiveFilter[];
  currentSort: { columnId: string; direction: "asc" | "desc" } | null;
  filterRow: (row: TRow, filter: ActiveFilter) => boolean;
  getSearchText: (row: TRow) => string;
  getSortValue: (row: TRow, columnId: string) => string | number;
}): TRow[] {
  return useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (activePreset.customFilter && !activePreset.customFilter(row)) return false;
      if (search.length > 0 && !getSearchText(row).includes(search)) return false;
      return columnFilters.every((filter) => filterRow(row, filter));
    });
    if (!currentSort) return filtered;
    const { columnId, direction } = currentSort;
    return [...filtered].sort((a, b) => {
      const aVal = getSortValue(a, columnId);
      const bVal = getSortValue(b, columnId);
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, searchQuery, columnFilters, currentSort, activePreset, getSearchText, filterRow, getSortValue]);
}
