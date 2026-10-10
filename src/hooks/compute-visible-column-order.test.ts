import { describe, expect, it } from "vitest";

import type { ColumnGap } from "../components/data-table/filter-types";
import type { ColumnMetaDef } from "../components/data-table/types";
import { gapColumnId } from "../lib/column-gaps";
import { computeVisibleColumnOrder } from "./useTableOrchestration";

const columnMeta: Record<string, ColumnMetaDef> = {
  rowControl: { minW: 48, variant: "control" },
  name: { minW: 120 },
  status: { minW: 100 },
  score: { minW: 80 },
  actions: { minW: 64 },
};

const toggleableColumnIds = ["name", "status", "score"];

describe("computeVisibleColumnOrder", () => {
  it("includes rowControl and actions when present in column meta", () => {
    const order = computeVisibleColumnOrder({
      columnMeta,
      toggleableColumnIds,
      columnVisibility: {},
      columnGaps: [],
    });

    expect(order).toEqual(["rowControl", "name", "status", "score", "actions"]);
  });

  it("omits rowControl and actions when absent from column meta", () => {
    const order = computeVisibleColumnOrder({
      columnMeta: { name: { minW: 1 }, status: { minW: 1 } },
      toggleableColumnIds: ["name", "status"],
      columnVisibility: {},
      columnGaps: [],
    });

    expect(order).toEqual(["name", "status"]);
  });

  it("skips hidden toggleable columns", () => {
    const order = computeVisibleColumnOrder({
      columnMeta: { name: { minW: 1 }, status: { minW: 1 }, score: { minW: 1 } },
      toggleableColumnIds,
      columnVisibility: { status: false },
      columnGaps: [],
    });

    expect(order).toEqual(["name", "score"]);
  });

  it("inserts a gap column after its anchor column", () => {
    const gaps: ColumnGap[] = [{ afterColumnId: "name", hiddenIds: ["status"] }];
    const order = computeVisibleColumnOrder({
      columnMeta: { name: { minW: 1 }, status: { minW: 1 } },
      toggleableColumnIds: ["name"],
      columnVisibility: {},
      columnGaps: gaps,
    });

    expect(order).toEqual(["name", gapColumnId("name")]);
  });

  it("prepends a gap column when afterColumnId is null", () => {
    const gaps: ColumnGap[] = [{ afterColumnId: null, hiddenIds: ["status"] }];
    const order = computeVisibleColumnOrder({
      columnMeta: { name: { minW: 1 }, status: { minW: 1 } },
      toggleableColumnIds: ["name"],
      columnVisibility: {},
      columnGaps: gaps,
    });

    expect(order).toEqual([gapColumnId(null), "name"]);
  });

  it("ignores gap insertion when the anchor column is not in the order", () => {
    const gaps: ColumnGap[] = [{ afterColumnId: "missing", hiddenIds: ["status"] }];
    const order = computeVisibleColumnOrder({
      columnMeta: { name: { minW: 1 } },
      toggleableColumnIds: ["name"],
      columnVisibility: {},
      columnGaps: gaps,
    });

    expect(order).toEqual(["name"]);
  });
});
