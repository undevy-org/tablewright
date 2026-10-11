import { describe, expect, it } from "vitest";

import {
  deserializePersistedTableState,
  serializePersistedTableState,
  type PersistedTableState,
} from "./table-state-persistence";

const allFields = [
  "sorting",
  "columnFilters",
  "columnVisibility",
  "pageSize",
] as const;

describe("serializePersistedTableState / deserializePersistedTableState", () => {
  it("round-trips version and each field type", () => {
    const state: PersistedTableState = {
      sorting: { columnId: "name", direction: "desc" },
      columnFilters: [{ columnId: "status", value: ["ACTIVE"] }],
      columnVisibility: { name: true, status: false },
      pageSize: 25,
    };

    const serialized = serializePersistedTableState(state, 2, allFields);
    expect(JSON.parse(serialized)).toEqual({ version: 2, ...state });

    const restored = deserializePersistedTableState(serialized, 2, allFields);
    expect(restored).toEqual(state);
  });

  it("serializes null sorting", () => {
    const state: PersistedTableState = { sorting: null };
    const serialized = serializePersistedTableState(state, 1, ["sorting"]);
    expect(JSON.parse(serialized)).toEqual({ version: 1, sorting: null });
    expect(deserializePersistedTableState(serialized, 1, ["sorting"])).toEqual({
      sorting: null,
    });
  });

  it("returns empty state when stored version ≠ expected version", () => {
    const serialized = serializePersistedTableState({ pageSize: 10 }, 1, ["pageSize"]);
    expect(deserializePersistedTableState(serialized, 2, ["pageSize"])).toEqual({});
  });

  it("returns empty state for invalid JSON", () => {
    expect(deserializePersistedTableState("{not json", 1, allFields)).toEqual({});
    expect(deserializePersistedTableState(null, 1, allFields)).toEqual({});
    expect(deserializePersistedTableState("", 1, allFields)).toEqual({});
  });

  it("returns empty state when version key is missing", () => {
    expect(deserializePersistedTableState('{"pageSize":10}', 1, ["pageSize"])).toEqual({});
  });

  it("omits fields not listed in fields when serializing", () => {
    const state: PersistedTableState = {
      sorting: { columnId: "a", direction: "asc" },
      pageSize: 50,
    };
    const serialized = serializePersistedTableState(state, 1, ["pageSize"]);
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    expect(parsed).toEqual({ version: 1, pageSize: 50 });
    expect(parsed.sorting).toBeUndefined();
  });

  it("does not read fields omitted from fields when deserializing", () => {
    const blob = JSON.stringify({
      version: 1,
      sorting: { columnId: "x", direction: "asc" },
      pageSize: 20,
    });
    expect(deserializePersistedTableState(blob, 1, ["pageSize"])).toEqual({ pageSize: 20 });
  });

  it("skips malformed field values without throwing", () => {
    const blob = JSON.stringify({
      version: 1,
      sorting: { columnId: 1, direction: "up" },
      pageSize: "ten",
      columnVisibility: { a: "yes" },
      columnFilters: [{ bad: true }],
    });
    expect(deserializePersistedTableState(blob, 1, allFields)).toEqual({});
  });

  it("rejects non-object JSON root", () => {
    expect(deserializePersistedTableState("[1,2]", 1, ["pageSize"])).toEqual({});
  });

  it("rejects non-number version", () => {
    expect(
      deserializePersistedTableState('{"version":"1","pageSize":10}', 1, ["pageSize"]),
    ).toEqual({});
  });

  it("parses valid columnFilters only", () => {
    const filters = [{ columnId: "status", value: ["A"] }];
    const blob = JSON.stringify({ version: 1, columnFilters: filters });
    expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({
      columnFilters: filters,
    });
  });

  it("drops invalid sorting but keeps other valid fields", () => {
    const blob = JSON.stringify({
      version: 1,
      sorting: "not-an-object",
      pageSize: 25,
    });
    expect(deserializePersistedTableState(blob, 1, ["sorting", "pageSize"])).toEqual({
      pageSize: 25,
    });
  });

  it("drops sorting with invalid direction", () => {
    const blob = JSON.stringify({
      version: 1,
      sorting: { columnId: "a", direction: "sideways" },
    });
    expect(deserializePersistedTableState(blob, 1, ["sorting"])).toEqual({});
  });

  it("does not throw when columnFilters contains null entries", () => {
    const blob = JSON.stringify({ version: 1, columnFilters: [null] });
    expect(() =>
      deserializePersistedTableState(blob, 1, ["columnFilters"]),
    ).not.toThrow();
    expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({});
  });

  it("drops columnFilters when an item lacks columnId", () => {
    const blob = JSON.stringify({
      version: 1,
      columnFilters: [{ value: ["x"] }],
    });
    expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({});
  });

  it("drops columnVisibility when a value is not boolean", () => {
    const blob = JSON.stringify({
      version: 1,
      columnVisibility: { a: true, b: 1 },
    });
    expect(deserializePersistedTableState(blob, 1, ["columnVisibility"])).toEqual({});
  });

  it("rejects non-positive pageSize", () => {
    expect(
      deserializePersistedTableState(
        JSON.stringify({ version: 1, pageSize: 0 }),
        1,
        ["pageSize"],
      ),
    ).toEqual({});
    expect(
      deserializePersistedTableState(
        JSON.stringify({ version: 1, pageSize: -5 }),
        1,
        ["pageSize"],
      ),
    ).toEqual({});
  });

  it("does not read columnFilters when field is omitted", () => {
    const blob = JSON.stringify({
      version: 1,
      columnFilters: [{ columnId: "x", value: [] }],
    });
    expect(deserializePersistedTableState(blob, 1, ["pageSize"])).toEqual({});
  });

  it("does not read columnVisibility when field is omitted", () => {
    const blob = JSON.stringify({
      version: 1,
      columnVisibility: { hidden: false },
    });
    expect(deserializePersistedTableState(blob, 1, ["sorting"])).toEqual({});
  });

  it("does not assign sorting when parseSorting fails", () => {
    const blob = JSON.stringify({ version: 1, sorting: ["array"] });
    const result = deserializePersistedTableState(blob, 1, ["sorting"]);
    expect(result).toEqual({});
    expect("sorting" in result).toBe(false);
  });

  it("serialize omits state keys not listed in fields", () => {
    const serialized = serializePersistedTableState(
      {
        pageSize: 10,
        sorting: { columnId: "n", direction: "asc" },
        columnFilters: [{ columnId: "c", value: "v" }],
        columnVisibility: { hidden: true },
      },
      1,
      ["pageSize"],
    );
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    expect(parsed).toEqual({ version: 1, pageSize: 10 });
    expect(parsed.sorting).toBeUndefined();
    expect(parsed.columnFilters).toBeUndefined();
    expect(parsed.columnVisibility).toBeUndefined();
  });

  it("serialize omits undefined optional fields from payload", () => {
    const serialized = serializePersistedTableState({}, 3, allFields);
    expect(JSON.parse(serialized)).toEqual({ version: 3 });
  });

  it("serializes each field only when present in state", () => {
    expect(
      JSON.parse(serializePersistedTableState({ sorting: null }, 1, ["sorting"])),
    ).toEqual({ version: 1, sorting: null });

    expect(
      JSON.parse(
        serializePersistedTableState(
          { columnFilters: [{ columnId: "a", value: "x" }] },
          1,
          ["columnFilters"],
        ),
      ),
    ).toEqual({
      version: 1,
      columnFilters: [{ columnId: "a", value: "x" }],
    });

    expect(
      JSON.parse(
        serializePersistedTableState({ columnVisibility: { a: false } }, 1, [
          "columnVisibility",
        ]),
      ),
    ).toEqual({ version: 1, columnVisibility: { a: false } });
  });
});
