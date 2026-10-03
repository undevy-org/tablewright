import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useStore } from "zustand";
import type { VisibilityState } from "@tanstack/react-table";
import { useColumnResize } from "../components/data-table/hooks/use-column-resize";
import { getVisiblePageNumbers } from "../components/data-table/hooks/use-table-pagination";
import type { ColumnMetaDef, SortDirection } from "../components/data-table/types";

import type {
  ActiveFilter,
  ActiveFilterValue,
  ColumnFilterConfig,
  ColumnGap,
  ColumnGroup,
  FilterColumnStats,
  FilterStatsSlice,
  ViewPreset,
} from "../components/data-table/filter-types";
import { computeColumnGaps } from "../lib/column-gaps";
import { computeColumnStats } from "../lib/filter-stats";
import {
  createTableOrchestrationStore,
  defaultValueForFilter,
  type TableOrchestrationStoreApi,
} from "./table-orchestration-store";

// ── Config ──────────────────────────────────────────────────────────────

export interface TableOrchestrationConfig<TRow extends object, TViewKey extends string> {
  rows: TRow[];
  getRowId: (row: TRow) => string;
  filterRow: (row: TRow, filter: ActiveFilter) => boolean;
  getSortValue: (row: TRow, columnId: string) => string | number;
  getSearchText: (row: TRow) => string;
  filterConfigs: Record<string, ColumnFilterConfig>;
  columnMeta: Record<string, ColumnMetaDef>;
  toggleableColumnIds: readonly string[];
  rowsPerPageOptions: readonly number[];
  viewPresets: ViewPreset<TRow, TViewKey>[];
  defaultViewKey: TViewKey;
  columnGroups?: ColumnGroup[];
  initialColumnVisibility?: Record<string, boolean>;
  /** Restore previously-persisted column widths (px), keyed by column id. */
  initialColumnWidths?: Record<string, number>;
  /**
   * Responsive column priorities: columns mapped to `3` (детали) collapse
   * below `wideBreakpoint`. `2` (второстепенные) is NOT auto-hidden — without a
   * Compact card layout it would strand data on tables without a row drawer;
   * react to `isCompact` to build one. Unmapped columns are P1 and always
   * render. The result is surfaced as `responsiveHiddenColumnIds` for the
   * shell — it never mutates the table's own columnVisibility, so manual
   * hiding stays independent.
   */
  columnPriorities?: Record<string, 2 | 3>;
  /** Width (px) at/above which every column shows. @default 1280 */
  wideBreakpoint?: number;
  /**
   * Width (px) below which `isCompact` flips true (the Compact tier) so consumers can switch to a card layout. It does NOT auto-hide P2
   * columns. @default 768
   */
  compactBreakpoint?: number;
}

// ── Return type ─────────────────────────────────────────────────────────

export interface TableOrchestrationReturn<TRow extends object, TViewKey extends string> {
  // State
  searchInput: string;
  setSearchInput: (v: string) => void;
  searchQuery: string;
  columnFilters: ActiveFilter[];
  newestFilterColumnId: string | null;
  requestOpenFilterId: string | null;
  currentSort: { columnId: string; direction: "asc" | "desc" } | null;
  columnVisibility: VisibilityState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  page: number;
  rowsPerPage: number;
  density: "normal" | "dense";
  setDensity: (v: "normal" | "dense") => void;
  /** @deprecated Demo-only: it only spins for a fixed time (700 ms by default) and refetches nothing. Keep refresh state in your data layer (e.g. your query's `isFetching`). Will be removed in a future minor release. */
  isRefreshing: boolean;
  selectedIds: Set<string>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeView: TViewKey;
  columnsMenuOpen: boolean;
  setColumnsMenuOpen: (v: boolean) => void;
  selectedRowId: string | null;
  setSelectedRowId: (v: string | null) => void;

  // Derived data
  sortState: Record<string, SortDirection>;
  activePreset: ViewPreset<TRow, TViewKey>;
  filteredRows: TRow[];
  paginatedRows: TRow[];
  totalPages: number;
  safePage: number;
  pageNumbers: number[];
  columnFilterStats: Record<string, FilterStatsSlice>;
  columnGaps: ColumnGap[];
  extendedColumnMeta: Record<string, ColumnMetaDef>;
  extendedWidths: Record<string, number>;
  activeCustomFilterChip: { label: string; value: string } | null;
  hiddenColumnsCount: number;
  /** Columns collapsed by the responsive priority rule at the current width. */
  responsiveHiddenColumnIds: ReadonlySet<string>;
  /** True when viewport width is below `compactBreakpoint` (Compact tier). */
  isCompact: boolean;

