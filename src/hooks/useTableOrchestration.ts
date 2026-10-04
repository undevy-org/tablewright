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
  FilterStatsSlice,
  ViewPreset,
} from "../components/data-table/filter-types";
import {
  createTableOrchestrationStore,
  type TableOrchestrationStoreApi,
} from "./table-orchestration-store";
import { useColumnFilterStats } from "./table-orchestration/use-column-filter-stats";
import { useColumnGaps } from "./table-orchestration/use-column-gaps";
import { useFilteredRows } from "./table-orchestration/use-filtered-rows";
import { useOrchestrationActions } from "./table-orchestration/use-orchestration-actions";
import { useResponsiveColumns } from "./table-orchestration/use-responsive-columns";

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
  const storedSelectedIds = useStore(store, (s) => s.selectedIds);
  const activeView = useStore(store, (s) => s.activeView);
  const columnsMenuOpen = useStore(store, (s) => s.columnsMenuOpen);
  const storedSelectedRowId = useStore(store, (s) => s.selectedRowId);

  // ── Responsive column collapse (P1/P2/P3) ────────────────────────────
  const { responsiveHiddenColumnIds, isCompact } = useResponsiveColumns(
    columnPriorities,
    wideBreakpoint,
    compactBreakpoint,
  );

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

  // ── Filtered + sorted rows ────────────────────────────────────────────
  const filteredRows = useFilteredRows({
    rows,
    activePreset,
    searchQuery,
    columnFilters,
    currentSort,
    filterRow,
    getSearchText,
    getSortValue,
  });

  // ── Filter stats ──────────────────────────────────────────────────────
  const columnFilterStats = useColumnFilterStats(
    rows,
    filteredRows,
    filterConfigs,
    columnFilters.length > 0 || searchQuery.trim().length > 0,
  );

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
  const { columnGaps, extendedColumnMeta, extendedWidths } = useColumnGaps({
    columnGroups,
    toggleableColumnIds,
    columnVisibility,
    columnMeta,
    widths,
  });

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

  // ── Actions ───────────────────────────────────────────────────────────
  const {
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
    handleToggleRowSelection,
    handleToggleHeaderCheck,
    handleExpandRow,
    handleExpandGap,
    handlePageChange,
    handleRowsPerPageChange,
    setSearchInput,
    setColumnVisibility,
    setDensity,
    setSelectedIds,
    setColumnsMenuOpen,
    setSelectedRowId,
  } = useOrchestrationActions({
    store,
    viewPresets,
    filterConfigs,
    columnMeta,
    setWidths,
    defaultViewKey,
    paginatedRows,
    allOnPageSelected,
    getRowId,
  });

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
