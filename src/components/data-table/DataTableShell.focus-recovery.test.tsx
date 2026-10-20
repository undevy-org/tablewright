import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { ColumnHeaderMenu } from "./ColumnHeaderMenu";
import { DataTableShell } from "./DataTableShell";
import { GapCell, GapIndicator } from "./GapIndicator";
import { RowActionsMenu } from "./RowActionsMenu";

afterEach(cleanup);

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.scrollIntoView ??= () => undefined;
  proto.hasPointerCapture ??= () => false;
  proto.releasePointerCapture ??= () => undefined;
});

type Row = { id: string; name: string };
const rows: Row[] = [
  { id: "r0", name: "n0" },
  { id: "r1", name: "n1" },
  { id: "r2", name: "n2" },
];

interface ScreenProps {
  keyboardNavigation?: boolean;
  status?: "idle" | "loading" | "error";
  /** Hides Beta from outside (without any menu), like a controlled visibility state. */
  forceHidden?: boolean;
}

/** Alpha | Beta | Gamma | C: header menus; `columns` is recomputed on every state change, like the pinning story. */
function ColumnScreen({ keyboardNavigation = false, status, forceHidden = false }: ScreenProps) {
  const [hidden, setHidden] = useState(false);
  const [sorted, setSorted] = useState<"asc" | "desc" | false>(false);
  const [pin, setPin] = useState<"left" | "right" | false>(false);
  const betaHidden = hidden || forceHidden;

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "alpha",
        header: () => (
          <ColumnHeaderMenu
            label="Alpha"
            onHide={() => setHidden(true)}
            onPinLeft={() => setPin("left")}
            onUnpin={() => setPin(false)}
            pinSide={pin}
          />
        ),
        cell: ({ row }) => row.original.name,
      },
      betaHidden
        ? {
            id: "gap",
            header: () => <GapIndicator onClick={() => setHidden(false)} />,
            cell: () => <GapCell />,
          }
        : {
            id: "beta",
            header: () => (
              <ColumnHeaderMenu
                label="Beta"
                sorted={sorted}
                onSort={setSorted}
                onPinRight={() => setPin("right")}
                onUnpin={() => setPin(false)}
                pinSide={pin}
                onHide={() => setHidden(true)}
              />
            ),
            cell: ({ row }) => row.original.id,
          },
      {
        id: "gamma",
        header: () => <ColumnHeaderMenu label="Gamma" onPinLeft={() => setPin("left")} />,
        cell: () => "g",
      },
      { id: "c", header: "C", cell: () => "c" },
    ],
    [betaHidden, sorted, pin],
  );
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel(), getRowId: (r) => r.id });
  return (
    <DataTableShell
      table={table}
      dense={false}
      emptyMessage="No rows"
      columnMeta={{}}
      columnWidths={{}}
      onColumnResizeStart={() => undefined}
      keyboardNavigation={keyboardNavigation}
      status={status}
    />
  );
}

const betaTrigger = () => screen.getByRole("button", { name: "Beta" });
const gapButton = () => screen.getByRole("button", { name: "Show hidden columns" });
const headerCell = (col: number) =>
  document.querySelector<HTMLElement>(`th[data-grid-row="-1"][data-grid-col="${col}"]`)!;
const bodyCell = (row: number, col: number) =>
  document.querySelector<HTMLElement>(`td[data-grid-row="${row}"][data-grid-col="${col}"]`)!;

async function chooseItem(trigger: HTMLElement, name: string) {
  trigger.focus();
  await act(async () => {
    fireEvent.keyDown(trigger, { key: "Enter" });
  });
  const label = await screen.findByText(name);
  const item = label.closest<HTMLElement>('[role^="menuitem"]')!;
  await act(async () => {
    fireEvent.keyDown(item, { key: "Enter" });
  });
  await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
}

describe("DataTableShell focus recovery without keyboardNavigation", () => {
  it("Hide column: focus goes to the gap indicator now at that index, and back after restoring", async () => {
    render(<ColumnScreen />);
    const old = betaTrigger();
    await chooseItem(old, "Hide column");
    expect(old.isConnected).toBe(false);
    await waitFor(() => expect(document.activeElement).toBe(gapButton()));
    expect(gapButton().closest("th")).toBe(document.querySelectorAll("thead th")[1]);

    await act(async () => {
      fireEvent.click(gapButton());
    });
    await waitFor(() => expect(document.activeElement).toBe(betaTrigger()));
  });

  it.each([
    ["Ascending"],
    ["Descending"],
    ["Pin right"],
    ["Unpin"],
  ])("%s with recomputed columns: focus returns to the Beta header control", async (item) => {
    render(<ColumnScreen />);
    if (item === "Unpin") await chooseItem(betaTrigger(), "Pin right");
    const old = betaTrigger();
    await chooseItem(old, item);
    expect(old.isConnected).toBe(false);
    await waitFor(() => expect(document.activeElement).toBe(betaTrigger()));
    expect(betaTrigger().closest("th")).toBe(document.querySelectorAll("thead th")[1]);
  });

  it("focuses a control, never a cell, and adds no tabindex, data-grid or role attribute", async () => {
    render(<ColumnScreen />);
    const names = () => {
      const table = document.querySelector("table")!;
      return new Set(
        [table, ...Array.from(table.querySelectorAll("*"))].flatMap((el) => el.getAttributeNames()),
      );
    };
    const forbidden = ["tabindex", "data-grid-row", "data-grid-col", "role"];
    const before = names();
    await chooseItem(betaTrigger(), "Hide column");
    await waitFor(() => expect(document.activeElement).toBe(gapButton()));
    const after = names();
    for (const name of forbidden) {
      expect(before.has(name)).toBe(false);
      expect(after.has(name)).toBe(false);
    }
    expect(document.activeElement?.tagName).toBe("BUTTON");
  });
});

