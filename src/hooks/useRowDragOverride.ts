import { useRef, useState } from "react";
import { useRowDrag } from "../components/data-table/hooks/use-row-drag";
import type { UseRowDragResult } from "../components/data-table/hooks/use-row-drag";

export interface UseRowDragOverrideResult<TRow> {
  displayRows: TRow[];
  rowDrag: UseRowDragResult;
}

export function useRowDragOverride<TRow extends object>(
  paginatedRows: TRow[],
): UseRowDragOverrideResult<TRow> {
  const [dragOverride, setDragOverride] = useState<TRow[] | null>(null);
  const prevPaginatedRef = useRef<TRow[]>(paginatedRows);

  // Auto-clear override when paginatedRows gets a new reference
  // (sort/filter/page change produces a new array → ref changes → override cleared)
  // eslint-disable-next-line react-hooks/refs
  if (prevPaginatedRef.current !== paginatedRows) {
    // eslint-disable-next-line react-hooks/refs
    prevPaginatedRef.current = paginatedRows;
    if (dragOverride !== null) {
      setDragOverride(null);
    }
  }

  const displayRows = dragOverride ?? paginatedRows;
  const rowDrag = useRowDrag(displayRows, setDragOverride);

  return { displayRows, rowDrag };
}
