import { renderHook } from "@testing-library/react";
import type { ColumnDef } from "@tanstack/react-table";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  defaultTableRowCellText,
  downloadCsvFile,
  exportTableToCsv,
  resolveCsvExportLabel,
  resolveExportColumnsFromTable,
  resolveTableExportButtonSize,
  resolveTableExportButtonVariant,
} from "./export-table-csv";

type Row = { name: string; note: string; hidden?: string };

const columns: ColumnDef<Row>[] = [
  { id: "name", accessorKey: "name", header: "Name" },
  { id: "note", accessorKey: "note", header: "Note" },
  { id: "hidden", accessorKey: "hidden", header: "Hidden" },
];

function createTableFixture(visibility: Record<string, boolean> = {}) {
  const data: Row[] = [
    { name: "Alpha", note: "", hidden: "x" },
    { name: 'Say "hi", friend', note: "line1\nline2", hidden: "y" },
  ];

  const { result } = renderHook(() =>
    useReactTable({
      data,
      columns,
      state: {
        columnVisibility: visibility,
      },
      getCoreRowModel: getCoreRowModel(),
    }),
  );

  return { table: result.current, data };
}

describe("resolveTableExportButtonVariant", () => {
  it("defaults to the secondary button variant", () => {
    expect(resolveTableExportButtonVariant(undefined)).toBe("secondary");
  });

  it("preserves an explicit variant override", () => {
    expect(resolveTableExportButtonVariant("ghost")).toBe("ghost");
  });
});

describe("resolveTableExportButtonSize", () => {
  it("defaults to the standard control size", () => {
    expect(resolveTableExportButtonSize(undefined)).toBe("default");
  });

  it("preserves an explicit size override", () => {
    expect(resolveTableExportButtonSize("sm")).toBe("sm");
  });
});

describe("resolveCsvExportLabel", () => {
  it("defaults to Export CSV when no label override is provided", () => {
    expect(resolveCsvExportLabel()).toBe("Export CSV");
    expect(resolveCsvExportLabel({})).toBe("Export CSV");
  });

  it("uses a custom export label when provided", () => {
    expect(resolveCsvExportLabel({ export: "Download" })).toBe("Download");
  });
});

describe("exportTableToCsv", () => {
  it("quotes fields that contain commas, quotes, or newlines", () => {
    const csv = exportTableToCsv({
      columns: [{ id: "name", header: "Name" }, { id: "note", header: "Note" }],
      rows: [{ name: 'Say "hi", friend', note: "line1\nline2" }],
      getCellText: (row, columnId) => (columnId === "name" ? row.name : row.note),
    });

    expect(csv).toBe(
      'Name,Note\r\n"Say ""hi"", friend","line1\nline2"',
    );
  });

  it("renders empty string cells without quoting", () => {
    const csv = exportTableToCsv({
      columns: [{ id: "name", header: "Name" }, { id: "note", header: "Note" }],
      rows: [{ name: "Alpha", note: "" }],
      getCellText: (row, columnId) => (columnId === "name" ? row.name : row.note),
    });

    expect(csv).toBe("Name,Note\r\nAlpha,");
  });
});

describe("downloadCsvFile", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not add a BOM by default", async () => {
    let capturedBlob: Blob | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:csv";
    });
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL: vi.fn() });
    const anchor = document.createElement("a");
    vi.spyOn(anchor, "click").mockImplementation(() => undefined);
    vi.spyOn(document, "createElement").mockReturnValue(anchor);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => anchor);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => anchor);

    downloadCsvFile("plain", "out");

    const text = await capturedBlob!.text();
    expect(text).toBe("plain");
    expect(anchor.download).toBe("out.csv");
  });

  it("keeps filenames that already end with .csv", async () => {
    const anchor = document.createElement("a");
    vi.spyOn(anchor, "click").mockImplementation(() => undefined);
    vi.spyOn(document, "createElement").mockReturnValue(anchor);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => anchor);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => anchor);
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:csv"), revokeObjectURL: vi.fn() });

    downloadCsvFile("a", "report.csv");

    expect(anchor.download).toBe("report.csv");
  });

  it("prefixes UTF-8 BOM when utf8Bom is true", async () => {
    let capturedBlob: Blob | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      capturedBlob = blob;
      return "blob:csv";
    });
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });

    const anchor = document.createElement("a");
    const click = vi.spyOn(anchor, "click").mockImplementation(() => undefined);
    const createElement = vi.spyOn(document, "createElement").mockReturnValue(anchor);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => anchor);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => anchor);

    downloadCsvFile("a,b", "report", { utf8Bom: true });

    expect(createObjectURL).toHaveBeenCalled();
    expect(capturedBlob).toBeInstanceOf(Blob);
    expect(capturedBlob!.type).toBe("text/csv;charset=utf-8");

    const text = await capturedBlob!.text();
    expect(text.startsWith("\uFEFF")).toBe(true);
    expect(text.slice(1)).toBe("a,b");

    expect(createElement).toHaveBeenCalledWith("a");
    expect(anchor.download).toBe("report.csv");
    expect(anchor.rel).toBe("noopener");
    expect(anchor.style.display).toBe("none");
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:csv");
  });

  it("creates an anchor element for the download", () => {
    const createElement = vi.spyOn(document, "createElement");
    const anchor = document.createElement("a");
    vi.spyOn(anchor, "click").mockImplementation(() => undefined);
    createElement.mockReturnValue(anchor);
    vi.spyOn(document.body, "appendChild").mockImplementation(() => anchor);
    vi.spyOn(document.body, "removeChild").mockImplementation(() => anchor);
    vi.stubGlobal("URL", { createObjectURL: vi.fn(() => "blob:csv"), revokeObjectURL: vi.fn() });

    downloadCsvFile("x", "file");

    expect(createElement).toHaveBeenCalledWith("a");
  });
});

