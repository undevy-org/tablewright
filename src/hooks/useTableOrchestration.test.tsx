import type { FormEvent } from "react";
import { act, render, renderHook, waitFor } from "@testing-library/react";
import { useStore } from "zustand";
import { describe, expect, it, vi } from "vitest";

import type { ActiveFilter, ColumnFilterConfig, ViewPreset } from "../components/data-table/filter-types";
import type { ColumnMetaDef } from "../components/data-table/types";
import { gapColumnId } from "../lib/column-gaps";
import type { TableOrchestrationStoreApi } from "./table-orchestration-store";
import { useTableOrchestration } from "./useTableOrchestration";

type FixtureRow = {
  id: string;
  name: string;
  status: string;
  score: number;
  metricValue: number;
};

type ViewKey = "all" | "custom";

const ROWS: FixtureRow[] = [
  { id: "1", name: "Alpha", status: "open", score: 30, metricValue: 1 },
  { id: "2", name: "Beta", status: "closed", score: 10, metricValue: 5 },
  { id: "3", name: "Gamma", status: "open", score: 20, metricValue: 3 },
  { id: "4", name: "Delta", status: "open", score: 40, metricValue: 2 },
  { id: "5", name: "Epsilon", status: "closed", score: 50, metricValue: 4 },
];

const filterConfigs: Record<string, ColumnFilterConfig> = {
  status: { type: "enum", label: "Status", options: [{ label: "Open", value: "open" }] },
  score: { type: "number-range", label: "Score", fieldName: "score" },
  metric: { type: "number-range", label: "Metric", fieldName: "metricValue" },
};

const columnMeta: Record<string, ColumnMetaDef> = {
  name: { minW: 120 },
  status: { minW: 100 },
  score: { minW: 80 },
};

const viewPresets: ViewPreset<FixtureRow, ViewKey>[] = [
  { key: "all", label: "All", filters: [], sort: null },
];

function makeConfig(overrides: Partial<Parameters<typeof useTableOrchestration<FixtureRow, ViewKey>>[0]> = {}) {
  return {
    rows: ROWS,
    getRowId: (row: FixtureRow) => row.id,
    filterRow: (row: FixtureRow, filter: ActiveFilter) => {
      if (filter.columnId === "status") {
        const values = Array.isArray(filter.value) ? filter.value : [];
        return values.length === 0 || values.includes(row.status);
      }
      return true;
    },
    getSortValue: (row: FixtureRow, columnId: string) =>
      columnId === "score" ? row.score : row.name,
    getSearchText: (row: FixtureRow) => row.name.toLowerCase(),
    filterConfigs,
    columnMeta,
    toggleableColumnIds: ["name", "status", "score"],
    rowsPerPageOptions: [2],
    viewPresets,
    defaultViewKey: "all" as ViewKey,
    columnGroups: [{ key: "main", label: "Main", columnIds: ["name", "status", "score"] }],
    ...overrides,
  };
}

const STABLE_CALLBACK_KEYS = [
  "handleSearchSubmit",
  "handleHeaderSort",
  "handleViewChange",
  "handleAddColumnFilter",
  "handleOpenExistingFilter",
  "handleRequestOpenHandled",
  "handleRemoveColumnFilter",
  "handleChangeColumnFilter",
  "handleSetColumnFilter",
  "handleHeaderFilterClick",
  "handleHideColumn",
  "handleResetColumns",
  "handleRemoveSort",
  "handleRemoveCustomFilter",
  "handleClearAll",
  "handleToggleRowSelection",
  "handleExpandRow",
  "handleExpandGap",
  "handlePageChange",
  "handleRowsPerPageChange",
] as const;

const baseConfig = makeConfig();

function StoreSubscriber({ store }: { store: TableOrchestrationStoreApi<ViewKey> }) {
  useStore(store, (s) => s.selectedRowId);
  useStore(store, (s) => s.selectedIds);
  return null;
}

