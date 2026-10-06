import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STYLE_SCOPE } from "../../../lib/style-scope";
import { liveTabSummaries } from "./data/liveSnapshot";
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

function clickResourceTab(label: string) {
  const tablist = screen.getByRole("tablist");
  const tab = within(tablist)
    .getAllByRole("tab")
    .find((el) => el.textContent?.includes(label));
  if (!tab) {
    throw new Error(`resource tab not found: ${label}`);
  }
  act(() => {
    fireEvent.mouseDown(tab, { button: 0, ctrlKey: false });
  });
  return tab;
}

describe("MerchantsLiveRefactoredScreen", () => {
  it("wires each resource tab trigger aria-controls to an existing panel id", () => {
    const { container } = renderScreen();
    expect(tabTriggersReferenceExistingPanels(container)).toBe(true);
  });

  it("shows the merchants table on the default tab", () => {
    renderScreen();
    expect(screen.getByPlaceholderText("Search by Merchant ID")).toBeTruthy();
  });

  it("switches to the reports panel when the Reports tab is selected", () => {
    renderScreen();
    const tab = clickResourceTab("Reports");
    expect(tab.getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("heading", { name: "Balance Diff" })).toBeTruthy();
    expect(screen.queryByPlaceholderText("Search by Merchant ID")).toBeNull();
  });

  it("switches to a summary panel when a non-merchants resource tab is selected", () => {
    renderScreen();
    clickResourceTab("Balances");
    expect(screen.getByText(liveTabSummaries.balances.endpoint)).toBeTruthy();
    expect(screen.queryByPlaceholderText("Search by Merchant ID")).toBeNull();
  });

  it("renders summary tabs from liveTabs excluding merchants and reports", () => {
    renderScreen();
    clickResourceTab("Statistics");
    expect(screen.getByText(liveTabSummaries.statistics.emptyStateMessage!)).toBeTruthy();

    clickResourceTab("Widgets");
    expect(screen.getByText("QR National")).toBeTruthy();
  });
});
