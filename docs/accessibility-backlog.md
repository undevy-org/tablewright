# Accessibility backlog

Known accessibility defects in this library, with locations and remedies. Everything here was found by an audit of the built Storybook — `axe-core` via `@storybook/addon-a11y`, plus reading the rendered DOM — not by static review. Resolved defects are under **Fixed** below; **Open items** are still queued.

This file exists because shipping a component library with an accessibility addon installed makes a claim. Leaving that claim undocumented would be worse than the defects themselves: a reader opening the a11y panel deserves to know which findings are understood and queued, and which are noise the tooling produces on every project.

## Read this first: the panel will never be empty

`axe` reports `aria-hidden-focus` on Radix's `data-radix-focus-guard` spans whenever a Dialog, DropdownMenu, Popover or Select is open. These are Radix's own focus-trap sentinels. `axe` cannot statically verify that a focus trap behaves correctly, so it flags the guards on principle. **This is not a defect and there is nothing to fix** — it is inherent to building on Radix primitives, and it appears in every design system that does.

`axe` also returns `color-contrast` as *inconclusive* on every icon-only control, with "element content contains only non-text characters". It cannot compute contrast for a glyph. Also not a defect.

Discount both before reading any a11y report on this library.

## Fixed during the pages port (2026-08-19)

Task 6 added roughly 25 new components and two composed pages; `axe` had never run against them until Task 7's verification pass. Three defects were found and fixed on the spot because each was a small, self-contained, semantics-only change with no visible or behavioural side effect:

- **`FilterFormPanel.tsx`** used `<header>` for the "Filters" row inside the panel. Nested inside ordinary content, a bare `<header>` still computes as a second `banner` landmark, so the page carried two banners (`landmark-no-duplicate-banner`). Changed the tag to `<div>` — the row was never a page banner, just a heading-and-close-button strip.
- **`DrawerShell.tsx`** always rendered `<h2>{title}</h2>` in its header, even when `title` is empty — which it is on both new pages while the drawer is mounted but no row is selected, since the drawer stays in the DOM (not `display:none`, not `aria-hidden`) so it can animate open. That produced a reachable, empty heading (`empty-heading`). The `<h2>` now only renders when `title` is truthy.
- **`Sidebar.tsx`**'s `<aside>` and `DrawerShell.tsx`'s `<aside>` both lacked an `aria-label`. Composed together for the first time on the two page stories, two unlabelled `complementary` landmarks coexist, which is indistinguishable to assistive tech (`landmark-unique`). Added `aria-label="Primary navigation"` and `aria-label="Details panel"` respectively.

Re-verified: full 136-story corpus (both themes) re-ran clean after the changes, and re-running `axe` against `pages-merchants--default` / `pages-transactions--default` confirms all three finding types are gone with no new ones introduced.

## Fixed (2026-10-05)

### Text colour tokens — WCAG AA contrast on surfaces

**Fix:** Retuned light `--text-secondary`, `--text-tertiary`, `--text-utility` and dark `--text-tertiary` in `src/css/tokens.css` (values only; hierarchy unchanged).

**Measured (token pairs in `tokens.test.ts`):** light minimum 4.62:1 (`--text-utility` on `--bg-tertiary`); dark minimum 4.61:1 (`--text-tertiary` on `--bg-tertiary`).

**Verified:** `tokens.css text on surface contrast` (`src/css/tokens.test.ts`); `story-diff --axe` — `color-contrast` 936 → 0, total axe violations 984 → 48 (other rules unchanged).

### 8. `--text-tertiary` fails AA against white

