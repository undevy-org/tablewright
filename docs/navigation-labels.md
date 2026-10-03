# Sidebar navigation labels — why only four changed

The sidebar (`src/components/layout/Sidebar.tsx`, fixture data in `.stories.tsx`) lists 28 navigation items. Task 6 of the pages port (2026-08-18) needed four of them to match vocabulary the ported Merchants/Transactions pages actually use, and renamed:

- `Requisite Pool` → `Payout Accounts`
- `Widget Requisite Ban` → `Widget Account Ban`
- `Scoring Ban Requisites` → `Scoring Ban Accounts`
- `Merchant Balance Deposit` → `Balance Top-Up`

The remaining 24 items were left as-is.

**This is a deliberate scope decision, not a partial migration.** The sidebar is shared chrome across the whole admin surface this library demonstrates — most of its items belong to areas the two ported pages don't touch (fees, routing rules, antifraud, settings, and so on) and have no reason to change vocabulary just because two specific pages were added. Renaming all 28 to chase a "replace the whole IA" reading of the port would have meant inventing labels for areas with no corresponding ported screen to justify them, which is worse than leaving established generic admin vocabulary alone. The four that did change were the ones where the ported page content and the sidebar label would otherwise visibly disagree (e.g. a page calling something "Payout Accounts" while the sidebar still said "Requisite Pool" next to it).

Verified 2026-08-19 (Task 7): re-checked against the current `Sidebar.stories.tsx` fixture and both page stories — the four renamed labels are consistent between sidebar and page content, and no other sidebar item is referenced by name from either page in a way that would create the same mismatch.
