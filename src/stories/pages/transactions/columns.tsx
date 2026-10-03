import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "../../../components/ui/badge";
import { CopyableText } from "../../../components/data-table/CopyableText";
import { RowActionsMenu } from "../../../components/data-table/RowActionsMenu";
import { RowControlCell, RowControlHeader } from "../../../components/data-table/RowControlCell";
import type { SortDirection } from "../../../components/data-table/types";
import { AmountCell } from "../../../components/data-table/cells/AmountCell";
import { ConfirmedAmountCell } from "../../../components/data-table/cells/ConfirmedAmountCell";
import { MonoIdCell } from "../../../components/data-table/cells/MonoIdCell";
import { CurrencyAmountCell } from "../../../components/data-table/cells/CurrencyAmountCell";
import { DualLineCell } from "../../../components/data-table/cells/DualLineCell";
import { EnumBadgeCell } from "../../../components/data-table/cells/EnumBadgeCell";
import { formatEnumLabel } from "../../../lib/format-enum";

import { ColumnHeaderMenu } from "../../../components/data-table/ColumnHeaderMenu";
import { GapCell, GapIndicator } from "../../../components/data-table/GapIndicator";
import { TimestampCell } from "../../../components/data-table/TimestampCell";
import { ExpiryTimestampCell } from "../../../components/data-table/ExpiryTimestampCell";
import { buildRowActionSections } from "./action-model";
import {
  directionBadgeVariants,
  statusBadgeVariants,
  paymentMethodBadgeVariants,
  formatDirectionLabel,
  formatStatusLabel,
} from "./adapters";
import type { ColumnGap } from "./gap-indicators";
import { transactionColumnFilters } from "./table-config";
import type { TransactionViewModel } from "./types";

interface CreateColumnsOptions {
  sortState: Record<string, SortDirection>;
  onSort: (columnId: string, direction: "asc" | "desc") => void;
  rowNumberBase: number;
  getSelectedIds: () => Set<string>;
  onToggleRowSelection: (id: string) => void;
  onExpandRow: (tx: TransactionViewModel, e: React.MouseEvent) => void;
  getHeaderCheckState: () => boolean | "indeterminate";
  onToggleHeaderCheck: () => void;
  onHeaderFilterClick: (columnId: string) => void;
  onHideColumn: (columnId: string) => void;
  columnGaps: ColumnGap[];
  onExpandGap: (hiddenIds: string[]) => void;
  onRowActionClick: (tx: TransactionViewModel, action: string) => void;
}

