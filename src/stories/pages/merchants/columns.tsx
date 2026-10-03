import type { ColumnDef } from "@tanstack/react-table";

import { DualLineCell } from "../../../components/data-table/cells/DualLineCell";
import { EnumBadgeCell } from "../../../components/data-table/cells/EnumBadgeCell";
import { RowActionsMenu } from "../../../components/data-table/RowActionsMenu";
import { RowControlCell, RowControlHeader } from "../../../components/data-table/RowControlCell";
import type { SortDirection } from "../../../components/data-table/types";

import { ColumnHeaderMenu } from "../../../components/data-table/ColumnHeaderMenu";
import { GapCell, GapIndicator } from "../../../components/data-table/GapIndicator";
import { TimestampCell } from "../../../components/data-table/TimestampCell";
import { balanceBadgeVariants, statusBadgeVariants, trafficBadgeVariants } from "./adapters";
import { buildRowActionSections } from "./action-model";
import { merchantColumnFilters } from "./table-config";
import type { LiveMerchantViewModel } from "./types";

interface CreateColumnsOptions {
  sortState: Record<string, SortDirection>;
  onSort: (columnId: string, direction: "asc" | "desc") => void;
  onRowActionPreview: (merchant: LiveMerchantViewModel, label: string) => void;
  rowNumberBase: number;
  getSelectedIds: () => Set<string>;
  onToggleRowSelection: (id: string) => void;
  onExpandRow: (merchant: LiveMerchantViewModel, e: React.MouseEvent) => void;
  getHeaderCheckState: () => boolean | "indeterminate";
  onToggleHeaderCheck: () => void;
  onHeaderFilterClick: (columnId: string) => void;
  onHideColumn: (columnId: string) => void;
  columnGaps?: import("../../../components/data-table/filter-types").ColumnGap[];
  onExpandGap?: (hiddenIds: string[]) => void;
}

