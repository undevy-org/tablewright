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

describe("MerchantsLiveRefactoredScreen", () => {
  it("wires each resource tab trigger aria-controls to an existing panel id", () => {
    renderScreen();
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThan(0);
    for (const tab of tabs) {
      const controls = tab.getAttribute("aria-controls");
      expect(controls, `tab "${tab.textContent}" missing aria-controls`).toBeTruthy();
      expect(
        document.getElementById(controls!),
        `no element with id "${controls}" for tab "${tab.textContent}"`,
      ).not.toBeNull();
    }
  });
});
