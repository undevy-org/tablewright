import { describe, expect, it } from "vitest";

import { clampGridPosition, GRID_PAGE_SIZE, nextGridPosition } from "./grid-navigation";

const size = { rowCount: 30, columnCount: 5 };
const at = (row: number, col: number) => ({ row, col });
const press = (pos: { row: number; col: number }, key: string, ctrl = false) =>
  nextGridPosition(pos, key, { ...size, ctrl });

describe("nextGridPosition", () => {
  it("moves one cell with each arrow key", () => {
    expect(press(at(5, 2), "ArrowUp")).toEqual(at(4, 2));
    expect(press(at(5, 2), "ArrowDown")).toEqual(at(6, 2));
    expect(press(at(5, 2), "ArrowLeft")).toEqual(at(5, 1));
    expect(press(at(5, 2), "ArrowRight")).toEqual(at(5, 3));
  });

  it("clamps at every edge without wrapping", () => {
    expect(press(at(0, 2), "ArrowUp")).toEqual(at(0, 2));
    expect(press(at(29, 2), "ArrowDown")).toEqual(at(29, 2));
    expect(press(at(5, 0), "ArrowLeft")).toEqual(at(5, 0));
    expect(press(at(5, 4), "ArrowRight")).toEqual(at(5, 4));
  });

  it("uses Home/End within the row and Ctrl+Home/Ctrl+End for the grid corners", () => {
    expect(press(at(7, 2), "Home")).toEqual(at(7, 0));
    expect(press(at(7, 2), "End")).toEqual(at(7, 4));
    expect(press(at(7, 2), "Home", true)).toEqual(at(0, 0));
    expect(press(at(7, 2), "End", true)).toEqual(at(29, 4));
  });

  it("moves PageUp/PageDown by 10 rows, clamps at both ends and keeps the column", () => {
    expect(GRID_PAGE_SIZE).toBe(10);
    expect(press(at(15, 3), "PageUp")).toEqual(at(5, 3));
    expect(press(at(15, 3), "PageDown")).toEqual(at(25, 3));
    expect(press(at(4, 3), "PageUp")).toEqual(at(0, 3));
    expect(press(at(25, 3), "PageDown")).toEqual(at(29, 3));
  });

  it("returns null for unknown keys, Ctrl with other keys and an empty grid", () => {
    expect(press(at(1, 1), "a")).toBeNull();
    expect(press(at(1, 1), "Enter")).toBeNull();
    expect(press(at(1, 1), "ArrowDown", true)).toBeNull();
    expect(nextGridPosition(at(0, 0), "ArrowDown", { rowCount: 0, columnCount: 3, ctrl: false })).toBeNull();
    expect(nextGridPosition(at(0, 0), "ArrowDown", { rowCount: 3, columnCount: 0, ctrl: false })).toBeNull();
  });
});

describe("clampGridPosition", () => {
  it("pulls an out-of-range position back inside the grid", () => {
    expect(clampGridPosition(at(9, 9), 3, 4)).toEqual(at(2, 3));
    expect(clampGridPosition(at(-2, -1), 3, 4)).toEqual(at(0, 0));
  });

  it("keeps an in-range position", () => {
    expect(clampGridPosition(at(1, 2), 3, 4)).toEqual(at(1, 2));
  });
});
