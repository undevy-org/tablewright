import { useState, type FocusEventHandler, type KeyboardEventHandler } from "react";

import {
  clampGridPosition,
  nextGridPosition,
  type GridPosition,
} from "../grid-navigation";

export interface GridCellProps {
  tabIndex?: number;
  "data-grid-row"?: number;
  "data-grid-col"?: number;
  onFocus?: FocusEventHandler<HTMLElement>;
}

export interface UseGridNavigationOptions {
  enabled: boolean;
  rowCount: number;
  columnCount: number;
}

export interface UseGridNavigationResult {
  getCellProps: (row: number, col: number) => GridCellProps;
  onKeyDown: KeyboardEventHandler<HTMLElement> | undefined;
}

export function useGridNavigation({
  enabled,
  rowCount,
  columnCount,
}: UseGridNavigationOptions): UseGridNavigationResult {
  const [position, setPosition] = useState<GridPosition>({ row: 0, col: 0 });
  const active = clampGridPosition(position, rowCount, columnCount);

  if (!enabled) {
    return { getCellProps: () => ({}), onKeyDown: undefined };
  }

  return {
    getCellProps: (row, col) => ({
      tabIndex: row === active.row && col === active.col ? 0 : -1,
      "data-grid-row": row,
      "data-grid-col": col,
      onFocus: () => setPosition({ row, col }),
    }),
    onKeyDown: (event) => {
      const target = event.target as HTMLElement;
      const row = target.getAttribute("data-grid-row");
      const col = target.getAttribute("data-grid-col");
      if (row === null || col === null) return;
      if (event.altKey || event.metaKey || event.shiftKey) return;

      const next = nextGridPosition({ row: Number(row), col: Number(col) }, event.key, {
        rowCount,
        columnCount,
        ctrl: event.ctrlKey,
      });
      if (!next) return;

      event.preventDefault();
      event.currentTarget
        .querySelector<HTMLElement>(
          `[data-grid-row="${next.row}"][data-grid-col="${next.col}"]`,
        )
        ?.focus();
      setPosition(next);
    },
  };
}
