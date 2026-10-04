import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { useScrollActivity } from "../../hooks/use-scroll-activity";
import { DrawerExpandContext } from "../../context/drawer-expand-context";

/**
 * Controls how the drawer opens:
 * - `"side"` — (default) side panel only, no expand button. Matches every
 *   consumer that predates this prop, so the default preserves their exact
 *   rendered output.
 * - `"side+modal"` — side panel with an expand button that opens a
 *   full-screen modal.
 * - `"modal"` — opens directly as a full-screen modal, skipping the side
 *   panel entirely.
 */
export type DrawerMode = "side" | "modal" | "side+modal";

interface DrawerShellProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  /** Pinned footer (e.g. row actions); stays fixed while the body scrolls. */
  footer?: React.ReactNode;
  /**
   * Opt into a dismiss layer in side mode: a click-to-close scrim over the
   * positioning container plus Escape-to-close. Off by default so existing
   * consumers keep their current behavior (background stays interactive,
   * close only via the X button).
   * @default false
   */
  dismissible?: boolean;
  /** @default "side" */
  mode?: DrawerMode;
}

export function DrawerShell({
  open,
  onClose,
  title,
  subtitle,
  headerExtra,
  children,
  footer,
  dismissible = false,
  mode = "side",
}: DrawerShellProps) {
  const [expandedState, setExpandedState] = useState(false);
  const bodyScrollRef = useScrollActivity<HTMLDivElement>();

  const isExpanded = mode === "modal" ? true : mode === "side" ? false : expandedState;
  const canToggle = mode === "side+modal";

  const handleClose = () => {
    setExpandedState(false);
    onClose();
  };

  // Escape-to-close, opt-in via `dismissible`. A ref keeps the listener on
  // the latest close callback without re-subscribing on every render; a
  // dialog/menu layered above consumes Esc first.
  const closeRef = useRef(handleClose);
  useEffect(() => {
    closeRef.current = handleClose;
  });
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest?.("[role=dialog],[role=menu]")) return;
      closeRef.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dismissible]);

  const header = (
    <div className="flex shrink-0 items-start justify-between border-b border-[var(--border-subtle)] px-6 py-6">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          {title ? (
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
          ) : null}
          {headerExtra}
        </div>
        {subtitle && (
          <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
            {subtitle}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1">
        {canToggle &&
          (isExpanded ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-sm"
              onClick={() => setExpandedState(false)}
              title="Collapse to panel"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-sm"
              onClick={() => setExpandedState(true)}
              title="Expand to full view"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          ))}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close"
          className="h-8 w-8 rounded-sm"
          onClick={handleClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  const body = (
    <div
      ref={bodyScrollRef}
      tabIndex={0}
      className="scrollbar-auto-hide min-h-0 flex-1 overflow-y-auto px-6 py-6"
    >
      {children}
    </div>
  );

  const pinnedFooter = footer ? (
    <div className="shrink-0 border-t border-[var(--border-subtle)] px-6 py-4">{footer}</div>
  ) : null;

  return (
    <DrawerExpandContext.Provider value={isExpanded}>
      {/* Side panel — shown in "side" and "side+modal" (when not expanded) */}
      {!isExpanded && (
        <>
          {/* Scrim over the positioning container — click to close. Opt-in:
              existing consumers keep an interactive background unless
              dismissible. */}
          {dismissible && (
            <div
              className={cn(
                "absolute inset-0 z-30 bg-[var(--overlay-scrim,rgba(15,23,42,0.28))] transition-opacity duration-300",
                open ? "opacity-100" : "pointer-events-none opacity-0",
              )}
              onClick={handleClose}
              aria-hidden
            />
          )}
          <aside
            aria-label="Details panel"
            className={cn(
              "absolute inset-y-0 right-0 z-40 flex w-[var(--size-drawer)] flex-col border-l border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              open
                ? "translate-x-0 [box-shadow:var(--shadow-drawer)]"
                : "translate-x-full shadow-none",
            )}
          >
            {header}
            {body}
            {pinnedFooter}
          </aside>
        </>
      )}

      {/* Modal — shown in "modal" and "side+modal" (when expanded) */}
      {isExpanded && open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0 duration-200"
            onClick={handleClose}
          />
          <div className="fixed left-1/2 top-[10vh] z-50 flex h-[80vh] w-[min(75vw,1400px)] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
            {header}
            {body}
            {pinnedFooter}
          </div>
        </>
      )}
    </DrawerExpandContext.Provider>
  );
}
