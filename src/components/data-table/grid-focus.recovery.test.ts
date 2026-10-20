import { afterEach, describe, expect, it } from "vitest";

import {
  findNearestGridCell,
  findNearestHeaderControl,
  getCellPosition,
  type CellPosition,
} from "./grid-focus";

afterEach(() => {
  document.body.innerHTML = "";
});

interface Spec {
  /** Header cells; `true` = a control, `false` = plain text. */
  head: boolean[];
  rows: number;
  cols: number;
  grid?: boolean;
}

function build({ head, rows, cols, grid = true }: Spec): HTMLTableElement {
  const table = document.createElement("table");
  const headCells = head
    .map((control, col) => {
      const attrs = grid ? ` data-grid-row="-1" data-grid-col="${col}"` : "";
      return `<th${attrs}>${control ? `<button id="h${col}">h${col}</button>` : "text"}</th>`;
    })
    .join("");
  const bodyRows = Array.from({ length: rows }, (_, row) => {
    const cells = Array.from({ length: cols }, (_, col) => {
      const attrs = grid ? ` data-grid-row="${row}" data-grid-col="${col}"` : "";
      return `<td${attrs}><button id="b${row}-${col}">x</button></td>`;
    }).join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  table.innerHTML = `<thead><tr>${headCells}</tr></thead><tbody>${bodyRows}</tbody>`;
  document.body.appendChild(table);
  return table;
}

const pos = (over: Partial<CellPosition>): CellPosition => ({
  region: "body",
  gridRow: 0,
  gridCol: 0,
  rowIndex: 0,
  cellIndex: 0,
  ...over,
});

describe("getCellPosition", () => {
  it("reads the region, grid coordinates and DOM indexes of the containing cell", () => {
    const table = build({ head: [true, true, true], rows: 3, cols: 3 });
    expect(getCellPosition(table, table.querySelector("#h2")!)).toEqual({
      region: "head",
      gridRow: -1,
      gridCol: 2,
      rowIndex: 0,
      cellIndex: 2,
    });
    expect(getCellPosition(table, table.querySelector("#b2-1")!)).toEqual({
      region: "body",
      gridRow: 2,
      gridCol: 1,
      rowIndex: 2,
      cellIndex: 1,
    });
  });

  it("reads the cell itself and a cell without grid attributes", () => {
    const table = build({ head: [true, true], rows: 1, cols: 2, grid: false });
    const cell = table.querySelectorAll("td")[1];
    expect(getCellPosition(table, cell)).toEqual({
      region: "body",
      gridRow: null,
      gridCol: null,
      rowIndex: 0,
      cellIndex: 1,
    });
  });

  it("is null outside any cell and for a cell of another table", () => {
    const table = build({ head: [true], rows: 1, cols: 1 });
    const other = document.createElement("div");
    other.innerHTML = "<table><tbody><tr><td><i id='o'></i></td></tr></tbody></table>";
    document.body.appendChild(other);
    expect(getCellPosition(table, table)).toBeNull();
    expect(getCellPosition(table, other.querySelector("#o")!)).toBeNull();
    const loose = document.createElement("button");
    document.body.appendChild(loose);
    expect(getCellPosition(table, loose)).toBeNull();
  });
});

describe("findNearestGridCell", () => {
  const cellAt = (el: HTMLElement | null) =>
    el && `${el.getAttribute("data-grid-row")}:${el.getAttribute("data-grid-col")}`;

  it("header origin: the header cell of the same column, clamped to the last", () => {
    const table = build({ head: [true, true, true], rows: 3, cols: 3 });
    const origin = pos({ region: "head", gridRow: -1, gridCol: 1 });
    expect(cellAt(findNearestGridCell(table, origin))).toBe("-1:1");
    expect(cellAt(findNearestGridCell(table, { ...origin, gridCol: 7 }))).toBe("-1:2");
  });

  it("body origin: same cell, last row beyond, last column beyond", () => {
    const table = build({ head: [true, true, true], rows: 3, cols: 3 });
    expect(cellAt(findNearestGridCell(table, pos({ gridRow: 1, gridCol: 1 })))).toBe("1:1");
    expect(cellAt(findNearestGridCell(table, pos({ gridRow: 9, gridCol: 1 })))).toBe("2:1");
    expect(cellAt(findNearestGridCell(table, pos({ gridRow: 1, gridCol: 9 })))).toBe("1:2");
  });

  it("body origin: equal distance goes to the lower index", () => {
    const table = build({ head: [true, true, true, true], rows: 4, cols: 4 });
    table.querySelector('[data-grid-row="1"]')!.parentElement!.remove();
    // row 1 is missing: rows 0 and 2 are equally far
    expect(cellAt(findNearestGridCell(table, pos({ gridRow: 1, gridCol: 1 })))).toBe("0:1");
    // column 1 is missing in row 0: columns 0 and 2 are equally far
    table.querySelector('[data-grid-row="0"][data-grid-col="1"]')!.remove();
    table.querySelector('[data-grid-row="2"][data-grid-col="1"]')!.remove();
    expect(cellAt(findNearestGridCell(table, pos({ gridRow: 1, gridCol: 1 })))).toBe("3:1");
  });

  it("body origin without grid attributes falls back to the DOM indexes", () => {
    const table = build({ head: [true, true], rows: 2, cols: 2 });
    const origin = pos({ gridRow: null, gridCol: null, rowIndex: 1, cellIndex: 1 });
    expect(cellAt(findNearestGridCell(table, origin))).toBe("1:1");
  });

  it("a body origin never yields a header cell and a header origin never a body cell", () => {
    const headOnly = build({ head: [true, true], rows: 0, cols: 2 });
    expect(findNearestGridCell(headOnly, pos({ gridRow: 0, gridCol: 0 }))).toBeNull();
    document.body.innerHTML = "";
    const table = build({ head: [true, true], rows: 2, cols: 2 });
    table.querySelectorAll("th").forEach((th) => th.remove());
    expect(findNearestGridCell(table, pos({ region: "head", gridRow: -1, gridCol: 0 }))).toBeNull();
  });
});

describe("findNearestHeaderControl", () => {
  const idOf = (el: HTMLElement | null) => el && el.id;
  const head = (cellIndex: number, rowIndex = 0) =>
    pos({ region: "head", gridRow: null, gridCol: null, rowIndex, cellIndex });

  it("prefers the same index, then outward with ties to the lower index", () => {
    const table = build({ head: [true, true, true, true, true], rows: 1, cols: 5, grid: false });
    expect(idOf(findNearestHeaderControl(table, head(2)))).toBe("h2");
    table.querySelector("#h2")!.remove();
    expect(idOf(findNearestHeaderControl(table, head(2)))).toBe("h1");
    table.querySelector("#h1")!.remove();
    expect(idOf(findNearestHeaderControl(table, head(2)))).toBe("h3");
  });

  it("skips cells without a control, and an index beyond the last uses the last cell", () => {
    const table = build({ head: [true, false, false], rows: 1, cols: 3, grid: false });
    expect(idOf(findNearestHeaderControl(table, head(2)))).toBe("h0");
    expect(idOf(findNearestHeaderControl(table, head(9)))).toBe("h0");
  });

  it("uses the same header row, else the last one", () => {
    const table = build({ head: [true, true], rows: 1, cols: 2, grid: false });
    const top = document.createElement("tr");
    top.innerHTML = "<th><button id='top0'>t</button></th><th></th>";
    table.querySelector("thead")!.prepend(top);
    expect(idOf(findNearestHeaderControl(table, head(0, 0)))).toBe("top0");
    expect(idOf(findNearestHeaderControl(table, head(1, 1)))).toBe("h1");
    expect(idOf(findNearestHeaderControl(table, head(1, 5)))).toBe("h1");
  });

  it("finds a link, an input, a checkbox role but not a disabled button", () => {
    const table = build({ head: [false, false, false, false], rows: 1, cols: 4, grid: false });
    const cells = table.querySelectorAll("th");
    cells[0].innerHTML = "<button disabled>no</button>";
    cells[1].innerHTML = '<a href="#x" id="link">l</a>';
    cells[2].innerHTML = '<span role="checkbox" id="cb"></span>';
    cells[3].innerHTML = '<input id="in">';
    expect(idOf(findNearestHeaderControl(table, head(0)))).toBe("link");
    cells[1].innerHTML = "";
    expect(idOf(findNearestHeaderControl(table, head(0)))).toBe("cb");
    cells[2].innerHTML = "";
    expect(idOf(findNearestHeaderControl(table, head(0)))).toBe("in");
  });

  it("is null without a control or without a header", () => {
    const none = build({ head: [false, false], rows: 1, cols: 2, grid: false });
    expect(findNearestHeaderControl(none, head(0))).toBeNull();
    const bare = document.createElement("table");
    bare.innerHTML = "<tbody><tr><td><button></button></td></tr></tbody>";
    expect(findNearestHeaderControl(bare, head(0))).toBeNull();
  });
});

describe("purity", () => {
  it("the helpers move no focus and mutate nothing", () => {
    const table = build({ head: [true, true, true], rows: 3, cols: 3 });
    const before = document.body.innerHTML;
    const focused = document.activeElement;
    const position = getCellPosition(table, table.querySelector("#b1-1")!)!;
    findNearestGridCell(table, position);
    findNearestGridCell(table, { ...position, region: "head" });
    findNearestHeaderControl(table, { ...position, region: "head" });
    expect(document.body.innerHTML).toBe(before);
    expect(document.activeElement).toBe(focused);
  });
});
