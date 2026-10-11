import type { PointerEvent, ReactNode } from "react";
import { flexRender, type Table } from "@tanstack/react-table";

import { cn } from "../../lib/utils";

import { DrawerShell, type DrawerMode } from "./DrawerShell";
import { EmptyState } from "./EmptyState";
import { TableErrorPanel } from "./TableErrorPanel";
import { TableLayout } from "./TableLayout";
import { stickyBorderClass, stickyStyle } from "./sticky-utils";
import type { UseRowDragResult } from "./hooks/use-row-drag";
import type { ColumnMetaDef } from "./types";

export interface DataTableDrawer {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  headerExtra?: ReactNode;
  content: ReactNode;
  /** @default "side" */
  mode?: DrawerMode;
}

export interface DataTableShellProps<TData> {
  table: Table<TData>;
  dense: boolean;
  emptyMessage: string;
  columnMeta: Record<string, ColumnMetaDef>;
  columnWidths: Record<string, number>;
  onColumnResizeStart: (columnId: string, event: PointerEvent<HTMLDivElement>) => void;
  onRowClick?: (row: TData) => void;
  getRowIsActive?: (row: TData) => boolean;
  rowDrag?: UseRowDragResult;
  footer?: ReactNode;
  drawer?: DataTableDrawer;
  className?: string;
  /** @default "idle" */
  status?: "idle" | "loading" | "error";
  /** @default 8 */
  loadingRowCount?: number;
  /** @default "Something went wrong" */
  errorMessage?: ReactNode;
  onRetry?: () => void;
  /** @default "Retry" */
  retryLabel?: string;
}

