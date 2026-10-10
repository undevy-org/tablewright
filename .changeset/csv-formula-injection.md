---
"@undevy-org/tablewright": patch
---

Security: CSV export prefixes formula-triggering cell values by default so spreadsheet apps do not evaluate them. Set `escapeFormulas: false` on `exportTableToCsv` to restore the previous output.
