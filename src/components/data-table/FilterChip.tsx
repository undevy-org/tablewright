import * as React from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface FilterChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: string;
  onRemove: () => void;
  active?: boolean;
}

export const FilterChip = React.forwardRef<HTMLDivElement, FilterChipProps>(
  ({ label, value, onRemove, active, children, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "flex h-[var(--size-control-md)] items-center rounded-md border border-[var(--border-subtle)] text-[13px] transition-colors",
          active ? "bg-[var(--bg-secondary)]" : "bg-[var(--bg-surface)]",
          className
        )}
      >
        <div className="flex h-full items-center pl-2.5 pr-1.5 cursor-pointer">
          <div className="flex items-center gap-1.5">
            <span className="text-[var(--text-secondary)]">{label}</span>
            {value && (
              <>
                <span className="text-[var(--text-tertiary)]">:</span>
                <span className="text-[var(--text-primary)] font-medium">
                  {value}
                </span>
              </>
            )}
            {children}
          </div>
        </div>
        <div className="h-full flex items-center pr-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="flex h-5 w-5 items-center justify-center rounded-sm text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]"
            aria-label={`Remove ${label} filter`}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }
);

FilterChip.displayName = "FilterChip";
