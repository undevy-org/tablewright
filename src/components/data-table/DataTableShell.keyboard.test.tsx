import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { DataTableShell } from "./DataTableShell";

afterEach(cleanup);

type Row = { id: string; a: string; b: string; c: string };

const columns: ColumnDef<Row>[] = [
  { id: "a", accessorKey: "a", header: "A" },
  { id: "b", accessorKey: "b", header: "B" },
  { id: "c", accessorKey: "c", header: "C" },
];

const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `r${i}`, a: `a${i}`, b: `b${i}`, c: `c${i}` }));

function Harness({
  rows,
  keyboardNavigation,
  status,
  hiddenColumns = {},
  cols = columns,
}: {
  rows: Row[];
  keyboardNavigation?: boolean;
  status?: "idle" | "loading" | "error";
  hiddenColumns?: Record<string, boolean>;
  cols?: ColumnDef<Row>[];
}) {
  const table = useReactTable({
    data: rows,
    columns: cols,
    state: { columnVisibility: hiddenColumns },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });
  return (
    <DataTableShell
      table={table}
      dense={false}
      emptyMessage="No rows"
      columnMeta={{}}
      columnWidths={{}}
      onColumnResizeStart={() => undefined}
      status={status}
      keyboardNavigation={keyboardNavigation}
    />
  );
}

const bodyCells = () => Array.from(document.querySelectorAll<HTMLElement>("tbody td"));
const cellAt = (r: number, c: number) =>
  document.querySelector<HTMLElement>(`td[data-grid-row="${r}"][data-grid-col="${c}"]`)!;
const tabbable = () => document.querySelectorAll('td[tabindex="0"]');

describe("DataTableShell keyboardNavigation", () => {
  it("renders no grid markup when the prop is off", () => {
    render(<Harness rows={makeRows(3)} />);
    expect(screen.getByRole("table").hasAttribute("role")).toBe(false);
    for (const td of bodyCells()) {
      expect(td.hasAttribute("tabindex")).toBe(false);
      expect(td.hasAttribute("data-grid-row")).toBe(false);
      expect(td.hasAttribute("data-grid-col")).toBe(false);
    }
  });

  it("with the prop on: role=grid and one tabindex=0 at row 0 col 0, all others -1", () => {
    render(<Harness rows={makeRows(3)} keyboardNavigation />);
    expect(screen.getByRole("grid")).toBeTruthy();
    const cells = bodyCells();
    expect(cells).toHaveLength(9);
    expect(tabbable()).toHaveLength(1);
    expect(cellAt(0, 0).getAttribute("tabindex")).toBe("0");
    expect(cells.filter((td) => td.getAttribute("tabindex") === "-1")).toHaveLength(8);
  });

  it.each([
    ["ArrowDown", {}, [1, 0]],
    ["ArrowRight", {}, [0, 1]],
    ["End", {}, [0, 2]],
    ["PageDown", {}, [2, 0]],
    ["End", { ctrlKey: true }, [2, 2]],
  ])("%s %j moves focus and the single tabindex=0", (key, init, [r, c]) => {
    render(<Harness rows={makeRows(3)} keyboardNavigation />);
    cellAt(0, 0).focus();
    fireEvent.keyDown(cellAt(0, 0), { key, ...init });
    expect(document.activeElement).toBe(cellAt(r, c));
    expect(tabbable()).toHaveLength(1);
    expect(cellAt(r, c).getAttribute("tabindex")).toBe("0");
  });

  it("prevents default for handled keys only, and ignores Alt/Meta/Shift combos", () => {
    render(<Harness rows={makeRows(3)} keyboardNavigation />);
    cellAt(0, 0).focus();
    expect(fireEvent.keyDown(cellAt(0, 0), { key: "x" })).toBe(true);
    expect(fireEvent.keyDown(cellAt(0, 0), { key: "ArrowDown", altKey: true })).toBe(true);
    expect(fireEvent.keyDown(cellAt(0, 0), { key: "ArrowDown", metaKey: true })).toBe(true);
    expect(fireEvent.keyDown(cellAt(0, 0), { key: "ArrowDown", shiftKey: true })).toBe(true);
    expect(document.activeElement).toBe(cellAt(0, 0));
    expect(fireEvent.keyDown(cellAt(0, 0), { key: "ArrowDown" })).toBe(false);
  });

  it("focusing a cell makes it the active one", () => {
    render(<Harness rows={makeRows(3)} keyboardNavigation />);
    fireEvent.focus(cellAt(2, 1));
    expect(tabbable()).toHaveLength(1);
    expect(cellAt(2, 1).getAttribute("tabindex")).toBe("0");
  });

  it("clamps the active cell when rows shrink", () => {
    const { rerender } = render(<Harness rows={makeRows(5)} keyboardNavigation />);
    fireEvent.focus(cellAt(4, 2));
    rerender(<Harness rows={makeRows(2)} keyboardNavigation />);
    expect(tabbable()).toHaveLength(1);
    expect(cellAt(1, 2).getAttribute("tabindex")).toBe("0");
  });

  it("counts only visible columns", () => {
    render(<Harness rows={makeRows(2)} keyboardNavigation hiddenColumns={{ b: false }} />);
    expect(bodyCells()).toHaveLength(4);
    cellAt(0, 0).focus();
    fireEvent.keyDown(cellAt(0, 0), { key: "End" });
    expect(document.activeElement).toBe(cellAt(0, 1));
  });

  it.each(["loading", "error"] as const)("status=%s: role=grid but no tabindex or key handling", (status) => {
    render(<Harness rows={makeRows(3)} keyboardNavigation status={status} />);
    expect(screen.getByRole("grid")).toBeTruthy();
    expect(document.querySelectorAll("td[tabindex]")).toHaveLength(0);
    expect(document.querySelectorAll("[data-grid-row]")).toHaveLength(0);
    const table = screen.getByRole("grid");
    expect(fireEvent.keyDown(table, { key: "ArrowDown" })).toBe(true);
  });

  it("status=loading: a key press from a gridlike header element is not handled", () => {
    const probeColumns: ColumnDef<Row>[] = [
      {
        id: "a",
        accessorKey: "a",
        header: () => <span data-testid="probe" data-grid-row="0" data-grid-col="0" />,
      },
    ];
    render(<Harness rows={makeRows(3)} keyboardNavigation status="loading" cols={probeColumns} />);
    expect(fireEvent.keyDown(screen.getByTestId("probe"), { key: "ArrowDown" })).toBe(true);
  });

  it("zero rows: role=grid but no tabindex or key handling", () => {
    render(<Harness rows={[]} keyboardNavigation />);
    expect(screen.getByRole("grid")).toBeTruthy();
    expect(document.querySelectorAll("td[tabindex]")).toHaveLength(0);
    expect(fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowDown" })).toBe(true);
  });

  it("leaves header cells without tabindex or data-grid attributes", () => {
    render(<Harness rows={makeRows(2)} keyboardNavigation />);
    const headers = document.querySelectorAll("thead th");
    expect(headers).toHaveLength(3);
    for (const th of headers) {
      expect(th.hasAttribute("tabindex")).toBe(false);
      expect(th.hasAttribute("data-grid-row")).toBe(false);
      expect(th.hasAttribute("data-grid-col")).toBe(false);
    }
  });
});
