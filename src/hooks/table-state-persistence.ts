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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSorting(value: unknown): PersistedTableSorting | undefined {
  if (value === null) {
    return null;
  }
  if (!isPlainObject(value)) {
    return undefined;
  }
  const { columnId, direction } = value;
  if (typeof columnId !== "string") {
    return undefined;
  }
  if (direction !== "asc" && direction !== "desc") {
    return undefined;
  }
  return { columnId, direction };
}

function parseColumnFilters(value: unknown): ActiveFilter[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const filters: ActiveFilter[] = [];
  for (const item of value) {
    if (!isPlainObject(item) || typeof item.columnId !== "string" || !("value" in item)) {
      return undefined;
    }
    filters.push({ columnId: item.columnId, value: item.value as ActiveFilter["value"] });
  }
  return filters;
}

function parseColumnVisibility(value: unknown): VisibilityState | undefined {
  if (!isPlainObject(value)) {
    return undefined;
  }
  const out: VisibilityState = {};
  for (const [key, visible] of Object.entries(value)) {
    if (typeof visible !== "boolean") {
      return undefined;
    }
    out[key] = visible;
  }
  return out;
}

function parsePageSize(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }
  return value;
}

const FIELD_PARSERS: {
  [K in PersistedTableStateField]: (value: unknown) => PersistedTableState[K] | undefined;
} = {
  sorting: parseSorting,
  columnFilters: parseColumnFilters,
  columnVisibility: parseColumnVisibility,
  pageSize: parsePageSize,
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
  if (serialized === null || serialized === "") {
    return {};
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return {};
  }

  if (!isPlainObject(parsed) || typeof parsed.version !== "number") {
    return {};
  }

  if (parsed.version !== expectedVersion) {
    return {};
  }

  const state: PersistedTableState = {};

  for (const field of fields) {
    if (!(field in parsed)) {
      continue;
    }
    const parsedValue = FIELD_PARSERS[field](parsed[field]);
    if (parsedValue !== undefined) {
      state[field] = parsedValue;
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
    if (value !== undefined) {
      payload[field] = value;
    }
  }

  return JSON.stringify(payload);
}
