---
"@undevy-org/tablewright": minor
---

Filter values: one shared `isFilterValueEmpty` replaces six local copies across the filter components, and typed readers (`getStringArray`, `getDateRange`, `getNumberRange`, `getCompoundValue`) replace the `as { from?: … }` casts. Both are exported for consumers' `filterRow`, along with the `DateRangeValue`, `NumberRangeValue` and `CompoundFilterValue` aliases (`ActiveFilterValue` is structurally unchanged).

Behavior is unchanged for well-formed values, with one fix: `AppliedStateChips` no longer shows a chip for a range whose bounds are all `undefined`. Malformed values (e.g. `[""]`, a date range with numeric bounds) are now treated as empty consistently everywhere.
