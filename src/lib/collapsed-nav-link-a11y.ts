/** Accessible name for icon-only nav links when the sidebar rail is collapsed. */
export function collapsedNavLinkAriaLabel(
  showExpanded: boolean,
  label: string,
): string | undefined {
  return showExpanded ? undefined : label;
}
