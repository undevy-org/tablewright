---
"@undevy-org/tablewright": patch
---

Filters: `FilterFormPanel` now stores compound sub-filter values under `sub.key` (it used `sub.field`), matching `CompoundFilterPopover`, column stats and `hiddenSubFilterKeys` — with `key !== field` the form and the chip popover no longer lose each other's values. If your `filterRow` read form-set compound values by `field`, read them by `key`. `ColumnFilterPopover` and `CompoundFilterPopover` now re-seed their drafts when the committed value changes while closed (filter form, preset, clear all), instead of reopening on a stale value.
