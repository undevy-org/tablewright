import { useCallback, useEffect, useMemo, useState } from "react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { FileDown, Plus, RefreshCw, Search } from "lucide-react";

import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { TopBar } from "../../../components/layout/TopBar";
import { CopyableText } from "../../../components/data-table/CopyableText";
import { DataTableShell } from "../../../components/data-table/DataTableShell";
import * as FilterToolbar from "../../../components/data-table/FilterToolbar";
import { TableFooter } from "../../../components/data-table/TableFooter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { useScrollActivity } from "../../../hooks/use-scroll-activity";
import { DRAWER_SIZE } from "../../../constants/drawer";

import { FlatColumnToggle } from "../../../components/data-table/FlatColumnToggle";
import { AppliedStateChips } from "../../../components/data-table/AppliedStateChips";
import { FilterFormPanel } from "../../../components/data-table/FilterFormPanel";
import { FilterFormToggle, useFilterFormOpen } from "../../../components/data-table/FilterFormToggle";
import { applyManagedChanges, clearManagedFilters, hasActiveManagedFilters, type ManagedFilterChange } from "../../../components/data-table/managed-filters";
import { useTableOrchestration } from "../../../hooks/useTableOrchestration";
import { useDemoRefresh } from "../../useDemoRefresh";
import { useRowDragOverride } from "../../../hooks/useRowDragOverride";

import {
  getMerchantSortValue,
  mapRawMerchantToViewModel,
  matchesColumnFilter,
  statusBadgeVariants,
} from "./adapters";
import { createColumns } from "./columns";
import { CreateMerchantPreviewDialog } from "./components/CreateMerchantPreviewDialog";
import { LiveMerchantDrawerContent } from "./components/LiveMerchantDrawerContent";
import { LiveReportsShell, LiveSummaryShell } from "./components/LiveSummaryShell";
import {
  createMerchantOptions,
  liveReportSections,
  liveTabCounts,
  liveTabSummaries,
} from "./data/liveSnapshot";
import { rawMerchantsLiveSeed } from "./data/merchantsLiveSeed";
import { merchantViewPresets } from "./view-presets";
import { buildRowActionSections } from "./action-model";
import {
  liveTabs,
  merchantColumnFilters,
  merchantColumnLabels,
  merchantColumnMeta,
  merchantRowsPerPageOptions,
  merchantsEmptyMessage,
  merchantToggleableColumnIds,
} from "./table-config";
import { MERCHANT_COLUMN_GROUPS } from "./column-groups";
import type {
  CreateMerchantPreviewFormState,
  LiveMerchantViewModel,
  LiveTabKey,
  MerchantViewKey,
} from "./types";

const MERCHANT_FORM_FIELDS = [
  "status",
  "traffic",
  "balance",
  "merchant",
  "createdAt",
  "updatedAt",
  "spamBlock",
] as const;

interface PreviewDialogState {
  title: string;
  body: string;
  merchantId?: string;
  merchantName?: string;
}