  // Selection helpers
  pageIds: Set<string>;
  allOnPageSelected: boolean;
  headerCheckState: boolean | "indeterminate";

  // Ref-stable getters (for column factory closures)
  getSelectedIds: () => Set<string>;
  getHeaderCheckState: () => boolean | "indeterminate";

  // Callbacks
  handleSearchSubmit: (e: React.FormEvent) => void;
  handleHeaderSort: (columnId: string, direction: "asc" | "desc") => void;
  handleViewChange: (key: TViewKey) => void;
  handleAddColumnFilter: (columnId: string) => void;
  handleOpenExistingFilter: (columnId: string) => void;
  handleRequestOpenHandled: () => void;
  handleRemoveColumnFilter: (columnId: string) => void;
  handleChangeColumnFilter: (columnId: string, value: ActiveFilterValue) => void;
  handleSetColumnFilter: (columnId: string, value: ActiveFilterValue) => void;
  handleHeaderFilterClick: (columnId: string) => void;
  handleHideColumn: (columnId: string) => void;
  handleResetColumns: () => void;
  handleRemoveSort: () => void;
  handleRemoveCustomFilter: () => void;
  handleClearAll: () => void;
  /** @deprecated Demo-only: it only spins for a fixed time (700 ms by default) and refetches nothing. Keep refresh state in your data layer (e.g. your query's `isFetching`). Will be removed in a future minor release. */
  handleRefresh: () => void;
  handleToggleRowSelection: (id: string) => void;
  handleToggleHeaderCheck: () => void;
  handleExpandRow: (row: TRow, e: React.MouseEvent) => void;
  handleExpandGap: (hiddenIds: string[]) => void;
  handlePageChange: (p: number) => void;
  handleRowsPerPageChange: (value: number) => void;

  // Column resize + row drag
  widths: Record<string, number>;
  onPointerDown: (columnId: string, e: React.PointerEvent) => void;

  // Escape hatch — direct access to the underlying zustand store for advanced
  // consumers that want to subscribe with selectors instead of going through
  // the hook return value.
  store: TableOrchestrationStoreApi<TViewKey>;
}

// ── Hook ────────────────────────────────────────────────────────────────

const EMPTY_ID_SET: ReadonlySet<string> = new Set<string>();

