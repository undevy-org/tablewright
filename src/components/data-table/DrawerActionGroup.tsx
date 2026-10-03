import { cn } from "../../lib/utils";
import type { RowActionSection } from "./types";

interface DrawerActionGroupProps {
  sections: RowActionSection[];
  variant: "flat" | "grouped";
  columns?: 2 | 4;
}

export function DrawerActionGroup({ sections, variant, columns }: DrawerActionGroupProps) {
  if (variant === "flat") {
    const actions = sections.flatMap((s) => s.actions);
    return (
      <div className={cn("grid gap-2", (columns ?? 2) === 4 ? "grid-cols-4" : "grid-cols-2")}>
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(e);
            }}
            disabled={action.disabled}
            className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <action.icon className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            {action.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div
          key={section.label}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3"
        >
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
            {section.label}
          </div>
          <div className={cn("grid gap-2", (columns ?? 2) === 4 ? "grid-cols-4" : "grid-cols-2")}>
            {section.actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(e);
                }}
                disabled={action.disabled}
                className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 py-2 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <action.icon
                  className={
                    action.variant === "danger"
                      ? "h-4 w-4 shrink-0 text-[var(--tag-pink-text)]"
                      : action.variant === "accent"
                        ? "h-4 w-4 shrink-0 text-[var(--text-primary)]"
                        : "h-4 w-4 shrink-0 text-[var(--text-secondary)]"
                  }
                />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
