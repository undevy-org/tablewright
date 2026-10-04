import { describe, expect, it } from "vitest";
import { SCROLL_REGION_TAB_INDEX } from "./scroll-region-tab-index";

describe("SCROLL_REGION_TAB_INDEX", () => {
  it("is zero so scroll regions participate in sequential focus", () => {
    expect(SCROLL_REGION_TAB_INDEX).toBe(0);
  });
});
