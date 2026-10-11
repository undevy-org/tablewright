import type { VisibilityState } from "@tanstack/react-table";

import type { ActiveFilter } from "../components/data-table/filter-types";

export type PersistedTableStateField =
  | "sorting"
  | "columnFilters"
  | "columnVisibility"
  | "pageSize";

export type PersistedTableSorting = {
  columnId: string;
  direction: "asc" | "desc";
} | null;

export type PersistedTableState = {
  sorting?: PersistedTableSorting;
  columnFilters?: ActiveFilter[];
  columnVisibility?: VisibilityState;
  pageSize?: number;
};

type SerializedPayload = {
  version: number;
  sorting?: PersistedTableSorting;
  columnFilters?: ActiveFilter[];
  columnVisibility?: VisibilityState;
  pageSize?: number;
};

/**
 * Parse a versioned JSON blob into a partial table state. Only keys listed in `fields` are returned.
 * Returns `{}` when JSON is invalid, `version` is missing, or stored `version` ≠ `expectedVersion`.
 */
export function deserializePersistedTableState(
  serialized: string | null,
  expectedVersion: number,
  fields: readonly PersistedTableStateField[],
): PersistedTableState {
  if (!serialized) {
    return {};
  }

  let root: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    root = parsed as Record<string, unknown>;
  } catch {
    return {};
  }

  if (typeof root.version !== "number" || root.version !== expectedVersion) {
    return {};
  }

  const state: PersistedTableState = {};

  for (const field of fields) {
    if (!Object.hasOwn(root, field)) {
      continue;
    }
    const raw = root[field];

    if (field === "sorting") {
      if (raw === null) {
        state.sorting = null;
        continue;
      }
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        continue;
      }
      const { columnId, direction } = raw as Record<string, unknown>;
      if (typeof columnId !== "string") {
        continue;
      }
      if (direction !== "asc" && direction !== "desc") {
        continue;
      }
      state.sorting = { columnId, direction };
      continue;
    }

    if (field === "columnFilters") {
      if (!Array.isArray(raw)) {
        continue;
      }
      const filters: ActiveFilter[] = [];
      let valid = true;
      for (const item of raw) {
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          valid = false;
          break;
        }
        const record = item as Record<string, unknown>;
        if (typeof record.columnId !== "string" || !("value" in record)) {
          valid = false;
          break;
        }
        filters.push({
          columnId: record.columnId,
          value: record.value as ActiveFilter["value"],
        });
      }
      if (valid) {
        state.columnFilters = filters;
      }
      continue;
    }

    if (field === "columnVisibility") {
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        continue;
      }
      const out: VisibilityState = {};
      let valid = true;
      for (const [key, visible] of Object.entries(raw)) {
        if (typeof visible !== "boolean") {
          valid = false;
          break;
        }
        out[key] = visible;
      }
      if (valid) {
        state.columnVisibility = out;
      }
      continue;
    }

    if (field === "pageSize") {
      if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
        continue;
      }
      state.pageSize = raw;
    }
  }

  return state;
}

/**
 * Serialize a partial table state into versioned JSON. Only keys listed in `fields` are written.
 */
export function serializePersistedTableState(
  state: PersistedTableState,
  version: number,
  fields: readonly PersistedTableStateField[],
): string {
  const payload: SerializedPayload = { version };

  for (const field of fields) {
    if (field === "sorting") {
      if (state.sorting !== undefined) {
        payload.sorting = state.sorting;
      }
      continue;
    }
    if (field === "columnFilters") {
      if (state.columnFilters !== undefined) {
        payload.columnFilters = state.columnFilters;
      }
      continue;
    }
    if (field === "columnVisibility") {
      if (state.columnVisibility !== undefined) {
        payload.columnVisibility = state.columnVisibility;
      }
      continue;
    }
    if (field === "pageSize" && state.pageSize !== undefined) {
      payload.pageSize = state.pageSize;
    }
  }

  return JSON.stringify(payload);
}
