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
