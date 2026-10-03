/**
 * Class name that scopes the package's element reset.
 *
 * `@undevy-org/tablewright/tablewright.css` confines its reset — border style,
 * form-control appearance, typographic base — to this class instead of applying
 * it globally the way Tailwind's preflight does, so the stylesheet cannot
 * restyle a host application that has a reset of its own.
 *
 * Put it on the element that wraps your use of the kit. Components that render
 * through a Radix portal (dropdown, popover, dialog, select) carry it
 * themselves, because a portal mounts outside the React tree and would
 * otherwise land on document.body with no scope around it.
 *
 * Note that this covers the reset only. Theme selection is separate: tokens
 * resolve from wherever `data-theme` sits, so portalled content still needs a
 * `PortalContainerContext` value inside the themed subtree to follow a theme
 * that is not set on :root.
 */
export const STYLE_SCOPE = "tablewright";
