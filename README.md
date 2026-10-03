# tablewright

Live Storybook: <https://undevy-org.github.io/tablewright/>

A React + TypeScript component library — buttons, inputs, dialogs, and a
data-table system (drawers, filters, row controls, sortable headers) built
on Radix UI, TanStack Table, and Tailwind CSS.

## Using it in another project

```bash
npm i @undevy-org/tablewright
```

Peer dependencies you install yourself, so there is exactly one copy of each in
the final bundle:

```bash
npm i react react-dom @tanstack/react-table
```

| Peer | Range | |
| --- | --- | --- |
| `react`, `react-dom` | `>=18.0.0 <20.0.0` | required |
| `@tanstack/react-table` | `^8.21.3` | required — you construct the `Table` instance yourself |
| `@types/react`, `@types/react-dom` | `*` | optional; your copy is used, none is installed |

### Styles

Two stylesheets, imported once at the application entry:

```ts
import "@undevy-org/tablewright/tokens.css";      // CSS custom properties, both themes
import "@undevy-org/tablewright/tablewright.css"; // scoped reset + component styles
```

`@undevy-org/tablewright/styles.css` is the two of them concatenated, if you would
rather have a single import.

Then put the style scope on the element that wraps your use of the kit:

```tsx
import { STYLE_SCOPE } from "@undevy-org/tablewright";

<div className={STYLE_SCOPE} data-theme="light">
  …
</div>;
```

The scope exists because the package must not restyle its host. Tailwind's
preflight is a global reset — it rewrites margins, list styles, heading sizes
and form-control appearance for every element on the page — so this package
ships that normalisation confined to `.tablewright` instead.

What is and is not isolated, precisely:

- **The element reset is scoped.** It never touches an element outside
  `.tablewright`, and it sits at exactly one class of specificity, so it
  outranks a host reset that names bare elements (`button, input { border: none }`
  would otherwise erase every border in the kit) while still losing to the
  package's own utilities.
- **The utility classes are global and unprefixed.** `tablewright.css` defines
  `.flex`, `.rounded-md`, `.text-sm` and the rest at the top level. If your own
  stylesheets define class names of the same shape, they collide, and source
  order decides. CSS-module or component-scoped class names — what the first
  consumer uses — cannot collide.

If your app has no reset of its own and you want the global one,
`@undevy-org/tablewright/preflight.css` is Tailwind's preflight compiled from a
stock config, so it carries Tailwind's default font stacks rather than this
package's.

Fonts are not loaded for you. Serve Inter and JetBrains Mono yourself, or
`import "@undevy-org/tablewright/fonts.css"` to pull them from Google Fonts.

You do not need Tailwind. `tablewright.css` is compiled; the package works the
same in a project that has never seen Tailwind, and adding the package to a
`content` glob is neither required nor useful.

### Theme

Tokens resolve from the nearest ancestor carrying `data-theme="light"` or
`data-theme="dark"`. Set it on `:root` for a whole-application theme, or on any
wrapper to theme a region.

Radix portals — dropdown, popover, dialog, select — mount outside the React tree
and default to `document.body`. Their content carries the style scope itself, so
it is always laid out and typeset correctly, but `document.body` sits outside
your `data-theme` wrapper. To make portalled content follow a theme that is not
on `:root`, give it a container inside the themed subtree:

```tsx
import { useState } from "react";
import { PortalContainerContext, STYLE_SCOPE } from "@undevy-org/tablewright";

function Page({ theme }: { theme: "light" | "dark" }) {
  // Callback ref, not useRef: a ref object is still null on first render,
  // and the portals would fall back to document.body.
  const [portal, setPortal] = useState<HTMLDivElement | null>(null);

  return (
    <div ref={setPortal} className={STYLE_SCOPE} data-theme={theme}>
      <PortalContainerContext.Provider value={portal}>
        …
      </PortalContainerContext.Provider>
    </div>
  );
}
```

### Example

```tsx
import { getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Badge, DataTableShell, STYLE_SCOPE, type ColumnMetaDef } from "@undevy-org/tablewright";

type Row = { id: string; status: string };

const columns: ColumnDef<Row>[] = [
  { id: "id", accessorKey: "id", header: "ID" },
  { id: "status", accessorKey: "status", header: "Status",
    cell: ({ row }) => <Badge variant="success">{row.original.status}</Badge> },
];

const columnMeta: Record<string, ColumnMetaDef> = {
  id: { minW: 140 },
  status: { minW: 120 },
};

function Table({ rows }: { rows: Row[] }) {
  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() });
  return (
    <div className={STYLE_SCOPE} style={{ height: 400, display: "flex" }}>
      <DataTableShell
        table={table}
        dense={false}
        emptyMessage="Nothing found"
        columnMeta={columnMeta}
        columnWidths={{}}
        onColumnResizeStart={() => {}}
      />
    </div>
  );
}
```

### Known rough edges

- **User-visible strings are hardcoded English in eleven components** —
  `Sidebar`, `SidebarAccountMenu`, `TableFooter`, `DrawerShell`,
  `FilterFormPanel`, `RowActionsMenu`, `GroupedColumnToggle`,
  `ReportSummaryCard`, `AmountCell`, `ConfirmedAmountCell` and the dialog close
  button. `ColumnHeaderMenu` is the only component that takes a `labels` prop, so
  everything else needs a fork or a patch to localise.
