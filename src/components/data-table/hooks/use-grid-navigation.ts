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
  /** Topmost row index; pass -1 to include a header row. @default 0 */
  firstRow?: number;
}

export interface UseGridNavigationResult {
  getCellProps: (row: number, col: number) => GridCellProps;
  getHeaderCellProps: (col: number, isLeafRow: boolean) => GridCellProps;
  onKeyDown: KeyboardEventHandler<HTMLElement> | undefined;
}

const HEADER_CONTROL_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="checkbox"]';

export function useGridNavigation({
  enabled,
  rowCount,
  columnCount,
  firstRow = 0,
}: UseGridNavigationOptions): UseGridNavigationResult {
  const [position, setPosition] = useState<GridPosition>({ row: 0, col: 0 });
  const active = clampGridPosition(position, rowCount, columnCount, firstRow);

  if (!enabled) {
    return { getCellProps: () => ({}), getHeaderCellProps: () => ({}), onKeyDown: undefined };
  }

  const getCellProps = (row: number, col: number): GridCellProps => ({
    tabIndex: row === active.row && col === active.col ? 0 : -1,
    "data-grid-row": row,
    "data-grid-col": col,
    onFocus: () => setPosition({ row, col }),
  });

  return {
    getCellProps,
    getHeaderCellProps: (col, isLeafRow) =>
      isLeafRow && rowCount > 0 ? getCellProps(-1, col) : {},
    onKeyDown: (event) => {
      if (event.altKey || event.metaKey || event.shiftKey) return;
      const table = event.currentTarget;
      const target = event.target as HTMLElement;
      if (!table.contains(target)) return;

      const row = target.getAttribute("data-grid-row");
      const col = target.getAttribute("data-grid-col");

      if (row === null || col === null) {
        if (event.key !== "Escape" || event.ctrlKey) return;
        const header = target.closest<HTMLElement>('[data-grid-row="-1"]');
        if (!header || !table.contains(header)) return;
        event.preventDefault();
        header.focus();
        setPosition({ row: -1, col: Number(header.getAttribute("data-grid-col")) });
        return;
      }

      if (row === "-1" && event.key === "Enter" && !event.ctrlKey) {
        const control = target.querySelector<HTMLElement>(HEADER_CONTROL_SELECTOR);
        if (!control) return;
        event.preventDefault();
        control.focus();
        return;
      }

      const next = nextGridPosition({ row: Number(row), col: Number(col) }, event.key, {
        rowCount,
        columnCount,
        ctrl: event.ctrlKey,
        firstRow,
      });
      if (!next) return;

      event.preventDefault();
      table
        .querySelector<HTMLElement>(
          `[data-grid-row="${next.row}"][data-grid-col="${next.col}"]`,
        )
        ?.focus();
      setPosition(next);
    },
  };
}
