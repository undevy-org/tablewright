import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataTableShell } from "./DataTableShell";
import type { ColumnMetaDef } from "./types";

type Row = { id: string; name: string };

const columnMeta: Record<string, ColumnMetaDef> = {
  name: { minW: 200 },
};

const columnWidths = { name: 200 };

function TableHarness({
  data,
  status,
  loadingRowCount,
  errorMessage,
  onRetry,
  retryLabel,
}: {
  data: Row[];
  status?: "idle" | "loading" | "error";
  loadingRowCount?: number;
  errorMessage?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  const columns: ColumnDef<Row>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <DataTableShell
      table={table}
      dense={false}
      emptyMessage="No rows"
      columnMeta={columnMeta}
      columnWidths={columnWidths}
      onColumnResizeStart={() => undefined}
      status={status}
      loadingRowCount={loadingRowCount}
      errorMessage={errorMessage}
      onRetry={onRetry}
      retryLabel={retryLabel}
    />
  );
}

describe("DataTableShell", () => {
  it("renders data rows when status is idle", () => {
    render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }, { id: "2", name: "Beta" }]}
        status="idle"
      />,
    );

    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByText("Beta")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
    const table = screen.getByRole("table");
    expect(table.hasAttribute("aria-busy")).toBe(false);
  });

  it("renders data rows when status is omitted", () => {
    render(<TableHarness data={[{ id: "1", name: "Alpha" }]} />);

    expect(screen.getByText("Alpha")).toBeTruthy();
    expect(screen.getByRole("table").hasAttribute("aria-busy")).toBe(false);
  });

  it("shows skeleton rows while loading with default row count and aria-busy", () => {
    const { container } = render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        status="loading"
      />,
    );

    expect(screen.queryByText("Alpha")).toBeNull();
    const skeletonRows = container.querySelectorAll("tbody tr");
    expect(skeletonRows.length).toBe(8);
    expect(screen.getByRole("table").getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll("[aria-hidden]").length).toBeGreaterThan(0);
  });

  it("respects loadingRowCount while loading", () => {
    const { container } = render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        status="loading"
        loadingRowCount={3}
      />,
    );

    expect(container.querySelectorAll("tbody tr").length).toBe(3);
  });

  it("shows the default error message with role alert", () => {
    render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        status="error"
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toBe("Something went wrong");
    expect(screen.queryByText("Alpha")).toBeNull();
  });

  it("shows a custom error message ReactNode with role alert", () => {
    render(
      <TableHarness
        data={[]}
        status="error"
        errorMessage={<span>Custom failure</span>}
      />,
    );

    expect(screen.getByRole("alert").textContent).toBe("Custom failure");
  });

  it("renders retry only when onRetry is provided and handles click and keyboard", () => {
    const onRetry = vi.fn();

    render(
      <TableHarness
        data={[]}
        status="error"
        onRetry={onRetry}
        retryLabel="Try again"
      />,
    );

    const retryButton = screen.getByRole("button", { name: "Try again" });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);

    onRetry.mockClear();
    retryButton.focus();
    fireEvent.keyDown(retryButton, { key: "Enter", code: "Enter" });
    fireEvent.keyUp(retryButton, { key: "Enter", code: "Enter" });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);

    onRetry.mockClear();
    fireEvent.keyDown(retryButton, { key: " ", code: "Space" });
    fireEvent.keyUp(retryButton, { key: " ", code: "Space" });
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);

    cleanup();
    render(<TableHarness data={[]} status="error" />);

    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });
});
