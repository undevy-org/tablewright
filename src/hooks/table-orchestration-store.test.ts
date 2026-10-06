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

  it("hideColumn updates visibility without switching to custom view", () => {
    const store = makeStore("all");
    store.getState().showColumns(["other"]);
    expect(store.getState().columnVisibility.other).toBe(true);

    store.getState().hideColumn("other");
    expect(store.getState().columnVisibility.other).toBe(false);
    expect(store.getState().activeView).toBe("all");
  });

  it("hideColumn does not change activeView when already on custom", () => {
    const store = makeStore("all");
    store.getState().toggleSort("name", "asc");
    expect(store.getState().activeView).toBe("custom");

    store.getState().hideColumn("visible");
    expect(store.getState().columnVisibility.visible).toBe(false);
    expect(store.getState().activeView).toBe("custom");
  });

  it("setColumnVisibility accepts a value or updater without changing activeView", () => {
    const store = makeStore("all");
    store.getState().setColumnVisibility({ a: false, b: true });
    expect(store.getState().columnVisibility).toEqual({ a: false, b: true });
    expect(store.getState().activeView).toBe("all");

    store.getState().setColumnVisibility((prev) => ({ ...prev, c: true }));
    expect(store.getState().columnVisibility).toEqual({ a: false, b: true, c: true });
    expect(store.getState().activeView).toBe("all");
  });

  it("showColumns merges visibility without changing activeView", () => {
    const store = makeStore("all");
    store.getState().hideColumn("keep-hidden");
    store.getState().showColumns(["x", "y"]);
    expect(store.getState().columnVisibility).toEqual({
      col: false,
      "keep-hidden": false,
      x: true,
      y: true,
    });
    expect(store.getState().activeView).toBe("all");
  });

  it("setRowsPerPage resets page to 1", () => {
    const store = makeStore();
    store.getState().setPage(4);
    store.getState().setRowsPerPage(25);
    expect(store.getState().rowsPerPage).toBe(25);
    expect(store.getState().page).toBe(1);
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
