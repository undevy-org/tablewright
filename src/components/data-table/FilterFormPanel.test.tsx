import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterFormPanel } from "./FilterFormPanel";
import type { ManagedFilterChange } from "./managed-filters";
import type { ColumnFilterConfig } from "./filter-types";

const enumWithEmptyOption: Record<string, ColumnFilterConfig> = {
  status: {
    type: "enum",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Empty", value: "" },
    ],
  },
};

const textConfig: Record<string, ColumnFilterConfig> = {
  note: { type: "text", label: "Note" },
};

const twoTextFields: Record<string, ColumnFilterConfig> = {
  note: { type: "text", label: "Note" },
  title: { type: "text", label: "Title" },
};

const enumMultiConfig: Record<string, ColumnFilterConfig> = {
  status: {
    type: "enum",
    label: "Status",
    options: [
      { label: "Active", value: "active" },
      { label: "Paused", value: "paused" },
    ],
  },
};

const compoundWithEmptyEnum: Record<string, ColumnFilterConfig> = {
  bundle: {
    type: "compound",
    label: "Bundle",
    subFilters: [
      {
        key: "tier",
        type: "enum",
        label: "Tier",
        field: "tier",
        options: [
          { label: "A", value: "a" },
          { label: "Empty tier", value: "" },
        ],
      },
    ],
  },
};

const compoundMultiAndRange: Record<string, ColumnFilterConfig> = {
  bundle: {
    type: "compound",
    label: "Bundle",
    subFilters: [
      { key: "tags", type: "text", label: "Tags", field: "tags" },
      {
        key: "amount",
        type: "number-range",
        label: "Amount",
        field: "amount",
      },
    ],
  },
};

const dateConfig: Record<string, ColumnFilterConfig> = {
  created: { type: "date", label: "Created" },
};

const numberRangeConfig: Record<string, ColumnFilterConfig> = {
  amount: { type: "number-range", label: "Amount" },
};

