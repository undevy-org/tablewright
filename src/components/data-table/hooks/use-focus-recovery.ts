import { useEffect, useRef, type RefObject } from "react";

import {
  findNearestGridCell,
  findNearestHeaderControl,
  getCellPosition,
  type CellPosition,
} from "../grid-focus";

interface Tracked {
  element: Element;
  position: CellPosition;
}

/**
 * Moves focus to the nearest surviving cell when the focused element inside the table disappears
 * (a menu action removed or remounted it) and DOM focus fell to the page. Glue only: the decisions
 * live in `grid-focus.ts`. Holds no React state; the observer exists only while an element is tracked.
 */
export function useFocusRecovery(
  tableRef: RefObject<HTMLTableElement | null>,
  gridActive: boolean,
): void {
  const gridActiveRef = useRef(gridActive);
  useEffect(() => {
    gridActiveRef.current = gridActive;
  }, [gridActive]);

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    let tracked: Tracked | null = null;
    let observer: MutationObserver | null = null;

    const forget = () => {
      tracked = null;
      observer?.disconnect();
      observer = null;
    };

    const recover = () => {
      const lost = tracked;
      if (!lost || lost.element.isConnected) return;
      forget();
      const active = document.activeElement;
      if (active && active !== document.body) return;

      const { position } = lost;
      const target =
        (gridActiveRef.current ? findNearestGridCell(table, position) : null) ??
        (position.region === "head" ? findNearestHeaderControl(table, position) : null);
      target?.focus();
    };

    const onFocusIn = (event: FocusEvent) => {
      // A focusin listener on the table only sees DOM descendants, never a portal's content.
      const element = event.target as Element;
      const position = getCellPosition(table, element);
      if (!position) return;
      tracked = { element, position };
      if (!observer) {
        observer = new MutationObserver(recover);
        observer.observe(document.body, { childList: true, subtree: true });
      }
    };

    table.addEventListener("focusin", onFocusIn);
    return () => {
      table.removeEventListener("focusin", onFocusIn);
      forget();
    };
  }, [tableRef]);
}
