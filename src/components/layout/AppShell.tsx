import * as React from "react";
import { cn } from "../../lib/utils";
import {
  AppShellContext,
  type AppShellContextValue,
} from "./app-shell-context";
import { Sidebar, type SidebarProps } from "./Sidebar";
import { TopBar, type TopBarProps } from "./TopBar";

/* ------------------------------------------------------------------ */
/*  AppShell root                                                      */
/* ------------------------------------------------------------------ */

export interface AppShellProps {
  collapsed?: boolean;
  defaultCollapsed?: boolean;
  onCollapsedChange?: (next: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

const HOVER_DELAY = 200;

function AppShellRoot({
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange: onCollapsedChangeProp,
  children,
  className,
}: AppShellProps) {
  const isControlled = controlledCollapsed !== undefined;

  const [internalCollapsed, setInternalCollapsed] =
    React.useState(defaultCollapsed);
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const [hovering, setHovering] = React.useState(false);
  const hoverTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const onCollapsedChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalCollapsed(next);
      onCollapsedChangeProp?.(next);
    },
    [isControlled, onCollapsedChangeProp],
  );

  // Cmd/Ctrl+B toggle
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        e.key === "b" &&
        (e.metaKey || e.ctrlKey) &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if ((e.target as HTMLElement)?.isContentEditable) return;
        e.preventDefault();
        onCollapsedChange(!collapsed);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [collapsed, onCollapsedChange]);

  // Hover expand handlers
  const handleMouseEnter = React.useCallback(() => {
    if (!collapsed) return;
    hoverTimerRef.current = setTimeout(() => setHovering(true), HOVER_DELAY);
  }, [collapsed]);

  const handleMouseLeave = React.useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHovering(false);
  }, []);

  // Reset hovering when user explicitly expands
  React.useEffect(() => {
    if (!collapsed) setHovering(false);
  }, [collapsed]);

  const ctx = React.useMemo<AppShellContextValue>(
    () => ({
      collapsed,
      hovering,
      effectiveCollapsed: collapsed && !hovering,
      onCollapsedChange,
    }),
    [collapsed, hovering, onCollapsedChange],
  );

  return (
    <AppShellContext.Provider value={ctx}>
      <div
        className={cn("flex h-full overflow-hidden bg-[var(--bg-body)]", className)}
        onMouseLeave={handleMouseLeave}
      >
        {React.Children.map(children, (child) => {
          if (!React.isValidElement(child)) return child;

          // Wrap AppShell.Sidebar with hover handlers
          if (child.type === AppShellSidebar) {
            return (
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative shrink-0"
                style={{
                  width: collapsed
                    ? "var(--size-sidebar-collapsed)"
                    : "var(--size-sidebar-expanded)",
                  transitionProperty: "width",
                  transitionDuration: "var(--duration-sidebar)",
                  transitionTimingFunction: "ease-in-out",
                }}
              >
                {child}
              </div>
            );
          }

          return child;
        })}
      </div>
    </AppShellContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function AppShellSidebar(props: SidebarProps) {
  return <Sidebar {...props} />;
}

function AppShellHeader(props: TopBarProps) {
  return <TopBar {...props} />;
}

function AppShellContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-hidden", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Compound export                                                    */
/* ------------------------------------------------------------------ */

export const AppShell = Object.assign(AppShellRoot, {
  Sidebar: AppShellSidebar,
  Header: AppShellHeader,
  Content: AppShellContent,
});
