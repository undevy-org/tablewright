import { useCallback, useMemo, useState } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FileDown, RefreshCw, Search } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { TopBar } from "../../../components/layout/TopBar";
import { CopyableText } from "../../../components/data-table/CopyableText";
import { DataTableShell } from "../../../components/data-table/DataTableShell";
import * as FilterToolbar from "../../../components/data-table/FilterToolbar";
import { TableFooter } from "../../../components/data-table/TableFooter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { ButtonFooter } from "../../../components/ui/button-footer";

import { GroupedColumnToggle } from "../../../components/data-table/GroupedColumnToggle";
import { AppliedStateChips } from "../../../components/data-table/AppliedStateChips";
import { FilterFormPanel } from "../../../components/data-table/FilterFormPanel";
import { FilterFormToggle, useFilterFormOpen } from "../../../components/data-table/FilterFormToggle";
import { applyManagedChanges, clearManagedFilters, hasActiveManagedFilters, type ManagedFilterChange } from "../../../components/data-table/managed-filters";
import { useTableOrchestration } from "../../../hooks/useTableOrchestration";
import { useDemoRefresh } from "../../useDemoRefresh";
import { useRowDragOverride } from "../../../hooks/useRowDragOverride";
import { DRAWER_SIZE } from "../../../constants/drawer";

import {
  getTransactionSortValue,
  mapRawTransactionToViewModel,
  matchesTransactionFilter,
  statusBadgeVariants,
  formatStatusLabel,
  formatDirectionLabel,
} from "./adapters";
import { createColumns } from "./columns";
import { TransactionDrawerContent } from "./components/TransactionDrawerContent";
import { UpdateStatusDialog } from "./components/UpdateStatusDialog";
import { CreateDisputeDialog } from "./components/CreateDisputeDialog";
import { CallbackLogsDialog } from "./components/CallbackLogsDialog";
import { WebhooksDialog } from "./components/WebhooksDialog";
import { rawTransactionsSeed } from "./data/transactionsSeed";
import { transactionViewPresets } from "./view-presets";
import {
  transactionColumnFilters,
  transactionColumnLabels,
  transactionColumnMeta,
  transactionRowsPerPageOptions,
  transactionToggleableColumnIds,
} from "./table-config";
import { TRANSACTION_COLUMN_GROUPS } from "./column-groups";
import type { TransactionViewModel, TransactionViewKey } from "./types";

const TRANSACTION_FORM_FIELDS = [
  "status",
  "direction",
  "createdAt",
  "txId",
  "merchant",
  "merchantId",
  "merchantClientId",
  "amount",
  "requisite",
  "widgetId",
  "paymentSystem",
  "provider",
  "paymentMethod",
] as const;

