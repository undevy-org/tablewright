import type { ReactNode } from "react";

export const GAP_HEADER_ATTR = "data-gap-header";
export const GAP_CELL_ATTR = "data-gap-cell";

interface GapIndicatorProps {
  onClick: () => void;
  ariaLabel?: string;
  children?: ReactNode;
}

export function GapIndicator({
  onClick,
  ariaLabel = "Show hidden columns",
  children = "‹›",
}: GapIndicatorProps) {
  return (
    <button
      type="button"
      {...{ [GAP_HEADER_ATTR]: true }}
      className="absolute inset-0 flex cursor-pointer items-center justify-center bg-[rgba(128,128,128,0.03)] text-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[rgba(128,128,128,0.08)] hover:text-[var(--text-accent,var(--text-primary))]"
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

export function GapCell() {
  return <div {...{ [GAP_CELL_ATTR]: true }} />;
}
