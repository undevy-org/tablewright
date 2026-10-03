---
"@undevy-org/tablewright": patch
---

`useTableOrchestration`: filtered column stats now read `fieldName` (they previously used the column id, so `filtered` was `null` for columns with a custom `fieldName`). Page clamping, drawer-row closing and selection pruning no longer write to the store during render — the hook returns the corrected values and syncs the store after commit, fixing React's "Cannot update a component while rendering a different component" warning for other store subscribers.
