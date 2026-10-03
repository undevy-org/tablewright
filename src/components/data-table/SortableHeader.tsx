import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import { cn } from "../../lib/utils";

import type { SortDirection } from "./types";

interface SortableHeaderProps {
  label?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  mode?: "single" | "stacked";
  sorted?: SortDirection;
  onClick?: () => void;
  primarySorted?: SortDirection;
  onPrimaryClick?: () => void;
  secondarySorted?: SortDirection;
  onSecondaryClick?: () => void;
  className?: string;
}

function SortIcon({
  sorted,
  hoverClass,
}: {
  sorted: SortDirection | undefined;
  hoverClass: string;
}) {
  if (sorted === "asc") {
    return <ArrowUp className="h-3 w-3 shrink-0 text-[var(--text-primary)]" />;
  }
  if (sorted === "desc") {
    return <ArrowDown className="h-3 w-3 shrink-0 text-[var(--text-primary)]" />;
  }
  return (
    <ArrowUpDown
      className={cn(
        "h-3 w-3 shrink-0 text-[var(--text-tertiary)] opacity-0 transition-opacity",
        hoverClass,
      )}
    />
  );
}

export function SortableHeader({
  label,
  primaryLabel,
  secondaryLabel,
  mode,
  sorted,
  onClick,
  primarySorted,
  onPrimaryClick,
  secondarySorted,
  onSecondaryClick,
  className,
}: SortableHeaderProps) {
  const resolvedPrimaryLabel = primaryLabel ?? label ?? "";
  const resolvedMode = mode ?? (secondaryLabel ? "stacked" : "single");
  const isStacked = resolvedMode === "stacked";
  const isDualSort = isStacked && primarySorted !== undefined;

  if (isDualSort) {
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <button
          type="button"
          className="group/primary inline-flex cursor-pointer select-none items-center gap-1 text-left"
          onClick={onPrimaryClick}
        >
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
            {resolvedPrimaryLabel}
          </span>
          <SortIcon
            sorted={primarySorted}
            hoverClass="group-hover/primary:opacity-100"
          />
        </button>
        <button
          type="button"
          className="group/secondary inline-flex cursor-pointer select-none items-center gap-1 text-left"
          onClick={onSecondaryClick}
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            {secondaryLabel}
          </span>
          <SortIcon
            sorted={secondarySorted}
            hoverClass="group-hover/secondary:opacity-100"
          />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "group/header inline-flex cursor-pointer select-none items-start gap-1.5 text-left",
        className,
      )}
      onClick={onClick}
    >
      {isStacked ? (
        <span className="flex flex-col leading-none">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
            {resolvedPrimaryLabel}
          </span>
          <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            {secondaryLabel}
          </span>
        </span>
      ) : (
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
          {resolvedPrimaryLabel}
        </span>
      )}
      <SortIcon sorted={sorted} hoverClass="group-hover/header:opacity-100" />
    </button>
  );
}
