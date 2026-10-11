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

function readFieldValue(
  field: PersistedTableStateField,
  raw: unknown,
): PersistedTableState[PersistedTableStateField] | undefined {
  switch (field) {
    case "sorting": {
      if (raw === null) {
        return null;
      }
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        return undefined;
      }
      const { columnId, direction } = raw as Record<string, unknown>;
      if (typeof columnId !== "string") {
        return undefined;
      }
      if (direction !== "asc" && direction !== "desc") {
        return undefined;
      }
      return { columnId, direction };
    }
    case "columnFilters": {
      if (!Array.isArray(raw)) {
        return undefined;
      }
      const filters: ActiveFilter[] = [];
      for (const item of raw) {
        if (typeof item !== "object" || item === null || Array.isArray(item)) {
          return undefined;
        }
        const record = item as Record<string, unknown>;
        if (typeof record.columnId !== "string" || !("value" in record)) {
          return undefined;
        }
        filters.push({
          columnId: record.columnId,
          value: record.value as ActiveFilter["value"],
        });
      }
      return filters;
    }
    case "columnVisibility": {
      if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
        return undefined;
      }
      const out: VisibilityState = {};
      for (const [key, visible] of Object.entries(raw)) {
        if (typeof visible !== "boolean") {
          return undefined;
        }
        out[key] = visible;
      }
      return out;
    }
    case "pageSize": {
      if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) {
        return undefined;
      }
      return raw;
    }
    default:
      return undefined;
  }
}

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

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return {};
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return {};
  }

  const root = parsed as Record<string, unknown>;
  if (typeof root.version !== "number" || root.version !== expectedVersion) {
    return {};
  }

  const state: PersistedTableState = {};

  for (const field of fields) {
    if (!Object.hasOwn(root, field)) {
      continue;
    }
    const value = readFieldValue(field, root[field]);
    if (value !== undefined) {
      state[field] = value;
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
    const value = state[field];
    if (value === undefined) {
      continue;
    }
    payload[field] = value;
  }

  return JSON.stringify(payload);
}