export function DataTableShell<TData>({
  table,
  dense,
  emptyMessage,
  columnMeta,
  columnWidths,
  onColumnResizeStart,
  onRowClick,
  getRowIsActive,
  rowDrag,
  footer,
  drawer,
  className,
  status = "idle",
  loadingRowCount = 8,
  errorMessage = "Something went wrong",
  onRetry,
  retryLabel = "Retry",
}: DataTableShellProps<TData>) {
  const visibleTableWidth = table
    .getVisibleLeafColumns()
    .reduce(
      (sum, column) =>
        sum + (columnWidths[column.id] ?? columnMeta[column.id]?.minW ?? 120),
      0,
    );

  const isLoading = status === "loading";
  const isError = status === "error";
  const dataRows = table.getRowModel().rows;
  const visibleColumnCount = table.getVisibleLeafColumns().length;

  return (
    <TableLayout className={cn("min-h-0", className)}>
      <TableLayout.ScrollArea className="[scrollbar-gutter:stable]">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed", minWidth: `${visibleTableWidth}px` }}
          {...(isLoading ? { "aria-busy": true } : {})}
        >
          <thead className="sticky top-0 z-10 bg-[var(--bg-surface)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const columnId = header.column.id;
                  const meta = columnMeta[columnId];
                  const isActionsColumn = meta?.sticky === "right";
                  const isControlColumn = meta?.variant === "control";

                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "group/th relative border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 text-left text-[12px] font-medium text-[var(--text-secondary)]",
                        dense ? "py-1.5" : "py-3",
                        isActionsColumn && "px-3 text-right",
                        isControlColumn && "px-1 text-center",
                        stickyBorderClass(meta),
                      )}
                      style={{
                        width: columnWidths[columnId],
                        minWidth: meta?.minW ?? 36,
                        ...stickyStyle(meta, true),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.columnDef.enableResizing !== false ? (
                        <div
                          className="absolute bottom-0 right-0 top-0 w-px cursor-col-resize bg-[var(--border-subtle)] opacity-30 transition-[opacity,width,background-color] duration-150 group-hover/th:w-[4px] group-hover/th:bg-[var(--border-focus)] group-hover/th:opacity-50 hover:!opacity-100"
                          onPointerDown={(event) => onColumnResizeStart(columnId, event)}
                        />
                      ) : null}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: loadingRowCount }, (_, rowIndex) => (
                <tr
                  key={`loading-${rowIndex}`}
                  className="group border-b border-[var(--border-subtle)]"
                >
                  {table.getVisibleLeafColumns().map((column) => {
                    const meta = columnMeta[column.id];
                    const isActionsColumn = meta?.sticky === "right";
                    const isControlColumn = meta?.variant === "control";

                    return (
                      <td
                        key={column.id}
                        className={cn(
                          "overflow-hidden px-4 text-[var(--text-primary)]",
                          dense ? "py-1 text-xs leading-tight" : "py-4 text-sm",
                          meta?.sticky && "bg-[var(--bg-surface)]",
                          isActionsColumn && "px-3 align-middle text-right",
                          isControlColumn && "px-1 text-center",
                          stickyBorderClass(meta),
                        )}
                        style={{
                          width: columnWidths[column.id],
                          minWidth: meta?.minW ?? 36,
                          maxWidth: columnWidths[column.id],
                          ...stickyStyle(meta, false),
                        }}
                      >
                        <div
                          aria-hidden
                          className="mx-auto h-4 w-[72%] max-w-full animate-pulse rounded bg-[var(--bg-tertiary)]"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : isError ? (
              <TableErrorPanel
                message={errorMessage}
                colSpan={visibleColumnCount}
                onRetry={onRetry}
                retryLabel={retryLabel}
              />
            ) : (
              <>
                {dataRows.map((row) => {
                  const isActive = getRowIsActive?.(row.original) ?? false;
                  const dragProps = rowDrag?.getDragProps(row.index);
                  const isDragged = rowDrag?.dragRowIdx === row.index;
                  const isDropTarget =
                    rowDrag != null &&
                    rowDrag.dropTargetIdx === row.index &&
                    rowDrag.dragRowIdx !== null &&
                    rowDrag.dragRowIdx !== row.index;

                  return (
                    <tr
                      key={row.id}
                      {...dragProps}
                      onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                      className={cn(
                        "group border-b border-[var(--border-subtle)] transition-colors",
                        onRowClick && "cursor-pointer hover:bg-[var(--bg-hover)]",
                        isActive && "bg-[var(--bg-hover)]",
                        rowDrag && "cursor-grab active:cursor-grabbing",
                        isDragged && "opacity-40",
                        isDropTarget && "border-t-2 border-t-[var(--border-focus)]",
                      )}
                    >
                      {row.getVisibleCells().map((cell, cellIndex) => {
                        const meta = columnMeta[cell.column.id];
                        const isActionsColumn = meta?.sticky === "right";
                        const isControlColumn = meta?.variant === "control";

                        return (
                          <td
                            key={cell.id}
                            className={cn(
                              "overflow-hidden px-4 text-[var(--text-primary)]",
                              dense ? "py-1 text-xs leading-tight" : "py-4 text-sm",
                              meta?.sticky &&
                                (isActive
                                  ? "bg-[var(--bg-hover)]"
                                  : "bg-[var(--bg-surface)] group-hover:bg-[var(--bg-hover)]"),
                              isActionsColumn && "px-3 align-middle text-right",
                              isControlColumn && "px-1 text-center",
                              cellIndex === 0 &&
                                isActive &&
                                "relative before:absolute before:bottom-0 before:left-0 before:top-0 before:w-[3px] before:bg-[var(--accent-primary)] before:content-['']",
                              stickyBorderClass(meta),
                            )}
                            style={{
                              width: columnWidths[cell.column.id],
                              minWidth: meta?.minW ?? 36,
                              maxWidth: columnWidths[cell.column.id],
                              ...stickyStyle(meta, false),
                            }}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {dataRows.length === 0 ? (
                  <EmptyState
                    message={emptyMessage}
                    colSpan={visibleColumnCount}
                  />
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </TableLayout.ScrollArea>

      {footer}

      {drawer ? (
        <DrawerShell
          open={drawer.open}
          onClose={drawer.onClose}
          title={drawer.title}
          subtitle={drawer.subtitle}
          headerExtra={drawer.headerExtra}
          mode={drawer.mode}
        >
          {drawer.content}
        </DrawerShell>
      ) : null}
    </TableLayout>
  );
}
