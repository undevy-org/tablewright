import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";

import type { RowActionItem, RowActionSection } from "./types";

interface RowActionsMenuProps {
  actions?: RowActionItem[];
  sections?: RowActionSection[];
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  contentClassName?: string;
}

export function RowActionsMenu({
  actions = [],
  sections,
  align = "end",
  triggerClassName,
  contentClassName,
}: RowActionsMenuProps) {
  const resolvedSections =
    sections && sections.length > 0 ? sections : actions.length > 0 ? [{ label: "", actions }] : [];
  const isGrouped = resolvedSections.some((section) => section.label);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Row actions"
          className={cn(
            "h-7 w-7 rounded-sm p-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100",
            triggerClassName,
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(isGrouped ? "w-[320px] p-1.5" : "w-40", contentClassName)}
      >
        {resolvedSections.map((section, sectionIndex) => (
          <div key={section.label || sectionIndex}>
            {section.label ? (
              <div className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] first:pt-1">
                {section.label}
              </div>
            ) : null}
            {section.actions.map((action) => (
              <DropdownMenuItem
                key={`${section.label}-${action.label}`}
                disabled={action.disabled}
                className={cn(
                  "gap-2.5 rounded-md px-2.5 py-2",
                  action.variant === "danger" && "text-[var(--tag-pink-text)]",
                  action.variant === "accent" && "text-[var(--text-primary)]",
                )}
                onClick={(event) => {
                  event.stopPropagation();
                  action.onClick(event);
                }}
              >
                <action.icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]",
                    action.variant === "danger" && "text-[var(--tag-pink-text)]",
                    action.variant === "accent" && "text-[var(--text-primary)]",
                  )}
                />
                <span className="truncate">{action.label}</span>
              </DropdownMenuItem>
            ))}
            {sectionIndex < resolvedSections.length - 1 ? (
              <div className="my-1 border-t border-[var(--border-subtle)]" />
            ) : null}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
