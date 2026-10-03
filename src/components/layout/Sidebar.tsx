import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import { useAppShell } from "./app-shell-context";
import type { NavGroup } from "./types";

export interface SidebarProps {
  groups: NavGroup[];
  activeKey?: string;
  collapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  renderLink?: (
    href: string,
    props: { className: string; children: React.ReactNode },
  ) => React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

function isItemActive(href: string, activeKey: string): boolean {
  if (href === "" || href === "/") return activeKey === "" || activeKey === "/";
  return activeKey === href || activeKey.startsWith(href + "/");
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  function Sidebar(
    {
      groups,
      activeKey = "",
      collapsed: collapsedProp,
      onCollapsedChange: onCollapsedChangeProp,
      renderLink,
      header,
      footer,
      className,
    },
    ref,
  ) {
    const shell = useAppShell();

    const collapsed = collapsedProp ?? shell?.collapsed ?? false;
    const hovering = shell?.hovering ?? false;
    const effectiveCollapsed = shell
      ? shell.effectiveCollapsed
      : collapsed;
    const onCollapsedChange =
      onCollapsedChangeProp ?? shell?.onCollapsedChange ?? (() => {});

    const showExpanded = !effectiveCollapsed;
    const isOverlay = hovering && collapsed;

    return (
      <aside
        ref={ref}
        aria-label="Primary navigation"
        className={cn(
          "flex h-full shrink-0 flex-col overflow-hidden border-r border-[var(--border-subtle)] bg-[var(--bg-surface)]",
          "transition-[width] ease-in-out",
          isOverlay
            ? "absolute left-0 top-0 z-40 h-full [box-shadow:var(--shadow-sidebar-overlay)]"
            : "relative",
          className,
        )}
        style={{
          width: showExpanded
            ? "var(--size-sidebar-expanded)"
            : "var(--size-sidebar-collapsed)",
          transitionDuration: "var(--duration-sidebar)",
        }}
      >
        {/* Header slot */}
        {header && (
          <div
            className={cn(
              "flex shrink-0 items-center border-b border-[var(--border-subtle)]",
              showExpanded ? "h-[var(--size-topbar-height)] px-2" : "h-[var(--size-topbar-height)] justify-center px-0",
            )}
          >
            {header}
          </div>
        )}

        {/* Navigation */}
        <nav className="scrollbar-auto-hide min-h-0 flex-1 overflow-y-auto py-2">
          {groups.map((group, groupIndex) => (
            <div key={group.label}>
              {groupIndex > 0 && (
                <div className="mx-3 my-1.5 border-t border-[var(--border-subtle)]" />
              )}

              {showExpanded && (
                <div className="px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)] first:pt-2">
                  {group.label}
                </div>
              )}

              <div className={cn("px-2", !showExpanded && "py-1")}>
                {group.items.map((item) => {
                  const active = isItemActive(item.href, activeKey);
                  const Icon = item.icon;

                  const itemClassName = cn(
                    "flex w-full items-center rounded-[var(--radius-md)] transition-colors",
                    showExpanded
                      ? "gap-2.5 px-3 py-2"
                      : "justify-center p-2.5",
                    active
                      ? "bg-[var(--bg-nav-item-active)] font-medium text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
                  );

                  const children = (
                    <>
                      <Icon
                        className={cn(
                          "shrink-0",
                          showExpanded ? "h-4 w-4" : "h-[18px] w-[18px]",
                        )}
                      />
                      {showExpanded && (
                        <span className="truncate text-[13px]">
                          {item.label}
                        </span>
                      )}
                    </>
                  );

                  if (renderLink) {
                    return (
                      <React.Fragment key={item.key}>
                        {renderLink(item.href, {
                          className: itemClassName,
                          children,
                        })}
                      </React.Fragment>
                    );
                  }

                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      className={itemClassName}
                    >
                      {children}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer slot (SidebarUser etc.) */}
        {footer}

        {/* Toggle button */}
        <div className="shrink-0 border-t border-[var(--border-subtle)] p-2">
          <button
            type="button"
            aria-label={
              // Mirrors the visible-text branches below, isOverlay first: when the
              // collapsed rail is hovered both isOverlay and showExpanded are true,
              // and the button reads "Expand". Keying on showExpanded alone made the
              // accessible name contradict the visible label (WCAG 2.5.3).
              isOverlay
                ? "Expand sidebar"
                : showExpanded
                  ? "Collapse sidebar"
                  : "Expand sidebar"
            }
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "flex w-full items-center rounded-[var(--radius-md)] p-2 text-[var(--text-tertiary)] transition-colors hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]",
              !showExpanded ? "justify-center" : "gap-2",
            )}
          >
            {isOverlay ? (
              <>
                <ChevronRight className="h-4 w-4" />
                <span className="text-[12px]">Expand</span>
              </>
            ) : showExpanded ? (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="text-[12px]">Collapse</span>
              </>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    );
  },
);
