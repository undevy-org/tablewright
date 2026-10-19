import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ColumnHeaderMenu } from "./ColumnHeaderMenu";
import { DataTableShell } from "./DataTableShell";

afterEach(cleanup);

type Row = { id: string; a: string; b: string; c: string };

const plainColumns: ColumnDef<Row>[] = [
  { id: "a", accessorKey: "a", header: "A" },
  { id: "b", accessorKey: "b", header: "B" },
  { id: "c", accessorKey: "c", header: "C" },
];

const menuColumns: ColumnDef<Row>[] = [
  { id: "a", accessorKey: "a", header: () => <ColumnHeaderMenu label="Alpha" onSort={() => undefined} /> },
  { id: "b", accessorKey: "b", header: "B" },
  { id: "c", accessorKey: "c", header: "C" },
];

const groupedColumns: ColumnDef<Row>[] = [
  {
    id: "g",
    header: "Group",
    columns: [
      { id: "a", accessorKey: "a", header: "A" },
      { id: "b", accessorKey: "b", header: "B" },
    ],
  },
  { id: "c", accessorKey: "c", header: "C" },
];

const makeRows = (n: number): Row[] =>
  Array.from({ length: n }, (_, i) => ({ id: `r${i}`, a: `a${i}`, b: `b${i}`, c: `c${i}` }));

function Harness({
  rows = makeRows(3),
  keyboardNavigation,
  status,
  hiddenColumns = {},
  cols = plainColumns,
}: {
  rows?: Row[];
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

const headers = () => Array.from(document.querySelectorAll<HTMLElement>("thead th"));
const headerAt = (c: number) =>
  document.querySelector<HTMLElement>(`th[data-grid-row="-1"][data-grid-col="${c}"]`)!;
const cellAt = (r: number, c: number) =>
  document.querySelector<HTMLElement>(`td[data-grid-row="${r}"][data-grid-col="${c}"]`)!;
const tabbable = () => document.querySelectorAll('table [tabindex="0"]');

function openMenu(name: string) {
  const trigger = screen.getByRole("button", { name });
  act(() => {
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.click(trigger);
  });
}

describe("DataTableShell keyboardNavigation headers", () => {
  it("prop off: header cells carry no tabindex or data-grid attributes, no role", () => {
    render(<Harness />);
    for (const th of headers()) {
      expect(th.hasAttribute("tabindex")).toBe(false);
      expect(th.hasAttribute("data-grid-row")).toBe(false);
      expect(th.hasAttribute("data-grid-col")).toBe(false);
    }
    expect(document.querySelector("table")!.hasAttribute("role")).toBe(false);
  });

  it("prop on: every header cell is row -1 with tabindex -1; body row 0 col 0 is the only tab stop", () => {
    render(<Harness keyboardNavigation />);
    headers().forEach((th, i) => {
      expect(th.getAttribute("data-grid-row")).toBe("-1");
      expect(th.getAttribute("data-grid-col")).toBe(String(i));
      expect(th.getAttribute("tabindex")).toBe("-1");
    });
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(cellAt(0, 0));
  });

  it("ArrowUp from body row 0 focuses the header cell; ArrowDown returns", () => {
    render(<Harness keyboardNavigation />);
    const cell = cellAt(0, 1);
    cell.focus();
    fireEvent.keyDown(cell, { key: "ArrowUp" });
    expect(document.activeElement).toBe(headerAt(1));
    expect(tabbable()).toHaveLength(1);
    expect(tabbable()[0]).toBe(headerAt(1));
    fireEvent.keyDown(headerAt(1), { key: "ArrowDown" });
    expect(document.activeElement).toBe(cellAt(0, 1));
    expect(tabbable()[0]).toBe(cellAt(0, 1));
  });

  it("Ctrl+Home lands on header column 0", () => {
    render(<Harness keyboardNavigation />);
    const cell = cellAt(2, 2);
    cell.focus();
    fireEvent.keyDown(cell, { key: "Home", ctrlKey: true });
    expect(document.activeElement).toBe(headerAt(0));
  });

  it("Radix menu trigger: Enter enters, Escape returns, an open menu's Escape keeps the trigger focused", () => {
    render(<Harness keyboardNavigation cols={menuColumns} />);
    const th = headerAt(0);
    th.focus();
    fireEvent.keyDown(th, { key: "Enter" });
    const trigger = screen.getByRole("button", { name: "Alpha" });
    expect(document.activeElement).toBe(trigger);

    openMenu("Alpha");
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).not.toBe(th);

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(document.activeElement).toBe(th);
  });

  it.each(["loading", "error"] as const)("status=%s: header cells are outside the grid", (status) => {
    render(<Harness keyboardNavigation status={status} />);
    for (const th of headers()) {
      expect(th.hasAttribute("tabindex")).toBe(false);
      expect(th.hasAttribute("data-grid-row")).toBe(false);
    }
    expect(screen.getByRole("grid")).toBeTruthy();
  });

  it("zero rows: header cells are outside the grid", () => {
    render(<Harness keyboardNavigation rows={[]} />);
    for (const th of headers()) {
      expect(th.hasAttribute("tabindex")).toBe(false);
      expect(th.hasAttribute("data-grid-col")).toBe(false);
    }
    expect(screen.getByRole("grid")).toBeTruthy();
  });

  it("grouped headers: only the bottom header row carries data-grid-*", () => {
    render(<Harness keyboardNavigation cols={groupedColumns} />);
    const rows = document.querySelectorAll("thead tr");
    expect(rows).toHaveLength(2);
    for (const th of rows[0]!.querySelectorAll("th")) {
      expect(th.hasAttribute("data-grid-row")).toBe(false);
      expect(th.hasAttribute("tabindex")).toBe(false);
    }
    const bottom = Array.from(rows[1]!.querySelectorAll("th"));
    expect(bottom.length).toBeGreaterThan(0);
    bottom.forEach((th, i) => {
      expect(th.getAttribute("data-grid-row")).toBe("-1");
      expect(th.getAttribute("data-grid-col")).toBe(String(i));
    });
  });

  it("hidden columns: header data-grid-col follows the visible columns", () => {
    render(<Harness keyboardNavigation hiddenColumns={{ b: false }} />);
    expect(headers().map((th) => th.getAttribute("data-grid-col"))).toEqual(["0", "1"]);
    expect(headers().map((th) => th.textContent)).toEqual(["A", "C"]);
  });
});