export function createColumns({
  sortState,
  onSort,
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
  onRowActionClick,
}: CreateColumnsOptions): ColumnDef<TransactionViewModel>[] {
  const cols: ColumnDef<TransactionViewModel>[] = [
    // 1. Row control
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
          selected={getSelectedIds().has(row.original.txId)}
          onSelectToggle={() => onToggleRowSelection(row.original.txId)}
          onExpandToggle={(e) => onExpandRow(row.original, e)}
        />
      ),
    },

    // 2. Transaction ID
    {
      id: "txId",
      accessorFn: (row) => row.txId,
      header: () => (
        <ColumnHeaderMenu
          label="TX ID"
          sorted={sortState.txId ?? false}
          onSort={(dir) => onSort("txId", dir)}
          hasFilter={!!transactionColumnFilters.txId}
          onFilterClick={() => onHeaderFilterClick("txId")}
          onHide={() => onHideColumn("txId")}
        />
      ),
      cell: ({ row }) => <MonoIdCell value={row.original.txId} copyTitle="Copy transaction ID" />,
    },

    // 3. Status
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: () => (
        <ColumnHeaderMenu
          label="Status"
          sorted={sortState.status ?? false}
          onSort={(dir) => onSort("status", dir)}
          hasFilter={!!transactionColumnFilters.status}
          onFilterClick={() => onHeaderFilterClick("status")}
          onHide={() => onHideColumn("status")}
        />
      ),
      cell: ({ row }) => (
        <EnumBadgeCell
          value={row.original.status}
          variantMap={statusBadgeVariants}
          label={formatStatusLabel(row.original.status)}
          className="min-w-[120px] justify-center"
        />
      ),
    },

    // 4. Direction
    {
      id: "direction",
      accessorFn: (row) => row.direction,
      header: () => (
        <ColumnHeaderMenu
          label="Direction"
          sorted={sortState.direction ?? false}
          onSort={(dir) => onSort("direction", dir)}
          hasFilter={!!transactionColumnFilters.direction}
          onFilterClick={() => onHeaderFilterClick("direction")}
          onHide={() => onHideColumn("direction")}
        />
      ),
      cell: ({ row }) => (
        <EnumBadgeCell
          value={row.original.direction}
          variantMap={directionBadgeVariants}
          label={formatDirectionLabel(row.original.direction)}
        />
      ),
    },

    // 5. Payment Method
    {
      id: "paymentMethod",
      accessorFn: (row) => row.paymentMethod,
      header: () => (
        <ColumnHeaderMenu
          label="Payment Method"
          sorted={sortState.paymentMethod ?? false}
          onSort={(dir) => onSort("paymentMethod", dir)}
          hasFilter={!!transactionColumnFilters.paymentMethod}
          onFilterClick={() => onHeaderFilterClick("paymentMethod")}
          onHide={() => onHideColumn("paymentMethod")}
        />
      ),
      cell: ({ row }) => (
        <EnumBadgeCell value={row.original.paymentMethod} variantMap={paymentMethodBadgeVariants} />
      ),
    },

    // 6. Merchant (dual: Name + Merchant TX ID — entity + its TX ID)
    {
      id: "merchant",
      accessorFn: (row) => `${row.merchantName} ${row.merchantTxId}`,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Name"
          secondaryLabel="TX ID"
          primarySorted={sortState.merchant ?? false}
          onPrimarySort={(dir) => onSort("merchant", dir)}
          secondarySorted={sortState.merchantTxId ?? false}
          onSecondarySort={(dir) => onSort("merchantTxId", dir)}
          hasFilter={!!transactionColumnFilters.merchant}
          onFilterClick={() => onHeaderFilterClick("merchant")}
          onHide={() => onHideColumn("merchant")}
        />
      ),
      cell: ({ row }) => (
        <DualLineCell
          primary={row.original.merchantName}
          secondary={row.original.merchantTxId}
          primaryCopyTitle="Copy merchant name"
          secondaryCopyTitle="Copy merchant TX ID"
          equalWeight
          secondaryTruncateMiddle
        />
      ),
    },

    // 7. Amount (compound: inAmount+inCurrency → merchantOutAmount+outCurrency)
    {
      id: "amount",
      accessorFn: (row) => row.inAmount,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="In"
          secondaryLabel="Out"
          primarySorted={sortState.amount ?? false}
          onPrimarySort={(dir) => onSort("amount", dir)}
          secondarySorted={sortState.merchantOutAmount ?? false}
          onSecondarySort={(dir) => onSort("merchantOutAmount", dir)}
          hasFilter={!!transactionColumnFilters.amount}
          onFilterClick={() => onHeaderFilterClick("amount")}
          onHide={() => onHideColumn("amount")}
        />
      ),
      cell: ({ row }) => (
        <AmountCell
          inAmount={row.original.inAmount}
          inCurrency={row.original.inCurrency}
          outAmount={row.original.merchantOutAmount}
          outCurrency={row.original.outCurrency}
          inAmountConfirmed={row.original.inAmountConfirmed}
          outAmountConfirmed={row.original.merchantOutAmountConfirmed}
          mutedCurrency
        />
      ),
    },

    // 8. Geo
    {
      id: "geo",
      accessorFn: (row) => row.geo,
      header: () => (
        <ColumnHeaderMenu
          label="Geo"
          sorted={sortState.geo ?? false}
          onSort={(dir) => onSort("geo", dir)}
          hasFilter={!!transactionColumnFilters.geo}
          onFilterClick={() => onHeaderFilterClick("geo")}
          onHide={() => onHideColumn("geo")}
        />
      ),
      cell: ({ row }) => <span className="text-sm">{row.original.geo}</span>,
    },

    // 10. Merchant ID (internal merchant identifier — separate, optional)
    {
      id: "merchantId",
      accessorFn: (row) => row.merchantId,
      header: () => (
        <ColumnHeaderMenu
          label="Merchant ID"
          sorted={sortState.merchantId ?? false}
          onSort={(dir) => onSort("merchantId", dir)}
          hasFilter={!!transactionColumnFilters.merchantId}
          onFilterClick={() => onHeaderFilterClick("merchantId")}
          onHide={() => onHideColumn("merchantId")}
        />
      ),
      cell: ({ row }) => (
        <MonoIdCell value={row.original.merchantId} copyTitle="Copy merchant ID" />
      ),
    },

    // 11. Merchant Client ID
    {
      id: "merchantClientId",
      accessorFn: (row) => row.merchantClientId,
      header: () => (
        <ColumnHeaderMenu
          label="Client ID"
          sorted={sortState.merchantClientId ?? false}
          onSort={(dir) => onSort("merchantClientId", dir)}
          hasFilter={!!transactionColumnFilters.merchantClientId}
          onFilterClick={() => onHeaderFilterClick("merchantClientId")}
          onHide={() => onHideColumn("merchantClientId")}
        />
      ),
      cell: ({ row }) => (
        <MonoIdCell value={row.original.merchantClientId} copyTitle="Copy merchant client ID" />
      ),
    },

    // 12. Fee % (merged: merchant fee % + provider fee %)
    {
      id: "feePct",
      accessorFn: (row) => row.merchantFeePct,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="M Fee %"
          secondaryLabel="P Fee %"
          primarySorted={sortState.feePct ?? false}
          onPrimarySort={(dir) => onSort("feePct", dir)}
          secondarySorted={sortState.providerFeePct ?? false}
          onSecondarySort={(dir) => onSort("providerFeePct", dir)}
          hasFilter={!!transactionColumnFilters.feePct}
          onFilterClick={() => onHeaderFilterClick("feePct")}
          onHide={() => onHideColumn("feePct")}
        />
      ),
      cell: ({ row }) => (
        <DualLineCell
          primary={`${row.original.merchantFeePct}%`}
          secondary={`${row.original.providerFeePct}%`}
          primaryLabel="M"
          secondaryLabel="P"
          primaryCopyTitle="Copy merchant fee %"
          secondaryCopyTitle="Copy provider fee %"
          equalWeight
        />
      ),
    },

    // 13. Rate (merged: merchant rate + provider rate)
    {
      id: "rate",
      accessorFn: (row) => row.merchantRate,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="M Rate"
          secondaryLabel="P Rate"
          primarySorted={sortState.rate ?? false}
          onPrimarySort={(dir) => onSort("rate", dir)}
          secondarySorted={sortState.providerRate ?? false}
          onSecondarySort={(dir) => onSort("providerRate", dir)}
          hasFilter={!!transactionColumnFilters.rate}
          onFilterClick={() => onHeaderFilterClick("rate")}
          onHide={() => onHideColumn("rate")}
        />
      ),
      cell: ({ row }) => (
        <DualLineCell
          primary={String(row.original.merchantRate)}
          secondary={String(row.original.providerRate)}
          primaryLabel="M"
          secondaryLabel="P"
          primaryCopyTitle="Copy merchant rate"
          secondaryCopyTitle="Copy provider rate"
          equalWeight
        />
      ),
    },

    // 14. Merchant Out (compound: amount + confirmed)
    {
      id: "merchantOut",
      accessorFn: (row) => row.merchantOutAmount,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Merchant Out"
          secondaryLabel="Confirmed"
          primarySorted={sortState.merchantOut ?? false}
          onPrimarySort={(dir) => onSort("merchantOut", dir)}
          secondarySorted={sortState.merchantOutAmountConfirmed ?? false}
          onSecondarySort={(dir) => onSort("merchantOutAmountConfirmed", dir)}
          hasFilter={!!transactionColumnFilters.merchantOut}
          onFilterClick={() => onHeaderFilterClick("merchantOut")}
          onHide={() => onHideColumn("merchantOut")}
        />
      ),
      cell: ({ row }) => (
        <ConfirmedAmountCell
          value={row.original.merchantOutAmount}
          currency={row.original.outCurrency}
          confirmedValue={row.original.merchantOutAmountConfirmed}
          copyTitle="Copy merchant out amount"
          confirmedCopyTitle="Copy merchant out confirmed"
          mutedCurrency
        />
      ),
    },

    // 16. Provider (dual: Name + Provider TX ID — entity + its TX ID)
    {
      id: "provider",
      accessorFn: (row) => `${row.provider} ${row.providerTxId}`,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Name"
          secondaryLabel="TX ID"
          primarySorted={sortState.provider ?? false}
          onPrimarySort={(dir) => onSort("provider", dir)}
          secondarySorted={sortState.providerTxId ?? false}
          onSecondarySort={(dir) => onSort("providerTxId", dir)}
          hasFilter={!!transactionColumnFilters.provider}
          onFilterClick={() => onHeaderFilterClick("provider")}
          onHide={() => onHideColumn("provider")}
        />
      ),
      cell: ({ row }) => (
        <DualLineCell
          primary={row.original.provider}
          secondary={row.original.providerTxId}
          primaryCopyTitle="Copy provider"
          secondaryCopyTitle="Copy provider TX ID"
          equalWeight
          secondaryTruncateMiddle
        />
      ),
    },

    // 20. Provider Out (compound: amount + confirmed)
    {
      id: "providerOut",
      accessorFn: (row) => row.providerOutAmount,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Provider Out"
          secondaryLabel="Confirmed"
          primarySorted={sortState.providerOut ?? false}
          onPrimarySort={(dir) => onSort("providerOut", dir)}
          secondarySorted={sortState.providerOutAmountConfirmed ?? false}
          onSecondarySort={(dir) => onSort("providerOutAmountConfirmed", dir)}
          hasFilter={!!transactionColumnFilters.providerOut}
          onFilterClick={() => onHeaderFilterClick("providerOut")}
          onHide={() => onHideColumn("providerOut")}
        />
      ),
      cell: ({ row }) => (
        <ConfirmedAmountCell
          value={row.original.providerOutAmount}
          currency={row.original.outCurrency}
          confirmedValue={row.original.providerOutAmountConfirmed}
          copyTitle="Copy provider out amount"
          confirmedCopyTitle="Copy provider out confirmed"
          mutedCurrency
        />
      ),
    },

    // 22. Base Rate (merged: rate value + base rate type)
    {
      id: "baseRate",
      accessorFn: (row) => row.baseRate,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Rate"
          secondaryLabel="Type"
          primarySorted={sortState.baseRate ?? false}
          onPrimarySort={(dir) => onSort("baseRate", dir)}
          secondarySorted={sortState.baseRateType ?? false}
          onSecondarySort={(dir) => onSort("baseRateType", dir)}
          hasFilter={!!transactionColumnFilters.baseRate}
          onFilterClick={() => onHeaderFilterClick("baseRate")}
          onHide={() => onHideColumn("baseRate")}
        />
      ),
      cell: ({ row }) => (
        <DualLineCell
          primary={String(row.original.baseRate)}
          secondary={formatEnumLabel(row.original.baseRateType)}
          primaryCopyTitle="Copy base rate"
          secondaryCopyTitle="Copy base rate type"
        />
      ),
    },

    // 24. Payment System
    {
      id: "paymentSystem",
      accessorFn: (row) => row.paymentSystem,
      header: () => (
        <ColumnHeaderMenu
          label="Payment System"
          sorted={sortState.paymentSystem ?? false}
          onSort={(dir) => onSort("paymentSystem", dir)}
          hasFilter={!!transactionColumnFilters.paymentSystem}
          onFilterClick={() => onHeaderFilterClick("paymentSystem")}
          onHide={() => onHideColumn("paymentSystem")}
        />
      ),
      cell: ({ row }) => (
        <CopyableText
          value={row.original.paymentSystem}
          title="Copy payment system"
          className="w-full"
          textClassName="text-sm"
        />
      ),
    },

    // 25. Requisite (merged: requisite + full name)
    {
      id: "requisite",
      accessorFn: (row) => row.paymentRequisite,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Requisite"
          secondaryLabel="Holder"
          primarySorted={sortState.requisite ?? false}
          onPrimarySort={(dir) => onSort("requisite", dir)}
          secondarySorted={sortState.paymentRequisiteFullName ?? false}
          onSecondarySort={(dir) => onSort("paymentRequisiteFullName", dir)}
          hasFilter={!!transactionColumnFilters.requisite}
          onFilterClick={() => onHeaderFilterClick("requisite")}
          onHide={() => onHideColumn("requisite")}
        />
      ),
      cell: ({ row }) => (
        <DualLineCell
          primary={row.original.paymentRequisite}
          secondary={row.original.paymentRequisiteFullName || "—"}
          primaryVariant="mono"
          primaryCopyTitle="Copy requisite"
          secondaryCopyTitle="Copy full name"
          equalWeight
          primaryTruncateMiddle={{ head: 4, tail: 4 }}
        />
      ),
    },

    // 28. Widget ID
    {
      id: "widgetId",
      accessorFn: (row) => row.widgetId,
      header: () => (
        <ColumnHeaderMenu
          label="Widget ID"
          sorted={sortState.widgetId ?? false}
          onSort={(dir) => onSort("widgetId", dir)}
          hasFilter={!!transactionColumnFilters.widgetId}
          onFilterClick={() => onHeaderFilterClick("widgetId")}
          onHide={() => onHideColumn("widgetId")}
        />
      ),
      cell: ({ row }) => <MonoIdCell value={row.original.widgetId} copyTitle="Copy widget ID" />,
    },

    // 29. Bank Name Requested
    {
      id: "bankNameRequested",
      accessorFn: (row) => row.bankNameRequested,
      header: () => (
        <ColumnHeaderMenu
          label="Bank Requested"
          sorted={sortState.bankNameRequested ?? false}
          onSort={(dir) => onSort("bankNameRequested", dir)}
          hasFilter={!!transactionColumnFilters.bankNameRequested}
          onFilterClick={() => onHeaderFilterClick("bankNameRequested")}
          onHide={() => onHideColumn("bankNameRequested")}
        />
      ),
      cell: ({ row }) => (
        <CopyableText
          value={row.original.bankNameRequested}
          title="Copy bank name"
          className="w-full"
          textClassName="text-sm"
        />
      ),
    },

    // 30. In Amount (compound: amount + confirmed)
    {
      id: "inAmount",
      accessorFn: (row) => row.inAmount,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="In Amount"
          secondaryLabel="Confirmed"
          primarySorted={sortState.inAmount ?? false}
          onPrimarySort={(dir) => onSort("inAmount", dir)}
          secondarySorted={sortState.inAmountConfirmed ?? false}
          onSecondarySort={(dir) => onSort("inAmountConfirmed", dir)}
          hasFilter={!!transactionColumnFilters.inAmount}
          onFilterClick={() => onHeaderFilterClick("inAmount")}
          onHide={() => onHideColumn("inAmount")}
        />
      ),
      cell: ({ row }) => (
        <ConfirmedAmountCell
          value={row.original.inAmount}
          currency={row.original.inCurrency}
          confirmedValue={row.original.inAmountConfirmed}
          copyTitle="Copy in amount"
          confirmedCopyTitle="Copy in amount confirmed"
          mutedCurrency
        />
      ),
    },

    // 32. Out Currency
    {
      id: "outCurrency",
      accessorFn: (row) => row.outCurrency,
      header: () => (
        <ColumnHeaderMenu
          label="Out Currency"
          sorted={sortState.outCurrency ?? false}
          onSort={(dir) => onSort("outCurrency", dir)}
          hasFilter={!!transactionColumnFilters.outCurrency}
          onFilterClick={() => onHeaderFilterClick("outCurrency")}
          onHide={() => onHideColumn("outCurrency")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-[var(--text-secondary)]">{row.original.outCurrency}</span>
      ),
    },

    // 33. Fee (merged: fee amount + fee confirmed)
    {
      id: "fee",
      accessorFn: (row) => row.feeAmount,
      header: () => (
        <ColumnHeaderMenu
          primaryLabel="Fee"
          secondaryLabel="Confirmed"
          primarySorted={sortState.fee ?? false}
          onPrimarySort={(dir) => onSort("fee", dir)}
          secondarySorted={sortState.feeAmountConfirmed ?? false}
          onSecondarySort={(dir) => onSort("feeAmountConfirmed", dir)}
          hasFilter={!!transactionColumnFilters.fee}
          onFilterClick={() => onHeaderFilterClick("fee")}
          onHide={() => onHideColumn("fee")}
        />
      ),
      cell: ({ row }) => (
        <ConfirmedAmountCell
          value={row.original.feeAmount}
          currency={row.original.feeCurrency}
          confirmedValue={row.original.feeAmountConfirmed}
          copyTitle="Copy fee"
          confirmedCopyTitle="Copy confirmed fee"
          mutedCurrency
        />
      ),
    },

    // 35. In Amount Initial
    {
      id: "inAmountInitial",
      accessorFn: (row) => row.inAmountInitial,
      header: () => (
        <ColumnHeaderMenu
          label="In Amount Initial"
          sorted={sortState.inAmountInitial ?? false}
          onSort={(dir) => onSort("inAmountInitial", dir)}
          hasFilter={!!transactionColumnFilters.inAmountInitial}
          onFilterClick={() => onHeaderFilterClick("inAmountInitial")}
          onHide={() => onHideColumn("inAmountInitial")}
        />
      ),
      cell: ({ row }) => (
        <CurrencyAmountCell
          value={row.original.inAmountInitial}
          currency={row.original.inCurrency}
          copyTitle="Copy initial in amount"
          mutedCurrency
        />
      ),
    },

    // 36. Is Variable Amount
    {
      id: "isVariableAmount",
      header: () => (
        <ColumnHeaderMenu
          label="Variable Amount"
          sorted={sortState.isVariableAmount ?? false}
          onSort={(dir) => onSort("isVariableAmount", dir)}
          hasFilter={!!transactionColumnFilters.isVariableAmount}
          onFilterClick={() => onHeaderFilterClick("isVariableAmount")}
          onHide={() => onHideColumn("isVariableAmount")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.isVariableAmount ? "✓" : "—"}</span>
      ),
    },

    // 37. Is Balance Released
    {
      id: "isBalanceReleased",
      header: () => (
        <ColumnHeaderMenu
          label="Balance Released"
          sorted={sortState.isBalanceReleased ?? false}
          onSort={(dir) => onSort("isBalanceReleased", dir)}
          hasFilter={!!transactionColumnFilters.isBalanceReleased}
          onFilterClick={() => onHeaderFilterClick("isBalanceReleased")}
          onHide={() => onHideColumn("isBalanceReleased")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.isBalanceReleased ? "✓" : "—"}</span>
      ),
    },

    // 38. Is Balance Reserved
    {
      id: "isBalanceReserved",
      header: () => (
        <ColumnHeaderMenu
          label="Balance Reserved"
          sorted={sortState.isBalanceReserved ?? false}
          onSort={(dir) => onSort("isBalanceReserved", dir)}
          hasFilter={!!transactionColumnFilters.isBalanceReserved}
          onFilterClick={() => onHeaderFilterClick("isBalanceReserved")}
          onHide={() => onHideColumn("isBalanceReserved")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.isBalanceReserved ? "✓" : "—"}</span>
      ),
    },

    // 39. Is Requisite Pool
    {
      id: "isRequisitePool",
      header: () => (
        <ColumnHeaderMenu
          label="Requisite Pool"
          sorted={sortState.isRequisitePool ?? false}
          onSort={(dir) => onSort("isRequisitePool", dir)}
          hasFilter={!!transactionColumnFilters.isRequisitePool}
          onFilterClick={() => onHeaderFilterClick("isRequisitePool")}
          onHide={() => onHideColumn("isRequisitePool")}
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.isRequisitePool ? "✓" : "—"}</span>
      ),
    },

    // 40. Is Manual Confirmed
    {
      id: "isManualConfirmed",
      header: () => (
        <ColumnHeaderMenu
          label="Manual Confirmed"
          sorted={sortState.isManualConfirmed ?? false}
          onSort={(dir) => onSort("isManualConfirmed", dir)}
          hasFilter={!!transactionColumnFilters.isManualConfirmed}
          onFilterClick={() => onHeaderFilterClick("isManualConfirmed")}
          onHide={() => onHideColumn("isManualConfirmed")}
        />
      ),
      cell: ({ row }) =>
        row.original.isManualConfirmed ? (
          <Badge variant="warning">Manual</Badge>
        ) : (
          <span className="text-sm text-[var(--text-secondary)]">—</span>
        ),
    },

    // Time block — kept at the end so it never outranks core business fields.
    // Order inside the block: created → updated → completed → expires.
    {
      id: "createdAt",
      accessorFn: (row) => row.createdAtValue,
      header: () => (
        <ColumnHeaderMenu
          label="Created"
          sorted={sortState.createdAt ?? false}
          onSort={(dir) => onSort("createdAt", dir)}
          hasFilter={!!transactionColumnFilters.createdAt}
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
          hasFilter={!!transactionColumnFilters.updatedAt}
          onFilterClick={() => onHeaderFilterClick("updatedAt")}
          onHide={() => onHideColumn("updatedAt")}
        />
      ),
      cell: ({ row }) => <TimestampCell value={row.original.updatedAt} />,
    },
    {
      id: "completedAt",
      accessorFn: (row) => row.completedAtValue,
      header: () => (
        <ColumnHeaderMenu
          label="Completed"
          sorted={sortState.completedAt ?? false}
          onSort={(dir) => onSort("completedAt", dir)}
          hasFilter={!!transactionColumnFilters.completedAt}
          onFilterClick={() => onHeaderFilterClick("completedAt")}
          onHide={() => onHideColumn("completedAt")}
        />
      ),
      cell: ({ row }) => <TimestampCell value={row.original.completedAt} />,
    },
    {
      id: "paymentExpiresAt",
      accessorFn: (row) => row.paymentExpiresAtValue,
      header: () => (
        <ColumnHeaderMenu
          label="Payment Expires"
          sorted={sortState.paymentExpiresAt ?? false}
          onSort={(dir) => onSort("paymentExpiresAt", dir)}
          hasFilter={!!transactionColumnFilters.paymentExpiresAt}
          onFilterClick={() => onHeaderFilterClick("paymentExpiresAt")}
          onHide={() => onHideColumn("paymentExpiresAt")}
        />
      ),
      cell: ({ row }) => (
        <ExpiryTimestampCell
          value={row.original.paymentExpiresAt}
          timestampMs={row.original.paymentExpiresAtValue}
        />
      ),
    },

    // Actions
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
            sections={buildRowActionSections(row.original, onRowActionClick)}
            triggerClassName="opacity-100 hover:bg-[var(--bg-hover)]"
          />
        </div>
      ),
    },
  ];

  // Insert gap indicator pseudo-columns (right-to-left to preserve indices)
  for (let i = columnGaps.length - 1; i >= 0; i--) {
    const gap = columnGaps[i];
    const gapColumn: ColumnDef<TransactionViewModel> = {
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
      // Gap at start — insert after rowControl (index 1)
      cols.splice(1, 0, gapColumn);
    } else {
      const idx = cols.findIndex((c) => c.id === gap.afterColumnId);
      if (idx !== -1) {
        cols.splice(idx + 1, 0, gapColumn);
      }
    }
  }

  return cols;
}
