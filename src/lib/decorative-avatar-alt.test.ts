import { describe, expect, it } from "vitest";
import { decorativeAvatarAlt } from "./decorative-avatar-alt";

describe("decorativeAvatarAlt", () => {
  it("returns an empty string when the name is shown beside the image", () => {
    expect(decorativeAvatarAlt(true, "Jordan Ellis")).toBe("");
  });

  it("returns the name when there is no adjacent visible text", () => {
    expect(decorativeAvatarAlt(false, "Jordan Ellis")).toBe("Jordan Ellis");
  });
});
