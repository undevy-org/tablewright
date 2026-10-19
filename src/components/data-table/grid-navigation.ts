export interface GridPosition {
  row: number;
  col: number;
}

export interface GridSize {
  rowCount: number;
  columnCount: number;
  /** Topmost row index (a header row is -1). @default 0 */
  firstRow?: number;
}

export const GRID_PAGE_SIZE = 10;

function clamp(value: number, max: number, min = 0) {
  return Math.min(Math.max(value, min), max);
}

export function clampGridPosition(
  pos: GridPosition,
  rowCount: number,
  columnCount: number,
  firstRow = 0,
): GridPosition {
  return {
    row: clamp(pos.row, rowCount - 1, firstRow),
    col: clamp(pos.col, columnCount - 1),
  };
}

/** Returns the next active cell for a key press, or `null` when the key is not handled. */
export function nextGridPosition(
  pos: GridPosition,
  key: string,
  { rowCount, columnCount, ctrl, firstRow = 0 }: GridSize & { ctrl: boolean },
): GridPosition | null {
  if (rowCount <= 0 || columnCount <= 0) return null;

  const lastRow = rowCount - 1;
  const lastCol = columnCount - 1;

  if (ctrl) {
    if (key === "Home") return { row: firstRow, col: 0 };
    if (key === "End") return { row: lastRow, col: lastCol };
    return null;
  }

  switch (key) {
    case "ArrowUp":
      return { row: clamp(pos.row - 1, lastRow, firstRow), col: pos.col };
    case "ArrowDown":
      return { row: clamp(pos.row + 1, lastRow, firstRow), col: pos.col };
    case "ArrowLeft":
      return { row: pos.row, col: clamp(pos.col - 1, lastCol) };
    case "ArrowRight":
      return { row: pos.row, col: clamp(pos.col + 1, lastCol) };
    case "Home":
      return { row: pos.row, col: 0 };
    case "End":
      return { row: pos.row, col: lastCol };
    case "PageUp":
      return { row: clamp(pos.row - GRID_PAGE_SIZE, lastRow, firstRow), col: pos.col };
    case "PageDown":
      return { row: clamp(pos.row + GRID_PAGE_SIZE, lastRow, firstRow), col: pos.col };
    default:
      return null;
  }
}
