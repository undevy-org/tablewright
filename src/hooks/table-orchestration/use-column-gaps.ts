import { useMemo } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import type { ColumnGap, ColumnGroup } from "../../components/data-table/filter-types";
import type { ColumnMetaDef } from "../../components/data-table/types";
import { computeColumnGaps } from "../../lib/column-gaps";

const GAP_WIDTH = 32;

/** Column id of the gap indicator column placed after `afterColumnId` (`null` = at the start). */
export function gapColumnId(afterColumnId: string | null): string {
  return `__gap_after_${afterColumnId ?? "start"}`;
}

/** Gap indicators for hidden columns, plus column meta/widths extended with the gap columns. */
export function useColumnGaps({
  columnGroups,
  toggleableColumnIds,
  columnVisibility,
  columnMeta,
  widths,
}: {
  columnGroups: ColumnGroup[] | undefined;
  toggleableColumnIds: readonly string[];
  columnVisibility: VisibilityState;
  columnMeta: Record<string, ColumnMetaDef>;
  widths: Record<string, number>;
}) {
  const columnGaps = useMemo<ColumnGap[]>(
    () => (columnGroups ? computeColumnGaps(toggleableColumnIds, columnVisibility) : []),
    [columnGroups, toggleableColumnIds, columnVisibility],
  );

  const extendedColumnMeta = useMemo(() => {
    if (columnGaps.length === 0) return columnMeta;
    const meta: Record<string, ColumnMetaDef> = { ...columnMeta };
    for (const gap of columnGaps) meta[gapColumnId(gap.afterColumnId)] = { minW: GAP_WIDTH };
    return meta;
  }, [columnGaps, columnMeta]);

  const extendedWidths = useMemo(() => {
    if (columnGaps.length === 0) return widths;
    const merged: Record<string, number> = { ...widths };
    for (const gap of columnGaps) merged[gapColumnId(gap.afterColumnId)] = GAP_WIDTH;
    return merged;
  }, [widths, columnGaps]);

  return { columnGaps, extendedColumnMeta, extendedWidths };
}
