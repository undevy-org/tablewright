import { describe, expect, it } from "vitest";

import type { ColumnFilterConfig } from "./filter-types";
import {
  compoundSubTouchKey,
  enumComboboxSelection,
  formatEnumMultiSummary,
  formatTextMultiSummary,
  mergeCompoundSubDraft,
  mergeCompoundValueForApply,
  patchFieldState,
  recordFilterFieldTouch,
  resolveFieldApplyChange,
  shouldPreserveMultiSubOnApply,
  singleStringDraftValue,
} from "./filter-form-panel-apply";

const summaryLabels = {
  valuesCount: (n: number) => `${n} values`,
  selectedCount: (n: number) => `${n} selected`,
};

const compoundConfig: ColumnFilterConfig = {
  type: "compound",
  label: "Bundle",
  subFilters: [
    { key: "tags", type: "text", label: "Tags", field: "tags" },
    { key: "status", type: "enum", label: "Status", field: "status", options: [{ label: "A", value: "a" }] },
    { key: "amount", type: "number-range", label: "Amount", field: "amount" },
  ],
};

describe("compoundSubTouchKey", () => {
  it("joins field id and sub key", () => {
    expect(compoundSubTouchKey("bundle", "tags")).toBe("bundle:tags");
  });
});

describe("recordFilterFieldTouch", () => {
  it("records field and compound sub keys", () => {
    const touched = new Set<string>();
    recordFilterFieldTouch(touched, "bundle", "tags");
    expect(touched).toEqual(new Set(["bundle", "bundle:tags"]));
  });

  it("records only the field id when no compound sub key is provided", () => {
    const touched = new Set<string>();
    recordFilterFieldTouch(touched, "note");
    expect(touched).toEqual(new Set(["note"]));
  });
});

describe("singleStringDraftValue", () => {
  it("returns the first string or empty when the array is empty", () => {
    expect(singleStringDraftValue(["a"])).toBe("a");
    expect(singleStringDraftValue([])).toBe("");
  });
});

describe("enumComboboxSelection", () => {
  it("returns null for an empty selection and the first value otherwise", () => {
    expect(enumComboboxSelection([])).toBeNull();
    expect(enumComboboxSelection(["active"])).toBe("active");
    expect(enumComboboxSelection([""])).toBe("");
  });
});

describe("mergeCompoundSubDraft", () => {
  it("merges a sub-filter update into the compound draft", () => {
    expect(mergeCompoundSubDraft({ tags: ["a"] }, "amount", { from: 1 })).toEqual({
      tags: ["a"],
      amount: { from: 1 },
    });
  });

  it("returns undefined when every sub-filter is removed", () => {
    const cleared = mergeCompoundSubDraft({ tags: ["solo"] }, "tags", undefined);
    expect(cleared).toBeUndefined();
    expect(cleared).not.toEqual({});
  });

  it("drops a sub-filter when the next value is an empty array", () => {
    expect(mergeCompoundSubDraft({ tags: ["a"], amount: { from: 1 } }, "tags", [])).toEqual({
      amount: { from: 1 },
    });
  });

  it("replaces a sub-filter value when next is non-empty", () => {
    expect(mergeCompoundSubDraft({ tags: ["a"] }, "tags", ["b"])).toEqual({ tags: ["b"] });
  });
});

describe("patchFieldState", () => {
  it("updates one field without dropping other draft values", () => {
    const prev = { note: ["a"], title: ["b"] };
    expect(patchFieldState(prev, "note", ["next"])).toEqual({
      note: ["next"],
      title: ["b"],
    });
  });
});

describe("formatTextMultiSummary", () => {
  it("joins two short values", () => {
    expect(formatTextMultiSummary(["a", "b"], summaryLabels)).toBe("a, b");
  });

  it("joins two values when the joined string is exactly 24 characters", () => {
    const left = "0123456789";
    const right = "012345678901";
    expect(formatTextMultiSummary([left, right], summaryLabels)).toBe(`${left}, ${right}`);
  });

  it("uses count when two values join longer than 24 characters", () => {
    const long = "abcdefghijklmnopqrstuvwxy";
    expect(formatTextMultiSummary([long, "z"], summaryLabels)).toBe("2 values");
  });

  it("uses count for three or more values", () => {
    expect(formatTextMultiSummary(["a", "b", "c"], summaryLabels)).toBe("3 values");
  });
});

