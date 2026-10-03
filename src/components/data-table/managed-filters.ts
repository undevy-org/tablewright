import type { ActiveFilter, ActiveFilterValue } from "./filter-types";
import { isFilterValueEmpty } from "./filter-values";

export type ManagedFilterChange =
  | { columnId: string; action: "set"; value: ActiveFilterValue }
  | { columnId: string; action: "remove" };

interface OrchSlice {
  columnFilters: ActiveFilter[];
  handleSetColumnFilter: (columnId: string, value: ActiveFilterValue) => void;
  handleRemoveColumnFilter: (columnId: string) => void;
}

export function applyManagedChanges(orch: OrchSlice, changes: ManagedFilterChange[]): void {
  const activeIds = new Set(orch.columnFilters.map((f) => f.columnId));
  for (const change of changes) {
    if (change.action === "remove") {
      if (activeIds.has(change.columnId)) orch.handleRemoveColumnFilter(change.columnId);
      continue;
    }
    orch.handleSetColumnFilter(change.columnId, change.value);
  }
}

export function clearManagedFilters(orch: OrchSlice, managedColumnIds: string[]): void {
  const activeIds = new Set(orch.columnFilters.map((f) => f.columnId));
  for (const id of managedColumnIds) {
    if (activeIds.has(id)) orch.handleRemoveColumnFilter(id);
  }
}


export function hasActiveManagedFilters(
  filters: ActiveFilter[],
  managedFieldIds: readonly string[],
): boolean {
  const managed = new Set(managedFieldIds);
  return filters.some((f) => managed.has(f.columnId) && !isFilterValueEmpty(f.value));
}
