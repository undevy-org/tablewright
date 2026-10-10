export { Badge, badgeVariants } from "./components/ui/badge";
export type { BadgeProps } from "./components/ui/badge";
export { Button, buttonVariants } from "./components/ui/button";
export type { ButtonProps } from "./components/ui/button";
export * from "./components/ui/checkbox";
export * from "./components/ui/dialog";
export * from "./components/ui/dropdown-menu";
export * from "./components/ui/input";
export * from "./components/ui/popover";
export * from "./components/ui/select";
export * from "./components/ui/tabs";
export {
  Combobox,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./components/ui/combobox";
export type { ComboboxProps, ComboboxOption } from "./components/ui/combobox";
export { ButtonFooter } from "./components/ui/button-footer";
export type { ButtonFooterProps } from "./components/ui/button-footer";
export { ThemeSwitch } from "./components/ui/theme-switch";
export type { ThemeSwitchProps } from "./components/ui/theme-switch";
export { SegmentedControl } from "./components/ui/segmented-control";
export type { SegmentedControlProps, SegmentedControlOption } from "./components/ui/segmented-control";

export { CopyButton } from "./components/data-table/CopyButton";
export { CopyableText } from "./components/data-table/CopyableText";
export { DataTableShell } from "./components/data-table/DataTableShell";
export type {
  DataTableDrawer,
  DataTableShellProps,
} from "./components/data-table/DataTableShell";
export { DrawerActionGroup } from "./components/data-table/DrawerActionGroup";
export { DrawerEntityCard } from "./components/data-table/DrawerEntityCard";
export { DrawerField } from "./components/data-table/DrawerField";
export { DrawerFlagItem, DrawerFlagGrid } from "./components/data-table/DrawerFlagItem";
export { DrawerSection } from "./components/data-table/DrawerSection";
export { DrawerShell } from "./components/data-table/DrawerShell";
export type { DrawerMode } from "./components/data-table/DrawerShell";
export { DrawerSummaryCard } from "./components/data-table/DrawerSummaryCard";
export { useDrawerExpanded } from "./context/drawer-expand-context";
export { DRAWER_SIZE } from "./constants/drawer";
export { EmptyState } from "./components/data-table/EmptyState";
export { FilterChip } from "./components/data-table/FilterChip";
export type { FilterChipProps } from "./components/data-table/FilterChip";
export { ViewChip } from "./components/data-table/ViewChip";
export type { ViewChipProps } from "./components/data-table/ViewChip";
export { FilterPopoverFooter } from "./components/data-table/FilterPopoverFooter";
export type { FilterPopoverFooterLabels } from "./components/data-table/FilterPopoverFooter";
export * as FilterToolbar from "./components/data-table/FilterToolbar";
export { RowActionsMenu } from "./components/data-table/RowActionsMenu";
export { RowControlCell } from "./components/data-table/RowControlCell";
export type { RowControlCellProps } from "./components/data-table/RowControlCell";
export { RowControlHeader } from "./components/data-table/RowControlCell";
export type { RowControlHeaderProps } from "./components/data-table/RowControlCell";
export { SortableHeader } from "./components/data-table/SortableHeader";
export { TableFooter } from "./components/data-table/TableFooter";
export { TableCsvExportButton } from "./components/data-table/TableCsvExportButton";
export type { TableCsvExportButtonProps } from "./components/data-table/TableCsvExportButton";
export { TableLayout } from "./components/data-table/TableLayout";
export { useColumnResize } from "./components/data-table/hooks/use-column-resize";
export { getVisiblePageNumbers } from "./components/data-table/hooks/use-table-pagination";
export { useRowDrag } from "./components/data-table/hooks/use-row-drag";
export type { RowDragProps, UseRowDragResult } from "./components/data-table/hooks/use-row-drag";
export { useTableSort } from "./components/data-table/hooks/use-table-sort";
export type {
  BadgeVariant,
  BulkAction,
  ColumnMetaDef,
  RowActionItem,
  RowActionSection,
  RowActionVariant,
  SortDirection,
  StatusConfigEntry,
  StickyStyleResult,
  ViewMode,
} from "./components/data-table/types";

export { AppShell } from "./components/layout/AppShell";
export type { AppShellProps } from "./components/layout/AppShell";
export { Sidebar } from "./components/layout/Sidebar";
export type { SidebarProps } from "./components/layout/Sidebar";
export { TopBar } from "./components/layout/TopBar";
export type { TopBarProps } from "./components/layout/TopBar";
export { SidebarUser } from "./components/layout/SidebarUser";
export type { SidebarUserProps } from "./components/layout/SidebarUser";
export { SidebarAccountMenu } from "./components/layout/SidebarAccountMenu";
export type { SidebarAccountMenuProps, AccountMenuItem } from "./components/layout/SidebarAccountMenu";
export { useAppShell } from "./components/layout/app-shell-context";
export type { NavItem, NavGroup } from "./components/layout/types";

export { ReportSummaryCard } from "./components/dashboard/ReportSummaryCard";
export type { ReportSummaryCardProps } from "./components/dashboard/ReportSummaryCard";

export { useScrollActivity } from "./hooks/use-scroll-activity";
export { cn } from "./lib/utils";
export { STYLE_SCOPE } from "./lib/style-scope";

// Radix portals (dropdown, popover, dialog, select) mount outside the React
// tree and default to document.body, which sits outside both the `data-theme`
// wrapper and the `.tablewright` style scope. Provide a container inside that
// subtree and portalled content inherits tokens and the scoped reset.
export {
  PortalContainerContext,
  usePortalContainer,
} from "./context/portal-container-context";

// ── Table toolkit (pages port closure) ────────────────────────────────────

// Types
export type {
  ColumnFilterType,
  CompoundSubFilter,
  ColumnFilterConfig,
  ActiveFilterValue,
  DateRangeValue,
  NumberRangeValue,
  CompoundFilterValue,
  ActiveFilter,
  FilterColumnStats,
  FilterStatsSlice,
  ColumnGroup,
  ColumnGap,
  ViewPreset,
} from "./components/data-table/filter-types";

// Components
export {
  GapIndicator,
  GapCell,
  GAP_HEADER_ATTR,
  GAP_CELL_ATTR,
} from "./components/data-table/GapIndicator";
export { TimestampCell } from "./components/data-table/TimestampCell";
export { ExpiryTimestampCell } from "./components/data-table/ExpiryTimestampCell";
export { ColumnHeaderMenu } from "./components/data-table/ColumnHeaderMenu";
export type { ColumnHeaderMenuLabels } from "./components/data-table/ColumnHeaderMenu";
export { TwoPanelMenuBase } from "./components/data-table/TwoPanelMenu";
export type { TwoPanelMenuItem, TwoPanelMenuGroup } from "./components/data-table/TwoPanelMenu";
export { FlatColumnToggle } from "./components/data-table/FlatColumnToggle";
export { GroupedColumnToggle } from "./components/data-table/GroupedColumnToggle";
export { ColumnFilterPopover } from "./components/data-table/ColumnFilterPopover";
export type { ColumnFilterPopoverLabels } from "./components/data-table/ColumnFilterPopover";
export { CompoundFilterPopover } from "./components/data-table/CompoundFilterPopover";
export type { CompoundFilterPopoverLabels } from "./components/data-table/CompoundFilterPopover";
export { AppliedStateChips } from "./components/data-table/AppliedStateChips";
export type { AppliedStateChipsLabels } from "./components/data-table/AppliedStateChips";
export { FilterFormPanel } from "./components/data-table/FilterFormPanel";
export type { FilterFormPanelProps, FilterFormPanelLabels } from "./components/data-table/FilterFormPanel";
export { FilterFormToggle, useFilterFormOpen } from "./components/data-table/FilterFormToggle";
export type { FilterFormToggleProps } from "./components/data-table/FilterFormToggle";
export {
  applyManagedChanges,
  clearManagedFilters,
  hasActiveManagedFilters,
} from "./components/data-table/managed-filters";
export type { ManagedFilterChange } from "./components/data-table/managed-filters";
export {
  getCompoundValue,
  getDateRange,
  getNumberRange,
  getStringArray,
  isFilterValueEmpty,
} from "./components/data-table/filter-values";

// Hook
export { useTableOrchestration } from "./hooks/useTableOrchestration";
export type {
  TableOrchestrationConfig,
  TableOrchestrationReturn,
} from "./hooks/useTableOrchestration";
export {
  createTableOrchestrationStore,
  defaultValueForFilter,
} from "./hooks/table-orchestration-store";
export type {
  TableOrchestrationState,
  TableOrchestrationActions,
  TableOrchestrationStore,
  TableOrchestrationStoreApi,
} from "./hooks/table-orchestration-store";
export { useRowDragOverride } from "./hooks/useRowDragOverride";
export type { UseRowDragOverrideResult } from "./hooks/useRowDragOverride";

// Utils
export {
  downloadCsvFile,
  exportTableToCsv,
} from "./lib/export-table-csv";
export type {
  DownloadCsvFileOptions,
  ExportTableToCsvOptions,
} from "./lib/export-table-csv";
export { applyColumnPinningToMeta } from "./components/data-table/sticky-utils";
export type { ApplyColumnPinningToMetaOptions } from "./components/data-table/sticky-utils";
export { computeColumnGaps, gapColumnId } from "./lib/column-gaps";
export { computeColumnStats } from "./lib/filter-stats";
export { formatEnumLabel } from "./lib/format-enum";
export {
  formatDateParts,
  parsePossibleTimestamp,
  formatLiveTimestamp,
  displayTimeZone,
} from "./lib/format-timestamp";

// Cells
export { MonoIdCell } from "./components/data-table/cells/MonoIdCell";
export { CurrencyAmountCell } from "./components/data-table/cells/CurrencyAmountCell";
export { DualLineCell } from "./components/data-table/cells/DualLineCell";
export { AmountCell } from "./components/data-table/cells/AmountCell";
export { ConfirmedAmountCell } from "./components/data-table/cells/ConfirmedAmountCell";
export { EnumBadgeCell } from "./components/data-table/cells/EnumBadgeCell";
