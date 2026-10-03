import { useState } from "react";

export interface RowDragProps {
  draggable: true;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export interface UseRowDragResult {
  dragRowIdx: number | null;
  dropTargetIdx: number | null;
  getDragProps: (rowIndex: number) => RowDragProps;
}

export function useRowDrag<T>(
  source: T[],
  onReorder: (items: T[]) => void,
): UseRowDragResult {
  const [dragRowIdx, setDragRowIdx] = useState<number | null>(null);
  const [dropTargetIdx, setDropTargetIdx] = useState<number | null>(null);

  function getDragProps(rowIndex: number): RowDragProps {
    return {
      draggable: true,
      onDragStart: (e: React.DragEvent) => {
        setDragRowIdx(rowIndex);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", "");
      },
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDropTargetIdx(rowIndex);
      },
      onDragLeave: () => setDropTargetIdx(null),
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (dragRowIdx !== null && dragRowIdx !== rowIndex) {
          const items = [...source];
          const [moved] = items.splice(dragRowIdx, 1);
          items.splice(rowIndex, 0, moved);
          onReorder(items);
        }
        setDragRowIdx(null);
        setDropTargetIdx(null);
      },
      onDragEnd: () => {
        setDragRowIdx(null);
        setDropTargetIdx(null);
      },
    };
  }

  return { dragRowIdx, dropTargetIdx, getDragProps };
}
