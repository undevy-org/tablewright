import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STYLE_SCOPE } from "../../../lib/style-scope";
import { MerchantsLiveRefactoredScreen } from "./MerchantsLiveRefactoredScreen";

function renderScreen() {
  return render(
    <div className={STYLE_SCOPE}>
      <MerchantsLiveRefactoredScreen />
    </div>,
  );
}

function tabTriggersReferenceExistingPanels(root: ParentNode): boolean {
  const tabs = root.querySelectorAll('[role="tab"]');
  if (tabs.length === 0) return false;
  for (const tab of tabs) {
    const controls = tab.getAttribute("aria-controls");
    if (!controls || !root.querySelector(`#${CSS.escape(controls)}`)) return false;
  }
  return true;
}

describe("MerchantsLiveRefactoredScreen", () => {
  it("wires each resource tab trigger aria-controls to an existing panel id", () => {
    const { container } = renderScreen();
    expect(tabTriggersReferenceExistingPanels(container)).toBe(true);
    const tabs = screen.getAllByRole("tab");
    for (const tab of tabs) {
      const controls = tab.getAttribute("aria-controls");
      expect(controls).toBeTruthy();
      expect(document.getElementById(controls!)).not.toBeNull();
    }
  });
});
