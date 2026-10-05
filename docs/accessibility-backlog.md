# Accessibility backlog

Known accessibility defects in this library, with locations and remedies. Everything here was found by an audit of the built Storybook — `axe-core` via `@storybook/addon-a11y`, plus reading the rendered DOM — not by static review. Nothing listed here is fixed.

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

## Fixed (2026-10-05)

### 11. TopBar narrow story icon button has no accessible name

**Fix:** `aria-label="Add"` on the icon-only action button in `NarrowWithTruncation` (`TopBar.stories.tsx`).

**Verified:** `story-diff --axe` — `button-name` under axe fixed on `layout-topbar--narrow-with-truncation`; `topbar-narrow-a11y.test.tsx` — "names the icon-only action in NarrowWithTruncation".

## Open items

### 7. Design Tokens page prints light-theme values in dark mode

`src/DesignTokens.stories.tsx:114-118`

`formatTokenValue` returns `token.value` and never consults `token.modes.dark`, though the field exists in the type (`:13`, `:108`) and in the manifest. The swatches recolour correctly when the theme flips; the hex captions underneath keep reading their light values.

Not a WCAG issue, but the one page whose entire purpose is documenting exact values prints the wrong ones in half its states.

**Remedy:** read the active theme and select `modes.dark` when it applies, or read the resolved custom property from the DOM. The data is already there.

### 8. `--text-tertiary` fails AA against white

`src/styles.css` — light-theme `--text-tertiary: #9ca3af`

Measured **2.54:1** against a white surface, well under the 4.5:1 required for body text. Two confirmed places: the ID column of `datatable-tablelayout--default`, and the Design Tokens page's own demonstration of the token — which is how both the name and the value were confirmed.

**Remedy:** a token-level decision, not a patch. Darkening the light-theme value affects everything using it; scoping the change to body-sized text does not. Whoever takes this should decide deliberately rather than nudging the hex until `axe` goes quiet.

**More instances found 2026-08-19, same token, same verdict.** Running `axe` against the two new pages surfaced six more `--text-tertiary`-on-white nodes: the sidebar's five section labels ("Operations", "Finance", ...) at 2.53:1, and the account-switcher's role caption at 2.53:1. Composition, not new code — these are the pre-existing `Sidebar`/`SidebarAccountMenu` components, just exercised by a page for the first time. Two **new, narrower** near-misses also turned up, different tokens, worth naming separately since they're closer to passing and a smaller nudge might clear them: the resource-tab-bar's label text (`#6b7280` on `#f3f4f6`, **4.39:1**) and its count badge (`#667085` on `#eef2f6`, **4.42:1**), both in `MerchantsLiveRefactoredScreen.tsx`'s tab strip — new, Task 6. Also the sidebar-user avatar initials (`#6b7280` on `#eef2f6`, **4.29:1**), pre-existing. All four still route through the same "token-level decision" remedy above, not a per-node patch.

### 9. Merchants page's resource tabs point `aria-controls` at content that is never rendered

`src/stories/pages/merchants/MerchantsLiveRefactoredScreen.tsx` — the top tab strip (Merchants / Balances / Statistics / Widgets / Reports / ...).

The strip uses `<Tabs>` / `<TabsList>` / `<TabsTrigger>` (Radix, via `src/components/ui/tabs.tsx`), which is real ARIA tabs semantics: each trigger gets `aria-controls="…-content-<value>"` pointing at a `Tabs.Content` panel it expects to exist. But the actual panel content is switched by a plain `activeTab === "merchants" ? <div>…</div> : …` conditional below the `<Tabs>` block — no `<TabsContent>` is ever rendered for any tab, active or not. So every trigger's `aria-controls` references an id that doesn't exist in the DOM (`aria-valid-attr-value`, confirmed on the active "Merchants" trigger; the other eight are not individually reachable while inactive but share the same wiring).

**Why this isn't a quick fix:** the screen has nine tab panels (Merchants, Balances, Statistics, Widgets, Reports, Bank Block Lists, Merchant Rate Settings, Merchant Withdraw Fees, Request Logs), each a sizeable conditional block. Making this correct means either wrapping all nine in real `<Tabs.Content value="…">` (Radix supports `forceMount` + its own `hidden`-attribute toggling, so the current "only mount the active one" behaviour could be preserved, but that's a structural change to how the screen switches content, not a one-line patch), or deliberately dropping the ARIA tabs semantics (plain buttons with `role="tab"` removed, no `aria-controls`) in favour of what this component actually is — a segmented nav, not a tabs+tabpanel pair. Either way it's an intentional pattern decision, not something to nudge silently while fixing the port's own defects.

**Remedy:** pick one of the two shapes above and apply it consistently; out of scope for a verification pass to decide unilaterally.

### 10. Sidebar nav-item text stays at its light-theme color in dark mode

`src/components/layout/Sidebar.tsx` — the `<a>`/`<button>` wrapper for each non-active nav item, class `text-[var(--text-secondary)]`.

Confirmed by direct measurement, not by trusting `axe`'s contrast number at face value (see "Not in this list" below for why that caution matters here specifically): on `layout-sidebar--default` with `data-theme="dark"` on `<html>`, `getComputedStyle(a).getPropertyValue('--text-secondary')` correctly returns `#cbd5e1` (the dark value from `styles.css:116`) — but `getComputedStyle(a).color` on that *same element* is `rgb(107, 114, 128)` (`#6b7280`, the **light** value from `styles.css:25`). The custom property resolves correctly; the applied `color` doesn't match it. That's a real rendering discrepancy, confirmed at the exact node, not a stale/incorrect `axe` contrast computation — unlike the dismissed finding below, this one was checked against the live computed value and reproduces.

**Pre-existing, not introduced by the pages port** — reproduces on the baseline `layout-sidebar--default` story in dark theme alone; it surfaced during Task 7 only because `axe` was run against dark-theme `Sidebar` compositions more thoroughly than before.

**Remedy:** not diagnosed further here — the CSS variable is right, the applied color isn't, and why needs a cascade-level look (specificity/order between the compiled Tailwind utility and whatever sets `color` on this element) that a verification pass isn't the place to do. Repro: build Storybook, open `layout-sidebar--default` with dark theme active, inspect any inactive nav link's computed `color`.

## Not in this list

Dark-theme contrast findings from the original audit are deliberately absent. It reported `--text-secondary` failing at around 3.66:1 in four components, on the premise that the token holds the same value in both palettes. It does not — `styles.css` redefines it as `#cbd5e1` for dark. Direct measurement of the rendered elements found the correct dark value in every case, at roughly 12:1. The reported numbers were never reproduced and the discrepancy was never explained; acting on them would mean degrading the light theme to satisfy a measurement nobody can repeat.
