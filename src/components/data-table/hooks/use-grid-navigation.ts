import {
  useEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type KeyboardEventHandler,
  type RefObject,
} from "react";

import {
  clampGridPosition,
  nextGridPosition,
  type GridPosition,
} from "../grid-navigation";
import { focusGridCellNear } from "../grid-focus";

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
  /** Called with the `data-grid-row` index when `Enter` is pressed on a body cell. */
  onActivateRow?: (row: number) => void;
  /** An overlay (drawer) is open; when it closes, focus returns to the active cell. */
  overlayOpen?: boolean;
  /** Elements of the overlay that count as "focus is still in the overlay" on close. */
  isOverlayElement?: (element: Element) => boolean;
}

export interface UseGridNavigationResult {
  getCellProps: (row: number, col: number) => GridCellProps;
  getHeaderCellProps: (col: number, isLeafRow: boolean) => GridCellProps;
  onKeyDown: KeyboardEventHandler<HTMLElement> | undefined;
  tableRef: RefObject<HTMLTableElement | null>;
}

const HEADER_CONTROL_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="checkbox"]';

export function useGridNavigation({
  enabled,
  rowCount,
  columnCount,
  firstRow = 0,
  onActivateRow,
  overlayOpen = false,
  isOverlayElement,
}: UseGridNavigationOptions): UseGridNavigationResult {
  const [position, setPosition] = useState<GridPosition>({ row: 0, col: 0 });
  const active = clampGridPosition(position, rowCount, columnCount, firstRow);
  const tableRef = useRef<HTMLTableElement>(null);
  const overlayWas = useRef(overlayOpen);
  const focusWasInside = useRef(false);

  useEffect(() => {
    const wasOpen = overlayWas.current;
    overlayWas.current = overlayOpen;
    const table = tableRef.current;
    if (!enabled || !table || wasOpen === overlayOpen) return;
    if (overlayOpen) {
      focusWasInside.current = table.contains(document.activeElement);
      return;
    }
    const focused = document.activeElement;
    if (
      focusWasInside.current &&
      (focused === null || focused === document.body || (isOverlayElement?.(focused) ?? false))
    ) {
      focusGridCellNear(table, active.row, active.col);
    }
    focusWasInside.current = false;
  }, [enabled, overlayOpen, isOverlayElement, active.row, active.col]);

  if (!enabled) {
    return {
      getCellProps: () => ({}),
      getHeaderCellProps: () => ({}),
      onKeyDown: undefined,
      tableRef,
    };
  }

  const getCellProps = (row: number, col: number): GridCellProps => ({
    tabIndex: row === active.row && col === active.col ? 0 : -1,
    "data-grid-row": row,
    "data-grid-col": col,
    onFocus: () => setPosition({ row, col }),
  });

  return {
    getCellProps,
    tableRef,
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
        const cell = target.closest<HTMLElement>("[data-grid-row][data-grid-col]");
        if (!cell) return;
        event.preventDefault();
        cell.focus();
        setPosition({
          row: Number(cell.getAttribute("data-grid-row")),
          col: Number(cell.getAttribute("data-grid-col")),
        });
        return;
      }

      if (row !== "-1" && event.key === "Enter" && !event.ctrlKey && onActivateRow) {
        event.preventDefault();
        onActivateRow(Number(row));
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
