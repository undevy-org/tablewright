import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { FilterFormPanel } from "./FilterFormPanel";
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