export function MerchantsLiveRefactoredScreen() {
  const tabsScrollRef = useScrollActivity<HTMLDivElement>();
  const panelScrollRef = useScrollActivity<HTMLDivElement>();

  const [activeTab, setActiveTab] = useState<LiveTabKey>("merchants");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [previewDialog, setPreviewDialog] = useState<PreviewDialogState | null>(null);

  // ── Data ──────────────────────────────────────────────────────────────
  const merchants = useMemo(() => rawMerchantsLiveSeed.map(mapRawMerchantToViewModel), []);

  // ── Orchestration ─────────────────────────────────────────────────────
  const getRowId = useCallback((row: LiveMerchantViewModel) => row.id, []);
  const getSearchText = useCallback((row: LiveMerchantViewModel) => row.searchText, []);

  const [isRefreshing, handleRefresh] = useDemoRefresh();

  const orch = useTableOrchestration<LiveMerchantViewModel, MerchantViewKey>({
    rows: merchants,
    getRowId,
    filterRow: matchesColumnFilter,
    getSortValue: getMerchantSortValue,
    getSearchText,
    filterConfigs: merchantColumnFilters,
    columnMeta: merchantColumnMeta,
    toggleableColumnIds: merchantToggleableColumnIds,
    rowsPerPageOptions: merchantRowsPerPageOptions,
    viewPresets: merchantViewPresets,
    defaultViewKey: "all",
    columnGroups: MERCHANT_COLUMN_GROUPS,
  });

  const [filterFormOpen, setFilterFormOpen] = useFilterFormOpen("merchants", false);
  const formManagedActive = hasActiveManagedFilters(orch.columnFilters, MERCHANT_FORM_FIELDS);
  const merchantsFilterFormId = "merchants-filter-form";

  // ── Tab change → reset ────────────────────────────────────────────────
  useEffect(() => {
    orch.handleClearAll();
    orch.setSelectedRowId(null);
    orch.setSelectedIds(new Set());
    setPreviewDialog(null);
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Domain callbacks ──────────────────────────────────────────────────
  const handleExportPreview = () => {
    setPreviewDialog({ title: "Export CSV", body: "Demonstration only." });
  };

  const handleCreateSubmit = (value: CreateMerchantPreviewFormState) => {
    const nameLabel = value.name.trim() || "Name omitted";
    setPreviewDialog({
      title: "Create Merchant",
      body: `Prepared preview for ${nameLabel} with ${value.trafficType} and ${value.balanceType}.`,
    });
  };

  const handleRowActionPreview = useCallback(
    (merchant: LiveMerchantViewModel, label: string) => {
      orch.setSelectedRowId(merchant.id);
      setPreviewDialog({
        title: label,
        merchantId: merchant.id,
        merchantName: merchant.name,
        body: "Demonstration only.",
      });
    },
    [orch],
  );

  // ── Columns ───────────────────────────────────────────────────────────
  const rowNumberBase = (orch.safePage - 1) * orch.rowsPerPage;

  const columns = useMemo(
    () =>
      createColumns({
        sortState: orch.sortState,
        onSort: orch.handleHeaderSort,
        onRowActionPreview: handleRowActionPreview,
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
      }),
    [
      handleRowActionPreview,
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
    ],
  );

  // ── Drag override (lifted out of orch for perf) ───────────────────────
  const { displayRows, rowDrag } = useRowDragOverride(orch.paginatedRows);

  // ── Table instance ────────────────────────────────────────────────────
  const table = useReactTable({
    data: displayRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
    onColumnVisibilityChange: orch.setColumnVisibility,
    state: { columnVisibility: orch.columnVisibility },
  });

  const visibleToggleableCount = merchantToggleableColumnIds.filter((columnId) =>
    table.getColumn(columnId)?.getIsVisible(),
  ).length;

  // ── Drawer ────────────────────────────────────────────────────────────
  const selectedMerchant = merchants.find((m) => m.id === orch.selectedRowId) ?? null;

  const drawer = {
    open: Boolean(selectedMerchant),
    mode: "side+modal" as const,
    onClose: () => orch.setSelectedRowId(null),
    title: selectedMerchant ? (
      <CopyableText
        value={selectedMerchant.name}
        title="Copy merchant name"
        textClassName="font-semibold"
      />
    ) : (
      ""
    ),
    subtitle: selectedMerchant ? (
      <CopyableText
        value={selectedMerchant.id}
        title="Copy merchant ID"
        textClassName="font-mono"
      />
    ) : undefined,
    headerExtra: selectedMerchant ? (
      <Badge variant={statusBadgeVariants[selectedMerchant.status]}>
        {selectedMerchant.status}
      </Badge>
    ) : undefined,
    content: selectedMerchant ? (
      <LiveMerchantDrawerContent
        merchant={selectedMerchant}
        actionSections={buildRowActionSections(selectedMerchant, handleRowActionPreview)}
      />
    ) : null,
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      className="flex h-full min-h-0 flex-1 flex-col overflow-hidden"
      style={{ "--size-drawer": DRAWER_SIZE } as React.CSSProperties}
    >
      <TopBar
        actions={
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4" />
            Create Merchant
          </Button>
        }
      >
        <h1 className="text-[18px] font-semibold text-[var(--text-primary)]">Merchants</h1>
      </TopBar>

      <div className="flex min-h-0 flex-1 flex-col px-6">
        <div className="py-2">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LiveTabKey)}>
            <div ref={tabsScrollRef} className="scrollbar-auto-hide overflow-x-auto pb-0.5">
              <TabsList className="min-w-max">
                {liveTabs.map((tab) => (
                  <TabsTrigger key={tab.key} value={tab.key} count={liveTabCounts[tab.key]}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </Tabs>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden bg-[var(--bg-body)]">
          {activeTab === "merchants" ? (
            <div className="flex h-full min-h-0 flex-col overflow-hidden">
              <FilterToolbar.Root>
                <FilterToolbar.SearchForm onSubmit={orch.handleSearchSubmit}>
                  <Input
                    value={orch.searchInput}
                    onChange={(event) => orch.setSearchInput(event.target.value)}
                    placeholder="Search by Merchant ID"
                    className="h-9 min-w-0 flex-1"
                  />
                  <Button type="submit" className="shrink-0">
                    <Search className="h-4 w-4" />
                    Search
                  </Button>
                </FilterToolbar.SearchForm>

                <FilterToolbar.Filters>
                  <FlatColumnToggle
                    toggleableColumnIds={merchantToggleableColumnIds}
                    columnLabels={merchantColumnLabels}
                    columnVisibility={orch.columnVisibility}
                    open={orch.columnsMenuOpen}
                    onOpenChange={orch.setColumnsMenuOpen}
                    onColumnToggle={(columnId) => {
                      const column = table.getColumn(columnId);
                      if (!column) return;
                      if (column.getIsVisible() && visibleToggleableCount === 1) return;
                      column.toggleVisibility(!column.getIsVisible());
                    }}
                  />
                  <FilterFormToggle
                    open={filterFormOpen}
                    onOpenChange={setFilterFormOpen}
                    hasActiveFilters={formManagedActive}
                    controlsId={merchantsFilterFormId}
                    variant="button"
                  />
                </FilterToolbar.Filters>

                <FilterToolbar.Utility>
                  <Select
                    value={orch.activeView}
                    onValueChange={(v) => orch.handleViewChange(v as MerchantViewKey)}
                  >
                    <SelectTrigger aria-label="View" className="h-9 w-44">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {merchantViewPresets.map((view) => (
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
                    onClick={handleExportPreview}
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
                    id={merchantsFilterFormId}
                    filterConfigs={merchantColumnFilters}
                    fields={MERCHANT_FORM_FIELDS}
                    filters={orch.columnFilters}
                    onApply={(changes: ManagedFilterChange[]) => applyManagedChanges(orch, changes)}
                    onClear={(ids: string[]) => clearManagedFilters(orch, ids)}
                    onClose={() => setFilterFormOpen(false)}
                  />
                </div>
              </div>

              <AppliedStateChips
                filters={orch.columnFilters}
                configs={merchantColumnFilters}
                newestColumnId={orch.newestFilterColumnId}
                onRemoveFilter={orch.handleRemoveColumnFilter}
                onChangeFilter={orch.handleChangeColumnFilter}
                currentSort={orch.currentSort}
                columnLabels={merchantColumnLabels}
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

              <DataTableShell
                table={table}
                dense={orch.density === "dense"}
                emptyMessage={merchantsEmptyMessage}
                columnMeta={orch.extendedColumnMeta}
                columnWidths={orch.extendedWidths}
                onColumnResizeStart={orch.onPointerDown}
                onRowClick={(merchant) =>
                  orch.setSelectedRowId(orch.selectedRowId === merchant.id ? null : merchant.id)
                }
                getRowIsActive={(merchant) => merchant.id === orch.selectedRowId}
                rowDrag={rowDrag}
                footer={
                  <TableFooter
                    selectedCount={orch.selectedIds.size}
                    totalCount={orch.filteredRows.length}
                    onSelectAll={() =>
                      orch.setSelectedIds(new Set(orch.filteredRows.map((m) => m.id)))
                    }
                    onClearSelection={() => orch.setSelectedIds(new Set())}
                    bulkActions={
                      orch.selectedIds.size > 0
                        ? [
                            {
                              label: "Export CSV",
                              onClick: () =>
                                setPreviewDialog({
                                  title: "Export CSV",
                                  body: `Export ${orch.selectedIds.size} merchants. Preview only.`,
                                }),
                            },
                            {
                              label: "Block User",
                              onClick: () =>
                                setPreviewDialog({
                                  title: "Block Users",
                                  body: `Block ${orch.selectedIds.size} merchants. Preview only.`,
                                }),
                              variant: "danger" as const,
                            },
                          ]
                        : []
                    }
                    paginationVariant="perPage"
                    rowsPerPage={orch.rowsPerPage}
                    rowsPerPageOptions={[...merchantRowsPerPageOptions]}
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
          ) : activeTab === "reports" ? (
            <div ref={panelScrollRef} className="scrollbar-auto-hide h-full overflow-auto py-6">
              <LiveReportsShell sections={liveReportSections} />
            </div>
          ) : (
            <div ref={panelScrollRef} className="scrollbar-auto-hide h-full overflow-auto py-6">
              <LiveSummaryShell summary={liveTabSummaries[activeTab]} />
            </div>
          )}
        </div>
      </div>

      <CreateMerchantPreviewDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        options={createMerchantOptions}
        onSubmit={handleCreateSubmit}
      />

      <Dialog
        open={Boolean(previewDialog)}
        onOpenChange={(open) => {
          if (!open) setPreviewDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{previewDialog?.title ?? "Preview Action"}</DialogTitle>
            <DialogDescription>Demonstration only.</DialogDescription>
          </DialogHeader>

          {previewDialog ? (
            <div className="space-y-3 text-[13px] text-[var(--text-secondary)]">
              {previewDialog.merchantName ? (
                <div>
                  Merchant:{" "}
                  <span className="font-medium text-[var(--text-primary)]">
                    {previewDialog.merchantName}
                  </span>
                </div>
              ) : null}
              {previewDialog.merchantId ? (
                <div>
                  Merchant ID:{" "}
                  <span className="font-mono text-[var(--text-primary)]">
                    {previewDialog.merchantId}
                  </span>
                </div>
              ) : null}
              <div>{previewDialog.body}</div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
