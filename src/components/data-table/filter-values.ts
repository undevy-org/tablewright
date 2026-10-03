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
  return typeof value === "object" && !Array.isArray(value);
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

/** Read a compound filter value (sub-filter field → value). Non-objects read as `{}`. */
export function getCompoundValue(value: ActiveFilterValue | undefined): CompoundFilterValue {
  // A range object is indistinguishable from a compound one at runtime; callers
  // only use this for `compound` filters.
  return isObjectValue(value) ? (value as CompoundFilterValue) : {};
}

/**
 * True when a filter value constrains nothing: `undefined`, `""`, an array of
 * only empty strings, or an object whose every entry is itself empty (so
 * `{}`, `{ from: undefined }` and `{ sub: [] }` are empty; `{ from: 0 }` is not).
 */
export function isFilterValueEmpty(value: ActiveFilterValue | undefined): boolean {
  if (value === undefined) return true;
  if (typeof value === "string") return value.length === 0;
  if (Array.isArray(value)) return value.every((x) => x === "" || x == null);
  return Object.values(value).every((x) => typeof x !== "number" && isFilterValueEmpty(x));
}
