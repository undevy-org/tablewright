import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DataTableShell } from "./DataTableShell";
import type { UseRowDragResult } from "./hooks/use-row-drag";
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
  dense = false,
  onRowClick,
  getRowIsActive,
  harnessColumnMeta = columnMeta,
  harnessColumnWidths = columnWidths,
  columns,
  rowDrag,
}: {
  data: Row[];
  status?: "idle" | "loading" | "error";
  loadingRowCount?: number;
  errorMessage?: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
  dense?: boolean;
  onRowClick?: (row: Row) => void;
  getRowIsActive?: (row: Row) => boolean;
  harnessColumnMeta?: Record<string, ColumnMetaDef>;
  harnessColumnWidths?: Record<string, number>;
  columns?: ColumnDef<Row>[];
  rowDrag?: UseRowDragResult;
}) {
  const defaultColumns: ColumnDef<Row>[] = [
    {
      id: "name",
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.original.name,
    },
  ];

  const table = useReactTable({
    data,
    columns: columns ?? defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  return (
    <DataTableShell
      table={table}
      dense={dense}
      emptyMessage="No rows"
      columnMeta={harnessColumnMeta}
      columnWidths={harnessColumnWidths}
      onColumnResizeStart={() => undefined}
      status={status}
      loadingRowCount={loadingRowCount}
      errorMessage={errorMessage}
      onRetry={onRetry}
      retryLabel={retryLabel}
      onRowClick={onRowClick}
      getRowIsActive={getRowIsActive}
      rowDrag={rowDrag}
    />
  );
}

function noopDragProps() {
  return {
    draggable: true as const,
    onDragStart: () => undefined,
    onDragOver: () => undefined,
    onDragLeave: () => undefined,
    onDrop: () => undefined,
    onDragEnd: () => undefined,
  };
}

const multiColumnMeta: Record<string, ColumnMetaDef> = {
  rowControl: { minW: 48, variant: "control" },
  name: { minW: 200 },
  actions: { minW: 72, sticky: "right" },
};

const multiColumnWidths = {
  rowControl: 48,
  name: 200,
  actions: 72,
};

const multiColumns: ColumnDef<Row>[] = [
  {
    id: "rowControl",
    header: "#",
    cell: () => "1",
  },
  {
    id: "name",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => row.original.name,
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => "…",
  },
];

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

  it("shows the empty state when idle with no rows", () => {
    render(<TableHarness data={[]} status="idle" />);

    expect(screen.getByText("No rows")).toBeTruthy();
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

  it("hides the empty state while loading even with no data rows", () => {
    const { container } = render(
      <TableHarness data={[]} status="loading" loadingRowCount={2} />,
    );

    expect(screen.queryByText("No rows")).toBeNull();
    expect(container.querySelectorAll("tbody tr").length).toBe(2);
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

  it("applies column layout classes on loading skeleton cells", () => {
    const { container } = render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        status="loading"
        loadingRowCount={1}
        harnessColumnMeta={multiColumnMeta}
        harnessColumnWidths={multiColumnWidths}
        columns={multiColumns}
      />,
    );

    const cells = container.querySelectorAll("tbody tr td");
    expect(cells.length).toBe(3);
    expect(cells[0].className).toContain("px-1");
    expect(cells[0].className).toContain("text-center");
    expect(cells[2].className).toContain("px-3");
    expect(cells[2].className).toContain("text-right");
    expect(cells[1].className).not.toContain("text-right");
    expect(cells[1].getAttribute("style")).toContain("width: 200px");
  });

  it("does not set aria-busy on the table in the error state", () => {
    render(<TableHarness data={[]} status="error" />);

    expect(screen.getByRole("table").hasAttribute("aria-busy")).toBe(false);
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

  it("uses the default Retry label when onRetry is provided without retryLabel", () => {
    render(
      <TableHarness data={[]} status="error" onRetry={() => undefined} />,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
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

  it("calls onRowClick when a data row is clicked in the idle state", () => {
    const onRowClick = vi.fn();
    render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        onRowClick={onRowClick}
      />,
    );

    fireEvent.click(screen.getByText("Alpha"));
    expect(onRowClick).toHaveBeenCalledWith({ id: "1", name: "Alpha" });
  });

  it("does not show the empty message when data rows are present", () => {
    render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        status="idle"
      />,
    );

    expect(screen.queryByText("No rows")).toBeNull();
  });

  it("marks the active row when getRowIsActive returns true", () => {
    const { container } = render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        getRowIsActive={(row) => row.id === "1"}
      />,
    );

    const activeCell = screen.getByText("Alpha").closest("td");
    expect(activeCell?.className).toContain("before:bg-[var(--accent-primary)]");
    expect(container.querySelector("tbody tr")?.className).toContain("bg-[var(--bg-hover)]");
  });

  it("does not mark inactive rows as active", () => {
    render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        getRowIsActive={() => false}
      />,
    );

    const cell = screen.getByText("Alpha").closest("td");
    expect(cell?.className).not.toContain("before:bg-[var(--accent-primary)]");
    expect(cell?.closest("tr")?.className).not.toContain("bg-[var(--bg-hover)]");
  });

  it("applies column layout classes on idle data cells", () => {
    const { container } = render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        harnessColumnMeta={multiColumnMeta}
        harnessColumnWidths={multiColumnWidths}
        columns={multiColumns}
      />,
    );

    const cells = container.querySelectorAll("tbody tr td");
    expect(cells[0].className).toContain("text-center");
    expect(cells[2].className).toContain("text-right");
    expect(cells[1].getAttribute("style")).toContain("width: 200px");
    expect(cells[1].className).not.toContain("text-right");
  });

  it("applies drag styling to dragged and drop-target rows", () => {
    const rowDrag: UseRowDragResult = {
      dragRowIdx: 0,
      dropTargetIdx: 1,
      getDragProps: () => noopDragProps(),
    };

    const { container } = render(
      <TableHarness
        data={[
          { id: "1", name: "Alpha" },
          { id: "2", name: "Beta" },
        ]}
        rowDrag={rowDrag}
      />,
    );

    const rows = container.querySelectorAll("tbody tr");
    expect(rows[0].className).toContain("opacity-40");
    expect(rows[1].className).toContain("border-t-2");
    expect(rows[1].className).not.toContain("opacity-40");
  });

  it("does not apply drag styling when rowDrag is omitted", () => {
    const { container } = render(
      <TableHarness data={[{ id: "1", name: "Alpha" }]} />,
    );

    expect(container.querySelector("tbody tr")?.className).not.toContain("opacity-40");
  });

  it("does not treat rows as active when getRowIsActive is omitted", () => {
    render(<TableHarness data={[{ id: "1", name: "Alpha" }]} />);

    const cell = screen.getByText("Alpha").closest("td");
    expect(cell?.className).not.toContain("before:bg-[var(--accent-primary)]");
  });

  it("falls back to a 36px min width when column meta is missing", () => {
    const { container } = render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        harnessColumnMeta={{}}
        harnessColumnWidths={{ name: 200 }}
      />,
    );

    const cell = container.querySelector("tbody tr td");
    expect(cell?.getAttribute("style")).toContain("min-width: 36px");
  });

  it("uses dense padding on data cells when dense is true", () => {
    render(
      <TableHarness
        data={[{ id: "1", name: "Alpha" }]}
        dense
      />,
    );

    const cell = screen.getByText("Alpha").closest("td");
    expect(cell?.className).toContain("py-1");
    expect(cell?.className).toContain("text-xs");
  });
});
