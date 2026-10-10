import { describe, expect, it } from "vitest";

import { applyColumnPinningToMeta } from "./sticky-utils";
import type { ColumnMetaDef } from "./types";

const baseMeta: Record<string, ColumnMetaDef> = {
  rowControl: { minW: 80, sticky: "left", stickyOffset: 0, variant: "control" },
  name: { minW: 200 },
  status: { minW: 120 },
  actions: { minW: 72, sticky: "right", stickyOffset: 0 },
};

const columnOrder = ["rowControl", "name", "status", "actions"];

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
});
