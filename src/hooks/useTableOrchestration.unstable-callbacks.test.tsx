import { StrictMode, useState } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { ActiveFilter, ColumnFilterConfig, ViewPreset } from "../components/data-table/filter-types";
import type { ColumnMetaDef } from "../components/data-table/types";
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

function makeConfig() {
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
  };
}

const stableConfig = makeConfig();

const UNSTABLE_PROPS = ["getRowId", "filterRow", "getSortValue", "getSearchText"] as const;

type UnstableProp = (typeof UNSTABLE_PROPS)[number];

function useInlineUnstableOrchestration(unstableProp: UnstableProp) {
  const [, setTick] = useState(0);
  const config = {
    ...stableConfig,
    ...(unstableProp === "getRowId" ? { getRowId: (row: FixtureRow) => row.id } : null),
    ...(unstableProp === "filterRow"
      ? {
          filterRow: (row: FixtureRow, filter: ActiveFilter) =>
            stableConfig.filterRow(row, filter),
        }
      : null),
    ...(unstableProp === "getSortValue"
      ? {
          getSortValue: (row: FixtureRow, columnId: string) =>
            stableConfig.getSortValue(row, columnId),
        }
      : null),
    ...(unstableProp === "getSearchText"
      ? { getSearchText: (row: FixtureRow) => stableConfig.getSearchText(row) }
      : null),
  };
  const result = useTableOrchestration(config);
  return { result, bump: () => setTick((t) => t + 1) };
}

describe("useTableOrchestration unstable callback warnings", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.stubEnv("NODE_ENV", "development");
  });

  afterEach(() => {
    warnSpy.mockRestore();
    vi.unstubAllEnvs();
  });

  for (const prop of UNSTABLE_PROPS) {
    it(`warns once for unstable ${prop} after three consecutive identity changes`, () => {
      const { result } = renderHook(() => useInlineUnstableOrchestration(prop));

      const rerenderTimes = (n: number) => {
        for (let i = 0; i < n; i++) {
          act(() => {
            result.current.bump();
          });
        }
      };

      rerenderTimes(2);
      expect(
        warnSpy.mock.calls.filter(
          (args: unknown[]) =>
            String(args[0]).includes("useTableOrchestration") && String(args[0]).includes(prop),
        ),
      ).toHaveLength(0);

      rerenderTimes(1);
      const matching = warnSpy.mock.calls.filter(
        (args: unknown[]) =>
          String(args[0]).includes("useTableOrchestration") && String(args[0]).includes(prop),
      );
      expect(matching).toHaveLength(1);
      const message = String(matching[0][0]);
      expect(message).toContain("referentially stable");
      expect(message).toContain("useCallback");
      expect(message).toContain("render loop");

      rerenderTimes(5);
      expect(
        warnSpy.mock.calls.filter(
          (args: unknown[]) =>
            String(args[0]).includes("useTableOrchestration") && String(args[0]).includes(prop),
        ),
      ).toHaveLength(1);
    });
  }

  it("does not warn for stable module-level callbacks over many re-renders", () => {
    const { result, rerender } = renderHook(() => useTableOrchestration(stableConfig));

    for (let i = 0; i < 10; i++) {
      rerender();
    }

    act(() => {
      result.current.handleHeaderSort("score", "asc");
    });
    for (let i = 0; i < 5; i++) {
      rerender();
    }

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn under StrictMode with stable callbacks", () => {
    const { rerender } = renderHook(() => useTableOrchestration(stableConfig), {
      wrapper: ({ children }) => <StrictMode>{children}</StrictMode>,
    });

    for (let i = 0; i < 10; i++) {
      rerender();
    }

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn when identity changes twice then stabilizes", () => {
    const stableGetSortValue = stableConfig.getSortValue;
    const { rerender } = renderHook(
      ({ getSortValue }: { getSortValue: typeof stableGetSortValue }) =>
        useTableOrchestration({ ...stableConfig, getSortValue }),
      { initialProps: { getSortValue: stableGetSortValue } },
    );

    const heldSort = (row: FixtureRow, columnId: string) =>
      columnId === "score" ? row.score : row.name;

    act(() => {
      rerender({
        getSortValue: (row: FixtureRow, columnId: string) =>
          columnId === "score" ? row.score : row.name,
      });
    });
    act(() => {
      rerender({ getSortValue: heldSort });
    });
    act(() => {
      rerender({ getSortValue: heldSort });
    });

    expect(
      warnSpy.mock.calls.filter((args: unknown[]) => String(args[0]).includes("getSortValue")),
    ).toHaveLength(0);

    const laterA = (row: FixtureRow, columnId: string) =>
      columnId === "score" ? row.score : row.name;
    const laterB = (row: FixtureRow, columnId: string) =>
      columnId === "score" ? row.metricValue : row.name;
    act(() => {
      rerender({ getSortValue: laterA });
    });
    act(() => {
      rerender({ getSortValue: laterB });
    });
    expect(
      warnSpy.mock.calls.filter((args: unknown[]) => String(args[0]).includes("getSortValue")),
    ).toHaveLength(0);
  });

  it("does not warn in production for inline callbacks", () => {
    vi.stubEnv("NODE_ENV", "production");

    const { result } = renderHook(() => useInlineUnstableOrchestration("getSortValue"));
    for (let i = 0; i < 6; i++) {
      act(() => {
        result.current.bump();
      });
    }

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("does not warn when process is undefined (non-bundled browser)", () => {
    const savedProcess = globalThis.process;
    vi.stubGlobal("process", undefined);

    try {
      const { result } = renderHook(() => useInlineUnstableOrchestration("getRowId"));
      for (let i = 0; i < 6; i++) {
        act(() => {
          result.current.bump();
        });
      }

      expect(warnSpy).not.toHaveBeenCalled();
    } finally {
      vi.stubGlobal("process", savedProcess);
    }
  });

  it("warns for each unstable prop independently", () => {
    function useBothUnstable() {
      const [, setTick] = useState(0);
      const config = {
        ...stableConfig,
        getRowId: (row: FixtureRow) => row.id,
        getSortValue: (row: FixtureRow, columnId: string) =>
          stableConfig.getSortValue(row, columnId),
      };
      return { result: useTableOrchestration(config), bump: () => setTick((t) => t + 1) };
    }

    const { result } = renderHook(() => useBothUnstable());
    for (let i = 0; i < 3; i++) {
      act(() => {
        result.current.bump();
      });
    }

    const messages = warnSpy.mock.calls.map((args: unknown[]) => String(args[0]));
    expect(messages.some((m) => m.includes("getRowId"))).toBe(true);
    expect(messages.some((m) => m.includes("getSortValue"))).toBe(true);
    expect(messages.filter((m) => m.includes("getRowId"))).toHaveLength(1);
    expect(messages.filter((m) => m.includes("getSortValue"))).toHaveLength(1);
  });

  it("still filters and sorts with inline callbacks (no behaviour change)", () => {
    const { result } = renderHook(() => useInlineUnstableOrchestration("getSortValue"));

    for (let i = 0; i < 4; i++) {
      act(() => {
        result.current.bump();
      });
    }

    act(() => {
      result.current.result.handleHeaderSort("score", "desc");
    });

    expect(result.current.result.filteredRows.map((r) => r.id)).toEqual([
      "5",
      "4",
      "1",
      "3",
      "2",
    ]);
    expect(result.current.result.paginatedRows.map((r) => r.id)).toEqual(["5", "4"]);
  });
});
