import { createStore } from "zustand/vanilla";
import type { VisibilityState } from "@tanstack/react-table";
import type {
  ActiveFilter,
  ActiveFilterValue,
  ColumnFilterConfig,
} from "../components/data-table/filter-types";

// ── Raw state (no derived data, no callbacks taking generics) ────────────

export interface TableOrchestrationState<TViewKey extends string = string> {
  searchInput: string;
  searchQuery: string;
  columnFilters: ActiveFilter[];
  newestFilterColumnId: string | null;
  requestOpenFilterId: string | null;
  currentSort: { columnId: string; direction: "asc" | "desc" } | null;
  columnVisibility: VisibilityState;
  page: number;
  rowsPerPage: number;
  density: "normal" | "dense";
  /** @deprecated Demo-only: it only spins for a fixed time (700 ms by default) and refetches nothing. Keep refresh state in your data layer (e.g. your query's `isFetching`). Will be removed in a future minor release. */
  isRefreshing: boolean;
  selectedIds: Set<string>;
  activeView: TViewKey;
  columnsMenuOpen: boolean;
  selectedRowId: string | null;
}

// ── Actions — stable references, no useCallback needed at the call site ──

export interface TableOrchestrationActions<TViewKey extends string = string> {
  setSearchInput: (v: string) => void;
  submitSearch: () => void;

  setColumnFilters: (filters: ActiveFilter[]) => void;
  addColumnFilter: (columnId: string, defaultValue: ActiveFilterValue) => void;
  removeColumnFilter: (columnId: string) => void;
  changeColumnFilter: (columnId: string, value: ActiveFilterValue) => void;
  setColumnFilter: (columnId: string, value: ActiveFilterValue) => void;

  setNewestFilterColumnId: (v: string | null) => void;
  setRequestOpenFilterId: (v: string | null) => void;

  setCurrentSort: (next: { columnId: string; direction: "asc" | "desc" } | null) => void;
  toggleSort: (columnId: string, direction: "asc" | "desc") => void;
  removeSort: () => void;

  setColumnVisibility: (
    next: VisibilityState | ((prev: VisibilityState) => VisibilityState),
  ) => void;
  hideColumn: (columnId: string) => void;
  showColumns: (columnIds: string[]) => void;
  resetColumns: () => void;

  setPage: (p: number) => void;
  setRowsPerPage: (n: number) => void;

  setDensity: (v: "normal" | "dense") => void;

  /** @deprecated Demo-only: it only spins for a fixed time (700 ms by default) and refetches nothing. Keep refresh state in your data layer (e.g. your query's `isFetching`). Will be removed in a future minor release. */
  startRefresh: (durationMs?: number) => void;

