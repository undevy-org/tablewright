export type ColumnFilterType = "text" | "enum" | "date" | "number-range" | "compound";

export interface CompoundSubFilter {
  /** Sub-filter id: the key of its value inside the compound filter value. */
  key: string;
  type: "text" | "number-range" | "enum";
  label: string;
  badge?: string;
  /** Row field the sub-filter reads (used for column stats). */
  field: string;
  options?: { label: string; value: string }[];
}

export interface ColumnFilterConfig {
  type: ColumnFilterType;
  label: string;
  fieldName?: string;
  options?: { label: string; value: string }[];
  subFilters?: CompoundSubFilter[];
}

export type DateRangeValue = { from?: string; to?: string };
export type NumberRangeValue = { from?: number; to?: number };
/** Compound filter value: sub-filter `key` → that sub-filter's value. */
export type CompoundFilterValue = { [key: string]: ActiveFilterValue };

/**
 * Stored filter payload for one column. Text and enum filters are usually `string[]`
 * (one element for a single selection; multiple for popover/chip multi-select).
 *
 * `FilterFormPanel` edits at most one string per text/enum field (and per compound
 * sub-filter of those types). Multi-value text/enum filters are edited via column
 * filter chips and `ColumnFilterPopover`, not the form panel.
 */
export type ActiveFilterValue =
  | string
  | string[]
  | DateRangeValue
  | NumberRangeValue
  | CompoundFilterValue;

export interface ActiveFilter {
  columnId: string;
  value: ActiveFilterValue;
}

export type FilterColumnStats =
  | { type: "number-range"; min: number; max: number }
  | { type: "text"; samples: string[]; totalUnique: number }
  | { type: "date"; min: string; max: string }
  | { type: "enum"; counts: Record<string, number> };

export interface FilterStatsSlice {
  all: FilterColumnStats;
  filtered: FilterColumnStats | null;
}

// ── Column groups & gap indicators ─────────────────────────────────────

export interface ColumnGroup {
  key: string;
  label: string;
  columnIds: string[];
}

export interface ColumnGap {
  afterColumnId: string | null; // null = gap at the start (before first visible column)
  hiddenIds: string[]; // columns hidden in this gap
}

// ── View preset (generic) ──────────────────────────────────────────────

export interface ViewPreset<TRow, TViewKey extends string> {
  key: TViewKey;
  label: string;
  filters: ActiveFilter[];
  sort: { columnId: string; direction: "asc" | "desc" } | null;
  columnVisibility?: Record<string, boolean>;
  customFilter?: (row: TRow) => boolean;
  customFilterChip?: { label: string; value: string };
}
