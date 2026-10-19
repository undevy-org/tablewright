import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { getCoreRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DataTableShell } from "./DataTableShell";

afterEach(cleanup);

type Row = { id: string; a: string; b: string };

const columns: ColumnDef<Row>[] = [
  { id: "a", accessorKey: "a", header: "A" },
  { id: "b", accessorKey: "b", header: "B" },
];

const rows: Row[] = [
  { id: "r0", a: "c", b: "x0" },
  { id: "r1", a: "b", b: "x1" },
  { id: "r2", a: "a", b: "x2" },
];

interface HarnessProps {
  onRowClick?: (row: Row) => void;
  keyboardNavigation?: boolean;
  status?: "idle" | "loading" | "error";
  data?: Row[];
  sorting?: SortingState;
  withDrawer?: boolean;
}

function Harness({
  onRowClick,
  keyboardNavigation = true,
  status,
  data = rows,
  sorting = [],
  withDrawer = false,
}: HarnessProps) {
  const [open, setOpen] = useState(false);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
  });
  return (
    <div>
      <button type="button">outside</button>
      <DataTableShell
        table={table}
        dense={false}
        emptyMessage="No rows"
        columnMeta={{}}
        columnWidths={{}}
        onColumnResizeStart={() => undefined}
        status={status}
        keyboardNavigation={keyboardNavigation}
        onRowClick={
          withDrawer
            ? (row) => {
                onRowClick?.(row);
                setOpen((value) => !value);
              }
            : onRowClick
        }
        drawer={
          withDrawer
            ? { open, onClose: () => setOpen(false), title: "Details", content: <p>body</p> }
            : undefined
        }
      />
    </div>
  );
}

const cellAt = (r: number, c: number) =>
  document.querySelector<HTMLElement>(`td[data-grid-row="${r}"][data-grid-col="${c}"]`)!;
const enter = (el: HTMLElement) => fireEvent.keyDown(el, { key: "Enter" });

describe("DataTableShell keyboardNavigation row activation", () => {
  it("Enter on a body cell calls onRowClick with that row's data", () => {
    const onRowClick = vi.fn();
    render(<Harness onRowClick={onRowClick} />);
    expect(enter(cellAt(0, 1))).toBe(false);
    expect(onRowClick).toHaveBeenLastCalledWith(rows[0]);
    enter(cellAt(2, 0));
    expect(onRowClick).toHaveBeenLastCalledWith(rows[2]);
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it("maps the grid row to the displayed row after sorting", () => {
    const onRowClick = vi.fn();
    render(<Harness onRowClick={onRowClick} sorting={[{ id: "a", desc: false }]} />);
    enter(cellAt(0, 0));
    expect(onRowClick).toHaveBeenLastCalledWith(rows[2]);
    enter(cellAt(2, 1));
    expect(onRowClick).toHaveBeenLastCalledWith(rows[0]);
  });

  it("does not handle Enter without onRowClick", () => {
    render(<Harness />);
    expect(enter(cellAt(0, 0))).toBe(true);
  });

  it("does nothing with the prop off", () => {
    const onRowClick = vi.fn();
    render(<Harness onRowClick={onRowClick} keyboardNavigation={false} />);
    const cell = document.querySelector("tbody td") as HTMLElement;
    expect(enter(cell)).toBe(true);
    expect(onRowClick).not.toHaveBeenCalled();
    expect(document.querySelector("td[tabindex]")).toBeNull();
    expect(document.querySelector("[data-grid-row]")).toBeNull();
  });

  it.each(["loading", "error"] as const)("does nothing when status is %s", (status) => {
    const onRowClick = vi.fn();
    render(<Harness onRowClick={onRowClick} status={status} />);
    document.querySelectorAll("td").forEach((td) => enter(td as HTMLElement));
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it("does nothing with zero rows", () => {
    const onRowClick = vi.fn();
    render(<Harness onRowClick={onRowClick} data={[]} />);
    document.querySelectorAll("td").forEach((td) => enter(td as HTMLElement));
    expect(onRowClick).not.toHaveBeenCalled();
  });
});

describe("DataTableShell keyboardNavigation drawer focus return", () => {
  it("returns focus to the active cell when the drawer's Close button closes it", () => {
    render(<Harness withDrawer />);
    const cell = cellAt(1, 1);
    cell.focus();
    enter(cell);
    const close = screen.getByRole("button", { name: "Close" });
    close.focus();
    fireEvent.click(close);
    expect(document.activeElement).toBe(cell);
    expect(cell.getAttribute("tabindex")).toBe("0");
    expect(document.querySelectorAll('td[tabindex="0"]')).toHaveLength(1);
  });

  it("keeps focus on the cell when Enter closes the drawer", () => {
    render(<Harness withDrawer />);
    const cell = cellAt(2, 0);
    cell.focus();
    enter(cell);
    enter(cell);
    expect(document.activeElement).toBe(cell);
  });

  it("leaves focus alone when the user moved to an outside element", () => {
    render(<Harness withDrawer />);
    const cell = cellAt(0, 0);
    cell.focus();
    enter(cell);
    const outside = screen.getByRole("button", { name: "outside" });
    outside.focus();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(document.activeElement).toBe(outside);
  });
});
