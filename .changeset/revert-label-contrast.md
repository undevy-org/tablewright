---
"@undevy-org/tablewright": patch
---

Revert the text-colour changes that 0.6.0 made to filter popover section labels, the column header menu, sortable headers, the filter chip label and the combobox placeholder (they were not part of the a11y naming change). Contrast will be handled separately.
