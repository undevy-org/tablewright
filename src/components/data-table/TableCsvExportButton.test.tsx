import { fireEvent, render, screen } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { afterEach, describe, expect, it, vi } from "vitest";

import * as exportCsv from "../../lib/export-table-csv";

import { TableCsvExportButton } from "./TableCsvExportButton";

type Row = { id: string; name: string };

function ExportButtonFixture({
  getCellText,
  labels,
  columnIds,
  size,
}: {
  getCellText?: (row: Row, columnId: string) => string;
  labels?: { export?: string; columns?: Record<string, string> };
  columnIds?: string[];
  size?: "default" | "sm";
}) {
  const columns: ColumnDef<Row>[] = [
    { id: "name", accessorKey: "name", header: "Name" },
  ];
  const data: Row[] = [{ id: "1", name: "Alpha" }];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableCsvExportButton
      table={table}
      filename="rows.csv"
      getCellText={getCellText}
      labels={labels}
      columnIds={columnIds}
      size={size}
    />
  );
}

describe("TableCsvExportButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the secondary button variant by default", () => {
    render(
      <>
        <ExportButtonFixture />
        <ExportButtonFixture size="sm" />
      </>,
    );
    const [defaultButton, smallButton] = screen.getAllByRole("button", { name: "Export CSV" });
    expect(defaultButton.className).toContain("border-[var(--border-subtle)]");
    expect(defaultButton.className).toContain("h-[var(--size-control-md)]");
    expect(smallButton.className).toContain("h-[var(--size-control-sm)]");
    expect(defaultButton.className).not.toContain("h-[var(--size-control-sm)]");
    expect(defaultButton.textContent).toContain("Export CSV");
  });

  it("exports visible rows with default cell text on click", async () => {
    const downloadSpy = vi.spyOn(exportCsv, "downloadCsvFile").mockImplementation(() => undefined);
    const exportSpy = vi.spyOn(exportCsv, "exportTableToCsv");

    render(<ExportButtonFixture />);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    expect(exportSpy).toHaveBeenCalledWith({
      columns: [{ id: "name", header: "Name" }],
      rows: [{ id: "1", name: "Alpha" }],
      getCellText: expect.any(Function),
    });
    const { rows, getCellText } = exportSpy.mock.calls[0]![0];
    expect(getCellText(rows[0], "name")).toBe("Alpha");
    expect(downloadSpy).toHaveBeenCalledWith(expect.any(String), "rows.csv", { utf8Bom: undefined });

    downloadSpy.mockRestore();
    exportSpy.mockRestore();
  });

  it("uses custom export label and column header labels", async () => {
    vi.spyOn(exportCsv, "downloadCsvFile").mockImplementation(() => undefined);
    const exportSpy = vi.spyOn(exportCsv, "exportTableToCsv");

    render(
      <ExportButtonFixture labels={{ export: "Download", columns: { name: "Title" } }} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Download" }));

    expect(exportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        columns: [{ id: "name", header: "Title" }],
      }),
    );
  });

  it("forwards utf8Bom to the download helper", async () => {
    const downloadSpy = vi.spyOn(exportCsv, "downloadCsvFile").mockImplementation(() => undefined);
    vi.spyOn(exportCsv, "exportTableToCsv").mockReturnValue("csv");

    function BomFixture() {
      const table = useReactTable({
        data: [{ id: "1", name: "Alpha" }],
        columns: [{ id: "name", accessorKey: "name", header: "Name" }],
        getCoreRowModel: getCoreRowModel(),
      });
      return <TableCsvExportButton table={table} filename="rows.csv" utf8Bom />;
    }

    render(<BomFixture />);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));
    expect(downloadSpy).toHaveBeenCalledWith("csv", "rows.csv", { utf8Bom: true });
  });

  it("prefers getCellText over default table cell resolution", async () => {
    vi.spyOn(exportCsv, "downloadCsvFile").mockImplementation(() => undefined);
    const exportSpy = vi.spyOn(exportCsv, "exportTableToCsv");

    render(<ExportButtonFixture getCellText={() => "custom"} />);
    fireEvent.click(screen.getByRole("button", { name: "Export CSV" }));

    const getCellText = exportSpy.mock.calls[0]![0].getCellText;
    expect(getCellText({ id: "1", name: "Alpha" }, "name")).toBe("custom");
  });
});
