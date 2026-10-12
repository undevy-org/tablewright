import { describe, expect, it } from "vitest";

import {
  deserializePersistedTableState,
  serializePersistedTableState,
  type PersistedTableState,
  type PersistedTableStateField,
} from "./table-state-persistence";

const allFields = [
  "sorting",
  "columnFilters",
  "columnVisibility",
  "pageSize",
] as const;

function deserializeColumnFilterValue(value: unknown) {
  const blob = JSON.stringify({
    version: 1,
    columnFilters: [{ columnId: "c", value }],
  });
  return deserializePersistedTableState(blob, 1, ["columnFilters"]).columnFilters;
}

const fixtureCases: {
  label: string;
  blob: string | null;
  version: number;
  fields: readonly PersistedTableStateField[];
  expected: PersistedTableState;
}[] = [
  { label: "null input", blob: null, version: 1, fields: ["pageSize"], expected: {} },
  { label: "empty input", blob: "", version: 1, fields: ["pageSize"], expected: {} },
  { label: "number root", blob: "12", version: 1, fields: ["pageSize"], expected: {} },
  { label: "string version", blob: '{"version":"1","pageSize":10}', version: 1, fields: ["pageSize"], expected: {} },
  {
    label: "columnVisibility array",
    blob: JSON.stringify({ version: 1, columnVisibility: [] }),
    version: 1,
    fields: ["columnVisibility"],
    expected: {},
  },
  {
    label: "columnFilters object",
    blob: JSON.stringify({ version: 1, columnFilters: {} }),
    version: 1,
    fields: ["columnFilters"],
    expected: {},
  },
  {
    label: "pageSize only from multi-key blob",
    blob: JSON.stringify({
      version: 1,
      sorting: { columnId: "n", direction: "asc" },
      pageSize: 15,
    }),
    version: 1,
    fields: ["pageSize"],
    expected: { pageSize: 15 },
  },
];

