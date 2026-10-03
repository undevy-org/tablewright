# @undevy-org/tablewright

## 0.2.1

### Patch Changes

- [#22](https://github.com/undevy-org/tablewright/pull/22) [`9c55218`](https://github.com/undevy-org/tablewright/commit/9c55218e35ca3e460947ee1fcf3b407999bb8d6a) Thanks [@undevy](https://github.com/undevy)! - Deprecate the demo-only refresh API: `useTableOrchestration`'s `isRefreshing` / `handleRefresh` and the store's `isRefreshing` / `startRefresh` only spin for 700 ms without refetching anything. Keep refresh state in your data layer instead (e.g. your query's `isFetching`). They will be removed in a future minor release.

## 0.2.0

### Minor Changes

- [#19](https://github.com/undevy-org/tablewright/pull/19) [`c8d054c`](https://github.com/undevy-org/tablewright/commit/c8d054c40afef3f01a8ffe65c4b1f33d656336d1) Thanks [@undevy](https://github.com/undevy)! - Filter values: one shared `isFilterValueEmpty` replaces six local copies across the filter components, and typed readers (`getStringArray`, `getDateRange`, `getNumberRange`, `getCompoundValue`) replace the `as { from?: … }` casts. Both are exported for consumers' `filterRow`, along with the `DateRangeValue`, `NumberRangeValue` and `CompoundFilterValue` aliases (`ActiveFilterValue` is structurally unchanged).

  Behavior is unchanged for well-formed values, with one fix: `AppliedStateChips` no longer shows a chip for a range whose bounds are all `undefined`. Malformed values (e.g. a date range with numeric bounds, `null`) are now treated as empty consistently everywhere instead of throwing or disagreeing between components. `[""]` counts as non-empty everywhere (an enum option may have the value `""`); `FilterFormPanel` previously treated it as empty.

### Patch Changes

- [#20](https://github.com/undevy-org/tablewright/pull/20) [`01b9e56`](https://github.com/undevy-org/tablewright/commit/01b9e5662d3df976fb81ecc49fc0f42304713906) Thanks [@undevy](https://github.com/undevy)! - Filters: `FilterFormPanel` now stores compound sub-filter values under `sub.key` (it used `sub.field`), matching `CompoundFilterPopover`, column stats and `hiddenSubFilterKeys` — with `key !== field` the form and the chip popover no longer lose each other's values. If your `filterRow` read form-set compound values by `field`, read them by `key`. `ColumnFilterPopover` and `CompoundFilterPopover` now re-seed their drafts when the committed value changes while closed (filter form, preset, clear all), instead of reopening on a stale value.

- [#18](https://github.com/undevy-org/tablewright/pull/18) [`d5baf9e`](https://github.com/undevy-org/tablewright/commit/d5baf9e0706216c28afe5a0a53fdea7a3a79084a) Thanks [@undevy](https://github.com/undevy)! - `useTableOrchestration`: filtered column stats now read `fieldName` (they previously used the column id, so `filtered` was `null` for columns with a custom `fieldName`). Page clamping, drawer-row closing and selection pruning no longer write to the store during render — the hook returns the corrected values and syncs the store after commit, fixing React's "Cannot update a component while rendering a different component" warning for other store subscribers.

## 0.1.1

### Patch Changes

- [#2](https://github.com/undevy-org/tablewright/pull/2) [`b9cffb2`](https://github.com/undevy-org/tablewright/commit/b9cffb2fe9c3911dd06adeaba12f98c1940670fc) Thanks [@undevy](https://github.com/undevy)! - Publish through the automated release pipeline (npm trusted publishing with provenance).