describe("useTableOrchestration", () => {
  it("filters, searches, sorts, and paginates rows", () => {
    const { result } = renderHook(() => useTableOrchestration(baseConfig));

    act(() => {
      result.current.setSearchInput("alp");
      result.current.handleSearchSubmit({ preventDefault: () => undefined } as FormEvent);
    });
    expect(result.current.filteredRows.map((r) => r.id)).toEqual(["1"]);

    act(() => {
      result.current.handleSetColumnFilter("status", ["open"]);
    });
    expect(result.current.filteredRows.map((r) => r.id)).toEqual(["1"]);

    act(() => {
      result.current.handleHeaderSort("score", "asc");
    });
    expect(result.current.paginatedRows.map((r) => r.id)).toEqual(["1"]);
    expect(result.current.totalPages).toBe(1);

    act(() => {
      result.current.handleSetColumnFilter("status", []);
      result.current.setSearchInput("");
      result.current.handleSearchSubmit({ preventDefault: () => undefined } as FormEvent);
    });
    expect(result.current.filteredRows).toHaveLength(5);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.paginatedRows).toHaveLength(2);
  });

  it("clamps an out-of-range page after commit", async () => {
    const { result } = renderHook(() => useTableOrchestration(baseConfig));

    act(() => {
      result.current.handlePageChange(3);
    });
    expect(result.current.page).toBe(3);
    expect(result.current.store.getState().page).toBe(3);

    act(() => {
      result.current.handlePageChange(99);
    });
    expect(result.current.page).toBe(3);

    await waitFor(() => {
      expect(result.current.store.getState().page).toBe(3);
    });
  });

  it("prunes drawer row and selected ids when rows leave the filtered set without render warnings", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { result } = renderHook(() => useTableOrchestration(baseConfig));
    render(<StoreSubscriber store={result.current.store} />);

    act(() => {
      result.current.handleToggleRowSelection("1");
      result.current.handleToggleRowSelection("2");
      result.current.setSelectedRowId("2");
    });
    expect(result.current.selectedIds).toEqual(new Set(["1", "2"]));
    expect(result.current.selectedRowId).toBe("2");

    act(() => {
      result.current.handleSetColumnFilter("status", ["open"]);
    });

    await waitFor(() => {
      expect(result.current.selectedIds).toEqual(new Set(["1"]));
      expect(result.current.selectedRowId).toBeNull();
      expect(result.current.store.getState().selectedIds).toEqual(new Set(["1"]));
      expect(result.current.store.getState().selectedRowId).toBeNull();
    });

    const reactRenderWarnings = errorSpy.mock.calls.filter((args) =>
      String(args[0]).includes("while rendering a different component"),
    );
    expect(reactRenderWarnings).toHaveLength(0);

    errorSpy.mockRestore();
  });

  it("uses fieldName for columnFilterStats.filtered", () => {
    const { result } = renderHook(() => useTableOrchestration(baseConfig));

    act(() => {
      result.current.handleSetColumnFilter("status", ["open"]);
    });

    const metricStats = result.current.columnFilterStats.metric;
    expect(metricStats).toBeDefined();
    expect(metricStats.all.type).toBe("number-range");
    expect(metricStats.filtered?.type).toBe("number-range");
    if (metricStats.filtered?.type === "number-range") {
      expect(metricStats.filtered.min).toBe(1);
      expect(metricStats.filtered.max).toBe(3);
    }
  });

  it("merges column pinning into extendedColumnMeta", () => {
    const { result } = renderHook(() =>
      useTableOrchestration(
        makeConfig({
          columnMeta: {
            rowControl: { minW: 48, sticky: "left", stickyOffset: 0, variant: "control" },
            ...columnMeta,
            actions: { minW: 64, sticky: "right", stickyOffset: 0 },
          },
        }),
      ),
    );

    act(() => {
      result.current.pinColumn("name", "left");
    });

    expect(result.current.columnPinning).toEqual({ left: ["name"], right: [] });
    expect(result.current.extendedColumnMeta.name).toMatchObject({
      sticky: "left",
      stickyOffset: 48,
    });
    expect(result.current.extendedColumnMeta.rowControl).toMatchObject({
      sticky: "left",
      stickyOffset: 0,
    });
  });

  it("exposes gap columns in extended meta and widths", () => {
    const { result } = renderHook(() => useTableOrchestration(baseConfig));

    act(() => {
      result.current.handleHideColumn("status");
    });

    const gapId = gapColumnId("name");
    expect(result.current.columnGaps).toEqual([{ afterColumnId: "name", hiddenIds: ["status"] }]);
    expect(result.current.extendedColumnMeta[gapId]).toEqual({ minW: 32 });
    expect(result.current.extendedWidths[gapId]).toBe(32);
  });

  it("only refreshes handleToggleHeaderCheck when selection or page changes", () => {
    const { result } = renderHook(() => useTableOrchestration(baseConfig));

    const snapshot = () =>
      Object.fromEntries(STABLE_CALLBACK_KEYS.map((k) => [k, result.current[k]])) as Record<
        (typeof STABLE_CALLBACK_KEYS)[number],
        unknown
      >;

    const before = snapshot();
    const headerBefore = result.current.handleToggleHeaderCheck;

    act(() => {
      result.current.handleToggleRowSelection("1");
      result.current.handleToggleRowSelection("2");
    });
    const afterSelection = snapshot();
    expect(result.current.allOnPageSelected).toBe(true);
    expect(result.current.handleToggleHeaderCheck).not.toBe(headerBefore);
    for (const key of STABLE_CALLBACK_KEYS) {
      expect(afterSelection[key]).toBe(before[key]);
    }

    const headerAfterSelection = result.current.handleToggleHeaderCheck;
    act(() => {
      result.current.handlePageChange(2);
    });
    const afterPage = snapshot();
    expect(result.current.handleToggleHeaderCheck).not.toBe(headerAfterSelection);
    for (const key of STABLE_CALLBACK_KEYS) {
      expect(afterPage[key]).toBe(afterSelection[key]);
    }
  });
});
