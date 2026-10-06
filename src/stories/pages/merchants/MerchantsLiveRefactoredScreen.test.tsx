import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { STYLE_SCOPE } from "../../../lib/style-scope";
import { tabTriggersReferenceExistingPanels } from "../../../lib/tab-aria";
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
    const { container } = renderScreen();
    expect(tabTriggersReferenceExistingPanels(container)).toBe(true);
  });
});
