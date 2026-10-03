import * as React from "react";
import { cn } from "../../lib/utils";

export interface TopBarProps {
  children?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const TopBar = React.forwardRef<HTMLDivElement, TopBarProps>(
  function TopBar({ children, actions, className }, ref) {
    return (
      <header
        ref={ref}
        className={cn(
          "flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-body)] px-6",
          className,
        )}
        style={{ height: "var(--size-topbar-height)" }}
      >
        <div className="min-w-0 flex-1">{children}</div>
        {actions && (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        )}
      </header>
    );
  },
);
