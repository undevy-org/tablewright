import { afterEach, describe, expect, it } from "vitest";

import { focusGridCellNear } from "./grid-focus";

afterEach(() => {
  document.body.innerHTML = "";
});

/** cells: [row, col] pairs rendered as focusable divs. */
function mount(cells: Array<[number, number]>): HTMLElement {
  const root = document.createElement("div");
  for (const [row, col] of cells) {
    const cell = document.createElement("div");
    cell.tabIndex = -1;
    cell.setAttribute("data-grid-row", String(row));
    cell.setAttribute("data-grid-col", String(col));
    root.appendChild(cell);
  }
  document.body.appendChild(root);
  return root;
}

const full = (rows: number, cols: number, header = true): Array<[number, number]> => {
  const out: Array<[number, number]> = [];
  for (let r = header ? -1 : 0; r < rows; r++) for (let c = 0; c < cols; c++) out.push([r, c]);
  return out;
};

const focused = () => {
  const el = document.activeElement as HTMLElement;
  return [el.getAttribute("data-grid-row"), el.getAttribute("data-grid-col")];
};

describe("focusGridCellNear", () => {
  it("focuses the exact position", () => {
    const root = mount(full(3, 3));
    expect(focusGridCellNear(root, 1, 2)).toBe(true);
    expect(focused()).toEqual(["1", "2"]);
  });

  it("clamps a row beyond the last body row to the last, same column", () => {
    const root = mount(full(3, 3));
    expect(focusGridCellNear(root, 9, 1)).toBe(true);
    expect(focused()).toEqual(["2", "1"]);
  });

  it("clamps a column beyond the last to the last column", () => {
    const root = mount(full(3, 3));
    focusGridCellNear(root, 1, 9);
    expect(focused()).toEqual(["1", "2"]);
  });

  it("never chooses a header cell, even for row -1", () => {
    const root = mount(full(2, 2));
    focusGridCellNear(root, -1, 1);
    expect(focused()).toEqual(["0", "1"]);
    focusGridCellNear(root, -5, 0);
    expect(focused()).toEqual(["0", "0"]);
  });

  it("falls back to the nearest existing column when the clamped row lacks it", () => {
    const root = mount([
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [1, 1],
    ]);
    focusGridCellNear(root, 1, 2);
    expect(focused()).toEqual(["0", "2"]);
    focusGridCellNear(root, 5, 4);
    expect(focused()).toEqual(["1", "1"]);
  });

  it("returns false and focuses nothing when there is no body cell", () => {
    const root = mount([
      [-1, 0],
      [-1, 1],
    ]);
    expect(focusGridCellNear(root, 0, 0)).toBe(false);
    expect(document.activeElement).toBe(document.body);
    expect(focusGridCellNear(mount([]), 0, 0)).toBe(false);
  });

  it("prefers the lower row when two rows are equally near", () => {
    const root = mount([[0, 0], [2, 0]]);
    focusGridCellNear(root, 1, 0);
    expect(focused()).toEqual(["0", "0"]);
  });
});
