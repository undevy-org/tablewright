import { useEffect, useMemo, useState } from "react";

const EMPTY_ID_SET: ReadonlySet<string> = new Set<string>();

/**
 * Responsive column collapse (P1/P2/P3). Only P3 columns collapse below
 * `wideBreakpoint`; `isCompact` flips below `compactBreakpoint` so consumers
 * can switch to a card layout. Both start at their "wide" values so the first
 * client render matches server HTML.
 */
export function useResponsiveColumns(
  columnPriorities: Record<string, 2 | 3> | undefined,
  wideBreakpoint: number,
  compactBreakpoint: number,
): { responsiveHiddenColumnIds: ReadonlySet<string>; isCompact: boolean } {
  const hasPriorities = Boolean(columnPriorities && Object.keys(columnPriorities).length > 0);
  const [isWide, setIsWide] = useState(true);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (!hasPriorities || typeof window === "undefined") return;
    const mql = window.matchMedia(`(min-width: ${wideBreakpoint}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsWide(e.matches);
    // Read the real width after mount (initial state matches server HTML).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsWide(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [hasPriorities, wideBreakpoint]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${compactBreakpoint - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsCompact(e.matches);
    // Read the real width after mount (initial state matches server HTML).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsCompact(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [compactBreakpoint]);

  const responsiveHiddenColumnIds = useMemo<ReadonlySet<string>>(() => {
    if (isWide || !columnPriorities) return EMPTY_ID_SET;
    const hidden = new Set<string>();
    for (const [id, priority] of Object.entries(columnPriorities)) {
      // P2 is intentionally NOT auto-hidden: without a Compact card layout,
      // hiding it would strand data on tables that have no row drawer.
      if (priority === 3) hidden.add(id);
    }
    return hidden;
  }, [isWide, columnPriorities]);

  return { responsiveHiddenColumnIds, isCompact };
}