- **`animate-in` / `fade-in-0` / `zoom-in-95` compile to nothing.** `DrawerShell`
  asks for a fade-and-zoom entrance on the expanded drawer, but no
  `tailwindcss-animate` plugin is configured, so those three class names produce
  no CSS in any build — the modal appears instantly, in Storybook and in the
  package alike. Either add the plugin or drop the classes; today the source says
  one thing and the artifact does another.
- **Opacity modifiers on `var()` colours compile to nothing.** Tailwind v3 cannot
  extract an alpha channel from a raw `var()`, so
  `border-[var(--tag-blue-text)]/20` and `text-[var(--tag-blue-text)]/60` emit no
  rule at all. The blue filter chips in `ColumnFilterPopover` and
  `CompoundFilterPopover` ship without their intended 20% border and 60% glyph
  colour. `color-mix(in srgb, var(--tag-blue-text) 20%, transparent)` in an
  arbitrary value compiles and is the closest faithful fix.
- **Portalled surfaces re-assert the typographic base.** A font size or colour
  set on your `STYLE_SCOPE` wrapper reaches the tables and toolbars but not the
  dropdowns, popovers, selects or dialogs, because those carry the scope
  themselves.
- **No tests.** The gates are ESLint, `tsc`, the build's own assertions, the
  render check. Nothing exercises component
  behaviour or interaction.

## Development

```bash
pnpm install
pnpm storybook        # dev server
pnpm build-storybook  # static build
pnpm build            # dist/ — library, stylesheets, types
pnpm check:render     # renders dist in headless Chrome against a hostile host stylesheet
pnpm lint
pnpm typecheck
```

`check:render` is the one gate that resolves the CSS cascade rather than
inspecting it. It loads `dist/` — not `src` — into headless Chrome underneath a
deliberately hostile host stylesheet and asserts 27 computed styles: that the
kit's controls keep their borders and typography, that the utilities still beat
the reset, that portalled surfaces are styled while mounted on `document.body`,
and that the host's own elements are left exactly as the host styled them. Run it
after touching `src/css/`, the scope wiring, or the CSS build. It needs a Chrome
on the machine (`CHROME_PATH` overrides the search) and is deliberately not part
of `pnpm build`.

## Structure

- `src/components/ui` — primitives (Button, Input, Dialog, Select, Tabs, ...)
- `src/components/layout` — app shell, sidebar, top bar
- `src/components/data-table` — table shell, drawers, filters, row controls
- `src/components/dashboard` — summary cards
- `src/css` — token, reset, global and font layers assembled into `dist/`
- `scripts/render-check` — the fixture and runner behind `pnpm check:render`
- `design-tokens/manifest.json` — canonical token source

## Build

`pnpm build` runs four steps (`scripts/build.mjs`). `dist/` is cleared once at
the start, so the passes can write into the same tree:

| Step | Output |
| --- | --- |
| `TW_FORMAT=es vite build --config vite.lib.config.ts` | `dist/es/**` — one file per source module |
| `TW_FORMAT=cjs vite build --config vite.lib.config.ts` | `dist/tablewright.cjs` — one flattened file |
| `node scripts/build-css.mjs` | `dist/{tokens,tablewright,styles,preflight,fonts}.css` |
| `tsc -p tsconfig.build.json` | `dist/types/**` |

The ES output is per-module because a single flattened bundle defeats
tree-shaking here: component modules call `forwardRef(...)` and `cva(...)` at
module scope, which Rollup cannot prove side-effect free. Measured in a real
consumer with React, Radix and TanStack external — importing only `cn` costs
25.4 kB / 5.7 kB gzip against 171 kB / 34.3 kB for the whole surface. (The
`sideEffects` field changes none of this; it is declared because a webpack
consumer needs it to keep the CSS imports, and was measured to make no difference
to what Rollup drops.)

The CJS output is `.cjs`, not `.cjs.js`. This package is `"type": "module"`, so
Node reads any `.js` inside it as ESM — a CommonJS file named `.cjs.js` returns
an empty namespace from `require()` with no error at all.

The library build is deliberately not `vite.config.ts`: Storybook's
`@storybook/react-vite` auto-loads that filename and would inherit `build.lib`.

`tsconfig.build.json` sets `noEmit: false`. The base config sets it to `true`,
and a declaration build that inherits it exits 0 having written nothing — an
empty `dist` that no error reports.

Two further passes run after those steps: relative specifiers in the emitted
declarations get an explicit `.js` extension (without it, a consumer on
`node16`/`nodenext` types every export as `any` and sees no error), and every
path `package.json` advertises is asserted to exist and be non-trivial.

### Checks

The CSS build fails loudly on three mistakes it can otherwise make silently:

- a `content` glob that matches nothing — utilities would be missing and every
  component would render unstyled;
- a rule that addresses elements directly instead of through a class — a leaked
  preflight looks exactly like that and would restyle the host page;
- hand-authored CSS (`reset.css`, `scrollbar.css`) whose selector does not name
  `.tablewright` outside a `:where()`. Inside `:where()` the scope contributes no
  specificity, a host's plain `button, input { border: none }` beats the reset,
  and every control in the kit loses its border. That one shipped, and no static
  check caught it — `pnpm check:render` did, by rendering.

Each guard is verified by breaking the build on purpose and confirming it fails,
not merely by passing on a good build. The same applies to `check:render`: it was
confirmed to go red both for the specificity defect and for a portal that loses
the scope class.
