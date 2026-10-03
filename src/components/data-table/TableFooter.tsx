import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { BulkAction } from "./types";

type TableFooterBaseProps = {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  bulkActions: BulkAction[];
};

type TableFooterNoPaginationProps = TableFooterBaseProps & {
  paginationVariant?: "none";
};

type TableFooterPagesProps = TableFooterBaseProps & {
  paginationVariant: "pages";
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
};

type TableFooterPerPageProps = TableFooterBaseProps & {
  paginationVariant: "perPage";
  currentPage: number;
  totalPages: number;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  rowsPerPageOptions?: number[];
  onRowsPerPageChange: (value: number) => void;
};

type TableFooterProps =
  | TableFooterNoPaginationProps
  | TableFooterPagesProps
  | TableFooterPerPageProps;

const defaultRowsPerPageOptions = [15, 30, 60, 100];

export function TableFooter(props: TableFooterProps) {
  const {
    selectedCount,
    totalCount,
    onSelectAll,
    onClearSelection,
    bulkActions,
  } = props;

  const summaryLabel =
    selectedCount > 0 ? `Selected: ${selectedCount}` : `Total: ${totalCount}`;

  return (
    <div className="flex min-h-[64px] shrink-0 flex-col gap-3 border-t border-[var(--border-subtle)] px-6 py-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span
          className={
            selectedCount > 0
              ? "text-[12px] font-semibold text-[var(--text-primary)]"
              : "text-[12px] font-medium text-[var(--text-secondary)]"
          }
        >
          {summaryLabel}
        </span>
        {selectedCount > 0 ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px]"
              onClick={onSelectAll}
            >
              Select All ({totalCount})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px]"
              onClick={onClearSelection}
            >
              Clear
            </Button>
            {bulkActions.map((action) => (
              <Button
                key={action.label}
                variant="ghost"
                size="sm"
                className={`h-7 text-[12px]${action.variant === "danger" ? " text-[var(--tag-pink-text)]" : ""}`}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </>
        ) : null}
      </div>
      {renderPagination(props)}
    </div>
  );
}

function renderPagination(props: TableFooterProps) {
  if (props.paginationVariant === "perPage") {
    const rowsPerPageOptions = props.rowsPerPageOptions ?? defaultRowsPerPageOptions;

    return (
      <div className="flex flex-wrap items-center gap-3 lg:justify-end">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-[var(--text-secondary)]">Rows per page</span>
          <Select
            value={String(props.rowsPerPage)}
            onValueChange={(value) => props.onRowsPerPageChange(Number(value))}
          >
            <SelectTrigger className="h-[var(--size-control-sm)] w-[var(--size-select-compact)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {rowsPerPageOptions.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {renderNumericPager(props)}
      </div>
    );
  }

  if (props.paginationVariant !== "pages") {
    return null;
  }

  return renderNumericPager(props);
}

function renderNumericPager(
  props: TableFooterPagesProps | TableFooterPerPageProps,
) {
  return (
    <div className="flex items-center gap-1 lg:justify-end">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous page"
        className="h-7 w-7"
        disabled={props.currentPage === 1}
        onClick={() => props.onPageChange(props.currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {props.pageNumbers.map((pageNum) => (
        <Button
          key={pageNum}
          variant={pageNum === props.currentPage ? "default" : "ghost"}
          size="sm"
          className="h-7 w-7 p-0 text-[12px]"
          onClick={() => props.onPageChange(pageNum)}
        >
          {pageNum}
        </Button>
      ))}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next page"
        className="h-7 w-7"
        disabled={props.currentPage === props.totalPages}
        onClick={() => props.onPageChange(props.currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
