import { Expand, GripVertical } from "lucide-react";

import { cn } from "../../lib/utils";
import { Checkbox } from "../ui/checkbox";

// ─── Cell ────────────────────────────────────────────────

export interface RowControlCellProps {
  rowNumber: number;
  selected: boolean;
  onSelectToggle: () => void;
  onExpandToggle?: (e: React.MouseEvent) => void;
  ariaLabelSelect?: string;
  ariaLabelExpand?: string;
  forceControlsVisible?: boolean;
}

export function RowControlCell({
  rowNumber,
  selected,
  onSelectToggle,
  onExpandToggle,
  ariaLabelSelect = "Select row",
  ariaLabelExpand = "Expand row",
  forceControlsVisible = false,
}: RowControlCellProps) {
  const showCheckbox = selected || forceControlsVisible;
  const showHoverAffordances = forceControlsVisible;

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <span
        className={cn(
          "text-[11px] tabular-nums text-[var(--text-tertiary)] transition-opacity",
          showCheckbox ? "opacity-0" : "opacity-100 group-hover:opacity-0",
        )}
      >
        {rowNumber}
      </span>

      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-opacity",
          showCheckbox
            ? "opacity-100"
            : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
        )}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={() => onSelectToggle()}
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label={ariaLabelSelect}
        />
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 flex w-5 items-center justify-center transition-opacity",
          showHoverAffordances
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100",
        )}
      >
        <GripVertical
          className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]"
          aria-hidden="true"
        />
      </div>

      {onExpandToggle ? (
        <div
          className={cn(
            "absolute inset-y-0 right-0 flex w-5 items-center justify-center transition-opacity",
            showHoverAffordances
              ? "opacity-100"
              : "pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100",
          )}
        >
          <button
            type="button"
            className="inline-flex h-5 w-5 items-center justify-center rounded border border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]"
            onClick={(e) => {
              e.stopPropagation();
              onExpandToggle(e);
            }}
            aria-label={ariaLabelExpand}
          >
            <Expand className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────

export interface RowControlHeaderProps {
  checked: boolean | "indeterminate";
  onToggle: () => void;
  ariaLabel?: string;
}

export function RowControlHeader({
  checked,
  onToggle,
  ariaLabel = "Select all rows on page",
}: RowControlHeaderProps) {
  return (
    <div className="flex items-center justify-center">
      <Checkbox
        checked={checked}
        onCheckedChange={() => onToggle()}
        aria-label={ariaLabel}
      />
    </div>
  );
}
