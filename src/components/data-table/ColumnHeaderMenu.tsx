import { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { SortDirection } from "./types";

import { ArrowUp, ArrowDown, ChevronDown, ListFilter, EyeOff, Check } from "lucide-react";

export interface ColumnHeaderMenuLabels {
  sort: string;
  sortByColumn: (label: string) => string;
  ascending: string;
  descending: string;
  filterByColumn: string;
  hideColumn: string;
}

const DEFAULT_LABELS: ColumnHeaderMenuLabels = {
  sort: "Sort",
  sortByColumn: (label) => `Sort by ${label}`,
  ascending: "Ascending",
  descending: "Descending",
  filterByColumn: "Filter by this column",
  hideColumn: "Hide column",
};

interface ColumnHeaderMenuProps {
  // Label — one of two variants
  label?: string;
  primaryLabel?: string;
  secondaryLabel?: string;

  // Sort — single mode (when label is set)
  sorted?: SortDirection;
  onSort?: (direction: "asc" | "desc") => void;

  // Sort — stacked mode (when primaryLabel + secondaryLabel)
  primarySorted?: SortDirection;
  onPrimarySort?: (direction: "asc" | "desc") => void;
  secondarySorted?: SortDirection;
  onSecondarySort?: (direction: "asc" | "desc") => void;

  // Filter action
  hasFilter?: boolean;
  onFilterClick?: () => void;

  // Hide action
  onHide?: () => void;

  // Customization
  labels?: Partial<ColumnHeaderMenuLabels>;
  menuWidth?: string;
}

const sectionLabelClass =
  "px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] first:pt-1";

const itemClass = "gap-2.5 rounded-md px-2.5 py-2";

const iconClass = "h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]";

function SortItems({
  label,
  sorted,
  onSort,
  labels,
}: {
  label?: string;
  sorted: SortDirection;
  onSort: (direction: "asc" | "desc") => void;
  labels: ColumnHeaderMenuLabels;
}) {
  return (
    <>
      <div className={sectionLabelClass}>{label ? labels.sortByColumn(label) : labels.sort}</div>
      <DropdownMenuItem
        className={`${itemClass}${sorted === "asc" ? " bg-[var(--bg-tertiary)]" : ""}`}
        onClick={() => onSort("asc")}
      >
        <ArrowUp className={iconClass} />
        {labels.ascending}
        {sorted === "asc" && <Check className="ml-auto h-3 w-3 text-[var(--text-tertiary)]" />}
      </DropdownMenuItem>
      <DropdownMenuItem
        className={`${itemClass}${sorted === "desc" ? " bg-[var(--bg-tertiary)]" : ""}`}
        onClick={() => onSort("desc")}
      >
        <ArrowDown className={iconClass} />
        {labels.descending}
        {sorted === "desc" && <Check className="ml-auto h-3 w-3 text-[var(--text-tertiary)]" />}
      </DropdownMenuItem>
    </>
  );
}

export function ColumnHeaderMenu({
  label,
  primaryLabel,
  secondaryLabel,
  sorted,
  onSort,
  primarySorted,
  onPrimarySort,
  secondarySorted,
  onSecondarySort,
  hasFilter,
  onFilterClick,
  onHide,
  labels: labelOverrides,
  menuWidth = "w-[200px]",
}: ColumnHeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const labels = { ...DEFAULT_LABELS, ...labelOverrides };
  const isStacked = !!primaryLabel;
  const isSingleSortable = !!label && !!onSort;
  const isSortable = isStacked || isSingleSortable;
  const hasActions = hasFilter || !!onHide;

  const labelContent = isStacked ? (
    <span className="flex flex-col leading-none">
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
        {primaryLabel}
        {primarySorted === "asc" && <ArrowUp className="h-3 w-3 shrink-0" />}
        {primarySorted === "desc" && <ArrowDown className="h-3 w-3 shrink-0" />}
      </span>
      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
        {secondaryLabel}
        {secondarySorted === "asc" && <ArrowUp className="h-2.5 w-2.5 shrink-0" />}
        {secondarySorted === "desc" && <ArrowDown className="h-2.5 w-2.5 shrink-0" />}
      </span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
      {label}
      {sorted === "asc" && <ArrowUp className="h-3 w-3 shrink-0" />}
      {sorted === "desc" && <ArrowDown className="h-3 w-3 shrink-0" />}
    </span>
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Invisible spacer — button is absolute (out of flow), this preserves <th> height */}
      <span aria-hidden className="pointer-events-none invisible flex items-center gap-1.5 py-1">
        {labelContent}
        <span className="h-3 w-3 shrink-0" />
      </span>

      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`absolute inset-0 flex cursor-pointer select-none items-center gap-1.5 px-4 text-left transition-colors hover:bg-[var(--bg-hover)]${open ? " bg-[var(--bg-hover)]" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {labelContent}
          <ChevronDown
            className={`h-3 w-3 shrink-0 text-[var(--text-tertiary)] transition-transform duration-200${open ? " rotate-180" : ""}`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className={`${menuWidth} p-1.5`}>
        {/* Sort section */}
        {isSingleSortable && <SortItems sorted={sorted ?? false} onSort={onSort} labels={labels} />}

        {isStacked && onPrimarySort && (
          <SortItems
            label={primaryLabel}
            sorted={primarySorted ?? false}
            onSort={onPrimarySort}
            labels={labels}
          />
        )}

        {isStacked && onSecondarySort && (
          <SortItems
            label={secondaryLabel}
            sorted={secondarySorted ?? false}
            onSort={onSecondarySort}
            labels={labels}
          />
        )}

        {/* Separator */}
        {isSortable && hasActions && (
          <div className="my-1 border-t border-[var(--border-subtle)]" />
        )}

        {/* Filter + Hide section */}
        {hasFilter && onFilterClick && (
          <DropdownMenuItem className={itemClass} onClick={onFilterClick}>
            <ListFilter className={iconClass} />
            {labels.filterByColumn}
          </DropdownMenuItem>
        )}

        {onHide && (
          <DropdownMenuItem className={itemClass} onClick={onHide}>
            <EyeOff className={iconClass} />
            {labels.hideColumn}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
