import type { VisibilityState } from "@tanstack/react-table";

import type { ColumnGap } from "../components/data-table/filter-types";

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