describe("resolveExportColumnsFromTable", () => {
  it("uses visible leaf columns when columnIds is omitted", () => {
    const { table } = createTableFixture();
    expect(resolveExportColumnsFromTable(table).map((column) => column.id)).toEqual([
      "name",
      "note",
      "hidden",
    ]);
  });

  it("omits columns hidden in the table visibility state", () => {
    const { table } = createTableFixture({ note: false });
    expect(resolveExportColumnsFromTable(table).map((column) => column.id)).toEqual([
      "name",
      "hidden",
    ]);
  });

  it("uses column label overrides and string headers from the table", () => {
    const { table } = createTableFixture();
    expect(resolveExportColumnsFromTable(table, undefined, { name: "Title" })).toEqual([
      { id: "name", header: "Title" },
      { id: "note", header: "Note" },
      { id: "hidden", header: "Hidden" },
    ]);
  });

  it("falls back to the column id for unknown column ids", () => {
    const { table } = createTableFixture();
    expect(resolveExportColumnsFromTable(table, ["missing"])).toEqual([
      { id: "missing", header: "missing" },
    ]);
  });

  it("falls back to the column id when the header is not a plain string", () => {
    const { result } = renderHook(() =>
      useReactTable({
        data: [{ name: "Alpha", note: "", hidden: "x" }],
        columns: [
          {
            id: "custom",
            accessorKey: "name",
            header: () => "Ignored",
          },
        ],
        getCoreRowModel: getCoreRowModel(),
      }),
    );

    expect(resolveExportColumnsFromTable(result.current)).toEqual([
      { id: "custom", header: "custom" },
    ]);
  });
});

describe("defaultTableRowCellText", () => {
  it("reads accessor values and returns empty strings for missing cells", () => {
    const { table, data } = createTableFixture();
    expect(defaultTableRowCellText(data[0], "name", table)).toBe("Alpha");
    expect(defaultTableRowCellText(data[0], "note", table)).toBe("");
    expect(defaultTableRowCellText({ name: "Ghost", note: "", hidden: "" }, "name", table)).toBe(
      "",
    );
  });

  it("returns an empty string when the column id is missing on the row", () => {
    const { table, data } = createTableFixture();
    expect(defaultTableRowCellText(data[0], "does-not-exist", table)).toBe("");
  });

  it("returns an empty string for null cell values", () => {
    const { result } = renderHook(() =>
      useReactTable({
        data: [{ value: null }],
        columns: [{ id: "value", accessorKey: "value", header: "Value" }],
        getCoreRowModel: getCoreRowModel(),
      }),
    );
    const row = result.current.getRowModel().rows[0]!.original as { value: null };
    expect(defaultTableRowCellText(row, "value", result.current)).toBe("");
  });

  it("stringifies non-null cell values", () => {
    const { result } = renderHook(() =>
      useReactTable({
        data: [{ count: 3 }],
        columns: [{ id: "count", accessorKey: "count", header: "Count" }],
        getCoreRowModel: getCoreRowModel(),
      }),
    );
    const row = result.current.getRowModel().rows[0]!.original as { count: number };
    expect(defaultTableRowCellText(row, "count", result.current)).toBe("3");
  });
});
