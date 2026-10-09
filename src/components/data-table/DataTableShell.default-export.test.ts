import { describe, expect, it } from "vitest";

import { exportTableToCsv } from "../../lib/export-table-csv";

/** Mirrors DataTableShell.stories.tsx Default export wiring (visible sorted workspace rows). */
const workspaceRows = [
  { id: "WS-4F2D8A", name: "Atlas Queue", status: "ACTIVE", tier: "Standard", updatedAt: "12.02.2026 13:31:00" },
  { id: "WS-9C1E77", name: "Orbit Ledger", status: "PAUSED", tier: "Standard", updatedAt: "06.03.2026 16:14:08" },
  { id: "WS-7A5B31", name: "Signal Relay", status: "ACTIVE", tier: "Priority", updatedAt: "13.02.2026 13:30:27" },
  { id: "WS-1D8F42", name: "Northwind Labs", status: "PAUSED", tier: "Standard", updatedAt: "12.02.2026 13:31:00" },
];

const exportColumns = [
  { id: "workspace", header: "Workspace" },
  { id: "status", header: "Status" },
  { id: "tier", header: "Tier" },
  { id: "updatedAt", header: "Updated" },
];

function workspaceExportCellText(
  row: (typeof workspaceRows)[number],
  columnId: string,
): string {
  switch (columnId) {
    case "workspace":
      return `${row.name} ${row.id}`;
    case "status":
      return row.status;
    case "tier":
      return row.tier;
    case "updatedAt":
      return row.updatedAt;
    default:
      return "";
  }
}

describe("DataTableShell Default story CSV export smoke", () => {
  it("produces header row and visible-column data for all workspace rows", () => {
    const csv = exportTableToCsv({
      columns: exportColumns,
      rows: workspaceRows,
      getCellText: workspaceExportCellText,
    });

    expect(csv).toBe(
      [
        "Workspace,Status,Tier,Updated",
        "Atlas Queue WS-4F2D8A,ACTIVE,Standard,12.02.2026 13:31:00",
        "Orbit Ledger WS-9C1E77,PAUSED,Standard,06.03.2026 16:14:08",
        "Signal Relay WS-7A5B31,ACTIVE,Priority,13.02.2026 13:30:27",
        "Northwind Labs WS-1D8F42,PAUSED,Standard,12.02.2026 13:31:00",
      ].join("\r\n"),
    );
  });
});
