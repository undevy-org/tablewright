import { describe, expect, it } from "vitest";

import { tabTriggersReferenceExistingPanels } from "./tab-aria";

describe("tabTriggersReferenceExistingPanels", () => {
  it("returns false when there are no tabs", () => {
    const root = document.createElement("div");
    expect(tabTriggersReferenceExistingPanels(root)).toBe(false);
  });

  it("returns false when aria-controls is missing", () => {
    const root = document.createElement("div");
    root.innerHTML = '<button role="tab">One</button>';
    expect(tabTriggersReferenceExistingPanels(root)).toBe(false);
  });

  it("returns false when the referenced panel id is absent", () => {
    const root = document.createElement("div");
    root.innerHTML =
      '<button role="tab" aria-controls="panel-a">One</button><div id="panel-b">Other</div>';
    expect(tabTriggersReferenceExistingPanels(root)).toBe(false);
  });

  it("returns true when every tab references an existing panel id", () => {
    const root = document.createElement("div");
    root.innerHTML =
      '<button role="tab" aria-controls="panel-a">One</button>' +
      '<button role="tab" aria-controls="panel-b">Two</button>' +
      '<div id="panel-a"></div><div id="panel-b"></div>';
    expect(tabTriggersReferenceExistingPanels(root)).toBe(true);
  });

  it("resolves panels when the root is the document", () => {
    document.body.innerHTML =
      '<button role="tab" aria-controls="doc-panel">Tab</button><div id="doc-panel"></div>';
    expect(tabTriggersReferenceExistingPanels(document)).toBe(true);
  });
});