**Fix (release 0.7.0, PR #42):** same token retune as above — light `--text-tertiary` (and related text tokens) in `src/css/tokens.css`; addresses the ID column, Design Tokens demo, sidebar section labels, and account-switcher role caption instances called out in the original audit.

**Verified:** `pnpm test src/css/tokens.test.ts` (contrast pairs for text on `--bg-primary` / `--bg-secondary` / `--bg-tertiary` in light and dark); `story-diff --axe` — `color-contrast` 936 → 0, total axe violations 984 → 48 (other rules unchanged).

### 11. TopBar narrow story icon button has no accessible name

**Fix:** `aria-label="Add"` on the icon-only action button in `NarrowWithTruncation` (`TopBar.stories.tsx`).

**Verified:** `story-diff --axe` — `button-name` under axe fixed on `layout-topbar--narrow-with-truncation`; `topbar-narrow-a11y.test.tsx` — "names the icon-only action in NarrowWithTruncation".

## Fixed (2026-10-04)

### 1. Dialog's Default story has unlabelled inputs

**Fix:** `id` / `htmlFor` pairs on the Default story's Name and Username fields (`dialog.stories.tsx`).

**Verified:** `story-diff --axe` — `label` under axe fixed on `ui-dialog` (with `--interact pages-,ui-dialog`); no new violations.

### 2. Collapsed sidebar navigation links have no accessible name

**Fix:** `aria-label={item.label}` on nav anchors when collapsed (`Sidebar.tsx`); Dashboard fixture `href` set to `/dashboard` (`Sidebar.stories.tsx`).

**Verified:** `story-diff --axe` — `link-name` under axe fixed on `layout-sidebar--collapsed`; `a11y-quick-wins.test.tsx` — "gives collapsed sidebar nav links an accessible name".

### 5. Two scroll regions are unreachable by keyboard

**Fix:** `tabIndex={0}` on `DrawerShell` body scroll container and `TableLayout.ScrollArea`.

**Verified:** `story-diff --axe` — `scrollable-region-focusable` under axe fixed on DrawerShell / TableLayout stories; `a11y-quick-wins.test.tsx` — drawer and table layout scroll region tests.

### 6. Avatar `alt` text duplicates the adjacent visible name

**Fix:** `alt=""` when the name is visible beside the image; keep `alt={name}` when collapsed/icon-only (`SidebarUser.tsx`, `SidebarAccountMenu.tsx` trigger + menu header).

**Verified:** `story-diff --axe` — `image-redundant-alt` under axe fixed on SidebarUser / SidebarAccountMenu stories; `a11y-quick-wins.test.tsx` (SidebarUser and SidebarAccountMenu expanded, collapsed, and menu panel cases).

### 3. Popover content is an unnamed dialog

**Fix:** `Popover` shares a `useId` with `PopoverTrigger`; `PopoverContent` sets `aria-labelledby` to the trigger id when the consumer passes neither `aria-label` nor `aria-labelledby` and a trigger is mounted (`popover.tsx`). `RowActionsMenu` adds optional `triggerAriaLabel` (default `"Row actions"`).

**Verified:** `story-diff --axe` — `aria-dialog-name` under axe fixed on popover-bearing stories (with `--interact` covering popover, select, and row-actions stories); `popover.test.tsx` — "labels content by its trigger by default", "uses an explicit aria-label on content instead of the trigger id", "keeps an explicit aria-labelledby on content", "does not set aria-labelledby when opened from an anchor without a trigger"; `RowActionsMenu.test.tsx` — `triggerAriaLabel` and default name tests.

### 4. `Select` triggers have no accessible name

**Fix:** Call-site labelling — `TableFooter` associates the page-size trigger with "Rows per page" via `aria-labelledby`; Storybook `ui/select` stories and page fixture selects use `aria-label` (or equivalent); `SelectTrigger` JSDoc documents the requirement.

**Verified:** `story-diff --axe` — Select-caused `button-name` under axe fixed (with `--interact` covering page, `ui-select`, and datatable footer/shell stories); `TableFooter.test.tsx` — 'names the rows-per-page select "Rows per page"'.

## Fixed (2026-10-06)

### 9. Merchants page resource tabs — `aria-controls` without matching panels

**Fix:** Wrapped each resource tab panel in `TabsContent` inside the same `Tabs` root as the strip (`MerchantsLiveRefactoredScreen.tsx`), matching the Transaction drawer tabs pattern.

**Verified:** `MerchantsLiveRefactoredScreen.test.tsx` — aria-controls id exists for each tab trigger; resource tab switching shows reports/summary panels; `story-diff --axe` — `aria-valid-attr-value` under axe fixed on `pages-merchants--default`, total axe violations 47 → 44, 0 new violations.

### Sidebar account menu — invalid children inside `role="menu"`

**Fix:** Account header, theme row, and dividers in `SidebarAccountMenu.tsx` now use `DropdownMenuItem` / `DropdownMenuSeparator` (Radix menu primitives) instead of plain `div` blocks; `DropdownMenuLabel` and `DropdownMenuSeparator` exported from `dropdown-menu.tsx`.

**Verified:** `SidebarAccountMenu.test.tsx` — direct children of the open menu are only `menuitem` and `separator`; `story-diff --axe` — `aria-required-children` under axe fixed on `pages-merchants--default` and `pages-transactions--default`, total axe violations 44 → 42, 0 new violations.

### 7. Design Tokens page prints light-theme values in dark mode

**Fix:** `displayTokenValue` in `src/design-tokens-display.ts` selects `modes.dark` when Storybook's theme toolbar is dark; a story decorator passes `globals.theme` into context so captions update on toggle.

**Repro (before fix):** `STORYBOOK_BASE_PATH=/ pnpm exec storybook build -o storybook-static --quiet`, then Playwright on `design-tokens--tokens` with `globals=theme:dark` — `text-secondary` caption was `#6b7280` while `--text-secondary` on `documentElement` was `#cbd5e1`.

**Verified:** `pnpm test src/DesignTokens.test.ts`; post-build harness on `design-tokens--tokens` with `globals=theme:dark` — `text-secondary` caption `#cbd5e1` matches resolved `--text-secondary`; `story-diff --axe` with `allow-diff: design-tokens--tokens, design-tokens--docs`.

### 10. Sidebar nav-item text stays at its light-theme color in dark mode

`src/components/layout/Sidebar.tsx` — inactive nav links, class `text-[var(--text-secondary)]`.

**Diagnosis:** On the pre-fix build, inactive nav links used `transition-colors` (150 ms). The defect reproduces with a synchronous `getComputedStyle(a).color` read immediately after a theme switch: mid-transition RGB values (`rgb(74,81,96)` → `rgb(133,141,155)` → `rgb(193,203,215)` → settled `rgb(203,213,225)` before 250 ms. Not a stale token or cascade bug.

**Fix (release 0.7.5, PR #54):** `transition-[background-color]` on nav rows only; label, icon, and border snap with the theme.

## Fixed (2026-10-08)

### Sidebar account menu — Theme radio keyboard focus not visible (WCAG 2.4.7)

**Fix:** Theme `RadioItem`s in `SidebarAccountMenu.tsx` use `data-[highlighted]:bg-[var(--bg-hover)]` instead of `focus:bg-transparent`, matching other menu rows.

**Repro:** `node .private/e2e/repro/2026-10-08-account-menu-theme-focus/theme-radio-focus.mjs`

**Verified:** post-fix `darkFocused.bg` is `rgba(0, 0, 0, 0)` → `rgb(249, 250, 251)`.

## Open items

None.

## Not in this list

Dark-theme contrast findings from the original audit are deliberately absent. It reported `--text-secondary` failing at around 3.66:1 in four components, on the premise that the token holds the same value in both palettes. It does not — `styles.css` redefines it as `#cbd5e1` for dark. Direct measurement of the rendered elements found the correct dark value in every case, at roughly 12:1. The reported numbers were never reproduced and the discrepancy was never explained; acting on them would mean degrading the light theme to satisfy a measurement nobody can repeat.