describe("FilterFormPanel multi-value guard", () => {
  it("does not emit a change for a text field with multiple values when Apply is untouched", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["a", "b"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("a, b")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([]);
  });

  it("removes a multi-value text filter after Clear to edit one value and Apply", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["a", "b"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear to edit one value" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([{ columnId: "note", action: "remove" }]);
  });

  it("sets a single text value after clearing a multi-value field and typing", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["a", "b"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear to edit one value" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), {
      target: { value: "solo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "note", action: "set", value: ["solo"] },
    ]);
  });

  it("does not overwrite an enum with two values when Apply is untouched", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={enumMultiConfig}
        fields={["status"]}
        filters={[{ columnId: "status", value: ["active", "paused"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("Active, Paused")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([]);
  });

  it("summarizes three or more text values by count", () => {
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["a", "b", "c"] }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("3 values")).toBeTruthy();
  });

  it("does not truncate a multi-value compound text sub-filter on Apply", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundMultiAndRange}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["x", "y"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "bundle", action: "set", value: { tags: ["x", "y"] } },
    ]);
  });

  it("applies a number-range change on a compound field while leaving a multi-value text sub-filter alone", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundMultiAndRange}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["x", "y"], amount: { from: 1 } } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount — to" }), {
      target: { value: "9" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      {
        columnId: "bundle",
        action: "set",
        value: { tags: ["x", "y"], amount: { from: 1, to: 9 } },
      },
    ]);
  });

  it("applies an updated date range on Apply", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={dateConfig}
        fields={["created"]}
        filters={[{ columnId: "created", value: { from: "2024-01-01" } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Created — to"), { target: { value: "2024-12-31" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([
      { columnId: "created", action: "set", value: { from: "2024-01-01", to: "2024-12-31" } },
    ]);
  });

  it("removes a number-range filter when both bounds are cleared", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={numberRangeConfig}
        fields={["amount"]}
        filters={[{ columnId: "amount", value: { from: 5, to: 10 } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount — from"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Amount — to"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([{ columnId: "amount", action: "remove" }]);
  });

  it("shows the default multi-value hint copy", () => {
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["a", "b"] }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(
      screen.getByText(
        "Multiple values — edit using the column filter chips or popover above the table.",
      ),
    ).toBeTruthy();
  });

  it("shows the multi-value hint and custom summary labels", () => {
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["a", "b"] }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
        labels={{
          multiValueFormHint: "Use chips for multiple values.",
          valuesCount: (n) => `(${n})`,
          clearFieldForSingleEdit: "Reset field",
        }}
      />,
    );

    expect(screen.getByText("Use chips for multiple values.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Reset field" })).toBeTruthy();
  });

  it("summarizes two long text values by count", () => {
    const longA = "abcdefghijklmnopqrstuvwxy";
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: [longA, "z"] }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("2 values")).toBeTruthy();
  });

  it("summarizes three enum selections by count", () => {
    const threeEnum: Record<string, ColumnFilterConfig> = {
      status: {
        type: "enum",
        label: "Status",
        options: [
          { label: "A", value: "a" },
          { label: "B", value: "b" },
          { label: "C", value: "c" },
        ],
      },
    };
    render(
      <FilterFormPanel
        filterConfigs={threeEnum}
        fields={["status"]}
        filters={[{ columnId: "status", value: ["a", "b", "c"] }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("3 selected")).toBeTruthy();
  });

  it("clears a compound enum sub-filter after Clear to edit one value", () => {
    const compoundEnumMulti: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [
          {
            key: "status",
            type: "enum",
            label: "Status",
            field: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
        ],
      },
    };
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundEnumMulti}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { status: ["active", "paused"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear to edit one value" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([{ columnId: "bundle", action: "remove" }]);
  });

  it("clears a compound text sub-filter by emptying the input", () => {
    const compoundTextOnly: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [{ key: "tags", type: "text", label: "Tags", field: "tags" }],
      },
    };
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundTextOnly}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["one"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Tags" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([{ columnId: "bundle", action: "remove" }]);
  });

  it("does not overwrite compound enum sub-filter with multiple values on Apply", () => {
    const compoundEnumMulti: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [
          {
            key: "status",
            type: "enum",
            label: "Status",
            field: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
        ],
      },
    };
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundEnumMulti}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { status: ["active", "paused"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([
      { columnId: "bundle", action: "set", value: { status: ["active", "paused"] } },
    ]);
  });

  it("removes a single-value text filter when the input is cleared", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["solo"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([{ columnId: "note", action: "remove" }]);
  });

  it("edits compound text sub-filter and applies a single value", () => {
    const compoundTextOnly: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [{ key: "tags", type: "text", label: "Tags", field: "tags" }],
      },
    };
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundTextOnly}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["one"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Tags" }), {
      target: { value: "two" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([
      { columnId: "bundle", action: "set", value: { tags: ["two"] } },
    ]);
  });

  it("clears a compound multi-value text sub-filter via Clear to edit one value", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundMultiAndRange}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["x", "y"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    const clearButtons = screen.getAllByRole("button", { name: "Clear to edit one value" });
    fireEvent.click(clearButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([{ columnId: "bundle", action: "remove" }]);
  });

  it("shows read-only summary for compound enum sub-filter with multiple values", () => {
    const compoundEnumMulti: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [
          {
            key: "status",
            type: "enum",
            label: "Status",
            field: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
        ],
      },
    };
    render(
      <FilterFormPanel
        filterConfigs={compoundEnumMulti}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { status: ["active", "paused"] } }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByText("Active, Paused")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Status" })).toBeNull();
  });

  it("renders compound enum sub-filter as combobox for a single value", () => {
    const compoundEnumSingle: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [
          {
            key: "status",
            type: "enum",
            label: "Status",
            field: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
        ],
      },
    };
    render(
      <FilterFormPanel
        filterConfigs={compoundEnumSingle}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { status: ["active"] } }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Status" }).textContent).toContain("Active");
  });

  it("omits hidden compound sub-filters from the form", () => {
    render(
      <FilterFormPanel
        filterConfigs={compoundMultiAndRange}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["x"], amount: { from: 1 } } }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
        hiddenSubFilterKeys={["bundle:tags"]}
      />,
    );

    expect(screen.queryByRole("textbox", { name: "Tags" })).toBeNull();
    expect(screen.getByRole("spinbutton", { name: "Amount — from" })).toBeTruthy();
  });

  it("calls onClear with managed column ids when Clear is pressed", () => {
    const onClear = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["a"] }]}
        onApply={vi.fn()}
        onClear={onClear}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledWith(["note"]);
  });

  it("reseeds untouched fields when filters change externally", () => {
    const { rerender } = render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["first"] }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    rerender(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["second"] }]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect((screen.getByRole("textbox", { name: "Note" }) as HTMLInputElement).value).toBe(
      "second",
    );
  });

  it("shows Any for a top-level enum with no selection", () => {
    render(
      <FilterFormPanel
        filterConfigs={enumMultiConfig}
        fields={["status"]}
        filters={[]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Status" }).textContent).toContain("Any");
  });

  it("renders an empty text input for a single-value field with no filter", () => {
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect((screen.getByRole("textbox", { name: "Note" }) as HTMLInputElement).value).toBe("");
  });

  it("applies a new inactive column without removing other active filters", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={twoTextFields}
        fields={["note", "title"]}
        filters={[{ columnId: "note", value: ["kept"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "added" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    const changes = onApply.mock.calls[0][0];
    expect(changes).toContainEqual({
      columnId: "title",
      action: "set",
      value: ["added"],
    });
    expect(
      changes.some((c: ManagedFilterChange) => c.columnId === "note" && c.action === "remove"),
    ).toBe(false);
  });

  it("adds a text filter when the column was not previously active", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), {
      target: { value: "fresh" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([
      { columnId: "note", action: "set", value: ["fresh"] },
    ]);
  });

  it("edits a single-value text field normally", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={textConfig}
        fields={["note"]}
        filters={[{ columnId: "note", value: ["solo"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    expect((screen.getByRole("textbox", { name: "Note" }) as HTMLInputElement).value).toBe("solo");

    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), {
      target: { value: "updated" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([
      { columnId: "note", action: "set", value: ["updated"] },
    ]);
  });

  it("applies a top-level number-range filter", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={numberRangeConfig}
        fields={["amount"]}
        filters={[]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount — from" }), {
      target: { value: "10" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount — to" }), {
      target: { value: "20" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "amount", action: "set", value: { from: 10, to: 20 } },
    ]);
  });

  it("removes a top-level number-range filter when both bounds are cleared", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={numberRangeConfig}
        fields={["amount"]}
        filters={[{ columnId: "amount", value: { from: 5, to: 15 } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount — from" }), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount — to" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([{ columnId: "amount", action: "remove" }]);
  });

  it("edits compound number-range sub-filter bounds", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundMultiAndRange}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { amount: { from: 1 } } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount — to" }), {
      target: { value: "99" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "bundle", action: "set", value: { amount: { from: 1, to: 99 } } },
    ]);
  });

  it("changes a single-value compound enum sub-filter via combobox", () => {
    const compoundEnumSingle: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [
          {
            key: "status",
            type: "enum",
            label: "Status",
            field: "status",
            options: [
              { label: "Active", value: "active" },
              { label: "Paused", value: "paused" },
            ],
          },
        ],
      },
    };
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundEnumSingle}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { status: ["active"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: /Paused/i }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "bundle", action: "set", value: { status: ["paused"] } },
    ]);
  });

  it("preserves multi-value text when editing another compound sub-filter", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundMultiAndRange}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["x", "y"], amount: { from: 1 } } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: "Amount — to" }), {
      target: { value: "50" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      {
        columnId: "bundle",
        action: "set",
        value: { tags: ["x", "y"], amount: { from: 1, to: 50 } },
      },
    ]);
  });

  it("renders compound text sub-filter placeholder from the sub label", () => {
    render(
      <FilterFormPanel
        filterConfigs={compoundMultiAndRange}
        fields={["bundle"]}
        filters={[]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByPlaceholderText("Tags").getAttribute("placeholder")).toBe("Tags");
  });

  it("clears compound field state when the last sub-filter is emptied", () => {
    const compoundTextOnly: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [{ key: "tags", type: "text", label: "Tags", field: "tags" }],
      },
    };
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundTextOnly}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tags: ["solo"] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Tags" }), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledWith([{ columnId: "bundle", action: "remove" }]);
  });

  it("keeps the title draft when note is edited again", () => {
    render(
      <FilterFormPanel
        filterConfigs={twoTextFields}
        fields={["note", "title"]}
        filters={[]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), { target: { value: "t" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), { target: { value: "n" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), { target: { value: "n2" } });

    expect((screen.getByRole("textbox", { name: "Title" }) as HTMLInputElement).value).toBe("t");
  });

  it("keeps independent draft state across two text fields", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={twoTextFields}
        fields={["note", "title"]}
        filters={[]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("textbox", { name: "Note" }), { target: { value: "n" } });
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), { target: { value: "t" } });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "note", action: "set", value: ["n"] },
      { columnId: "title", action: "set", value: ["t"] },
    ]);
  });

  it("spans compound layout by visible sub-filter count", () => {
    const threeSubs: Record<string, ColumnFilterConfig> = {
      bundle: {
        type: "compound",
        label: "Bundle",
        subFilters: [
          { key: "a", type: "text", label: "A", field: "a" },
          { key: "b", type: "text", label: "B", field: "b" },
          { key: "c", type: "text", label: "C", field: "c" },
        ],
      },
    };
    render(
      <FilterFormPanel
        filterConfigs={threeSubs}
        fields={["bundle"]}
        filters={[]}
        onApply={vi.fn()}
        onClear={vi.fn()}
      />,
    );

    const label = screen.getByText("Bundle");
    const wrapper = label.parentElement;
    expect(wrapper?.style.gridColumn).toBe("span 3");
  });

  it("does not apply a new single enum selection until the multi-value field was cleared", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={enumMultiConfig}
        fields={["status"]}
        filters={[{ columnId: "status", value: ["active", "paused"] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear to edit one value" }));
    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: /Active/i }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "status", action: "set", value: ["active"] },
    ]);
  });
});

