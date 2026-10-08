# @undevy-org/tablewright

## 0.7.10

### Patch Changes

- [#70](https://github.com/undevy-org/tablewright/pull/70) [`4226f41`](https://github.com/undevy-org/tablewright/commit/4226f4139b5b47a4153e25d6b209c9d30bb4873e) Thanks [@undevy](https://github.com/undevy)! - Fix SidebarAccountMenu theme radio focus highlight on checked items (WCAG 2.4.7).

## 0.7.9

### Patch Changes

- [#68](https://github.com/undevy-org/tablewright/pull/68) [`3746fc4`](https://github.com/undevy-org/tablewright/commit/3746fc4a7e517195f711814c682c2aa7ac1088bf) Thanks [@undevy](https://github.com/undevy)! - fix(SidebarAccountMenu): show keyboard focus on theme radio items

## 0.7.8

### Patch Changes

- [#66](https://github.com/undevy-org/tablewright/pull/66) [`85e3247`](https://github.com/undevy-org/tablewright/commit/85e32471226f35ff150264b23b5e273ade73346b) Thanks [@undevy](https://github.com/undevy)! - Fix SidebarAccountMenu dropdown header and theme keyboard accessibility.

## 0.7.7

### Patch Changes

- [#62](https://github.com/undevy-org/tablewright/pull/62) [`a9e5d0c`](https://github.com/undevy-org/tablewright/commit/a9e5d0cae4c823022b1ea5308e0e14fc0368599e) Thanks [@undevy](https://github.com/undevy)! - Refactor filter form apply merge helpers (behaviour unchanged); strengthen apply regression tests.

## 0.7.6

### Patch Changes

- [#59](https://github.com/undevy-org/tablewright/pull/59) [`8941976`](https://github.com/undevy-org/tablewright/commit/894197657b607f56fc7287d9e8e395761deda4f4) Thanks [@undevy](https://github.com/undevy)! - Fix FilterFormPanel Apply dropping compound filter keys hidden from the form or absent from subFilters (regression since 0.7.3).

## 0.7.5

### Patch Changes

- [#54](https://github.com/undevy-org/tablewright/pull/54) [`89e278b`](https://github.com/undevy-org/tablewright/commit/89e278b1b3b6bc7dcdfb5ea650033944786ec151) Thanks [@undevy](https://github.com/undevy)! - Fix inactive sidebar nav link color when switching to dark theme by limiting row transitions to background color only.

## 0.7.4

### Patch Changes

- [#52](https://github.com/undevy-org/tablewright/pull/52) [`1974da9`](https://github.com/undevy-org/tablewright/commit/1974da97fc640621a78741db0a6bac9c72521fe5) Thanks [@undevy](https://github.com/undevy)! - Fix `aria-required-children` on sidebar account dropdown by using Radix menu items and separators for the account header, theme row, and dividers.

## 0.7.3

### Patch Changes

- [#49](https://github.com/undevy-org/tablewright/pull/49) [`f0d6fa0`](https://github.com/undevy-org/tablewright/commit/f0d6fa02162bc8312ed6aee471dd0b539622b4d5) Thanks [@undevy](https://github.com/undevy)! - Guard `FilterFormPanel` against silently truncating multi-value text and enum filters on Apply; show a read-only summary and require clearing before single-value edit.

## 0.7.2

### Patch Changes

- [#47](https://github.com/undevy-org/tablewright/pull/47) [`9b50da8`](https://github.com/undevy-org/tablewright/commit/9b50da8acbf073139127181aba7d4be6cebfaeef) Thanks [@undevy](https://github.com/undevy)! - Fix FilterFormPanel enum fields treating empty-string option values as no selection.

## 0.7.1

### Patch Changes

- [#44](https://github.com/undevy-org/tablewright/pull/44) [`6ed4229`](https://github.com/undevy-org/tablewright/commit/6ed42292e1704179be60427a67b478cb4c901651) Thanks [@undevy](https://github.com/undevy)! - Fix accessible name on the icon-only action in the TopBar narrow truncation Storybook story.

## 0.7.0

### Minor Changes

- [#42](https://github.com/undevy-org/tablewright/pull/42) [`c7c1e1a`](https://github.com/undevy-org/tablewright/commit/c7c1e1a4f99ace5b3778fa339a30852c92b84268) Thanks [@undevy](https://github.com/undevy)! - text colour tokens retuned for WCAG AA contrast (light: secondary, tertiary, utility; dark: tertiary); visual change, no API change

## 0.6.1

### Patch Changes

- [#40](https://github.com/undevy-org/tablewright/pull/40) [`e193ff9`](https://github.com/undevy-org/tablewright/commit/e193ff99094443b5803f3508cbe867a9058cd23d) Thanks [@undevy](https://github.com/undevy)! - Revert the text-colour changes that 0.6.0 made to filter popover section labels, the column header menu, sortable headers, the filter chip label and the combobox placeholder (they were not part of the a11y naming change). Contrast will be handled separately.

## 0.6.0

### Minor Changes

- [#38](https://github.com/undevy-org/tablewright/pull/38) [`2dfb912`](https://github.com/undevy-org/tablewright/commit/2dfb912ad5ed453b430ae7b09a03984da2062563) Thanks [@undevy](https://github.com/undevy)! - Name popover dialogs from their trigger by default (`aria-labelledby`); add optional `RowActionsMenu.triggerAriaLabel`. Document and fix Select trigger accessible names at call sites (including table footer rows-per-page).

## 0.5.2

### Patch Changes

- [#36](https://github.com/undevy-org/tablewright/pull/36) [`2046d78`](https://github.com/undevy-org/tablewright/commit/2046d7812e05ba96b4ab72fc3b9ece3786c503ec) Thanks [@undevy](https://github.com/undevy)! - internal: inline a11y helpers; no behaviour change

## 0.5.1

### Patch Changes

- [#34](https://github.com/undevy-org/tablewright/pull/34) [`e438742`](https://github.com/undevy-org/tablewright/commit/e43874228da156e316060bf81cd5fbe6b4bb0f0f) Thanks [@undevy](https://github.com/undevy)! - Fix accessibility quick wins: collapsed sidebar link names, keyboard-focusable table/drawer scroll regions, and decorative avatar alt text.

## 0.5.0

### Minor Changes

- [#32](https://github.com/undevy-org/tablewright/pull/32) [`7e495bb`](https://github.com/undevy-org/tablewright/commit/7e495bb5aafb6b4cacfafb6416be30c2c94e6755) Thanks [@undevy](https://github.com/undevy)! - Add optional `labels` props and exported `*Labels` types for filter UI components (`ColumnFilterPopover`, `CompoundFilterPopover`, `AppliedStateChips`, `FilterPopoverFooter`, `FilterFormPanel`) so consumers can localize strings without forking components.

## 0.4.0

### Minor Changes

- [#28](https://github.com/undevy-org/tablewright/pull/28) [`24a259b`](https://github.com/undevy-org/tablewright/commit/24a259b2015c693cbdc7464ad59c5aa9fd559c9c) Thanks [@undevy](https://github.com/undevy)! - **Breaking:** remove the demo-only refresh API deprecated in 0.2.1 — `useTableOrchestration`'s `isRefreshing` / `handleRefresh` and the store's `isRefreshing` / `startRefresh`. They only spun for 700 ms and refetched nothing. Keep refresh state in your data layer (e.g. your query's `isFetching`) and drive the Refresh button from it.

## 0.3.0

### Minor Changes

- [#26](https://github.com/undevy-org/tablewright/pull/26) [`e8115df`](https://github.com/undevy-org/tablewright/commit/e8115df30cdc578b98748b329e96aa0c7a70ee2e) Thanks [@undevy](https://github.com/undevy)! - Export `gapColumnId(afterColumnId)`: the id of the gap indicator column that `useTableOrchestration` uses in `extendedColumnMeta` / `extendedWidths`. Use it when defining gap columns instead of rebuilding the `__gap_after_…` string by hand.

## 0.2.2

### Patch Changes

- [#24](https://github.com/undevy-org/tablewright/pull/24) [`4ec6765`](https://github.com/undevy-org/tablewright/commit/4ec6765ef7119bc9f0d4f0c3a8544ae53e1f7403) Thanks [@undevy](https://github.com/undevy)! - Internal: `useTableOrchestration` is split into focused internal hooks (responsive columns, filtered rows, filter stats, column gaps, bound actions). No API or behavior change.

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
