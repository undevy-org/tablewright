import { describe, expect, it } from "vitest";

import type { ActiveFilterValue } from "./filter-types";
import {
  getCompoundValue,
  getDateRange,
  getNumberRange,
  getStringArray,
  isMultiStringFilterValue,
  isFilterValueEmpty,
} from "./filter-values";

describe("isFilterValueEmpty", () => {
  it("treats undefined, null, empty string, and empty array as empty", () => {
    expect(isFilterValueEmpty(undefined)).toBe(true);
    expect(isFilterValueEmpty(null as unknown as ActiveFilterValue)).toBe(true);
    expect(isFilterValueEmpty("")).toBe(true);
    expect(isFilterValueEmpty([])).toBe(true);
  });

  it('treats [""] as not empty (enum option value may be "")', () => {
    expect(isFilterValueEmpty([""])).toBe(false);
  });

  it("treats numeric range with from: 0 as not empty", () => {
    expect(isFilterValueEmpty({ from: 0 })).toBe(false);
  });

  it("treats { from: undefined } and {} as empty", () => {
    expect(isFilterValueEmpty({ from: undefined })).toBe(true);
    expect(isFilterValueEmpty({})).toBe(true);
  });

  it("recurses into compound values", () => {
    expect(isFilterValueEmpty({ sub: [] })).toBe(true);
    expect(isFilterValueEmpty({ sub: ["x"] })).toBe(false);
    expect(isFilterValueEmpty({ a: { b: [] } })).toBe(true);
    expect(isFilterValueEmpty({ a: { b: [""] } })).toBe(false);
  });
});

describe("isMultiStringFilterValue", () => {
  it("is true only when more than one string is selected", () => {
    expect(isMultiStringFilterValue(["a", "b"])).toBe(true);
    expect(isMultiStringFilterValue(["a"])).toBe(false);
    expect(isMultiStringFilterValue([])).toBe(false);
    expect(isMultiStringFilterValue({ from: "2024-01-01" })).toBe(false);
  });
});

describe("getStringArray", () => {
  it("returns arrays as-is and non-arrays as []", () => {
    expect(getStringArray(["a"])).toEqual(["a"]);
    expect(getStringArray("x")).toEqual([]);
    expect(getStringArray({ from: 1 })).toEqual([]);
  });
});

describe("getDateRange", () => {
  it("keeps string bounds and drops wrong types", () => {
    expect(getDateRange({ from: "2024-01-01", to: "2024-12-31" })).toEqual({
      from: "2024-01-01",
      to: "2024-12-31",
    });
    expect(getDateRange({ from: 1, to: true } as unknown as ActiveFilterValue)).toEqual({});
    expect(getDateRange(["x"])).toEqual({});
  });

  it("returns empty range for null and non-object values", () => {
    expect(getDateRange(null as unknown as ActiveFilterValue)).toEqual({});
    expect(getDateRange("2024-01-01" as unknown as ActiveFilterValue)).toEqual({});
  });
});

describe("getNumberRange", () => {
  it("keeps number bounds and drops wrong types", () => {
    expect(getNumberRange({ from: 0, to: 10 })).toEqual({ from: 0, to: 10 });
    expect(getNumberRange({ from: "1", to: null } as unknown as ActiveFilterValue)).toEqual({});
    expect(getNumberRange(undefined)).toEqual({});
  });
});

describe("getCompoundValue", () => {
  it("returns objects and {} for non-objects", () => {
    expect(getCompoundValue({ a: ["x"] })).toEqual({ a: ["x"] });
    expect(getCompoundValue([])).toEqual({});
    expect(getCompoundValue("")).toEqual({});
  });
});
