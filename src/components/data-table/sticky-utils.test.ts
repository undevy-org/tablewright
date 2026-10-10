import { describe, expect, it } from "vitest";

import { applyColumnPinningToMeta, columnWidthPx } from "./sticky-utils";
import type { ColumnMetaDef } from "./types";

const baseMeta: Record<string, ColumnMetaDef> = {
  rowControl: { minW: 80, sticky: "left", stickyOffset: 0, variant: "control" },
  name: { minW: 200 },
  status: { minW: 120 },
  actions: { minW: 72, sticky: "right", stickyOffset: 0 },
};

const columnOrder = ["rowControl", "name", "status", "actions"];

describe("columnWidthPx", () => {
  it("returns zero when the column id is missing from base meta", () => {
    expect(columnWidthPx("missing", {})).toBe(0);
  });
});

describe("applyColumnPinningToMeta", () => {
  it("pins left with increasing offsets after existing left-sticky columns", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: ["name"] },
      { columnOrder, columnWidths: { rowControl: 80, name: 200 } },
    );

    expect(merged.rowControl).toMatchObject({ sticky: "left", stickyOffset: 0 });
    expect(merged.name).toMatchObject({ sticky: "left", stickyOffset: 80 });
    expect(merged.status?.sticky).toBeUndefined();
    expect(merged.actions).toMatchObject({ sticky: "right", stickyOffset: 0 });
  });

  it("pins right with offsets from the right edge", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { right: ["status"] },
      { columnOrder, columnWidths: { actions: 72, status: 120 } },
    );

    expect(merged.status).toMatchObject({ sticky: "right", stickyOffset: 72 });
    expect(merged.actions).toMatchObject({ sticky: "right", stickyOffset: 0 });
  });

  it("unpin removes sticky override and preserves control column base sticky", () => {
    const merged = applyColumnPinningToMeta(baseMeta, {}, { columnOrder });

    expect(merged.rowControl).toMatchObject({ sticky: "left", stickyOffset: 0 });
    expect(merged.name?.sticky).toBeUndefined();
    expect(merged.actions).toMatchObject({ sticky: "right", stickyOffset: 0 });
  });

  it("stacks multiple left pins in column order", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: ["name", "status"] },
      {
        columnOrder,
        columnWidths: { rowControl: 80, name: 200, status: 120 },
      },
    );

    expect(merged.name).toMatchObject({ sticky: "left", stickyOffset: 80 });
    expect(merged.status).toMatchObject({ sticky: "left", stickyOffset: 280 });
  });

  it("falls back to meta.minW when columnWidths are omitted", () => {
    const merged = applyColumnPinningToMeta(baseMeta, { left: ["name"] }, { columnOrder });

    expect(merged.name).toMatchObject({ sticky: "left", stickyOffset: 80 });
  });

  it("computes right sticky offsets from minW when columnWidths are omitted", () => {
    const merged = applyColumnPinningToMeta(baseMeta, { right: ["status"] }, { columnOrder });

    expect(merged.status).toMatchObject({ sticky: "right", stickyOffset: 72 });
  });

  it("uses base meta key order when columnOrder is omitted", () => {
    const merged = applyColumnPinningToMeta(
      { a: { minW: 10 }, b: { minW: 20 } },
      { left: ["a", "b"] },
    );

    expect(merged.a).toMatchObject({ sticky: "left", stickyOffset: 0 });
    expect(merged.b).toMatchObject({ sticky: "left", stickyOffset: 10 });
  });

  it("treats missing pinning lists as empty", () => {
    const merged = applyColumnPinningToMeta(baseMeta, {}, { columnOrder });

    expect(merged.name?.sticky).toBeUndefined();
    expect(merged.rowControl).toMatchObject({ sticky: "left" });
  });

  it("handles undefined left and right arrays in pinning state", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: undefined, right: undefined },
      { columnOrder },
    );

    expect(merged.name?.sticky).toBeUndefined();
  });

  it("computes right offsets without an options object", () => {
    const merged = applyColumnPinningToMeta(baseMeta, { right: ["status"] });

    expect(merged.status).toMatchObject({ sticky: "right", stickyOffset: 72 });
  });

  it("computes left offsets without columnWidths in options", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: ["name"] },
      { columnOrder },
    );

    expect(merged.name).toMatchObject({ sticky: "left", stickyOffset: 80 });
  });

  it("skips unknown column ids in columnOrder when computing offsets", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: ["name"] },
      { columnOrder: ["rowControl", "missingGap", "name", "actions"] },
    );

    expect(merged.name).toMatchObject({ sticky: "left", stickyOffset: 80 });
  });

  it("uses minW when columnWidths omits a pinned column", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: ["name", "status"] },
      { columnOrder, columnWidths: { rowControl: 80 } },
    );

    expect(merged.status).toMatchObject({ sticky: "left", stickyOffset: 280 });
  });

  it("falls back to minW when columnWidths is null", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: ["name"] },
      {
        columnOrder,
        columnWidths: null as unknown as Record<string, number>,
      },
    );

    expect(merged.name).toMatchObject({ sticky: "left", stickyOffset: 80 });
  });

  it("uses an empty left pin set when pinning.left is null", () => {
    const merged = applyColumnPinningToMeta(
      baseMeta,
      { left: null as unknown as string[], right: [] },
      { columnOrder },
    );

    expect(merged.name?.sticky).toBeUndefined();
  });

  it("does not pin a sentinel column when pinning.left is omitted", () => {
    const meta = {
      "Stryker was here": { minW: 1 },
      name: { minW: 10 },
    };
    const merged = applyColumnPinningToMeta(meta, {}, { columnOrder: ["Stryker was here", "name"] });

    expect(merged["Stryker was here"]?.sticky).toBeUndefined();
    expect(merged.name?.sticky).toBeUndefined();
  });

  it("does not pin a sentinel column when pinning.right is omitted", () => {
    const meta = {
      "Stryker was here": { minW: 1 },
      name: { minW: 10 },
    };
    const merged = applyColumnPinningToMeta(
      meta,
      { left: [] },
      { columnOrder: ["name", "Stryker was here"] },
    );

    expect(merged["Stryker was here"]?.sticky).toBeUndefined();
  });

  it("uses zero width when pinned column meta is missing minW and columnWidths", () => {
    const merged = applyColumnPinningToMeta(
      { lead: { minW: 40 }, tail: { minW: 0 } },
      { left: ["lead", "tail"] },
      { columnOrder: ["lead", "tail"] },
    );

    expect(merged.tail).toMatchObject({ sticky: "left", stickyOffset: 40 });
  });

  it("prefers columnWidths over minW when stacking left pin offsets", () => {
    const merged = applyColumnPinningToMeta(
      { gap: { minW: 1 }, name: { minW: 10 } },
      { left: ["gap", "name"] },
      { columnOrder: ["gap", "name"], columnWidths: { gap: 25 } },
    );

    expect(merged.name).toMatchObject({ sticky: "left", stickyOffset: 25 });
  });

  it("empty pinning deep-equals base meta when static left stickies have custom offsets (B21)", () => {
    const reproMeta: Record<string, ColumnMetaDef> = {
      rowControl: { minW: 60, sticky: "left", stickyOffset: 0 },
      name: { minW: 100, sticky: "left", stickyOffset: 72 },
      amount: { minW: 120 },
      actions: { minW: 72, sticky: "right", stickyOffset: 0 },
    };
    const reproOrder = ["rowControl", "name", "amount", "actions"];

    const merged = applyColumnPinningToMeta(
      reproMeta,
      { left: [], right: [] },
      { columnOrder: reproOrder },
    );

    expect(merged).toEqual(reproMeta);
    expect(merged.name.stickyOffset).toBe(72);
  });

  it("undefined pinning lists deep-equal base meta (B21)", () => {
    const reproMeta: Record<string, ColumnMetaDef> = {
      rowControl: { minW: 60, sticky: "left", stickyOffset: 0 },
      name: { minW: 100, sticky: "left", stickyOffset: 72 },
      amount: { minW: 120 },
      actions: { minW: 72, sticky: "right", stickyOffset: 0 },
    };

    const merged = applyColumnPinningToMeta(reproMeta, {}, { columnOrder: ["rowControl", "name", "amount", "actions"] });

    expect(merged).toEqual(reproMeta);
  });

  it("leaves unpinned columns unchanged when a sibling is pinned (B21)", () => {
    const meta: Record<string, ColumnMetaDef> = {
      rowControl: { minW: 60, sticky: "left", stickyOffset: 0, variant: "control" },
      name: { minW: 100, sticky: "left", stickyOffset: 72 },
      amount: { minW: 120 },
      actions: { minW: 72, sticky: "right", stickyOffset: 0 },
    };
    const order = ["rowControl", "name", "amount", "actions"];

    const merged = applyColumnPinningToMeta(meta, { left: ["amount"] }, { columnOrder: order });

    expect(merged.rowControl).toEqual(meta.rowControl);
    expect(merged.name).toEqual(meta.name);
    expect(merged.actions).toEqual(meta.actions);
    expect(merged.amount).toMatchObject({ sticky: "left", stickyOffset: 172 });
  });

  it("pinned left offset uses static stickyOffset plus width for preceding stickies (B21)", () => {
    const meta: Record<string, ColumnMetaDef> = {
      rowControl: { minW: 60, sticky: "left", stickyOffset: 0 },
      name: { minW: 100, sticky: "left", stickyOffset: 72 },
      amount: { minW: 120 },
    };

    const merged = applyColumnPinningToMeta(
      meta,
      { left: ["amount"] },
      { columnOrder: ["rowControl", "name", "amount"] },
    );

    expect(merged.name.stickyOffset).toBe(72);
    expect(merged.amount).toMatchObject({ sticky: "left", stickyOffset: 172 });
  });

  it("two static right stickies unchanged under empty pinning (B21)", () => {
    const meta: Record<string, ColumnMetaDef> = {
      amount: { minW: 120 },
      status: { minW: 80, sticky: "right", stickyOffset: 72 },
      actions: { minW: 72, sticky: "right", stickyOffset: 0 },
    };

    const merged = applyColumnPinningToMeta(
      meta,
      { left: [], right: [] },
      { columnOrder: ["amount", "status", "actions"] },
    );

    expect(merged).toEqual(meta);
  });

  it("pinned right offset walks from end with static right stickies (B21)", () => {
    const meta: Record<string, ColumnMetaDef> = {
      name: { minW: 100 },
      amount: { minW: 120 },
      status: { minW: 80, sticky: "right", stickyOffset: 72 },
      actions: { minW: 72, sticky: "right", stickyOffset: 0 },
    };

    const merged = applyColumnPinningToMeta(
      meta,
      { right: ["amount"] },
      { columnOrder: ["name", "amount", "status", "actions"] },
    );

    expect(merged.status).toEqual(meta.status);
    expect(merged.actions).toEqual(meta.actions);
    expect(merged.amount).toMatchObject({ sticky: "right", stickyOffset: 152 });
  });

  it("keeps custom static right stickyOffset when a column is pinned on the right (B21)", () => {
    const meta: Record<string, ColumnMetaDef> = {
      name: { minW: 100 },
      amount: { minW: 120 },
      status: { minW: 80, sticky: "right", stickyOffset: 100 },
      actions: { minW: 72, sticky: "right", stickyOffset: 0 },
    };

    const merged = applyColumnPinningToMeta(
      meta,
      { right: ["amount"] },
      { columnOrder: ["name", "amount", "status", "actions"] },
    );

    expect(merged.status.stickyOffset).toBe(100);
    expect(merged.amount).toMatchObject({ sticky: "right", stickyOffset: 180 });
  });

  it("stacks multiple right pins using running offset after static stickies (B21)", () => {
    const meta: Record<string, ColumnMetaDef> = {
      lead: { minW: 50 },
      mid: { minW: 40 },
      tail: { minW: 30, sticky: "right", stickyOffset: 0 },
    };

    const merged = applyColumnPinningToMeta(
      meta,
      { right: ["lead", "mid"] },
      { columnOrder: ["lead", "mid", "tail"] },
    );

    expect(merged.tail).toEqual(meta.tail);
    expect(merged.mid).toMatchObject({ sticky: "right", stickyOffset: 30 });
    expect(merged.lead).toMatchObject({ sticky: "right", stickyOffset: 70 });
  });
});
