import type { VisibilityState } from "@tanstack/react-table";

import type {
  ActiveFilter,
  ActiveFilterValue,
  CompoundFilterValue,
  DateRangeValue,
  NumberRangeValue,
} from "../components/data-table/filter-types";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSorting(value: unknown): PersistedTableSorting | undefined {
  if (value === null) {
    return null;
  }
  if (!isRecord(value)) {
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

function parseActiveFilterValue(value: unknown): ActiveFilterValue | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    if (value.every((element) => typeof element === "string")) {
      return value;
    }
    return undefined;
  }
  if (!isRecord(value)) {
    return undefined;
  }

  const keys = Object.keys(value);

  const onlyFromTo = keys.every((key) => key === "from" || key === "to");
  if (onlyFromTo) {
    let sawDateBound = false;
    let sawNumberBound = false;
    const numberRange: NumberRangeValue = {};
    const dateRange: DateRangeValue = {};

    for (const key of ["from", "to"] as const) {
      if (!(key in value)) {
        continue;
      }
      const bound = value[key];
      if (typeof bound === "string") {
        if (sawNumberBound) {
          return undefined;
        }
        sawDateBound = true;
        dateRange[key] = bound;
        continue;
      }
      if (!Number.isFinite(bound)) {
        return undefined;
      }
      if (sawDateBound) {
        return undefined;
      }
      sawNumberBound = true;
      numberRange[key] = bound as number;
    }

    return sawNumberBound ? numberRange : sawDateBound ? dateRange : {};
  }

  const compound: CompoundFilterValue = {};
  for (const key of keys) {
    const nested = parseActiveFilterValue(value[key]);
    if (nested === undefined) {
      return undefined;
    }
    compound[key] = nested;
  }
  return compound;
}

function parseColumnFilters(value: unknown): ActiveFilter[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }
  const filters: ActiveFilter[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.columnId !== "string" || !("value" in item)) {
      return undefined;
    }
    const parsedValue = parseActiveFilterValue(item.value);
    if (parsedValue === undefined) {
      return undefined;
    }
    filters.push({ columnId: item.columnId, value: parsedValue });
  }
  return filters;
}

function parseColumnVisibility(value: unknown): VisibilityState | undefined {
  if (!isRecord(value)) {
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

  if (!isRecord(parsed) || typeof parsed.version !== "number") {
    return {};
  }

  if (parsed.version !== expectedVersion) {
    return {};
  }

  const state: PersistedTableState = {};

  if (fields.includes("sorting") && "sorting" in parsed) {
    const sorting = parseSorting(parsed.sorting);
    if (sorting !== undefined) {
      state.sorting = sorting;
    }
  }

  if (fields.includes("columnFilters") && "columnFilters" in parsed) {
    const columnFilters = parseColumnFilters(parsed.columnFilters);
    if (columnFilters !== undefined) {
      state.columnFilters = columnFilters;
    }
  }

  if (fields.includes("columnVisibility") && "columnVisibility" in parsed) {
    const columnVisibility = parseColumnVisibility(parsed.columnVisibility);
    if (columnVisibility !== undefined) {
      state.columnVisibility = columnVisibility;
    }
  }

  if (fields.includes("pageSize") && "pageSize" in parsed) {
    const pageSize = parsePageSize(parsed.pageSize);
    if (pageSize !== undefined) {
      state.pageSize = pageSize;
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

  if (fields.includes("sorting") && state.sorting !== undefined) {
    payload.sorting = state.sorting;
  }
  if (fields.includes("columnFilters") && state.columnFilters !== undefined) {
    payload.columnFilters = state.columnFilters;
  }
  if (fields.includes("columnVisibility") && state.columnVisibility !== undefined) {
    payload.columnVisibility = state.columnVisibility;
  }
  if (fields.includes("pageSize") && state.pageSize !== undefined) {
    payload.pageSize = state.pageSize;
  }

  return JSON.stringify(payload);
}