  setSelectedIds: (next: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
  toggleRowSelection: (id: string) => void;
  toggleHeaderCheck: (pageIds: string[], allOnPageSelected: boolean) => void;

  setActiveView: (v: TViewKey) => void;
  applyPreset: (preset: {
    key: TViewKey;
    filters: ActiveFilter[];
    sort: { columnId: string; direction: "asc" | "desc" } | null;
    columnVisibility?: VisibilityState;
  }) => void;
  goCustom: () => void;
  clearAll: (defaultViewKey: TViewKey) => void;

  setColumnsMenuOpen: (v: boolean) => void;
  setSelectedRowId: (v: string | null) => void;
  toggleSelectedRowId: (id: string) => void;
}

export type TableOrchestrationStore<TViewKey extends string = string> =
  TableOrchestrationState<TViewKey> & TableOrchestrationActions<TViewKey>;

export interface CreateTableStoreInput<TViewKey extends string> {
  defaultViewKey: TViewKey;
  initialColumnVisibility?: VisibilityState;
  initialRowsPerPage: number;
}

const CUSTOM_VIEW_KEY = "custom" as const;

const defaultValueForFilter = (cfg: ColumnFilterConfig): ActiveFilterValue => {
  if (cfg.type === "compound") return {};
  if (cfg.type === "enum") return [];
  if (cfg.type === "number-range") return {};
  if (cfg.type === "text") return [];
  return "";
};

export function createTableOrchestrationStore<TViewKey extends string>({
  defaultViewKey,
  initialColumnVisibility,
  initialRowsPerPage,
}: CreateTableStoreInput<TViewKey>) {
  return createStore<TableOrchestrationStore<TViewKey>>()((set, get) => {
    // Helper: when state diverges from any preset, mark view as "custom".
    // Most filter/sort/visibility mutations should call this.
    const goCustom = () => {
      const cur = get().activeView as string;
      if (cur !== CUSTOM_VIEW_KEY) {
        set({ activeView: CUSTOM_VIEW_KEY as unknown as TViewKey });
      }
    };

    return {
      // ── State ────────────────────────────────────────────────────────
      searchInput: "",
      searchQuery: "",
      columnFilters: [],
      newestFilterColumnId: null,
      requestOpenFilterId: null,
      currentSort: null,
      columnVisibility: initialColumnVisibility ?? {},
      page: 1,
      rowsPerPage: initialRowsPerPage,
      density: "normal",
      isRefreshing: false,
      selectedIds: new Set<string>(),
      activeView: defaultViewKey,
      columnsMenuOpen: false,
      selectedRowId: null,

      // ── Actions ──────────────────────────────────────────────────────
      setSearchInput: (v) => set({ searchInput: v }),
      submitSearch: () => set((s) => ({ searchQuery: s.searchInput, page: 1 })),

      setColumnFilters: (filters) => {
        set({ columnFilters: filters, page: 1 });
        goCustom();
      },
      addColumnFilter: (columnId, defaultValue) => {
        set((s) => ({
          newestFilterColumnId: columnId,
          columnVisibility:
            s.columnVisibility[columnId] === false
              ? { ...s.columnVisibility, [columnId]: true }
              : s.columnVisibility,
          columnFilters: [...s.columnFilters, { columnId, value: defaultValue }],
          page: 1,
        }));
        goCustom();
      },
      removeColumnFilter: (columnId) => {
        set((s) => ({
          columnFilters: s.columnFilters.filter((f) => f.columnId !== columnId),
          page: 1,
        }));
        goCustom();
      },
      changeColumnFilter: (columnId, value) => {
        set((s) => ({
          columnFilters: s.columnFilters.map((f) =>
            f.columnId === columnId ? { ...f, value } : f,
          ),
          page: 1,
        }));
        goCustom();
      },
      setColumnFilter: (columnId, value) => {
        set((s) => {
          const exists = s.columnFilters.some((f) => f.columnId === columnId);
          return {
            columnVisibility:
              s.columnVisibility[columnId] === false
                ? { ...s.columnVisibility, [columnId]: true }
                : s.columnVisibility,
            columnFilters: exists
              ? s.columnFilters.map((f) => (f.columnId === columnId ? { ...f, value } : f))
              : [...s.columnFilters, { columnId, value }],
            page: 1,
          };
        });
        goCustom();
      },

      setNewestFilterColumnId: (v) => set({ newestFilterColumnId: v }),
      setRequestOpenFilterId: (v) => set({ requestOpenFilterId: v }),

      setCurrentSort: (next) => set({ currentSort: next }),
      toggleSort: (columnId, direction) => {
        set((s) => {
          const same =
            s.currentSort?.columnId === columnId && s.currentSort.direction === direction;
          return { currentSort: same ? null : { columnId, direction }, page: 1 };
        });
        goCustom();
      },
      removeSort: () => {
        set({ currentSort: null, page: 1 });
        goCustom();
      },

      setColumnVisibility: (next) =>
        set((s) => ({
          columnVisibility: typeof next === "function" ? next(s.columnVisibility) : next,
        })),
      hideColumn: (columnId) =>
        set((s) => ({
          columnVisibility: { ...s.columnVisibility, [columnId]: false },
        })),
      showColumns: (columnIds) =>
        set((s) => ({
          columnVisibility: {
            ...s.columnVisibility,
            ...Object.fromEntries(columnIds.map((id) => [id, true])),
          },
        })),
      resetColumns: () => {
        set({ columnVisibility: {} });
        goCustom();
      },

      setPage: (p) => set({ page: p }),
      setRowsPerPage: (n) => set({ rowsPerPage: n, page: 1 }),

      setDensity: (v) => set({ density: v }),

      startRefresh: (durationMs = 700) => {
        set({ isRefreshing: true });
        if (typeof window !== "undefined") {
          window.setTimeout(() => set({ isRefreshing: false }), durationMs);
        }
      },

      setSelectedIds: (next) =>
        set((s) => ({
          selectedIds: typeof next === "function" ? next(s.selectedIds) : next,
        })),
      toggleRowSelection: (id) =>
        set((s) => {
          const next = new Set(s.selectedIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { selectedIds: next };
        }),
      toggleHeaderCheck: (pageIds, allOnPageSelected) =>
        set((s) => {
          const next = new Set(s.selectedIds);
          if (allOnPageSelected) pageIds.forEach((id) => next.delete(id));
          else pageIds.forEach((id) => next.add(id));
          return { selectedIds: next };
        }),

      setActiveView: (v) => set({ activeView: v }),
      applyPreset: (preset) =>
        set({
          activeView: preset.key,
          columnFilters: [...preset.filters],
          currentSort: preset.sort,
          columnVisibility: preset.columnVisibility ?? {},
          page: 1,
          newestFilterColumnId: null,
        }),
      goCustom: () => goCustom(),
      clearAll: (defaultKey) =>
        set({
          activeView: defaultKey,
          columnFilters: [],
          currentSort: null,
          columnVisibility: {},
          page: 1,
          newestFilterColumnId: null,
        }),

      setColumnsMenuOpen: (v) => set({ columnsMenuOpen: v }),
      setSelectedRowId: (v) => set({ selectedRowId: v }),
      toggleSelectedRowId: (id) =>
        set((s) => ({
          selectedRowId: s.selectedRowId === id ? null : id,
        })),
    };
  });
}

export type TableOrchestrationStoreApi<TViewKey extends string = string> = ReturnType<
  typeof createTableOrchestrationStore<TViewKey>
>;

// Re-export filterConfigs default-value helper for callers building presets.
export { defaultValueForFilter };
