import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { DataTableShell } from "./DataTableShell";
import { RowActionsMenu } from "./RowActionsMenu";

afterEach(cleanup);

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>;
  proto.scrollIntoView ??= () => undefined;
  proto.hasPointerCapture ??= () => false;
  proto.releasePointerCapture ??= () => undefined;
});

type Row = { id: string; name: string };

const initial: Row[] = [
  { id: "r0", name: "n0" },
  { id: "r1", name: "n1" },
  { id: "r2", name: "n2" },
];

function useColumns(remove: (id: string) => void, removes: boolean): ColumnDef<Row>[] {
  return [
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
              onClick: () => {
                if (removes) remove(row.original.id);
              },
            },
          ]}
        />
      ),
    },
  ];
}

function Grid({ removes = true, keyboardNavigation = true }: { removes?: boolean; keyboardNavigation?: boolean }) {
  const [data, setData] = useState(initial);
  const columns = useColumns((id) => setData((rows) => rows.filter((r) => r.id !== id)), removes);
  const prepend = () => setData((rows) => [{ id: "x", name: "nx" }, ...rows]);
  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel(), getRowId: (r) => r.id });
  return (
    <>
      <output onClick={prepend}>prepend</output>
      <DataTableShell
      table={table}
      dense={false}
      emptyMessage="No rows"
      columnMeta={{}}
      columnWidths={{}}
      onColumnResizeStart={() => undefined}
      keyboardNavigation={keyboardNavigation}
      />
    </>
  );
}

const trigger = (id: string) => screen.getByRole("button", { name: `Actions for ${id}` });
const actionCell = (row: number) =>
  document.querySelector<HTMLElement>(`td[data-grid-row="${row}"][data-grid-col="1"]`)!;

async function openMenu(id: string) {
  const btn = trigger(id);
  btn.focus();
  await act(async () => {
    fireEvent.keyDown(btn, { key: "Enter" });
  });
  return screen.findByRole("menuitem", { name: "Delete" });
}

async function activate(item: HTMLElement) {
  await act(async () => {
    fireEvent.keyDown(item, { key: "Enter" });
  });
}

describe("RowActionsMenu focus return in a keyboard grid", () => {
  it("focuses the cell of the row that took the removed row's place", async () => {
    render(<Grid />);
    await activate(await openMenu("r1"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(actionCell(1)));
    expect(actionCell(1).getAttribute("tabindex")).toBe("0");
    expect(actionCell(1).textContent).toBe("");
    expect(trigger("r2")).toBe(actionCell(1).querySelector("button"));
    expect(document.querySelectorAll('td[tabindex="0"]')).toHaveLength(1);
  });

  it("focuses the new last row's cell when the last row is removed", async () => {
    render(<Grid />);
    await activate(await openMenu("r2"));
    await waitFor(() => expect(document.activeElement).toBe(actionCell(1)));
    expect(trigger("r1")).toBe(actionCell(1).querySelector("button"));
  });

  it("remembers the cell position from the moment the menu opened", async () => {
    render(<Grid />);
    const item = await openMenu("r1");
    fireEvent.click(screen.getByText("prepend"));
    await activate(item);
    await waitFor(() => expect(document.activeElement).toBe(actionCell(1)));
    expect(trigger("r0")).toBe(actionCell(1).querySelector("button"));
  });

  it("returns focus to the trigger when the action keeps the row", async () => {
    render(<Grid removes={false} />);
    await activate(await openMenu("r1"));
    await waitFor(() => expect(document.activeElement).toBe(trigger("r1")));
    expect(document.activeElement).not.toBe(actionCell(1));
  });

  it("does nothing extra outside a keyboard grid", async () => {
    render(<Grid keyboardNavigation={false} />);
    await activate(await openMenu("r1"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(screen.queryByRole("button", { name: "Actions for r1" })).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it("removes the row in a plain table without moving focus", async () => {
    function Plain() {
      const [data, setData] = useState(initial);
      return (
        <table>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td>
                  <RowActionsMenu
                    triggerAriaLabel={`Actions for ${r.id}`}
                    actions={[
                      {
                        label: "Delete",
                        icon: Trash2,
                        onClick: () => setData((rows) => rows.filter((x) => x.id !== r.id)),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    render(<Plain />);
    await activate(await openMenu("r1"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(screen.queryByRole("button", { name: "Actions for r1" })).toBeNull();
    expect(document.activeElement).toBe(document.body);
  });

  it("does not move focus when the menu closes with Escape and the row is removed later", async () => {
    function Later() {
      const [data, setData] = useState(initial);
      return (
        <div>
          <table>
            <tbody>
              {data.map((r) => (
                <tr key={r.id}>
                  <td>
                    <RowActionsMenu
                      triggerAriaLabel={`Actions for ${r.id}`}
                      actions={[{ label: "Delete", icon: Trash2, onClick: () => undefined }]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
<output onClick={() => setData((rows) => rows.slice(1))}>remove</output>
        </div>
      );
    }
    render(<Later />);
    const item = await openMenu("r0");
    await act(async () => {
      fireEvent.keyDown(item, { key: "Escape" });
    });
    await waitFor(() => expect(document.activeElement).toBe(trigger("r0")));
    fireEvent.click(screen.getByText("remove"));
    expect(document.activeElement).toBe(document.body);
  });
});