describe("FilterFormPanel enum empty string value", () => {
  it("shows and applies a top-level enum option whose value is empty string", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={enumWithEmptyOption}
        fields={["status"]}
        filters={[{ columnId: "status", value: [""] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Status" }).textContent).toContain("Empty");

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "status", action: "set", value: [""] },
    ]);
  });

  it("clears a top-level enum empty-string selection back to no filter on Apply", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={enumWithEmptyOption}
        fields={["status"]}
        filters={[{ columnId: "status", value: [""] }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: /Empty/i }));

    expect(screen.getByRole("button", { name: "Status" }).textContent).toContain("Any");

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([{ columnId: "status", action: "remove" }]);
  });

  it("shows and applies a compound sub-filter enum option whose value is empty string", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundWithEmptyEnum}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tier: [""] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Tier" }).textContent).toContain("Empty tier");

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([
      { columnId: "bundle", action: "set", value: { tier: [""] } },
    ]);
  });

  it("clears a compound sub-filter empty-string enum selection on Apply", () => {
    const onApply = vi.fn();
    render(
      <FilterFormPanel
        filterConfigs={compoundWithEmptyEnum}
        fields={["bundle"]}
        filters={[{ columnId: "bundle", value: { tier: [""] } }]}
        onApply={onApply}
        onClear={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Tier" }));
    fireEvent.click(screen.getByRole("option", { name: /Empty tier/i }));

    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(onApply).toHaveBeenCalledWith([{ columnId: "bundle", action: "remove" }]);
  });
});
