import type {
  ActiveFilterValue,
  CompoundFilterValue,
  DateRangeValue,
  NumberRangeValue,
} from "./filter-types";

// `ActiveFilterValue` is an untagged union, so the stored value carries no
// marker of its filter type. These readers take the shape a filter type
// expects and fall back to an empty value for any other shape.

function isObjectValue(
  value: ActiveFilterValue | undefined,
): value is DateRangeValue | NumberRangeValue | CompoundFilterValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Read a text/enum filter value. Non-array values read as `[]`. */
export function getStringArray(value: ActiveFilterValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}

/** Read a date filter value. Non-string bounds are dropped. */
export function getDateRange(value: ActiveFilterValue | undefined): DateRangeValue {
  const range: DateRangeValue = {};
  if (!isObjectValue(value)) return range;
  if (typeof value.from === "string") range.from = value.from;
  if (typeof value.to === "string") range.to = value.to;
  return range;
}

/** Read a number-range filter value. Non-number bounds are dropped. */
export function getNumberRange(value: ActiveFilterValue | undefined): NumberRangeValue {
  const range: NumberRangeValue = {};
  if (!isObjectValue(value)) return range;
  if (typeof value.from === "number") range.from = value.from;
  if (typeof value.to === "number") range.to = value.to;
  return range;
}

/** Read a compound filter value (sub-filter key → value). Non-objects read as `{}`. */
export function getCompoundValue(value: ActiveFilterValue | undefined): CompoundFilterValue {
  // A range object is indistinguishable from a compound one at runtime; callers
  // only use this for `compound` filters.
  return isObjectValue(value) ? (value as CompoundFilterValue) : {};
}

/**
 * True when a filter value constrains nothing: `undefined`, `""`, `[]`, or an
 * object whose every entry is itself empty (so `{}`, `{ from: undefined }` and
 * `{ sub: [] }` are empty; `{ from: 0 }` is not). `[""]` is not empty — `""`
 * can be a real enum option value.
 */
export function isFilterValueEmpty(value: ActiveFilterValue | undefined): boolean {
  // `null` is outside the type but can arrive from deserialized state.
  if (value === undefined || value === null) return true;
  if (typeof value === "string") return value.length === 0;
  if (Array.isArray(value)) return value.length === 0;
  return Object.values(value).every((x) => typeof x !== "number" && isFilterValueEmpty(x));
}