describe("formatEnumMultiSummary", () => {
  const options = [
    { label: "Active", value: "active" },
    { label: "Paused", value: "paused" },
  ];

  it("joins two short labels", () => {
    expect(formatEnumMultiSummary(["active", "paused"], options, summaryLabels)).toBe(
      "Active, Paused",
    );
  });

  it("falls back to raw value when option is missing", () => {
    expect(formatEnumMultiSummary(["active", "missing"], options, summaryLabels)).toBe(
      "Active, missing",
    );
  });

  it("uses selected count when joined labels exceed 24 characters", () => {
    const wide = [
      { label: "abcdefghijklmnopqrstuvwxy", value: "a" },
      { label: "z", value: "b" },
    ];
    expect(formatEnumMultiSummary(["a", "b"], wide, summaryLabels)).toBe("2 selected");
  });

  it("uses selected count for three or more values", () => {
    expect(formatEnumMultiSummary(["a", "b", "c"], options, summaryLabels)).toBe("3 selected");
  });

  it("joins two values when options are undefined", () => {
    expect(formatEnumMultiSummary(["x", "y"], undefined, summaryLabels)).toBe("x, y");
  });

  it("joins two enum labels when the joined string is exactly 24 characters", () => {
    const left = "0123456789";
    const right = "012345678901";
    const opts = [
      { label: left, value: "a" },
      { label: right, value: "b" },
    ];
    expect(formatEnumMultiSummary(["a", "b"], opts, summaryLabels)).toBe(`${left}, ${right}`);
  });
});

