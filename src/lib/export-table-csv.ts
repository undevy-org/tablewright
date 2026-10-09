import type { Table } from "@tanstack/react-table";

export type ExportTableToCsvOptions<TRow> = {
  columns: { id: string; header: string }[];
  rows: TRow[];
  getCellText: (row: TRow, columnId: string) => string;
};

export const DEFAULT_CSV_EXPORT_LABEL = "Export CSV";

export function resolveCsvExportLabel(labels?: { export?: string }): string {
  return labels?.export ?? DEFAULT_CSV_EXPORT_LABEL;
}

export function resolveTableExportButtonSize<TSize extends string | null | undefined>(
  size: TSize,
): NonNullable<TSize> | "default" {
  return size ?? "default";
}

export function resolveTableExportButtonVariant<TVariant extends string | null | undefined>(
  variant: TVariant,
): NonNullable<TVariant> | "secondary" {
  return variant ?? "secondary";
}

export type DownloadCsvFileOptions = {
  /** Prepends a UTF-8 BOM so Excel recognizes UTF-8. @default false */
  utf8Bom?: boolean;
};

function escapeCsvField(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportTableToCsv<TRow>(options: ExportTableToCsvOptions<TRow>): string {
  const { columns, rows, getCellText } = options;
  const headerLine = columns.map((column) => escapeCsvField(column.header)).join(",");
  const bodyLines = rows.map((row) =>
    columns.map((column) => escapeCsvField(getCellText(row, column.id))).join(","),
  );
  return [headerLine, ...bodyLines].join("\r\n");
}

export function downloadCsvFile(
  content: string,
  filename: string,
  options?: DownloadCsvFileOptions,
): void {
  const utf8Bom = options?.utf8Bom ?? false;
  const payload = utf8Bom ? `\uFEFF${content}` : content;
  const blob = new Blob([payload], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function resolveColumnHeader<TData>(
  table: Table<TData>,
  columnId: string,
  columnLabels?: Record<string, string>,
): string {
  if (columnLabels?.[columnId]) {
    return columnLabels[columnId];
  }
  const column = table.getColumn(columnId);
  if (!column) {
    return columnId;
  }
  const header = column.columnDef.header;
  return typeof header === "string" ? header : columnId;
}

export function resolveExportColumnsFromTable<TData>(
  table: Table<TData>,
  columnIds?: string[],
  columnLabels?: Record<string, string>,
): { id: string; header: string }[] {
  const ids =
    columnIds ??
    table
      .getVisibleLeafColumns()
      .map((column) => column.id);
  return ids.map((id) => ({
    id,
    header: resolveColumnHeader(table, id, columnLabels),
  }));
}

export function defaultTableRowCellText<TData>(
  row: TData,
  columnId: string,
  table: Table<TData>,
): string {
  const tableRow = table.getRowModel().rows.find((candidate) => candidate.original === row);
  if (!tableRow) {
    return "";
  }
  const cell = tableRow.getAllCells().find((candidate) => candidate.column.id === columnId);
  if (!cell) {
    return "";
  }
  const value = cell.getValue();
  if (value == null) {
    return "";
  }
  return String(value);
}
