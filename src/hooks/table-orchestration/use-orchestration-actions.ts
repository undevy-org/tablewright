import { useCallback } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import type { ActiveFilterValue, ColumnFilterConfig, ViewPreset } from "../../components/data-table/filter-types";
import type { ColumnMetaDef } from "../../components/data-table/types";
import { defaultValueForFilter, type TableOrchestrationStoreApi } from "../table-orchestration-store";

/**
 * Store actions bound into stable callbacks with the hook's public signatures
 * (`handleX` / React-style setters). Each callback's deps are exactly what it
 * reads, so identities only change when those inputs do.
 */
export function useOrchestrationActions<TRow extends object, TViewKey extends string>({
  store,
  viewPresets,
  filterConfigs,
  columnMeta,
  setWidths,
  defaultViewKey,
  paginatedRows,
  allOnPageSelected,
  getRowId,
}: {
  store: TableOrchestrationStoreApi<TViewKey>;
  viewPresets: ViewPreset<TRow, TViewKey>[];
  filterConfigs: Record<string, ColumnFilterConfig>;
  columnMeta: Record<string, ColumnMetaDef>;
  setWidths: (updater: (prev: Record<string, number>) => Record<string, number>) => void;
  defaultViewKey: TViewKey;
  paginatedRows: TRow[];
  allOnPageSelected: boolean;
  getRowId: (row: TRow) => string;
}) {
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

  return {
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
    setSearchInput,
    setColumnVisibility,
    setDensity,
    setSelectedIds,
    setColumnsMenuOpen,
    setSelectedRowId,
  };
}