describe("DataTableShell focus recovery with keyboardNavigation", () => {
  it.each([["Hide column"], ["Ascending"], ["Pin right"]])(
    "%s: focus goes to the header grid cell of that column, the single tab stop",
    async (item) => {
      render(<ColumnScreen keyboardNavigation />);
      await chooseItem(betaTrigger(), item);
      await waitFor(() => expect(document.activeElement).toBe(headerCell(1)));
      expect(headerCell(1).getAttribute("tabindex")).toBe("0");
      expect(document.querySelectorAll('table [tabindex="0"]')).toHaveLength(1);
    },
  );

  it("a consumer's own body menu that removes its row: focus goes to the nearest body cell", async () => {
    function OwnMenuGrid() {
      const [data, setData] = useState(rows);
      const columns: ColumnDef<Row>[] = [
        { id: "name", accessorKey: "name", header: "Name" },
        {
          id: "menu",
          header: "Menu",
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label={`Menu ${row.original.id}`}>
                  ...
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onSelect={() => setData((d) => d.filter((r) => r.id !== row.original.id))}>
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        },
      ];
      const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: (r) => r.id });
      return (
        <DataTableShell
          table={table}
          dense={false}
          emptyMessage="No rows"
          columnMeta={{}}
          columnWidths={{}}
          onColumnResizeStart={() => undefined}
          keyboardNavigation
        />
      );
    }
    render(<OwnMenuGrid />);
    await chooseItem(screen.getByRole("button", { name: "Menu r1" }), "Remove");
    await waitFor(() => expect(document.activeElement).toBe(bodyCell(1, 1)));
    expect(bodyCell(1, 1).getAttribute("tabindex")).toBe("0");
    expect(screen.queryByRole("button", { name: "Menu r1" })).toBeNull();
  });

  it("the library RowActionsMenu still ends on the same cell", async () => {
    function ActionsGrid() {
      const [data, setData] = useState(rows);
      const columns: ColumnDef<Row>[] = [
        { id: "name", accessorKey: "name", header: "Name" },
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => (
            <RowActionsMenu
              triggerAriaLabel={`Actions for ${row.original.id}`}
              actions={[
                {
                  label: "Delete",
                  icon: Trash2,
                  onClick: () => setData((d) => d.filter((r) => r.id !== row.original.id)),
                },
              ]}
            />
          ),
        },
      ];
      const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: (r) => r.id });
      return (
        <DataTableShell
          table={table}
          dense={false}
          emptyMessage="No rows"
          columnMeta={{}}
          columnWidths={{}}
          onColumnResizeStart={() => undefined}
          keyboardNavigation
        />
      );
    }
    render(<ActionsGrid />);
    await chooseItem(screen.getByRole("button", { name: "Actions for r1" }), "Delete");
    await waitFor(() => expect(document.activeElement).toBe(bodyCell(1, 1)));
    await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
    expect(document.activeElement).toBe(bodyCell(1, 1));
  });
});

describe.each([["loading"], ["error"]] as const)("DataTableShell focus recovery while status is %s", (status) => {
  it.each([[true], [false]])("keyboardNavigation=%s: a vanished header control follows the header rule", async (keyboardNavigation) => {
    const view = render(<ColumnScreen keyboardNavigation={keyboardNavigation} status={status} />);
    betaTrigger().focus();
    view.rerender(<ColumnScreen keyboardNavigation={keyboardNavigation} status={status} forceHidden />);
    await waitFor(() => expect(document.activeElement).toBe(gapButton()));
    expect(document.querySelector("th[tabindex], td[tabindex], [data-grid-row], [data-grid-col]")).toBeNull();
  });

  it("a focused body cell replaced by the skeleton or error panel: nothing moves", async () => {
    const view = render(<ColumnScreen keyboardNavigation />);
    bodyCell(1, 1).focus();
    expect(document.activeElement).toBe(bodyCell(1, 1));
    view.rerender(<ColumnScreen keyboardNavigation status={status} />);
    await act(async () => undefined);
    expect(document.activeElement).toBe(document.body);
  });
});
