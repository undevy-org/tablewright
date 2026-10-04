import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterChipPopoverTrigger } from "./FilterChipPopoverTrigger";

describe("FilterChipPopoverTrigger", () => {
  it("renders the label and value for filter chips", () => {
    render(
      <FilterChipPopoverTrigger label="Status" value="Active" onRemove={vi.fn()} active />,
    );

    expect(screen.getByText("Status")).toBeTruthy();
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("calls onRemove without bubbling to the popover trigger", () => {
    const onRemove = vi.fn();
    const onTriggerClick = vi.fn();

    render(
      <FilterChipPopoverTrigger
        label="Status"
        value="Active"
        active
        onRemove={onRemove}
        onClick={onTriggerClick}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove Status filter" }));

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onTriggerClick).not.toHaveBeenCalled();
  });
});
