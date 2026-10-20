// Same controls as the header-control selector in hooks/use-grid-navigation.ts.
const HEADER_CONTROL_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [role="checkbox"]';

const nearest = (values: number[], wanted: number): number =>
  values.reduce((best, value) => {
    const distance = Math.abs(value - wanted);
    const bestDistance = Math.abs(best - wanted);
    return distance < bestDistance || (distance === bestDistance && value < best) ? value : best;
  });

interface GridCell {
  element: HTMLElement;
  row: number;
  col: number;
}

const readGridCells = (root: ParentNode): GridCell[] =>
  Array.from(root.querySelectorAll<HTMLElement>("[data-grid-row][data-grid-col]")).map(
    (element) => ({
      element,
      row: Number(element.getAttribute("data-grid-row")),
      col: Number(element.getAttribute("data-grid-col")),
    }),
  );

const nearestCellAt = (cells: GridCell[], col: number): HTMLElement =>
  cells.find((cell) => cell.col === nearest(cells.map((c) => c.col), col))!.element;

/** The body grid cell nearest to (row, col); header cells are never chosen. `null` without a body cell. */
function findBodyGridCellNear(root: ParentNode, row: number, col: number): HTMLElement | null {
  const cells = readGridCells(root).filter((cell) => cell.row >= 0);
  if (cells.length === 0) return null;

  const inColumn = cells.filter((cell) => cell.col === col);
  const rowSource = inColumn.length > 0 ? inColumn : cells;
  const targetRow = nearest(rowSource.map((cell) => cell.row), row);
  return nearestCellAt(cells.filter((cell) => cell.row === targetRow), col);
}

/**
 * Focuses the body grid cell nearest to (row, col) inside `root`; header cells are never chosen.
 * Returns `false` (and focuses nothing) when `root` has no body cell.
 */
export function focusGridCellNear(root: ParentNode, row: number, col: number): boolean {
  const target = findBodyGridCellNear(root, row, col);
  if (!target) return false;
  target.focus();
  return true;
}

/** Where a table cell sits: its section, its grid coordinates (if any) and its DOM indexes. */
export interface CellPosition {
  region: "head" | "body";
  gridRow: number | null;
  gridCol: number | null;
  /** Row index inside its `thead` / `tbody`. */
  rowIndex: number;
  /** Cell index inside its row. */
  cellIndex: number;
}

const readNumber = (element: Element, name: string): number | null => {
  const value = element.getAttribute(name);
  return value === null ? null : Number(value);
};

const indexIn = (element: Element): number =>
  Array.prototype.indexOf.call(element.parentElement?.children ?? [], element);

/** Position of the cell of `root` that contains `element` (or is it); `null` outside any cell. Pure. */
export function getCellPosition(root: Element, element: Element): CellPosition | null {
  const cell = element.closest<HTMLTableCellElement>("td, th");
  const row = cell?.parentElement;
  if (!cell || !row || !root.contains(cell)) return null;
  return {
    region: cell.closest("thead") ? "head" : "body",
    gridRow: readNumber(cell, "data-grid-row"),
    gridCol: readNumber(cell, "data-grid-col"),
    rowIndex: indexIn(row),
    cellIndex: indexIn(cell),
  };
}

/**
 * The grid cell nearest to `position`: a header origin yields a header cell (same column, clamped to
 * the last), a body origin a body cell (same row if it exists, else the nearest row, then the nearest
 * column; ties go to the lower index). `null` when no such cell exists. Pure.
 */
export function findNearestGridCell(root: ParentNode, position: CellPosition): HTMLElement | null {
  const col = position.gridCol ?? position.cellIndex;
  if (position.region === "body") {
    return findBodyGridCellNear(root, position.gridRow ?? position.rowIndex, col);
  }
  const cells = readGridCells(root).filter((cell) => cell.row < 0);
  return cells.length === 0 ? null : nearestCellAt(cells, col);
}

/**
 * The first focusable control of the header cell nearest to `position` in the same header row (the
 * same `thead` row index, else the last one): the same column first, then outward, ties to the lower
 * index; cells without a control are skipped. `null` when there is none. Pure.
 */
export function findNearestHeaderControl(
  root: ParentNode,
  position: CellPosition,
): HTMLElement | null {
  const rows = Array.from(root.querySelectorAll("thead > tr"));
  if (rows.length === 0) return null;
  const cells = Array.from((rows[position.rowIndex] ?? rows[rows.length - 1]).children);
  const byDistance = cells
    .map((cell, index) => ({ cell, index, distance: Math.abs(index - position.cellIndex) }))
    .sort((a, b) => a.distance - b.distance || a.index - b.index);
  for (const { cell } of byDistance) {
    const control = cell.querySelector<HTMLElement>(HEADER_CONTROL_SELECTOR);
    if (control) return control;
  }
  return null;
}
