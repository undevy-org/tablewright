import { describe, expect, it, vi } from "vitest";

import {
  applyManagedChanges,
  clearManagedFilters,
  hasActiveManagedFilters,
} from "./managed-filters";
import type { ActiveFilter } from "./filter-types";

describe("applyManagedChanges", () => {
  it("sets values and removes only active filters", () => {
    const handleSetColumnFilter = vi.fn();
    const handleRemoveColumnFilter = vi.fn();
    const orch = {
      columnFilters: [{ columnId: "status", value: ["open"] }],
      handleSetColumnFilter,
      handleRemoveColumnFilter,
    };

    applyManagedChanges(orch, [
      { columnId: "name", action: "set", value: ["x"] },
      { columnId: "missing", action: "remove" },
      { columnId: "status", action: "remove" },
    ]);

    expect(handleSetColumnFilter).toHaveBeenCalledWith("name", ["x"]);
    expect(handleRemoveColumnFilter).not.toHaveBeenCalledWith("missing");
    expect(handleRemoveColumnFilter).toHaveBeenCalledWith("status");
  });
});

describe("clearManagedFilters", () => {
  it("removes only managed ids that are active", () => {
    const handleRemoveColumnFilter = vi.fn();
    const orch = {
      columnFilters: [{ columnId: "a", value: ["1"] }, { columnId: "b", value: ["2"] }],
      handleSetColumnFilter: vi.fn(),
      handleRemoveColumnFilter,
    };

    clearManagedFilters(orch, ["a", "c"]);

    expect(handleRemoveColumnFilter).toHaveBeenCalledTimes(1);
    expect(handleRemoveColumnFilter).toHaveBeenCalledWith("a");
  });
});

describe("hasActiveManagedFilters", () => {
  const filters: ActiveFilter[] = [
    { columnId: "a", value: [] },
    { columnId: "b", value: ["x"] },
    { columnId: "c", value: { from: 0 } },
  ];

  it("is false when managed filters are empty or absent", () => {
    expect(hasActiveManagedFilters(filters, ["a", "d"])).toBe(false);
    expect(hasActiveManagedFilters([], ["b"])).toBe(false);
  });

  it("is true when a managed filter has a non-empty value", () => {
    expect(hasActiveManagedFilters(filters, ["b"])).toBe(true);
    expect(hasActiveManagedFilters(filters, ["c"])).toBe(true);
  });
});
