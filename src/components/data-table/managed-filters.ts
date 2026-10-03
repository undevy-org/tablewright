import type { ActiveFilter, ActiveFilterValue } from "./filter-types";

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

function isFilterValueEmpty(v: ActiveFilterValue | undefined): boolean {
  if (v === undefined) return true;
  if (Array.isArray(v)) return v.length === 0 || v.every((x) => x === "" || x == null);
  if (typeof v === "string") return v.length === 0;
  if (typeof v === "object" && v !== null) {
    return Object.values(v).every((x) => isFilterValueEmpty(x as ActiveFilterValue));
  }
  return false;
}

export function hasActiveManagedFilters(
  filters: ActiveFilter[],
  managedFieldIds: readonly string[],
): boolean {
  const managed = new Set(managedFieldIds);
  return filters.some((f) => managed.has(f.columnId) && !isFilterValueEmpty(f.value));
}
