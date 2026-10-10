import type { ColumnPinningState } from "@tanstack/react-table";
import type { CSSProperties } from "react";
import type { ColumnMetaDef } from "./types";

export interface ApplyColumnPinningToMetaOptions {
  /** Visible columns in left-to-right display order (include gap columns when present). */
  columnOrder: readonly string[];
  /** Resolved widths in px; falls back to `meta.minW`. */
  columnWidths?: Record<string, number>;
}

/** @internal Exported for unit tests (not re-exported from package entry). */
export function columnWidthPx(
  columnId: string,
  meta: Record<string, ColumnMetaDef>,
  columnWidths?: Record<string, number>,
): number {
  return columnWidths?.[columnId] ?? meta[columnId]?.minW ?? 0;
}

/** Merges TanStack `ColumnPinningState` into column meta sticky fields for rendering. */
export function applyColumnPinningToMeta(
  baseMeta: Record<string, ColumnMetaDef>,
  pinning: ColumnPinningState,
  options?: ApplyColumnPinningToMetaOptions,
): Record<string, ColumnMetaDef> {
  const order = options?.columnOrder ?? Object.keys(baseMeta);
  const pinnedLeft = new Set(pinning.left ?? []);
  const pinnedRight = new Set(pinning.right ?? []);

  const result: Record<string, ColumnMetaDef> = {};
  for (const [id, meta] of Object.entries(baseMeta)) {
    if (pinnedLeft.has(id)) {
      result[id] = { ...meta, sticky: "left" };
    } else if (pinnedRight.has(id)) {
      result[id] = { ...meta, sticky: "right" };
    } else {
      result[id] = { ...meta };
    }
  }

  let leftOffset = 0;
  for (const id of order) {
    const meta = result[id];
    if (meta?.sticky !== "left") continue;
    result[id] = { ...meta, stickyOffset: leftOffset };
    leftOffset += columnWidthPx(id, baseMeta, options?.columnWidths);
  }

  let rightOffset = 0;
  for (const id of [...order].reverse()) {
    const meta = result[id];
    if (meta?.sticky !== "right") continue;
    result[id] = { ...meta, stickyOffset: rightOffset };
    rightOffset += columnWidthPx(id, baseMeta, options?.columnWidths);
  }

  return result;
}

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
