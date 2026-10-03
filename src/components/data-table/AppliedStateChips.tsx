import { X } from "lucide-react";
import { Button } from "../ui/button";
import { FilterChip } from "./FilterChip";

import type {
  ActiveFilter,
  ActiveFilterValue,
  ColumnFilterConfig,
  FilterStatsSlice,
} from "./filter-types";
import { ColumnFilterPopover } from "./ColumnFilterPopover";
import { CompoundFilterPopover } from "./CompoundFilterPopover";

const DEFAULT_LABELS = {
  clearAll: "Clear all",
  columns: "Columns",
  hiddenCount: (n: number) => `${n} hidden`,
};

function isFilterValueEmpty(value: ActiveFilterValue): boolean {
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.length === 0;
  if (typeof value === "object" && value !== null) {
    const keys = Object.keys(value);
    if (keys.length === 0) return true;
    return keys.every((k) => isFilterValueEmpty((value as Record<string, ActiveFilterValue>)[k]));
  }
  return false;
}

interface AppliedStateChipsProps {
  filters: ActiveFilter[];
  configs: Record<string, ColumnFilterConfig>;
  newestColumnId: string | null;
  onRemoveFilter: (columnId: string) => void;
  onChangeFilter: (columnId: string, value: ActiveFilterValue) => void;
  currentSort: { columnId: string; direction: "asc" | "desc" } | null;
  columnLabels: Record<string, string>;
  onRemoveSort: () => void;
  hiddenColumnsCount: number;
  onResetColumns: () => void;
  onOpenColumnsMenu?: () => void;
  customFilterChip: { label: string; value: string } | null;
  onRemoveCustomFilter: () => void;
  onClearAll: () => void;
  columnFilterStats?: Record<string, FilterStatsSlice>;
  requestOpenFilterId?: string | null;
  onRequestOpenHandled?: () => void;
}

export function AppliedStateChips({
  filters,
  configs,
  newestColumnId,
  onRemoveFilter,
  onChangeFilter,
  currentSort,
  columnLabels,
  onRemoveSort,
  hiddenColumnsCount,
  onResetColumns,
  onOpenColumnsMenu,
  customFilterChip,
  onRemoveCustomFilter,
  onClearAll,
  columnFilterStats,
  requestOpenFilterId,
  onRequestOpenHandled,
}: AppliedStateChipsProps) {
  const hasFilters = filters.length > 0;
  const hasSort = currentSort !== null;
  const hasHiddenColumns = hiddenColumnsCount > 0;
  const hasCustomFilter = customFilterChip !== null;

  if (!hasFilters && !hasSort && !hasHiddenColumns && !hasCustomFilter) return null;

  const sortDirectionLabel = currentSort?.direction === "asc" ? "\u2191" : "\u2193";
  const sortColumnLabel = currentSort
    ? (columnLabels[currentSort.columnId] ?? currentSort.columnId)
    : "";

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      <Button variant="secondary" onClick={onClearAll} className="shrink-0">
        <X size={14} />
        {DEFAULT_LABELS.clearAll}
      </Button>

      {hasHiddenColumns && (
        <FilterChip
          label={DEFAULT_LABELS.columns}
          value={DEFAULT_LABELS.hiddenCount(hiddenColumnsCount)}
          onRemove={onResetColumns}
          onClick={onOpenColumnsMenu}
          className="cursor-pointer"
        />
      )}

      {hasSort && (
        <FilterChip label={sortColumnLabel} value={sortDirectionLabel} onRemove={onRemoveSort} />
      )}

      {filters.map((filter) => {
        const filterConfig = configs[filter.columnId];
        if (!filterConfig) return null;
        const isEmpty = isFilterValueEmpty(filter.value);

        if (filterConfig.type === "compound") {
          return (
            <CompoundFilterPopover
              key={filter.columnId}
              config={filterConfig}
              filter={filter}
              onChange={(value) => onChangeFilter(filter.columnId, value)}
              onRemove={() => onRemoveFilter(filter.columnId)}
              initialOpen={filter.columnId === newestColumnId}
              chipClassName={isEmpty ? "border-dashed" : undefined}
              columnFilterStats={columnFilterStats}
              requestOpen={filter.columnId === requestOpenFilterId}
              onRequestOpenHandled={onRequestOpenHandled}
            />
          );
        }

        return (
          <ColumnFilterPopover
            key={filter.columnId}
            config={filterConfig}
            filter={filter}
            onChange={(value) => onChangeFilter(filter.columnId, value)}
            onRemove={() => onRemoveFilter(filter.columnId)}
            initialOpen={filter.columnId === newestColumnId}
            chipClassName={isEmpty ? "border-dashed" : undefined}
            stats={columnFilterStats?.[filter.columnId]}
            requestOpen={filter.columnId === requestOpenFilterId}
            onRequestOpenHandled={onRequestOpenHandled}
          />
        );
      })}

      {hasCustomFilter && (
        <FilterChip
          label={customFilterChip.label}
          value={customFilterChip.value}
          onRemove={onRemoveCustomFilter}
        />
      )}
    </div>
  );
}
