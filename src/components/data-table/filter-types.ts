export type ColumnFilterType = "text" | "enum" | "date" | "number-range" | "compound";

export interface CompoundSubFilter {
  key: string;
  type: "text" | "number-range" | "enum";
  label: string;
  badge?: string;
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

export type ActiveFilterValue =
  | string
  | string[]
  | { from?: string; to?: string }
  | { from?: number; to?: number }
  | { [key: string]: ActiveFilterValue };

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
