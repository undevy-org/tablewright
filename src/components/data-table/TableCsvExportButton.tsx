import type { Table } from "@tanstack/react-table";
import { FileDown } from "lucide-react";

import {
  defaultTableRowCellText,
  downloadCsvFile,
  exportTableToCsv,
  resolveCsvExportLabel,
  resolveExportColumnsFromTable,
  resolveTableExportButtonSize,
  resolveTableExportButtonVariant,
} from "../../lib/export-table-csv";
import { cn } from "../../lib/utils";
import { Button, type ButtonProps } from "../ui/button";

export type TableCsvExportButtonLabels = {
  /** @default "Export CSV" */
  export?: string;
  columns?: Record<string, string>;
};

export type TableCsvExportButtonProps<TData> = {
  table: Table<TData>;
  filename: string;
  getCellText?: (row: TData, columnId: string) => string;
  utf8Bom?: boolean;
  /** Defaults to visible leaf columns on the table instance. */
  columnIds?: string[];
  labels?: TableCsvExportButtonLabels;
  className?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
};

export function TableCsvExportButton<TData>({
  table,
  filename,
  getCellText,
  utf8Bom,
  columnIds,
  labels,
  className,
  variant,
  size,
}: TableCsvExportButtonProps<TData>) {
  const buttonVariant = resolveTableExportButtonVariant(variant);
  const buttonSize = resolveTableExportButtonSize(size);
  const exportLabel = resolveCsvExportLabel(labels);

  const handleExport = () => {
    const columns = resolveExportColumnsFromTable(table, columnIds, labels?.columns);
    const rows = table.getRowModel().rows.map((row) => row.original);
    const resolveCellText =
      getCellText ??
      ((row: TData, columnId: string) => defaultTableRowCellText(row, columnId, table));

    const csv = exportTableToCsv({
      columns,
      rows,
      getCellText: resolveCellText,
    });
    downloadCsvFile(csv, filename, { utf8Bom });
  };

  return (
    <Button
      type="button"
      variant={buttonVariant}
      size={buttonSize}
      className={cn("shrink-0", className)}
      onClick={handleExport}
    >
      <FileDown className="h-4 w-4" />
      {exportLabel}
    </Button>
  );
}
