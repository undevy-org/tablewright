/** True when every tab in `root` has aria-controls pointing at an existing panel node. */
export function tabTriggersReferenceExistingPanels(root: ParentNode): boolean {
  const tabs = root.querySelectorAll('[role="tab"]');
  if (tabs.length === 0) return false;
  for (const tab of tabs) {
    const controls = tab.getAttribute("aria-controls");
    if (!controls || !root.querySelector(`#${CSS.escape(controls)}`)) return false;
  }
  return true;
}
