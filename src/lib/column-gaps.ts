import type { VisibilityState } from "@tanstack/react-table";

import type { ColumnGap } from "../components/data-table/filter-types";

/**
 * Column id of the gap indicator column placed after `afterColumnId` (`null` =
 * at the start). `useTableOrchestration` keys `extendedColumnMeta` /
 * `extendedWidths` by it, so gap columns you define must use the same id.
 */
export function gapColumnId(afterColumnId: string | null): string {
  return `__gap_after_${afterColumnId ?? "start"}`;
}

export function computeColumnGaps(
  orderedColumnIds: readonly string[],
  columnVisibility: VisibilityState,
): ColumnGap[] {
  const gaps: ColumnGap[] = [];
  let lastVisibleId: string | null = null;
  let pendingHidden: string[] = [];

  for (const columnId of orderedColumnIds) {
    if (columnVisibility[columnId] === false) {
      pendingHidden.push(columnId);
    } else {
      if (pendingHidden.length > 0) {
        gaps.push({ afterColumnId: lastVisibleId, hiddenIds: pendingHidden });
        pendingHidden = [];
      }
      lastVisibleId = columnId;
    }
  }

  // Handle trailing hidden columns (gap at the end)
  if (pendingHidden.length > 0) {
    gaps.push({ afterColumnId: lastVisibleId, hiddenIds: pendingHidden });
  }

  return gaps;
}
