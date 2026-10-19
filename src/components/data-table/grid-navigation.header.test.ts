import { describe, expect, it } from "vitest";

import { clampGridPosition, nextGridPosition, type GridSize } from "./grid-navigation";

const size: GridSize = { rowCount: 20, columnCount: 4, firstRow: -1 };
const press = (row: number, col: number, key: string, ctrl = false, s: GridSize = size) =>
  nextGridPosition({ row, col }, key, { ...s, ctrl });

describe("grid-navigation with a header row", () => {
  it("ArrowUp from row 0 goes to the header row", () => {
    expect(press(0, 2, "ArrowUp")).toEqual({ row: -1, col: 2 });
  });

  it("ArrowUp from the header row stays (no wrap)", () => {
    expect(press(-1, 2, "ArrowUp")).toEqual({ row: -1, col: 2 });
  });

  it("Ctrl+Home goes to the header row, column 0", () => {
    expect(press(7, 3, "Home", true)).toEqual({ row: -1, col: 0 });
  });

  it("Ctrl+End is unchanged", () => {
    expect(press(-1, 0, "End", true)).toEqual({ row: 19, col: 3 });
  });

  it("PageUp from row 5 goes to the header row", () => {
    expect(press(5, 1, "PageUp")).toEqual({ row: -1, col: 1 });
  });

  it("PageDown from the header row moves a page down to row 9", () => {
    expect(press(-1, 1, "PageDown")).toEqual({ row: 9, col: 1 });
  });

  it("PageDown from the header row clamps to the last row", () => {
    expect(press(-1, 1, "PageDown", false, { ...size, rowCount: 4 })).toEqual({ row: 3, col: 1 });
  });

  it("ArrowDown from the header row goes to row 0", () => {
    expect(press(-1, 2, "ArrowDown")).toEqual({ row: 0, col: 2 });
  });

  it("Home / End / ArrowLeft / ArrowRight stay in the header row", () => {
    expect(press(-1, 2, "Home")).toEqual({ row: -1, col: 0 });
    expect(press(-1, 2, "End")).toEqual({ row: -1, col: 3 });
    expect(press(-1, 2, "ArrowLeft")).toEqual({ row: -1, col: 1 });
    expect(press(-1, 2, "ArrowRight")).toEqual({ row: -1, col: 3 });
  });

  it("still returns null for unknown keys and for an empty grid", () => {
    expect(press(0, 0, "Enter")).toBeNull();
    expect(press(0, 0, "ArrowDown", false, { ...size, rowCount: 0 })).toBeNull();
  });

  it("clampGridPosition keeps -1 and pulls -5 to -1 and 99 to the last row", () => {
    expect(clampGridPosition({ row: -1, col: 0 }, 20, 4, -1)).toEqual({ row: -1, col: 0 });
    expect(clampGridPosition({ row: -5, col: 0 }, 20, 4, -1)).toEqual({ row: -1, col: 0 });
    expect(clampGridPosition({ row: 99, col: 0 }, 20, 4, -1)).toEqual({ row: 19, col: 0 });
  });

  it("without firstRow behaves as before", () => {
    const s = { rowCount: 20, columnCount: 4 };
    expect(press(0, 1, "ArrowUp", false, s)).toEqual({ row: 0, col: 1 });
    expect(press(5, 1, "Home", true, s)).toEqual({ row: 0, col: 0 });
    expect(clampGridPosition({ row: -1, col: 0 }, 20, 4)).toEqual({ row: 0, col: 0 });
  });
});
