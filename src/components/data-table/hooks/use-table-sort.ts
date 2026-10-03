import { useCallback, useState } from "react";
import type { SortDirection } from "../types";

export function useTableSort(onSortChange?: () => void) {
  const [sortState, setSortState] = useState<Record<string, SortDirection>>({});

  const toggleSort = useCallback((columnId: string) => {
    setSortState((prev) => {
      const current = prev[columnId] ?? false;
      const next: SortDirection =
        current === false ? "asc" : current === "asc" ? "desc" : false;
      const reset: Record<string, SortDirection> = {};
      for (const k of Object.keys(prev)) reset[k] = false;
      reset[columnId] = next;
      return reset;
    });
    onSortChange?.();
  }, [onSortChange]);

  const applySorting = useCallback(
    <T>(
      items: T[],
      getSortValue: (item: T, col: string) => string | number,
    ): T[] => {
      const activeSortCol = Object.entries(sortState).find(([, dir]) => dir !== false);
      if (!activeSortCol) return items;

      const [col, dir] = activeSortCol;
      const sorted = [...items];
      sorted.sort((a, b) => {
        const va = getSortValue(a, col);
        const vb = getSortValue(b, col);
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return dir === "asc" ? cmp : -cmp;
      });
      return sorted;
    },
    [sortState],
  );

  return { sortState, toggleSort, applySorting };
}