export function createColumns({
  sortState,
  onSort,
  onRowActionPreview,
  rowNumberBase,
  getSelectedIds,
  onToggleRowSelection,
  onExpandRow,
  getHeaderCheckState,
  onToggleHeaderCheck,
  onHeaderFilterClick,
  onHideColumn,
  columnGaps,
  onExpandGap,
}: CreateColumnsOptions): ColumnDef<LiveMerchantViewModel>[] {
  const cols: ColumnDef<LiveMerchantViewModel>[] = [
    {
      id: "rowControl",
      enableHiding: false,
      enableResizing: false,
      header: () => (
        <RowControlHeader checked={getHeaderCheckState()} onToggle={onToggleHeaderCheck} />
      ),
      cell: ({ row }) => (
        <RowControlCell
          rowNumber={rowNumberBase + row.index + 1}
          selected={getSelectedIds().has(row.original.id)}
          onSelectToggle={() => onToggleRowSelection(row.original.id)}
          onExpandToggle={(e) => onExpandRow(row.original, e)}
        />
      ),
    },
    {
      id: "merchant",
      accessorFn: (row) => `${row.name} ${row.id}`,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Merchant Name"
          secondaryLabel="Merchant ID"
          primarySorted={sortState.merchantName ?? false}
          onPrimarySort={(dir) => onSort("merchantName", dir)}
          secondarySorted={sortState.merchantId ?? false}
          onSecondarySort={(dir) => onSort("merchantId", dir)}
          hasFilter={!!merchantColumnFilters.merchant}
          onFilterClick={() => onHeaderFilterClick("merchant")}
          onHide={() => onHideColumn("merchant")}
        />
      ),
      cell: ({ row }) => (
        <DualLineCell
          primary={row.original.name}
          secondary={row.original.id}
          primaryCopyTitle="Copy merchant name"
          secondaryCopyTitle="Copy merchant ID"
          secondaryTruncateMiddle
        />
      ),
    },
    {
      id: "spamBlock",
      accessorFn: (row) => row.spamBlockExpirationValue ?? 0,
      header: () => (
        <ColumnHeaderMenu
          label="Block Expires"
          sorted={sortState.spamBlock ?? false}
          onSort={(dir) => onSort("spamBlock", dir)}
          hasFilter={!!merchantColumnFilters.spamBlock}
          onFilterClick={() => onHeaderFilterClick("spamBlock")}
          onHide={() => onHideColumn("spamBlock")}
        />
      ),
      cell: ({ row }) => <TimestampCell value={row.original.spamBlockExpiration} />,
    },
    {
      id: "traffic",
      accessorFn: (row) => row.trafficType,
      header: () => (
        <ColumnHeaderMenu
          label="Traffic Type"
          sorted={sortState.traffic ?? false}
          onSort={(dir) => onSort("traffic", dir)}
          hasFilter={!!merchantColumnFilters.traffic}
          onFilterClick={() => onHeaderFilterClick("traffic")}
          onHide={() => onHideColumn("traffic")}
        />
      ),
      cell: ({ row }) => (
        <EnumBadgeCell value={row.original.trafficType} variantMap={trafficBadgeVariants} />
      ),
    },
    {
      id: "balance",
      accessorFn: (row) => row.balanceType,
      header: () => (
        <ColumnHeaderMenu
          label="Balance Type"
          sorted={sortState.balance ?? false}
          onSort={(dir) => onSort("balance", dir)}
          hasFilter={!!merchantColumnFilters.balance}
          onFilterClick={() => onHeaderFilterClick("balance")}
          onHide={() => onHideColumn("balance")}
        />
      ),
      cell: ({ row }) => (
        <EnumBadgeCell value={row.original.balanceType} variantMap={balanceBadgeVariants} />
      ),
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: () => (
        <ColumnHeaderMenu
          label="Status"
          sorted={sortState.status ?? false}
          onSort={(dir) => onSort("status", dir)}
          hasFilter={!!merchantColumnFilters.status}
          onFilterClick={() => onHeaderFilterClick("status")}
          onHide={() => onHideColumn("status")}
        />
      ),
      cell: ({ row }) => (
        <EnumBadgeCell
          value={row.original.status}
          variantMap={statusBadgeVariants}
          label={row.original.status}
          className="min-w-[120px] justify-center"
        />
      ),
    },
    {
      id: "createdAt",
      accessorFn: (row) => row.createdAtValue,
      header: () => (
        <ColumnHeaderMenu
          label="Created"
          sorted={sortState.createdAt ?? false}
          onSort={(dir) => onSort("createdAt", dir)}
          hasFilter={!!merchantColumnFilters.createdAt}
          onFilterClick={() => onHeaderFilterClick("createdAt")}
          onHide={() => onHideColumn("createdAt")}
        />
      ),
      cell: ({ row }) => <TimestampCell value={row.original.createdAt} />,
    },
    {
      id: "updatedAt",
      accessorFn: (row) => row.updatedAtValue,
      header: () => (
        <ColumnHeaderMenu
          label="Updated"
          sorted={sortState.updatedAt ?? false}
          onSort={(dir) => onSort("updatedAt", dir)}
          hasFilter={!!merchantColumnFilters.updatedAt}
          onFilterClick={() => onHeaderFilterClick("updatedAt")}
          onHide={() => onHideColumn("updatedAt")}
        />
      ),
      cell: ({ row }) => <TimestampCell value={row.original.updatedAt} />,
    },
    {
      id: "actions",
      enableHiding: false,
      enableResizing: false,
      header: () => (
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]">
          Actions
        </span>
      ),
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
          <RowActionsMenu
            sections={buildRowActionSections(row.original, onRowActionPreview)}
            triggerClassName="opacity-100 hover:bg-[var(--bg-hover)]"
          />
        </div>
      ),
    },
  ];

  // Insert gap indicator pseudo-columns (right-to-left to preserve indices)
  if (columnGaps && onExpandGap) {
    for (let i = columnGaps.length - 1; i >= 0; i--) {
      const gap = columnGaps[i];
      const gapColumn: ColumnDef<LiveMerchantViewModel> = {
        id: `__gap_after_${gap.afterColumnId ?? "start"}`,
        header: () => <GapIndicator onClick={() => onExpandGap(gap.hiddenIds)} />,
        cell: () => <GapCell />,
        size: 10,
        minSize: 10,
        maxSize: 10,
        enableResizing: false,
        enableSorting: false,
        enableColumnFilter: false,
        enableHiding: false,
        meta: { isGapIndicator: true },
      };

      if (gap.afterColumnId === null) {
        cols.splice(1, 0, gapColumn);
      } else {
        const idx = cols.findIndex((c) => c.id === gap.afterColumnId);
        if (idx !== -1) {
          cols.splice(idx + 1, 0, gapColumn);
        }
      }
    }
  }

  return cols;
}
