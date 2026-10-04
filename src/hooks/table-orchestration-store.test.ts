import { describe, expect, it } from "vitest";

import { createTableOrchestrationStore } from "./table-orchestration-store";

type ViewKey = "all" | "custom";

function makeStore(initialView: ViewKey = "all") {
  return createTableOrchestrationStore<ViewKey>({
    defaultViewKey: initialView,
    initialRowsPerPage: 10,
    initialColumnVisibility: { col: false },
  });
}

describe("createTableOrchestrationStore", () => {
  it("marks custom view and resets page on filter mutations", () => {
    const store = makeStore();
    store.getState().setPage(3);

    store.getState().setColumnFilters([{ columnId: "x", value: ["a"] }]);
    expect(store.getState().activeView).toBe("custom");
    expect(store.getState().page).toBe(1);

    store.getState().setPage(2);
    store.getState().addColumnFilter("y", []);
    expect(store.getState().activeView).toBe("custom");
    expect(store.getState().page).toBe(1);

    store.getState().setPage(2);
    store.getState().removeColumnFilter("x");
    expect(store.getState().page).toBe(1);

    store.getState().setPage(2);
    store.getState().changeColumnFilter("y", ["z"]);
    expect(store.getState().page).toBe(1);

    store.getState().setPage(2);
    store.getState().setColumnFilter("z", ["w"]);
    expect(store.getState().page).toBe(1);
  });

  it("shows a hidden column when adding or setting its filter", () => {
    const store = makeStore();
    store.getState().addColumnFilter("col", []);
    expect(store.getState().columnVisibility.col).toBe(true);
  });

  it("marks custom view and resets page on sort mutations", () => {
    const store = makeStore();
    store.getState().setPage(4);

    store.getState().toggleSort("name", "asc");
    expect(store.getState().activeView).toBe("custom");
    expect(store.getState().page).toBe(1);

    store.getState().setPage(2);
    store.getState().removeSort();
    expect(store.getState().activeView).toBe("custom");
    expect(store.getState().page).toBe(1);
  });

  it("does not reset page on setCurrentSort (no goCustom)", () => {
    const store = makeStore();
    store.getState().setPage(3);
    store.getState().setCurrentSort({ columnId: "a", direction: "asc" });
    expect(store.getState().activeView).toBe("all");
    expect(store.getState().page).toBe(3);
  });

  it("marks custom on resetColumns without resetting page", () => {
    const store = makeStore();
    store.getState().setPage(5);
    store.getState().resetColumns();
    expect(store.getState().activeView).toBe("custom");
    expect(store.getState().page).toBe(5);
  });

  it("applyPreset restores view, filters, sort, visibility, and page", () => {
    const store = makeStore();
    store.getState().setPage(3);
    store.getState().applyPreset({
      key: "all",
      filters: [{ columnId: "f", value: ["v"] }],
      sort: { columnId: "name", direction: "desc" },
      columnVisibility: { a: false },
    });

    const s = store.getState();
    expect(s.activeView).toBe("all");
    expect(s.columnFilters).toEqual([{ columnId: "f", value: ["v"] }]);
    expect(s.currentSort).toEqual({ columnId: "name", direction: "desc" });
    expect(s.columnVisibility).toEqual({ a: false });
    expect(s.page).toBe(1);
    expect(s.newestFilterColumnId).toBeNull();
  });

  it("clearAll resets to the default view", () => {
    const store = makeStore();
    store.getState().setColumnFilters([{ columnId: "x", value: ["1"] }]);
    store.getState().setCurrentSort({ columnId: "a", direction: "asc" });
    store.getState().setPage(2);

    store.getState().clearAll("all");

    const s = store.getState();
    expect(s.activeView).toBe("all");
    expect(s.columnFilters).toEqual([]);
    expect(s.currentSort).toBeNull();
    expect(s.columnVisibility).toEqual({});
    expect(s.page).toBe(1);
  });

  it("selection actions update selectedIds and drawer row", () => {
    const store = makeStore();

    store.getState().toggleRowSelection("1");
    expect(store.getState().selectedIds).toEqual(new Set(["1"]));

    store.getState().toggleRowSelection("1");
    expect(store.getState().selectedIds).toEqual(new Set());

    store.getState().toggleHeaderCheck(["a", "b"], false);
    expect(store.getState().selectedIds).toEqual(new Set(["a", "b"]));

    store.getState().toggleHeaderCheck(["a", "b"], true);
    expect(store.getState().selectedIds).toEqual(new Set());

    store.getState().toggleSelectedRowId("row-1");
    expect(store.getState().selectedRowId).toBe("row-1");
    store.getState().toggleSelectedRowId("row-1");
    expect(store.getState().selectedRowId).toBeNull();
  });

  it("submitSearch copies input to query and resets page", () => {
    const store = makeStore();
    store.getState().setSearchInput("find me");
    store.getState().setPage(2);
    store.getState().submitSearch();
    expect(store.getState().searchQuery).toBe("find me");
    expect(store.getState().page).toBe(1);
  });
});
