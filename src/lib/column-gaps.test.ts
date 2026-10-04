import { describe, expect, it } from "vitest";

import { computeColumnGaps, gapColumnId } from "./column-gaps";

describe("gapColumnId", () => {
  it("names gap columns after the preceding visible column", () => {
    expect(gapColumnId(null)).toBe("__gap_after_start");
    expect(gapColumnId("name")).toBe("__gap_after_name");
  });
});

describe("computeColumnGaps", () => {
  const ids = ["a", "b", "c", "d"] as const;

  it("returns no gaps when every column is visible", () => {
    expect(computeColumnGaps(ids, {})).toEqual([]);
    expect(computeColumnGaps(ids, { a: true, b: true })).toEqual([]);
  });

  it("places a leading gap before the first visible column", () => {
    expect(computeColumnGaps(ids, { a: false, b: true, c: true, d: true })).toEqual([
      { afterColumnId: null, hiddenIds: ["a"] },
    ]);
  });

  it("places a middle gap after the last visible column before hidden run", () => {
    expect(computeColumnGaps(ids, { a: true, b: false, c: false, d: true })).toEqual([
      { afterColumnId: "a", hiddenIds: ["b", "c"] },
    ]);
  });

  it("places a trailing gap after the last visible column", () => {
    expect(computeColumnGaps(ids, { a: true, b: true, c: false, d: false })).toEqual([
      { afterColumnId: "b", hiddenIds: ["c", "d"] },
    ]);
  });
});
