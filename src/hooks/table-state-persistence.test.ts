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
});
