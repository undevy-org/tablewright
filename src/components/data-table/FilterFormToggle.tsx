import { useEffect, useState } from "react";
import { ChevronDown, Filter } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

const STORAGE_PREFIX = "tablewright.filters.open.";

function readPersisted(persistKey: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(STORAGE_PREFIX + persistKey);
  if (raw === "1") return true;
  if (raw === "0") return false;
  return fallback;
}

export function useFilterFormOpen(
  persistKey: string,
  defaultOpen = false,
): [boolean, (next: boolean) => void] {
  const [open, setOpen] = useState<boolean>(() => readPersisted(persistKey, defaultOpen));

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_PREFIX + persistKey, open ? "1" : "0");
  }, [open, persistKey]);

  return [open, setOpen];
}

export interface FilterFormToggleProps {
  /** Controlled open state. */
  open: boolean;
  /** Setter — receives the next open state. */
  onOpenChange: (next: boolean) => void;
  /** Whether at least one managed filter is active. Drives the dot indicator when open=false. */
  hasActiveFilters?: boolean;
  /** ID of the form panel element controlled by this button (for aria-controls). */
  controlsId?: string;
  /** Visual variant: icon-only button or icon + text label. Same height in both. Default: "icon". */
  variant?: "icon" | "button";
  /** Text label for the "button" variant. Default: "Filter". */
  label?: string;
  /** Extra classes for the button. */
  className?: string;
}

export function FilterFormToggle({
  open,
  onOpenChange,
  hasActiveFilters = false,
  controlsId,
  variant = "icon",
  label = "Filter",
  className,
}: FilterFormToggleProps) {
  const showDot = !open && hasActiveFilters;
  const isButton = variant === "button";
  return (
    <Button
      type="button"
      variant="secondary"
      size={isButton ? "default" : "icon"}
      aria-label={isButton ? undefined : "Filter form"}
      aria-expanded={open}
      aria-controls={controlsId}
      title={open ? "Hide filters" : "Show filters"}
      onClick={() => onOpenChange(!open)}
      className={cn(
        "relative",
        open &&
          "border-[var(--border-accent,#6366f1)] bg-[var(--bg-accent-subtle,rgba(99,102,241,0.12))] text-[var(--text-accent,#3730a3)]",
        className,
      )}
    >
      <Filter className="h-4 w-4" />
      {isButton ? <span>{label}</span> : null}
      {isButton ? (
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--text-tertiary)] transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      ) : null}
      {showDot ? (
        <span
          data-testid="filter-form-toggle-dot"
          className="absolute right-0.5 top-0.5 h-1.5 w-1.5 rounded-full border border-[var(--bg-elevated,#ffffff)] bg-[var(--bg-accent,#6366f1)]"
          aria-hidden="true"
        />
      ) : null}
    </Button>
  );
}
