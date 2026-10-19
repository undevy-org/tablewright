const nearest = (values: number[], wanted: number): number =>
  values.reduce((best, value) =>
    Math.abs(value - wanted) < Math.abs(best - wanted) ? value : best,
  );

/**
 * Focuses the body grid cell nearest to (row, col) inside `root`; header cells are never chosen.
 * Returns `false` (and focuses nothing) when `root` has no body cell.
 */
export function focusGridCellNear(root: ParentNode, row: number, col: number): boolean {
  const cells = Array.from(
    root.querySelectorAll<HTMLElement>("[data-grid-row][data-grid-col]"),
  )
    .map((element) => ({
      element,
      row: Number(element.getAttribute("data-grid-row")),
      col: Number(element.getAttribute("data-grid-col")),
    }))
    .filter((cell) => cell.row >= 0);
  if (cells.length === 0) return false;

  const inColumn = cells.filter((cell) => cell.col === col);
  const rowSource = inColumn.length > 0 ? inColumn : cells;
  const targetRow = nearest(rowSource.map((cell) => cell.row), row);
  const inRow = cells.filter((cell) => cell.row === targetRow);
  const targetCol = nearest(inRow.map((cell) => cell.col), col);
  const target = inRow.find((cell) => cell.col === targetCol)!;
  target.element.focus();
  return true;
}