// useLayoutEffect warns during SSR on React 18; fall back to useEffect there.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useTableOrchestration<TRow extends object, TViewKey extends string>(
  config: TableOrchestrationConfig<TRow, TViewKey>,
): TableOrchestrationReturn<TRow, TViewKey> {
  const {
    rows,
    filterConfigs,
    columnMeta,
    toggleableColumnIds,
    rowsPerPageOptions,
    viewPresets,
    defaultViewKey,
    columnGroups,
    initialColumnVisibility,
    initialColumnWidths,
    columnPriorities,
    wideBreakpoint = 1280,
    compactBreakpoint = 768,
  } = config;

  // Config callbacks — callers MUST provide stable references (useCallback or module-level).
  const { getRowId, filterRow, getSortValue, getSearchText } = config;

  // ── Store: one instance per hook mount ────────────────────────────────
  // useState's lazy initializer fires exactly once for the lifetime of the
  // component — the store is stable across re-renders and survives StrictMode
  // double-invocation in dev. Initial config (defaultViewKey, rowsPerPage,
  // initialColumnVisibility) is read once on mount; later prop changes don't
  // recreate the store.
  const [store] = useState<TableOrchestrationStoreApi<TViewKey>>(() =>
    createTableOrchestrationStore<TViewKey>({
      defaultViewKey,
      initialColumnVisibility,
      initialRowsPerPage: rowsPerPageOptions[0],
    }),
  );

  // ── Subscribe to slices (granular re-render scope) ───────────────────
  const searchInput = useStore(store, (s) => s.searchInput);
  const searchQuery = useStore(store, (s) => s.searchQuery);
  const columnFilters = useStore(store, (s) => s.columnFilters);
  const newestFilterColumnId = useStore(store, (s) => s.newestFilterColumnId);
  const requestOpenFilterId = useStore(store, (s) => s.requestOpenFilterId);
  const currentSort = useStore(store, (s) => s.currentSort);
  const columnVisibility = useStore(store, (s) => s.columnVisibility);
  const storedPage = useStore(store, (s) => s.page);
  const rowsPerPage = useStore(store, (s) => s.rowsPerPage);
  const density = useStore(store, (s) => s.density);
  const isRefreshing = useStore(store, (s) => s.isRefreshing);
  const storedSelectedIds = useStore(store, (s) => s.selectedIds);
  const activeView = useStore(store, (s) => s.activeView);
  const columnsMenuOpen = useStore(store, (s) => s.columnsMenuOpen);
  const storedSelectedRowId = useStore(store, (s) => s.selectedRowId);

  // ── Responsive column collapse (P1/P2/P3) ────────────────────────────
  // Initialize to `true` (all columns shown) so the first client render
  // matches the server HTML — no hydration mismatch. The real width is
  // read in the effect below (after commit) and only collapses then.
  const hasPriorities = Boolean(columnPriorities && Object.keys(columnPriorities).length > 0);
  const [isWide, setIsWide] = useState(true);
  // Compact tier (spec 07): below `compactBreakpoint` P2 columns also collapse
  // and `isCompact` flips so consumers can switch to a card layout. Initialize
  // `false` so the first client render matches server HTML (no hydration jump).
  const [isCompact, setIsCompact] = useState(false);
  useEffect(() => {
    if (!hasPriorities || typeof window === "undefined") return;
    const mql = window.matchMedia(`(min-width: ${wideBreakpoint}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsWide(e.matches);
    setIsWide(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [hasPriorities, wideBreakpoint]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia(`(max-width: ${compactBreakpoint - 1}px)`);
    const onChange = (e: MediaQueryListEvent) => setIsCompact(e.matches);
    setIsCompact(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [compactBreakpoint]);
  const responsiveHiddenColumnIds = useMemo<ReadonlySet<string>>(() => {
    if (isWide || !columnPriorities) return EMPTY_ID_SET;
    const hidden = new Set<string>();
    for (const [id, priority] of Object.entries(columnPriorities)) {
      // Only P3 (детали) collapse below Wide. P2 is intentionally NOT auto-hidden:
      // without a Compact card layout, hiding it would strand data on tables that
      // have no row drawer. Consumers react to `isCompact` to build a card view.
      if (priority === 3) hidden.add(id);
    }
    return hidden;
  }, [isWide, columnPriorities]);

  // ── Refs for stable closures ──────────────────────────────────────────
  const selectedIdsRef = useRef(storedSelectedIds);
  const headerCheckStateRef = useRef<boolean | "indeterminate">(false);

  // ── Sort state ────────────────────────────────────────────────────────
  const sortState: Record<string, SortDirection> = useMemo(() => {
    if (!currentSort) return {};
    return { [currentSort.columnId]: currentSort.direction };
  }, [currentSort]);

  // ── Column resize ─────────────────────────────────────────────────────
  const { widths, onPointerDown, setWidths } = useColumnResize(columnMeta, initialColumnWidths);

  // ── Active preset ─────────────────────────────────────────────────────
  const activePreset = useMemo<ViewPreset<TRow, TViewKey>>(() => {
    if (activeView === ("custom" as TViewKey)) {
      return {
        key: "custom" as TViewKey,
        label: "Custom",
        filters: [],
        sort: null,
        columnVisibility: {},
      };
    }
    return viewPresets.find((v) => v.key === activeView) ?? viewPresets[0];
  }, [activeView, viewPresets]);

  // ── Filter stats (all rows) ───────────────────────────────────────────
  const allColumnFilterStats = useMemo(() => {
    const result: Record<string, FilterColumnStats> = {};
    for (const [columnId, cfg] of Object.entries(filterConfigs)) {
      if (cfg.type === "compound" && cfg.subFilters) {
        for (const sub of cfg.subFilters) {
          const s = computeColumnStats(rows, sub.field, {
            type: sub.type,
            label: sub.label,
            options: sub.options,
          });
          if (s) result[`${columnId}:${sub.key}`] = s;
        }
      } else {
        const s = computeColumnStats(rows, cfg.fieldName ?? columnId, cfg);
        if (s) result[columnId] = s;
      }
    }
    return result;
  }, [rows, filterConfigs]);

  // ── Filtered + sorted rows ────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      if (activePreset.customFilter && !activePreset.customFilter(row)) return false;
      if (search.length > 0 && !getSearchText(row).includes(search)) return false;
      return columnFilters.every((filter) => filterRow(row, filter));
    });
    if (!currentSort) return filtered;
    const { columnId, direction } = currentSort;
    return [...filtered].sort((a, b) => {
      const aVal = getSortValue(a, columnId);
      const bVal = getSortValue(b, columnId);
      if (aVal < bVal) return direction === "asc" ? -1 : 1;
      if (aVal > bVal) return direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [
    rows,
    searchQuery,
    columnFilters,
    currentSort,
    activePreset,
    getSearchText,
    filterRow,
    getSortValue,
  ]);

  // ── Filter stats (filtered rows) ─────────────────────────────────────
  const filteredColumnFilterStats = useMemo(() => {
    if (columnFilters.length === 0 && searchQuery.trim().length === 0) return null;
    const result: Record<string, FilterColumnStats> = {};
    for (const [columnId, cfg] of Object.entries(filterConfigs)) {
      if (cfg.type === "compound" && cfg.subFilters) {
        for (const sub of cfg.subFilters) {
          const s = computeColumnStats(filteredRows, sub.field, {
            type: sub.type,
            label: sub.label,
            options: sub.options,
          });
          if (s) result[`${columnId}:${sub.key}`] = s;
        }
      } else {
        const s = computeColumnStats(filteredRows, cfg.fieldName ?? columnId, cfg);
        if (s) result[columnId] = s;
      }
    }
    return result;
  }, [filteredRows, filterConfigs, columnFilters, searchQuery]);

  // ── Combined filter stats ─────────────────────────────────────────────
  const columnFilterStats = useMemo(() => {
    const result: Record<string, FilterStatsSlice> = {};
    for (const [columnId, cfg] of Object.entries(filterConfigs)) {
      if (cfg.type === "compound" && cfg.subFilters) {
        for (const sub of cfg.subFilters) {
          const key = `${columnId}:${sub.key}`;
          const all = allColumnFilterStats[key];
          if (!all) continue;
          result[key] = { all, filtered: filteredColumnFilterStats?.[key] ?? null };
        }
      } else {
        const all = allColumnFilterStats[columnId];
        if (!all) continue;
        result[columnId] = { all, filtered: filteredColumnFilterStats?.[columnId] ?? null };
      }
    }
    return result;
  }, [allColumnFilterStats, filteredColumnFilterStats, filterConfigs]);

  // ── Pagination ────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(storedPage, totalPages);
  const page = safePage;
  const pageNumbers = useMemo(
    () => getVisiblePageNumbers(safePage, totalPages),
    [safePage, totalPages],
  );

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, rowsPerPage, safePage]);

  // ── Derived corrections ───────────────────────────────────────────────
  // Stored state can drift out of range when rows/filters change: page past
  // the last page, a drawer row or selected ids that left the filtered set.
  // Render with the corrected values and write them back to the store after
  // commit — never during render, which would notify other store subscribers
  // mid-render ("Cannot update a component while rendering a different one").
  const filteredIdSet = useMemo(
    () => new Set(filteredRows.map(getRowId)),
    [filteredRows, getRowId],
  );
  const selectedRowId =
    storedSelectedRowId && filteredIdSet.has(storedSelectedRowId) ? storedSelectedRowId : null;
  const selectedIds = useMemo(() => {
    const pruned = new Set([...storedSelectedIds].filter((id) => filteredIdSet.has(id)));
    return pruned.size === storedSelectedIds.size ? storedSelectedIds : pruned;
  }, [storedSelectedIds, filteredIdSet]);

  useIsomorphicLayoutEffect(() => {
    const state = store.getState();
    if (state.page !== safePage) state.setPage(safePage);
    if (state.selectedRowId !== selectedRowId) state.setSelectedRowId(selectedRowId);
    if (state.selectedIds !== selectedIds) state.setSelectedIds(selectedIds);
    // Stored values are deps too: a stored value can go out of range while the
    // corrected one stays put (e.g. setPage(99) on the last page).
  }, [store, storedPage, safePage, storedSelectedRowId, selectedRowId, storedSelectedIds, selectedIds]);

  // ── Selection ─────────────────────────────────────────────────────────
  const pageIds = useMemo(() => new Set(paginatedRows.map(getRowId)), [paginatedRows, getRowId]);

  const selectedOnPage = useMemo(
    () => [...selectedIds].filter((id) => pageIds.has(id)).length,
    [selectedIds, pageIds],
  );

  const allOnPageSelected = pageIds.size > 0 && selectedOnPage === pageIds.size;
  const headerCheckState: boolean | "indeterminate" = allOnPageSelected
    ? true
    : selectedOnPage > 0
      ? "indeterminate"
      : false;

  // ── Gap indicators ────────────────────────────────────────────────────
  const columnGaps = useMemo(
    () => (columnGroups ? computeColumnGaps(toggleableColumnIds, columnVisibility) : []),
    [columnGroups, toggleableColumnIds, columnVisibility],
  );

  const extendedColumnMeta = useMemo(() => {
    if (columnGaps.length === 0) return columnMeta;
    const meta: Record<string, ColumnMetaDef> = { ...columnMeta };
    for (const gap of columnGaps) {
      meta[`__gap_after_${gap.afterColumnId ?? "start"}`] = { minW: 32 };
    }
    return meta;
  }, [columnGaps, columnMeta]);

  const extendedWidths = useMemo(() => {
    if (columnGaps.length === 0) return widths;
    const merged: Record<string, number> = { ...widths };
    for (const gap of columnGaps) {
      merged[`__gap_after_${gap.afterColumnId ?? "start"}`] = 32;
    }
    return merged;
  }, [widths, columnGaps]);

  const hiddenColumnsCount = useMemo(() => {
    return toggleableColumnIds.filter((id) => columnVisibility[id] === false).length;
  }, [toggleableColumnIds, columnVisibility]);

  const activeCustomFilterChip = activePreset.customFilterChip ?? null;

  // Sync refs in render body so cell renderers read current values on the same
  // render that triggered the state change.
  // eslint-disable-next-line react-hooks/refs
  selectedIdsRef.current = selectedIds;
  // eslint-disable-next-line react-hooks/refs
  headerCheckStateRef.current = headerCheckState;

  // ── Bound action wrappers (preserve old hook signatures) ──────────────
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      store.getState().submitSearch();
    },
    [store],
  );

  const handleHeaderSort = useCallback(
    (columnId: string, direction: "asc" | "desc") => {
      store.getState().toggleSort(columnId, direction);
    },
    [store],
  );

  const handleViewChange = useCallback(
    (key: TViewKey) => {
      if (key === ("custom" as TViewKey)) return;
      const preset = viewPresets.find((v) => v.key === key);
      if (!preset) return;
      store.getState().applyPreset({
        key,
        filters: preset.filters,
        sort: preset.sort,
        columnVisibility: preset.columnVisibility,
      });
    },
    [viewPresets, store],
  );

  const handleAddColumnFilter = useCallback(
    (columnId: string) => {
      const cfg = filterConfigs[columnId];
      if (!cfg) return;
      store.getState().addColumnFilter(columnId, defaultValueForFilter(cfg));
    },
    [filterConfigs, store],
  );

  const handleOpenExistingFilter = useCallback(
    (columnId: string) => store.getState().setRequestOpenFilterId(columnId),
    [store],
  );

  const handleRequestOpenHandled = useCallback(
    () => store.getState().setRequestOpenFilterId(null),
    [store],
  );

  const handleRemoveColumnFilter = useCallback(
    (columnId: string) => store.getState().removeColumnFilter(columnId),
    [store],
  );

  const handleChangeColumnFilter = useCallback(
    (columnId: string, value: ActiveFilterValue) =>
      store.getState().changeColumnFilter(columnId, value),
    [store],
  );

  const handleSetColumnFilter = useCallback(
    (columnId: string, value: ActiveFilterValue) =>
      store.getState().setColumnFilter(columnId, value),
    [store],
  );

  const handleHeaderFilterClick = useCallback(
    (columnId: string) => {
      const state = store.getState();
      const isActive = state.columnFilters.some((f) => f.columnId === columnId);
      if (!isActive) {
        const cfg = filterConfigs[columnId];
        if (cfg) state.addColumnFilter(columnId, defaultValueForFilter(cfg));
      }
      state.setRequestOpenFilterId(columnId);
    },
    [filterConfigs, store],
  );

  const handleHideColumn = useCallback(
    (columnId: string) => store.getState().hideColumn(columnId),
    [store],
  );

  const handleResetColumns = useCallback(() => {
    store.getState().resetColumns();
    setWidths(() => {
      const w: Record<string, number> = {};
      for (const [id, m] of Object.entries(columnMeta)) w[id] = m.minW;
      return w;
    });
  }, [store, setWidths, columnMeta]);

  const handleRemoveSort = useCallback(() => store.getState().removeSort(), [store]);

  const handleRemoveCustomFilter = useCallback(() => {
    store.getState().goCustom();
    store.getState().setPage(1);
  }, [store]);

  const handleClearAll = useCallback(
    () => store.getState().clearAll(defaultViewKey),
    [defaultViewKey, store],
  );

  const handleRefresh = useCallback(() => store.getState().startRefresh(), [store]);

  const handleToggleRowSelection = useCallback(
    (id: string) => store.getState().toggleRowSelection(id),
    [store],
  );

  const handleToggleHeaderCheck = useCallback(() => {
    const ids = paginatedRows.map(getRowId);
    store.getState().toggleHeaderCheck(ids, allOnPageSelected);
  }, [paginatedRows, allOnPageSelected, getRowId, store]);

  const handleExpandRow = useCallback(
    (row: TRow, e: React.MouseEvent) => {
      e.stopPropagation();
      const id = getRowId(row);
      store.getState().toggleSelectedRowId(id);
    },
    [getRowId, store],
  );

  const handleExpandGap = useCallback(
    (hiddenIds: string[]) => store.getState().showColumns(hiddenIds),
    [store],
  );

  const handlePageChange = useCallback((p: number) => store.getState().setPage(p), [store]);

  const handleRowsPerPageChange = useCallback(
    (value: number) => store.getState().setRowsPerPage(value),
    [store],
  );

  // ── Stable setters with React-style signatures ───────────────────────
  const setSearchInput = useCallback((v: string) => store.getState().setSearchInput(v), [store]);

  const setColumnVisibility = useCallback<React.Dispatch<React.SetStateAction<VisibilityState>>>(
    (next) => store.getState().setColumnVisibility(next),
    [store],
  );

  const setDensity = useCallback(
    (v: "normal" | "dense") => store.getState().setDensity(v),
    [store],
  );

  const setSelectedIds = useCallback<React.Dispatch<React.SetStateAction<Set<string>>>>(
    (next) => store.getState().setSelectedIds(next),
    [store],
  );

  const setColumnsMenuOpen = useCallback(
    (v: boolean) => store.getState().setColumnsMenuOpen(v),
    [store],
  );

  const setSelectedRowId = useCallback(
    (v: string | null) => store.getState().setSelectedRowId(v),
    [store],
  );

  // ── Ref-stable getters ────────────────────────────────────────────────
  const getSelectedIds = useCallback(() => selectedIdsRef.current, []);
  const getHeaderCheckState = useCallback(() => headerCheckStateRef.current, []);

  return {
    // State
    searchInput,
    setSearchInput,
    searchQuery,
    columnFilters,
    newestFilterColumnId,
    requestOpenFilterId,
    currentSort,
    columnVisibility,
    setColumnVisibility,
    page,
    rowsPerPage,
    density,
    setDensity,
    isRefreshing,
    selectedIds,
    setSelectedIds,
    activeView,
    columnsMenuOpen,
    setColumnsMenuOpen,
    selectedRowId,
    setSelectedRowId,

    // Derived
    sortState,
    activePreset,
    filteredRows,
    paginatedRows,
    totalPages,
    safePage,
    pageNumbers,
    columnFilterStats,
    columnGaps,
    extendedColumnMeta,
    extendedWidths,
    activeCustomFilterChip,
    hiddenColumnsCount,
    responsiveHiddenColumnIds,
    isCompact,

    // Selection
    pageIds,
    allOnPageSelected,
    headerCheckState,

    // Ref-stable getters
    getSelectedIds,
    getHeaderCheckState,

    // Callbacks
    handleSearchSubmit,
    handleHeaderSort,
    handleViewChange,
    handleAddColumnFilter,
    handleOpenExistingFilter,
    handleRequestOpenHandled,
    handleRemoveColumnFilter,
    handleChangeColumnFilter,
    handleSetColumnFilter,
    handleHeaderFilterClick,
    handleHideColumn,
    handleResetColumns,
    handleRemoveSort,
    handleRemoveCustomFilter,
    handleClearAll,
    handleRefresh,
    handleToggleRowSelection,
    handleToggleHeaderCheck,
    handleExpandRow,
    handleExpandGap,
    handlePageChange,
    handleRowsPerPageChange,

    // Column resize
    widths,
    onPointerDown,

    // Escape hatch
    store,
  };
}
