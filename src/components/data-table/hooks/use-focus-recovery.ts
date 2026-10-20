import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

import {
  findNearestGridCell,
  findNearestHeaderControl,
  getCellPosition,
  type CellPosition,
} from "../grid-focus";

// Layout effects warn on the server in React 18; nothing runs there anyway.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

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
  // Synchronously with the commit, so a mutation callback never sees a stale value.
  useIsomorphicLayoutEffect(() => {
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
      const hasGrid = gridActiveRef.current && table.querySelector("[data-grid-row][data-grid-col]");
      const target =
        (hasGrid ? findNearestGridCell(table, position) : null) ??
        (position.region === "head" ? findNearestHeaderControl(table, position) : null);
      target?.focus();
    };

    const onFocusIn = (event: FocusEvent) => {
      const element = event.target;
      if (!(element instanceof Element) || !table.contains(element)) return;
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
