import type { CSSProperties } from "react";
import type { ColumnMetaDef } from "./types";

export function stickyStyle(
  meta: ColumnMetaDef | undefined,
  isHeader: boolean,
): CSSProperties | undefined {
  if (isHeader) {
    return {
      position: "sticky" as const,
      top: 0,
      zIndex: meta?.sticky ? 30 : 10,
      ...(meta?.sticky ? { [meta.sticky]: meta.stickyOffset ?? 0 } : {}),
    };
  }
  if (!meta?.sticky) return undefined;
  return {
    position: "sticky" as const,
    [meta.sticky]: meta.stickyOffset ?? 0,
    zIndex: 20,
  };
}

export function stickyBorderClass(meta: ColumnMetaDef | undefined): string {
  const edge =
    meta?.borderEdge !== undefined
      ? meta.borderEdge
      : meta?.sticky === "left"
        ? "right"
        : meta?.sticky === "right"
          ? "left"
          : null;

  if (!edge) return "";
  return edge === "right"
    ? "[box-shadow:1px_0_0_0_var(--border-subtle)]"
    : "[box-shadow:-1px_0_0_0_var(--border-subtle)]";
}
