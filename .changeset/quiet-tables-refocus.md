---
"@undevy-org/tablewright": patch
---

`DataTableShell` now moves keyboard focus to the nearest surviving cell (or, without `keyboardNavigation`, the neighbouring header control) when the focused control disappears after a menu action such as "Hide column", sort or pin, instead of letting focus fall to the page.