describe("serializePersistedTableState / deserializePersistedTableState", () => {
  it.each(fixtureCases)("$label", ({ blob, version, fields, expected }) => {
    expect(deserializePersistedTableState(blob, version, fields)).toEqual(expected);
  });

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

  it("parses partial number and date ranges without extra keys", () => {
    const fromOnlyNumber = deserializeColumnFilterValue({ from: 1 });
    expect(fromOnlyNumber).toStrictEqual([{ columnId: "c", value: { from: 1 } }]);
    expect(Object.keys(fromOnlyNumber![0].value)).toEqual(["from"]);

    const toOnlyNumber = deserializeColumnFilterValue({ to: 2 });
    expect(toOnlyNumber).toStrictEqual([{ columnId: "c", value: { to: 2 } }]);
    expect(Object.keys(toOnlyNumber![0].value)).toEqual(["to"]);

    const fromOnlyDate = deserializeColumnFilterValue({ from: "2024-01-01" });
    expect(fromOnlyDate).toStrictEqual([{ columnId: "c", value: { from: "2024-01-01" } }]);
    expect(Object.keys(fromOnlyDate![0].value)).toEqual(["from"]);

    const toOnlyDate = deserializeColumnFilterValue({ to: "2024-12-31" });
    expect(toOnlyDate).toStrictEqual([{ columnId: "c", value: { to: "2024-12-31" } }]);
    expect(Object.keys(toOnlyDate![0].value)).toEqual(["to"]);
  });

  it("treats objects with from/to plus other keys as compound filters", () => {
    expect(deserializeColumnFilterValue({ from: "2024-01-01", status: ["OPEN"] })).toEqual([
      { columnId: "c", value: { from: "2024-01-01", status: ["OPEN"] } },
    ]);
  });

  it("rejects from/to-only objects with mixed bound types or invalid bounds", () => {
    const rejected = [
      { from: 1, to: "x" },
      { from: "x", to: 2 },
      { from: "not-a-date", to: 1 },
      { from: null, to: 2 },
      { from: 1, to: null },
      { from: true },
      { from: {} },
    ];
    for (const value of rejected) {
      expect(deserializeColumnFilterValue(value)).toBeUndefined();
    }
  });

  it("parses full number and date ranges with exact keys", () => {
    const numberRange = deserializeColumnFilterValue({ from: 1, to: 2 });
    expect(numberRange).toStrictEqual([{ columnId: "c", value: { from: 1, to: 2 } }]);
    expect(Object.keys(numberRange![0].value).sort()).toEqual(["from", "to"]);

    const dateRange = deserializeColumnFilterValue({
      from: "2024-01-01",
      to: "2024-12-31",
    });
    expect(dateRange).toStrictEqual([
      { columnId: "c", value: { from: "2024-01-01", to: "2024-12-31" } },
    ]);
    expect(Object.keys(dateRange![0].value).sort()).toEqual(["from", "to"]);
  });

  it("rejects non-finite number bounds in JSON number ranges", () => {
    const blob = '{"version":1,"columnFilters":[{"columnId":"c","value":{"from":1e400}}]}';
    const restored = deserializePersistedTableState(blob, 1, ["columnFilters"]);
    expect(restored.columnFilters).toBeUndefined();
    expect(restored).toEqual({});
    expect(restored).not.toEqual({
      columnFilters: [{ columnId: "c", value: {} }],
    });
  });

  it("accepts empty object filter values as compound roots", () => {
    expect(deserializeColumnFilterValue({})).toStrictEqual([{ columnId: "c", value: {} }]);
    expect(deserializeColumnFilterValue({ nested: {} })).toStrictEqual([
      { columnId: "c", value: { nested: {} } },
    ]);
  });

  it("parses valid ActiveFilterValue shapes in columnFilters", () => {
    const filters = [
      { columnId: "text", value: "single" },
      { columnId: "enum", value: ["A", "B"] },
      { columnId: "created", value: { from: "2024-01-01", to: "2024-12-31" } },
      { columnId: "amount", value: { from: 1, to: 99.5 } },
      { columnId: "compound", value: { status: ["OPEN"], note: "x" } },
      { columnId: "emptyCompound", value: {} },
    ];
    const blob = JSON.stringify({ version: 1, columnFilters: filters });
    expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({
      columnFilters: filters,
    });
  });

  it("drops columnFilters when filter value is not a valid ActiveFilterValue", () => {
    const invalidValues = [
      42,
      null,
      true,
      ["A", 1],
      { from: "not-a-date", to: 1 },
      { evil: { nested: true } },
      { from: Number.NaN },
      { to: Number.POSITIVE_INFINITY },
    ];
    for (const value of invalidValues) {
      const blob = JSON.stringify({
        version: 1,
        columnFilters: [{ columnId: "c", value }],
      });
      expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({});
    }
  });

  it("drops columnFilters when one item is invalid but others are valid", () => {
    const blob = JSON.stringify({
      version: 1,
      columnFilters: [
        { columnId: "ok", value: ["A"] },
        { columnId: "bad", value: 42 },
      ],
    });
    expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({});
  });

  it("drops columnFilters when value key is missing on an item", () => {
    const blob = JSON.stringify({
      version: 1,
      columnFilters: [{ columnId: "c" }],
    });
    expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({});
  });

  it("rejects non-finite positive pageSize including Infinity", () => {
    expect(
      deserializePersistedTableState(
        JSON.stringify({ version: 1, pageSize: Number.POSITIVE_INFINITY }),
        1,
        ["pageSize"],
      ),
    ).toEqual({});
    expect(
      deserializePersistedTableState(
        JSON.stringify({ version: 1, pageSize: Number.NEGATIVE_INFINITY }),
        1,
        ["pageSize"],
      ),
    ).toEqual({});
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

  it("returns empty object for empty serialized string", () => {
    expect(deserializePersistedTableState("", 1, ["pageSize"])).toEqual({});
  });

  it("returns empty object for null serialized input", () => {
    expect(deserializePersistedTableState(null, 1, ["pageSize"])).toEqual({});
  });

  it("rejects sorting with non-string columnId", () => {
    const blob = JSON.stringify({
      version: 1,
      sorting: { columnId: 42, direction: "asc" },
    });
    expect(deserializePersistedTableState(blob, 1, ["sorting"])).toEqual({});
  });

  it("rejects columnFilters when value is a plain object", () => {
    const blob = JSON.stringify({ version: 1, columnFilters: {} });
    expect(deserializePersistedTableState(blob, 1, ["columnFilters"])).toEqual({});
  });

  it("rejects columnVisibility arrays", () => {
    const blob = JSON.stringify({ version: 1, columnVisibility: [] });
    expect(deserializePersistedTableState(blob, 1, ["columnVisibility"])).toEqual({});
  });

  it("does not throw on malformed JSON", () => {
    expect(() =>
      deserializePersistedTableState("{bad", 1, ["pageSize"]),
    ).not.toThrow();
  });

  it("rejects non-finite pageSize values", () => {
    const blob = JSON.stringify({ version: 1, pageSize: Number.NaN });
    expect(deserializePersistedTableState(blob, 1, ["pageSize"])).toEqual({});
  });

  it("ignores sorting in blob when sorting is not a requested field", () => {
    const blob = JSON.stringify({
      version: 1,
      sorting: { columnId: "n", direction: "asc" },
      pageSize: 5,
    });
    expect(deserializePersistedTableState(blob, 1, ["pageSize"])).toEqual({ pageSize: 5 });
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

  it("serialize writes only requested keys with stable JSON shape", () => {
    expect(
      serializePersistedTableState({ pageSize: 10 }, 1, ["pageSize", "sorting"]),
    ).toBe('{"version":1,"pageSize":10}');
  });

  it("serialize excludes pageSize when only sorting is in fields", () => {
    const serialized = serializePersistedTableState(
      {
        sorting: { columnId: "name", direction: "asc" },
        pageSize: 25,
      },
      1,
      ["sorting"],
    );
    const parsed = JSON.parse(serialized) as Record<string, unknown>;
    expect(parsed).toEqual({
      version: 1,
      sorting: { columnId: "name", direction: "asc" },
    });
    expect(parsed.pageSize).toBeUndefined();
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