export function TransactionsScreen() {
  // ── Data ──────────────────────────────────────────────────────────────
  const transactions = useMemo(() => rawTransactionsSeed.map(mapRawTransactionToViewModel), []);

  // ── Orchestration ─────────────────────────────────────────────────────
  const getRowId = useCallback((row: TransactionViewModel) => row.txId, []);
  const getSearchText = useCallback((row: TransactionViewModel) => row.searchText, []);

  const [isRefreshing, handleRefresh] = useDemoRefresh();

  const orch = useTableOrchestration<TransactionViewModel, TransactionViewKey>({
    rows: transactions,
    getRowId,
    filterRow: matchesTransactionFilter,
    getSortValue: getTransactionSortValue,
    getSearchText,
    filterConfigs: transactionColumnFilters,
    columnMeta: transactionColumnMeta,
    toggleableColumnIds: transactionToggleableColumnIds,
    rowsPerPageOptions: transactionRowsPerPageOptions,
    viewPresets: transactionViewPresets,
    defaultViewKey: "all",
    columnGroups: TRANSACTION_COLUMN_GROUPS,
  });

  const [filterFormOpen, setFilterFormOpen] = useFilterFormOpen("transactions", true);
  const formManagedActive = hasActiveManagedFilters(orch.columnFilters, TRANSACTION_FORM_FIELDS);
  const transactionsFilterFormId = "transactions-filter-form";

  // ── Dialog states ─────────────────────────────────────────────────────
  const [updateStatusDialog, setUpdateStatusDialog] = useState<TransactionViewModel | null>(null);
  const [createDisputeDialog, setCreateDisputeDialog] = useState<TransactionViewModel | null>(null);
  const [callbackLogsDialog, setCallbackLogsDialog] = useState<TransactionViewModel | null>(null);
  const [webhooksDialog, setWebhooksDialog] = useState<TransactionViewModel | null>(null);
  const [sendWebhookConfirm, setSendWebhookConfirm] = useState<TransactionViewModel | null>(null);

  // ── Action dispatch ───────────────────────────────────────────────────
  const handleRowAction = useCallback((tx: TransactionViewModel, action: string) => {
    switch (action) {
      case "Update Status":
        setUpdateStatusDialog(tx);
        break;
      case "Create Dispute":
        setCreateDisputeDialog(tx);
        break;
      case "Callback Logs":
        setCallbackLogsDialog(tx);
        break;
      case "Webhooks":
        setWebhooksDialog(tx);
        break;
      case "Send Last Webhook":
        setSendWebhookConfirm(tx);
        break;
    }
  }, []);

  const handleUpdateStatus = useCallback(() => setUpdateStatusDialog(null), []);
  const handleCreateDispute = useCallback(() => setCreateDisputeDialog(null), []);

  // ── Columns ───────────────────────────────────────────────────────────
  const rowNumberBase = (orch.safePage - 1) * orch.rowsPerPage;

  const columns = useMemo(
    () =>
      createColumns({
        sortState: orch.sortState,
        onSort: orch.handleHeaderSort,
        rowNumberBase,
        getSelectedIds: orch.getSelectedIds,
        onToggleRowSelection: orch.handleToggleRowSelection,
        onExpandRow: orch.handleExpandRow,
        getHeaderCheckState: orch.getHeaderCheckState,
        onToggleHeaderCheck: orch.handleToggleHeaderCheck,
        onHeaderFilterClick: orch.handleHeaderFilterClick,
        onHideColumn: orch.handleHideColumn,
        columnGaps: orch.columnGaps,
        onExpandGap: orch.handleExpandGap,
        onRowActionClick: handleRowAction,
      }),
    [
      orch.sortState,
      orch.handleHeaderSort,
      rowNumberBase,
      orch.getSelectedIds,
      orch.handleToggleRowSelection,
      orch.handleExpandRow,
      orch.getHeaderCheckState,
      orch.handleToggleHeaderCheck,
      orch.handleHeaderFilterClick,
      orch.handleHideColumn,
      orch.columnGaps,
      orch.handleExpandGap,
      handleRowAction,
    ],
  );

  // ── Drag override (lifted out of orch for perf) ───────────────────────
  const { displayRows, rowDrag } = useRowDragOverride(orch.paginatedRows);

  // ── Table instance ────────────────────────────────────────────────────
  const table = useReactTable({
    data: displayRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.txId,
    onColumnVisibilityChange: orch.setColumnVisibility,
    state: { columnVisibility: orch.columnVisibility },
  });

  const visibleToggleableCount = transactionToggleableColumnIds.filter((columnId) =>
    table.getColumn(columnId)?.getIsVisible(),
  ).length;

  // ── Drawer ────────────────────────────────────────────────────────────
  const selectedTransaction = transactions.find((tx) => tx.txId === orch.selectedRowId) ?? null;

  const drawer = {
    open: Boolean(selectedTransaction),
    mode: "side+modal" as const,
    onClose: () => orch.setSelectedRowId(null),
    title: selectedTransaction ? (
      <CopyableText value={selectedTransaction.txId} title="Copy TX ID" textClassName="font-mono" />
    ) : (
      ""
    ),
    subtitle: selectedTransaction
      ? `${selectedTransaction.merchantName} · ${formatDirectionLabel(selectedTransaction.direction)}`
      : undefined,
    headerExtra: selectedTransaction ? (
      <Badge variant={statusBadgeVariants[selectedTransaction.status]}>
        {formatStatusLabel(selectedTransaction.status)}
      </Badge>
    ) : undefined,
    content: selectedTransaction ? (
      <TransactionDrawerContent transaction={selectedTransaction} onAction={handleRowAction} />
    ) : null,
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <TopBar>
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Transactions</h1>
      </TopBar>

      <div className="flex min-h-0 flex-1 flex-col px-6">
        <div className="min-h-0 flex-1 overflow-hidden bg-[var(--bg-body)]">
          <div
            className="flex h-full min-h-0 flex-col overflow-hidden"
            style={{ "--size-drawer": DRAWER_SIZE } as React.CSSProperties}
          >
            <div className="border-b border-[var(--border-subtle)]">
              <FilterToolbar.Root>
                <FilterToolbar.SearchForm onSubmit={orch.handleSearchSubmit}>
                  <Input
                    value={orch.searchInput}
                    onChange={(event) => orch.setSearchInput(event.target.value)}
                    placeholder="Search TX ID, Merchant..."
                    className="h-9 min-w-0 flex-1"
                  />
                  <Button type="submit" className="shrink-0">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </FilterToolbar.SearchForm>

                <FilterToolbar.Filters>
                  <GroupedColumnToggle
                    columnGroups={TRANSACTION_COLUMN_GROUPS}
                    columnLabels={transactionColumnLabels}
                    columnVisibility={orch.columnVisibility}
                    open={orch.columnsMenuOpen}
                    onOpenChange={orch.setColumnsMenuOpen}
                    onColumnToggle={(columnId) => {
                      const column = table.getColumn(columnId);
                      if (!column) return;
                      if (column.getIsVisible() && visibleToggleableCount === 1) return;
                      column.toggleVisibility(!column.getIsVisible());
                      orch.setColumnVisibility((prev) => prev); // trigger re-render
                    }}
                    onGroupToggleAll={(groupKey, show) => {
                      const group = TRANSACTION_COLUMN_GROUPS.find((g) => g.key === groupKey);
                      if (!group) return;
                      let currentVisibleCount = visibleToggleableCount;
                      group.columnIds.forEach((columnId) => {
                        const column = table.getColumn(columnId);
                        if (!column) return;
                        if (!show) {
                          if (!column.getIsVisible()) return;
                          if (currentVisibleCount <= 1) return;
                          column.toggleVisibility(false);
                          currentVisibleCount--;
                        } else {
                          column.toggleVisibility(true);
                        }
                      });
                    }}
                  />
                  <FilterFormToggle
                    open={filterFormOpen}
                    onOpenChange={setFilterFormOpen}
                    hasActiveFilters={formManagedActive}
                    controlsId={transactionsFilterFormId}
                    variant="button"
                  />
                  {/* GroupedFilterAdd removed: this page uses FilterFormPanel for all filtering */}
                </FilterToolbar.Filters>

                <FilterToolbar.Utility>
                  <Select
                    value={orch.activeView}
                    onValueChange={(v) => orch.handleViewChange(v as TransactionViewKey)}
                  >
                    <SelectTrigger aria-label="View" className="h-9 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="min-w-44">
                      {transactionViewPresets.map((view) => (
                        <SelectItem key={view.key} value={view.key}>
                          {view.label}
                        </SelectItem>
                      ))}
                      {orch.activeView === "custom" && (
                        <SelectItem value="custom" disabled>
                          Custom
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FilterToolbar.DensityControl
                    density={orch.density}
                    onDensityChange={orch.setDensity}
                  />
                </FilterToolbar.Utility>

                <FilterToolbar.Actions>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    title="Refresh"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className={`h-4 w-4${isRefreshing ? " animate-spin" : ""}`} />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    title="Export CSV"
                    onClick={() => {}}
                  >
                    <FileDown className="h-4 w-4" />
                  </Button>
                </FilterToolbar.Actions>
              </FilterToolbar.Root>

              <div
                className="grid transition-[grid-template-rows] duration-150 ease-out"
                style={{ gridTemplateRows: filterFormOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <FilterFormPanel
                    id={transactionsFilterFormId}
                    filterConfigs={transactionColumnFilters}
                    fields={TRANSACTION_FORM_FIELDS}
                    filters={orch.columnFilters}
                    onApply={(changes: ManagedFilterChange[]) => applyManagedChanges(orch, changes)}
                    onClear={(ids: string[]) => clearManagedFilters(orch, ids)}
                    onClose={() => setFilterFormOpen(false)}
                  />
                </div>
              </div>

              <AppliedStateChips
                filters={orch.columnFilters}
                configs={transactionColumnFilters}
                newestColumnId={orch.newestFilterColumnId}
                onRemoveFilter={orch.handleRemoveColumnFilter}
                onChangeFilter={orch.handleChangeColumnFilter}
                currentSort={orch.currentSort}
                columnLabels={transactionColumnLabels}
                onRemoveSort={orch.handleRemoveSort}
                hiddenColumnsCount={orch.hiddenColumnsCount}
                onResetColumns={orch.handleResetColumns}
                onOpenColumnsMenu={() => orch.setColumnsMenuOpen(true)}
                customFilterChip={orch.activeCustomFilterChip}
                onRemoveCustomFilter={orch.handleRemoveCustomFilter}
                onClearAll={orch.handleClearAll}
                columnFilterStats={orch.columnFilterStats}
                requestOpenFilterId={orch.requestOpenFilterId}
                onRequestOpenHandled={orch.handleRequestOpenHandled}
              />
            </div>

            <DataTableShell
              table={table}
              dense={orch.density === "dense"}
              emptyMessage="No transactions match the current filters."
              columnMeta={orch.extendedColumnMeta}
              columnWidths={orch.extendedWidths}
              onColumnResizeStart={orch.onPointerDown}
              onRowClick={(tx) =>
                orch.setSelectedRowId(orch.selectedRowId === tx.txId ? null : tx.txId)
              }
              getRowIsActive={(tx) => tx.txId === orch.selectedRowId}
              rowDrag={rowDrag}
              footer={
                <TableFooter
                  selectedCount={orch.selectedIds.size}
                  totalCount={orch.filteredRows.length}
                  onSelectAll={() =>
                    orch.setSelectedIds(new Set(orch.filteredRows.map((tx) => tx.txId)))
                  }
                  onClearSelection={() => orch.setSelectedIds(new Set())}
                  bulkActions={
                    orch.selectedIds.size > 0 ? [{ label: "Export CSV", onClick: () => {} }] : []
                  }
                  paginationVariant="perPage"
                  rowsPerPage={orch.rowsPerPage}
                  rowsPerPageOptions={[...transactionRowsPerPageOptions]}
                  pageNumbers={orch.pageNumbers}
                  onRowsPerPageChange={orch.handleRowsPerPageChange}
                  currentPage={orch.safePage}
                  totalPages={orch.totalPages}
                  onPageChange={orch.handlePageChange}
                />
              }
              drawer={drawer}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <UpdateStatusDialog
        key={updateStatusDialog?.txId}
        open={!!updateStatusDialog}
        onOpenChange={() => setUpdateStatusDialog(null)}
        transaction={updateStatusDialog}
        onSubmit={handleUpdateStatus}
      />
      <CreateDisputeDialog
        key={createDisputeDialog?.txId}
        open={!!createDisputeDialog}
        onOpenChange={() => setCreateDisputeDialog(null)}
        transaction={createDisputeDialog}
        onSubmit={handleCreateDispute}
      />
      <CallbackLogsDialog
        open={!!callbackLogsDialog}
        onOpenChange={() => setCallbackLogsDialog(null)}
        transaction={callbackLogsDialog}
      />
      <WebhooksDialog
        open={!!webhooksDialog}
        onOpenChange={() => setWebhooksDialog(null)}
        transaction={webhooksDialog}
      />

      {/* Send Last Webhook confirm */}
      <Dialog open={!!sendWebhookConfirm} onOpenChange={() => setSendWebhookConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Last Webhook</DialogTitle>
            <DialogDescription>
              Resend last webhook for {sendWebhookConfirm?.txId}?
            </DialogDescription>
          </DialogHeader>
          <ButtonFooter>
            <Button type="button" variant="secondary" onClick={() => setSendWebhookConfirm(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => setSendWebhookConfirm(null)}>
              Send
            </Button>
          </ButtonFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
