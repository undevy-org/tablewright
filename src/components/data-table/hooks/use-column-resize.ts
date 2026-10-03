import { useCallback, useMemo, useRef, useState } from "react";
import type { ColumnMetaDef } from "../types";

export function useColumnResize(
  defaults: Record<string, ColumnMetaDef>,
  initialWidths?: Record<string, number>,
) {
  const [widths, setWidths] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    for (const [id, m] of Object.entries(defaults)) w[id] = m.minW;
    return initialWidths ? { ...w, ...initialWidths } : w;
  });

  const resizing = useRef<{ colId: string; startX: number; startW: number } | null>(null);

  const onPointerDown = useCallback(
    (colId: string, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizing.current = { colId, startX: e.clientX, startW: widths[colId] ?? defaults[colId]?.minW ?? 100 };

      const onMove = (ev: PointerEvent) => {
        if (!resizing.current) return;
        const { colId: resizingColId, startX, startW } = resizing.current;
        const diff = ev.clientX - startX;
        const newW = Math.max(36, startW + diff);
        setWidths((prev) => ({ ...prev, [resizingColId]: newW }));
      };

      const onUp = () => {
        resizing.current = null;
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [widths, defaults],
  );

  const totalWidth = useMemo(
    () => Object.values(widths).reduce((s, w) => s + w, 0),
    [widths],
  );

  return { widths, totalWidth, onPointerDown, setWidths };
}
