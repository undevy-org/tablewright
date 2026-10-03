import * as React from "react";
import { cn } from "../../lib/utils";

export interface ViewChipProps extends React.HTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
}

export const ViewChip = React.forwardRef<HTMLButtonElement, ViewChipProps>(
  ({ label, active, className, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={cn(
          "inline-flex items-center rounded-full border px-3 py-1 text-[13px] font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-[var(--border-focus)]",
          active
            ? "border-[var(--border-brand)] bg-[var(--bg-brand-subtle)] text-[var(--text-brand)]"
            : "border-[var(--border-subtle)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]",
          className
        )}
      >
        {label}
      </button>
    );
  }
);

ViewChip.displayName = "ViewChip";
