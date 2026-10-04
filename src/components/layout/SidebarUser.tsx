import * as React from "react";
import { cn } from "../../lib/utils";
import { useAppShell } from "./app-shell-context";

export interface SidebarUserProps {
  name: string;
  avatarUrl?: string;
  collapsed?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const SidebarUser = React.forwardRef<HTMLDivElement, SidebarUserProps>(
  function SidebarUser({ name, avatarUrl, collapsed: collapsedProp, className }, ref) {
    const shell = useAppShell();
    const effectiveCollapsed = collapsedProp ?? shell?.effectiveCollapsed ?? false;

    return (
      <div
        ref={ref}
        className={cn(
          "flex shrink-0 items-center border-t border-[var(--border-subtle)] p-2",
          effectiveCollapsed ? "justify-center" : "gap-2.5 px-3",
          className,
        )}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={effectiveCollapsed ? name : ""}
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[11px] font-semibold text-[var(--text-secondary)]">
            {getInitials(name)}
          </div>
        )}
        {!effectiveCollapsed && (
          <span className="truncate text-[13px] font-medium text-[var(--text-primary)]">
            {name}
          </span>
        )}
      </div>
    );
  },
);