describe("resolveFieldApplyChange", () => {
  const text: ColumnFilterConfig = { type: "text", label: "Note" };
  const enumCfg: ColumnFilterConfig = {
    type: "enum",
    label: "Status",
    options: [{ label: "A", value: "a" }],
  };
  const date: ColumnFilterConfig = { type: "date", label: "Created" };
  const range: ColumnFilterConfig = { type: "number-range", label: "Amount" };

  it("skips untouched multi-value text", () => {
    expect(
      resolveFieldApplyChange(text, "note", ["a", "b"], ["a", "b"], new Set(), new Set(), true),
    ).toEqual({ kind: "skip" });
  });

  it("does not apply a truncated draft for untouched multi-value text", () => {
    expect(
      resolveFieldApplyChange(text, "note", ["a", "b"], ["a"], new Set(), new Set(), true),
    ).toEqual({ kind: "skip" });
  });

  it("removes active text after clear (touched, empty draft)", () => {
    expect(
      resolveFieldApplyChange(text, "note", ["a", "b"], undefined, new Set(["note"]), new Set(), true),
    ).toEqual({ kind: "remove" });
  });

  it("removes an active text filter when the draft is an empty array", () => {
    expect(
      resolveFieldApplyChange(text, "note", ["solo"], [], new Set(["note"]), new Set(), true),
    ).toEqual({ kind: "remove" });
  });

  it("sets a new text filter when the column was not active", () => {
    expect(
      resolveFieldApplyChange(text, "note", undefined, ["new"], new Set(["note"]), new Set(), false),
    ).toEqual({ kind: "set", value: ["new"] });
  });

  it("sets single text after edit", () => {
    expect(
      resolveFieldApplyChange(text, "note", ["a", "b"], ["solo"], new Set(["note"]), new Set(), true),
    ).toEqual({ kind: "set", value: ["solo"] });
  });

  it("skips remove when inactive and draft empty", () => {
    expect(
      resolveFieldApplyChange(text, "note", undefined, undefined, new Set(), new Set(), false),
    ).toEqual({ kind: "skip" });
  });

  it("skips untouched multi-value enum", () => {
    expect(
      resolveFieldApplyChange(
        enumCfg,
        "status",
        ["a", "b"],
        ["a", "b"],
        new Set(),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "skip" });
  });

  it("sets date range draft", () => {
    const draft = { from: "2024-01-01", to: "2024-02-01" };
    expect(
      resolveFieldApplyChange(date, "created", { from: "2024-01-01" }, draft, new Set(), new Set(), true),
    ).toEqual({ kind: "set", value: draft });
  });

  it("removes active date when draft is an empty object", () => {
    expect(
      resolveFieldApplyChange(
        date,
        "created",
        { from: "2024-01-01" },
        {},
        new Set(["created"]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "remove" });
  });

  it("removes active date when draft cleared", () => {
    expect(
      resolveFieldApplyChange(
        date,
        "created",
        { from: "2024-01-01" },
        undefined,
        new Set(["created"]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "remove" });
  });

  it("sets number-range draft", () => {
    expect(
      resolveFieldApplyChange(range, "amount", { from: 1 }, { from: 1, to: 9 }, new Set(["amount"]), new Set(), true),
    ).toEqual({ kind: "set", value: { from: 1, to: 9 } });
  });

  it("removes active compound when the touched draft clears every sub-filter", () => {
    expect(
      resolveFieldApplyChange(
        compoundConfig,
        "bundle",
        { tags: ["only"] },
        {},
        new Set(["bundle"]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "remove" });
  });

  it("removes compound when merged result is empty and field is active", () => {
    expect(
      resolveFieldApplyChange(
        compoundConfig,
        "bundle",
        { tags: ["only"] },
        {},
        new Set(["bundle"]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "remove" });
  });

  it("skips compound apply when inactive and merged draft is empty", () => {
    expect(
      resolveFieldApplyChange(
        compoundConfig,
        "bundle",
        undefined,
        {},
        new Set(["bundle"]),
        new Set(),
        false,
      ),
    ).toEqual({ kind: "skip" });
  });

  it("skips compound clear when field was never active", () => {
    expect(
      resolveFieldApplyChange(compoundConfig, "bundle", undefined, {}, new Set(), new Set(), false),
    ).toEqual({ kind: "skip" });
  });

  it("sets active single-value text without touching multi guard", () => {
    expect(
      resolveFieldApplyChange(text, "note", ["solo"], ["next"], new Set(["note"]), new Set(), true),
    ).toEqual({ kind: "set", value: ["next"] });
  });

  it("skips inactive date when draft is empty", () => {
    expect(
      resolveFieldApplyChange(date, "created", undefined, undefined, new Set(), new Set(), false),
    ).toEqual({ kind: "skip" });
  });

  it("skips inactive number-range when draft is empty", () => {
    expect(
      resolveFieldApplyChange(range, "amount", undefined, undefined, new Set(), new Set(), false),
    ).toEqual({ kind: "skip" });
  });

  it("removes active number-range when the draft becomes undefined after edit", () => {
    expect(
      resolveFieldApplyChange(
        range,
        "amount",
        { from: 1, to: 2 },
        undefined,
        new Set(["amount"]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "remove" });
  });

  it("sets number-range when only one bound changes", () => {
    expect(
      resolveFieldApplyChange(
        range,
        "amount",
        { from: 1, to: 2 },
        { from: 5 },
        new Set(["amount"]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "set", value: { from: 5 } });
  });

  it("removes active number-range when draft is cleared after edit", () => {
    expect(
      resolveFieldApplyChange(
        range,
        "amount",
        { from: 1, to: 2 },
        undefined,
        new Set(["amount"]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "remove" });
  });

  it("skips unknown filter types", () => {
    const unknown = { type: "unknown", label: "X" } as unknown as ColumnFilterConfig;
    expect(
      resolveFieldApplyChange(unknown, "x", undefined, undefined, new Set(), new Set(), false),
    ).toEqual({ kind: "skip" });
  });

  it("sets compound payload for legacy keys when subFilters is empty", () => {
    const emptyCompound: ColumnFilterConfig = { type: "compound", label: "Empty", subFilters: [] };
    expect(
      resolveFieldApplyChange(
        emptyCompound,
        "empty",
        { legacy: ["a"] },
        { legacy: ["a"] },
        new Set(),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "set", value: { legacy: ["a"] } });
  });

  it("sets compound merged payload when sub-filters change", () => {
    const draft = { amount: { from: 2 } };
    expect(
      resolveFieldApplyChange(
        compoundConfig,
        "bundle",
        { amount: { from: 1 } },
        draft,
        new Set([compoundSubTouchKey("bundle", "amount")]),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "set", value: draft });
  });
});

describe("shouldPreserveMultiSubOnApply", () => {
  const textSub = { key: "tags", type: "text" as const, label: "Tags", field: "tags" };
  const enumSub = {
    key: "status",
    type: "enum" as const,
    label: "Status",
    field: "status",
  };
  const rangeSub = {
    key: "amount",
    type: "number-range" as const,
    label: "Amount",
    field: "amount",
  };

  it("is true for untouched multi-value text and enum sub-filters", () => {
    const touched = new Set<string>();
    expect(
      shouldPreserveMultiSubOnApply(textSub, ["a", "b"], compoundSubTouchKey("b", "tags"), touched),
    ).toBe(true);
    expect(
      shouldPreserveMultiSubOnApply(
        enumSub,
        ["a", "b"],
        compoundSubTouchKey("b", "status"),
        touched,
      ),
    ).toBe(true);
  });

  it("is false for number-range sub-filters and after touch", () => {
    const touchKey = compoundSubTouchKey("b", "tags");
    expect(shouldPreserveMultiSubOnApply(rangeSub, { from: 1 }, touchKey, new Set())).toBe(false);
    expect(shouldPreserveMultiSubOnApply(textSub, ["a", "b"], touchKey, new Set([touchKey]))).toBe(
      false,
    );
  });

  it("is false for a single-value text sub-filter", () => {
    expect(
      shouldPreserveMultiSubOnApply(
        textSub,
        ["solo"],
        compoundSubTouchKey("b", "tags"),
        new Set(),
      ),
    ).toBe(false);
  });

  it("is false when committed value is undefined", () => {
    expect(
      shouldPreserveMultiSubOnApply(textSub, undefined, compoundSubTouchKey("b", "tags"), new Set()),
    ).toBe(false);
  });

  it("is false for number-range sub-filters with object committed values", () => {
    expect(
      shouldPreserveMultiSubOnApply(
        rangeSub,
        { from: 1, to: 2 },
        compoundSubTouchKey("b", "amount"),
        new Set(),
      ),
    ).toBe(false);
  });
});

describe("mergeCompoundValueForApply", () => {
  const hidden = new Set<string>();
  const touched = new Set<string>();

  it("preserves untouched multi-value text sub-filter from committed state", () => {
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["x", "y"] },
      { tags: ["x", "y"] },
      touched,
      hidden,
    );
    expect(merged).toEqual({ tags: ["x", "y"] });
  });

  it("keeps committed multi-value text when draft was truncated to one value but sub-filter was not touched", () => {
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["x", "y"] },
      { tags: ["x"] },
      touched,
      hidden,
    );
    expect(merged).toEqual({ tags: ["x", "y"] });
  });

  it("applies draft for touched multi-value sub after clear", () => {
    const touch = new Set([compoundSubTouchKey("bundle", "tags")]);
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["x", "y"] },
      { tags: ["solo"] },
      touch,
      hidden,
    );
    expect(merged).toEqual({ tags: ["solo"] });
  });

  it("carries hidden sub-filters from draft on apply without edits", () => {
    const hide = new Set([compoundSubTouchKey("bundle", "tags")]);
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["x"], amount: { from: 1 } },
      { tags: ["x"], amount: { from: 1 } },
      touched,
      hide,
    );
    expect(merged).toEqual({ tags: ["x"], amount: { from: 1 } });
  });

  it("updates only visible sub-filters when hidden sub-filters share the compound draft", () => {
    const hide = new Set([compoundSubTouchKey("bundle", "tags")]);
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["x", "y"], amount: { from: 1 } },
      { tags: ["x", "y"], amount: { from: 1, to: 2 } },
      new Set([compoundSubTouchKey("bundle", "amount")]),
      hide,
    );
    expect(merged).toEqual({ tags: ["x", "y"], amount: { from: 1, to: 2 } });
  });

  it("does not write empty draft sub-values into the merged compound payload", () => {
    const touch = new Set([compoundSubTouchKey("bundle", "tags")]);
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["solo"] },
      { amount: { from: 1 } },
      touch,
      hidden,
    );
    expect(merged).toEqual({ amount: { from: 1 } });
  });

  it("merges number-range draft alongside preserved multi text", () => {
    const touch = new Set([compoundSubTouchKey("bundle", "amount")]);
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["x", "y"], amount: { from: 1 } },
      { tags: ["x", "y"], amount: { from: 1, to: 9 } },
      touch,
      hidden,
    );
    expect(merged).toEqual({ tags: ["x", "y"], amount: { from: 1, to: 9 } });
  });

  it("preserves untouched multi-value enum sub-filter", () => {
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { status: ["a", "b"] },
      { status: ["a", "b"] },
      touched,
      hidden,
    );
    expect(merged).toEqual({ status: ["a", "b"] });
  });

  it("ignores empty draft sub-values while preserving multi-value committed sub-filters", () => {
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["x", "y"], amount: { from: 1 } },
      { tags: ["x", "y"] },
      touched,
      hidden,
    );
    expect(merged).toEqual({ tags: ["x", "y"] });
  });

  it("does not treat a single-value committed array as multi-value preserve", () => {
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["solo"] },
      { tags: ["solo"], amount: { from: 2 } },
      new Set([compoundSubTouchKey("bundle", "amount")]),
      hidden,
    );
    expect(merged).toEqual({ tags: ["solo"], amount: { from: 2 } });
  });

  it("preserves committed multi-value text when another sub-filter is edited", () => {
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["a", "b"], amount: { from: 1 } },
      { amount: { from: 1, to: 9 } },
      new Set([compoundSubTouchKey("bundle", "amount")]),
      hidden,
    );
    expect(merged).toEqual({ tags: ["a", "b"], amount: { from: 1, to: 9 } });
  });

  it("carries legacy compound keys when config has no subFilters array", () => {
    const bare: ColumnFilterConfig = { type: "compound", label: "Bare" };
    expect(
      mergeCompoundValueForApply(bare, "bare", { legacy: ["a"] }, { legacy: ["a"] }, touched, hidden),
    ).toEqual({ legacy: ["a"] });
  });

  it("carries legacy compound keys when subFilters is an empty array", () => {
    const empty: ColumnFilterConfig = { type: "compound", label: "Empty", subFilters: [] };
    expect(
      mergeCompoundValueForApply(empty, "empty", { legacy: ["a"] }, { legacy: ["a"] }, touched, hidden),
    ).toEqual({ legacy: ["a"] });
  });

  it("omits empty draft sub-filters while keeping other sub-filter values", () => {
    const touch = new Set([compoundSubTouchKey("bundle", "tags")]);
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["solo"], amount: { from: 1 } },
      { tags: [], amount: { from: 1 } },
      touch,
      hidden,
    );
    expect(merged).toEqual({ amount: { from: 1 } });
  });

  it("skips empty draft sub-values without copying undefined committed keys", () => {
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { amount: { from: 1 } },
      { amount: { from: 2 } },
      new Set([compoundSubTouchKey("bundle", "amount")]),
      hidden,
    );
    expect(merged).toEqual({ amount: { from: 2 } });
  });

  it("drops a cleared sub-filter from the merged compound payload", () => {
    const touch = new Set([compoundSubTouchKey("bundle", "tags")]);
    const merged = mergeCompoundValueForApply(
      compoundConfig,
      "bundle",
      { tags: ["solo"], amount: { from: 1 } },
      { amount: { from: 1 } },
      touch,
      hidden,
    );
    expect(merged).toEqual({ amount: { from: 1 } });
  });

  it("drops a visible sub-filter when the draft omits a cleared key", () => {
    const touch = new Set([compoundSubTouchKey("bundle", "tags")]);
    expect(
      mergeCompoundValueForApply(
        compoundConfig,
        "bundle",
        { tags: ["solo"], amount: { from: 1 } },
        { amount: { from: 1 } },
        touch,
        hidden,
      ),
    ).toEqual({ amount: { from: 1 } });
  });

  it("drops a visible number-range sub-filter when the draft becomes an empty range object", () => {
    const touch = new Set([compoundSubTouchKey("bundle", "amount")]);
    expect(
      mergeCompoundValueForApply(
        compoundConfig,
        "bundle",
        { tags: ["solo"], amount: { from: 1 } },
        { tags: ["solo"], amount: {} },
        touch,
        hidden,
      ),
    ).toEqual({ tags: ["solo"] });
  });

  it("omits empty values carried from draft for hidden sub-filters", () => {
    const hide = new Set([compoundSubTouchKey("bundle", "tags")]);
    expect(
      mergeCompoundValueForApply(
        compoundConfig,
        "bundle",
        { tags: [], amount: { from: 1 } },
        { tags: [], amount: { from: 1 } },
        touched,
        hide,
      ),
    ).toEqual({ amount: { from: 1 } });
  });

  it("returns undefined when the draft compound has no non-empty values", () => {
    expect(
      mergeCompoundValueForApply(
        compoundConfig,
        "bundle",
        { tags: [], amount: {} },
        { tags: [], amount: {} },
        touched,
        hidden,
      ),
    ).toBeUndefined();
  });

  it("carries hidden sub-filter values when every configured sub-filter is hidden", () => {
    const hideAll = new Set([
      compoundSubTouchKey("bundle", "tags"),
      compoundSubTouchKey("bundle", "status"),
      compoundSubTouchKey("bundle", "amount"),
    ]);
    expect(
      mergeCompoundValueForApply(
        compoundConfig,
        "bundle",
        { tags: ["a", "b"] },
        { tags: ["a", "b"] },
        touched,
        hideAll,
      ),
    ).toEqual({ tags: ["a", "b"] });
  });

  it("uses an empty subFilters list when config has no sub-filters", () => {
    const emptyCompound: ColumnFilterConfig = { type: "compound", label: "Empty", subFilters: [] };
    expect(
      resolveFieldApplyChange(emptyCompound, "empty", undefined, {}, new Set(), new Set(), false),
    ).toEqual({ kind: "skip" });
  });

  it("keeps an active legacy compound value when the config defines no sub-filters", () => {
    const emptyCompound: ColumnFilterConfig = { type: "compound", label: "Empty" };
    expect(
      resolveFieldApplyChange(
        emptyCompound,
        "empty",
        { legacy: ["a"] },
        { legacy: ["a"] },
        new Set(),
        new Set(),
        true,
      ),
    ).toEqual({ kind: "set", value: { legacy: ["a"] } });
  });

  it("applies only text sub-filter drafts when enum sub-filter stays multi-value", () => {
    const textOnly: ColumnFilterConfig = {
      type: "compound",
      label: "Mix",
      subFilters: [
        { key: "tags", type: "text", label: "Tags", field: "tags" },
        { key: "status", type: "enum", label: "Status", field: "status" },
      ],
    };
    const touch = new Set([compoundSubTouchKey("mix", "tags")]);
    const merged = mergeCompoundValueForApply(
      textOnly,
      "mix",
      { tags: ["x", "y"], status: ["a", "b"] },
      { tags: ["solo"], status: ["a", "b"] },
      touch,
      hidden,
    );
    expect(merged).toEqual({ tags: ["solo"], status: ["a", "b"] });
  });
});
