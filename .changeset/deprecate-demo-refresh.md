---
"@undevy-org/tablewright": patch
---

Deprecate the demo-only refresh API: `useTableOrchestration`'s `isRefreshing` / `handleRefresh` and the store's `isRefreshing` / `startRefresh` only spin for 700 ms without refetching anything. Keep refresh state in your data layer instead (e.g. your query's `isFetching`). They will be removed in a future minor release.
