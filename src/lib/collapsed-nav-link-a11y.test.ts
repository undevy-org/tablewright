import { describe, expect, it } from "vitest";
import { collapsedNavLinkAriaLabel } from "./collapsed-nav-link-a11y";

describe("collapsedNavLinkAriaLabel", () => {
  it("returns the label when the rail is collapsed", () => {
    expect(collapsedNavLinkAriaLabel(false, "Dashboard")).toBe("Dashboard");
  });

  it("returns undefined when the label is visible", () => {
    expect(collapsedNavLinkAriaLabel(true, "Dashboard")).toBeUndefined();
  });
});
