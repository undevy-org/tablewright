import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "../../lib/utils";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label?: string;
  icon?: LucideIcon;
  /** Accessible name for icon-only options, which render no visible text. */
  ariaLabel?: string;
}

export interface SegmentedControlProps<T extends string>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: T;
  options: readonly SegmentedControlOption<T>[];
  onValueChange?: (value: T) => void;
  variant?: "toolbar";
  label?: string;
}

const shellClasses = {
  toolbar:
    "inline-flex h-[var(--size-control-md)] items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1 py-1",
} as const;

const segmentClasses = {
  toolbar: "rounded-md px-3 self-stretch flex items-center text-[12px] font-medium",
} as const;

const activeSegmentClasses = {
  toolbar: "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
} as const;

export function SegmentedControl<T extends string>({
  value,
  options,
  onValueChange,
  variant = "toolbar",
  label,
  className,
  ...props
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(shellClasses[variant], className)}
      {...props}
    >
      <div className="inline-flex self-stretch items-center gap-1">
        {options.map((option) => {
          const active = option.value === value;
          const isIconOnly = Boolean(option.icon) && !option.label;
          const sharedClassName = cn(
            "inline-flex items-center justify-center whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-0",
            variant === "toolbar" && isIconOnly
              ? "rounded-md px-2 self-stretch flex items-center text-[12px] font-medium"
              : segmentClasses[variant],
            active
              ? activeSegmentClasses[variant]
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
          );

          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              aria-label={isIconOnly ? (option.ariaLabel ?? option.value) : undefined}
              onClick={() => {
                if (!active) {
                  onValueChange?.(option.value);
                }
              }}
              className={sharedClassName}
            >
              {Icon ? <Icon className="h-4 w-4" /> : option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
