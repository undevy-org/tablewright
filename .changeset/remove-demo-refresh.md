---
"@undevy-org/tablewright": minor
---

**Breaking:** remove the demo-only refresh API deprecated in 0.2.1 — `useTableOrchestration`'s `isRefreshing` / `handleRefresh` and the store's `isRefreshing` / `startRefresh`. They only spun for 700 ms and refetched nothing. Keep refresh state in your data layer (e.g. your query's `isFetching`) and drive the Refresh button from it.
