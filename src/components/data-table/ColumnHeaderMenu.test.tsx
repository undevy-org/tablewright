import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColumnHeaderMenu } from "./ColumnHeaderMenu";

function openMenu() {
  const trigger = screen.getByRole("button", { name: "Status" });
  act(() => {
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.click(trigger);
  });
}

describe("ColumnHeaderMenu", () => {
  it("renders pin actions when callbacks are provided", () => {
    render(
      <ColumnHeaderMenu
        label="Status"
        onPinLeft={vi.fn()}
        onPinRight={vi.fn()}
        onUnpin={vi.fn()}
        pinSide="left"
      />,
    );

    openMenu();

    expect(screen.getByRole("menuitem", { name: /Pin left/i })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Pin right/i })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: /Unpin/i })).toBeTruthy();
  });

  it("calls onPinLeft when Pin left is clicked", () => {
    const onPinLeft = vi.fn();

    render(<ColumnHeaderMenu label="Status" onPinLeft={onPinLeft} />);

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pin left/i }));
    expect(onPinLeft).toHaveBeenCalledTimes(1);
  });

  it("activates onPinLeft from the keyboard when the pin item is focused", () => {
    const onPinLeft = vi.fn();

    render(<ColumnHeaderMenu label="Status" onPinLeft={onPinLeft} />);

    openMenu();
    const pinLeft = screen.getByRole("menuitem", { name: /Pin left/i });
    pinLeft.focus();
    fireEvent.keyDown(pinLeft, { key: "Enter", code: "Enter" });
    expect(onPinLeft).toHaveBeenCalledTimes(1);
  });

  it("calls onUnpin when Unpin is clicked", () => {
    const onUnpin = vi.fn();

    render(
      <ColumnHeaderMenu label="Status" onUnpin={onUnpin} pinSide="left" />,
    );

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Unpin/i }));
    expect(onUnpin).toHaveBeenCalledTimes(1);
  });

  it("activates onUnpin from the keyboard when the unpin item is focused", () => {
    const onUnpin = vi.fn();

    render(
      <ColumnHeaderMenu label="Status" onUnpin={onUnpin} pinSide="left" />,
    );

    openMenu();
    const unpin = screen.getByRole("menuitem", { name: /Unpin/i });
    unpin.focus();
    fireEvent.keyDown(unpin, { key: "Enter", code: "Enter" });
    expect(onUnpin).toHaveBeenCalledTimes(1);
  });

  it("calls onPinRight when Pin right is clicked", () => {
    const onPinRight = vi.fn();

    render(<ColumnHeaderMenu label="Status" onPinRight={onPinRight} />);

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Pin right/i }));
    expect(onPinRight).toHaveBeenCalledTimes(1);
  });

  it("shows a check on the active pin side", () => {
    const { unmount: unmountLeft } = render(
      <ColumnHeaderMenu label="Status" onPinLeft={vi.fn()} pinSide="left" />,
    );
    openMenu();
    const leftItem = screen.getByRole("menuitem", { name: /Pin left/i });
    expect(leftItem.querySelector("svg.lucide-check")).toBeTruthy();
    unmountLeft();

    render(
      <ColumnHeaderMenu label="Status" onPinRight={vi.fn()} pinSide="right" />,
    );
    openMenu();
    const rightItem = screen.getByRole("menuitem", { name: /Pin right/i });
    expect(rightItem.querySelector("svg.lucide-check")).toBeTruthy();
  });

  it("does not render pin items when no pin callbacks are passed", () => {
    render(<ColumnHeaderMenu label="Status" onHide={vi.fn()} />);

    openMenu();
    expect(screen.queryByRole("menuitem", { name: /Pin left/i })).toBeNull();
  });

  it("does not render unpin when pinSide is false", () => {
    render(<ColumnHeaderMenu label="Status" onUnpin={vi.fn()} pinSide={false} />);

    openMenu();
    expect(screen.queryByRole("menuitem", { name: /Unpin/i })).toBeNull();
  });

  it("does not show a pin checkmark when pinSide is not active", () => {
    render(<ColumnHeaderMenu label="Status" onPinLeft={vi.fn()} pinSide={false} />);

    openMenu();
    const leftItem = screen.getByRole("menuitem", { name: /Pin left/i });
    expect(leftItem.querySelector("svg.lucide-check")).toBeNull();
  });

  it("uses custom pin labels when provided", () => {
    render(
      <ColumnHeaderMenu
        label="Status"
        onPinLeft={vi.fn()}
        labels={{ pinLeft: "Stick left" }}
      />,
    );

    openMenu();
    expect(screen.getByRole("menuitem", { name: "Stick left" })).toBeTruthy();
  });

  it("renders a divider between sort and pin sections", () => {
    render(
      <ColumnHeaderMenu
        label="Status"
        sorted="asc"
        onSort={vi.fn()}
        onPinLeft={vi.fn()}
      />,
    );

    openMenu();
    expect(document.querySelectorAll('[role="menu"] .border-t').length).toBe(1);
  });

  it("calls onFilterClick when filter item is shown", () => {
    const onFilterClick = vi.fn();

    render(
      <ColumnHeaderMenu
        label="Status"
        hasFilter
        onFilterClick={onFilterClick}
      />,
    );

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Filter by this column/i }));
    expect(onFilterClick).toHaveBeenCalledTimes(1);
  });

  it("calls onHide when hide item is shown", () => {
    const onHide = vi.fn();

    render(<ColumnHeaderMenu label="Status" onHide={onHide} />);

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Hide column/i }));
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it("keeps sort items when no pin callbacks are passed", () => {
    const onSort = vi.fn();

    render(
      <ColumnHeaderMenu label="Status" sorted="asc" onSort={onSort} onHide={vi.fn()} />,
    );

    openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: /Ascending/i }));
    expect(onSort).toHaveBeenCalledWith("asc");
  });

  it("does not render filter without hasFilter", () => {
    render(<ColumnHeaderMenu label="Status" onFilterClick={vi.fn()} />);

    openMenu();
    expect(screen.queryByRole("menuitem", { name: /Filter by this column/i })).toBeNull();
  });

  it("renders a divider between hide and pin sections", () => {
    render(
      <ColumnHeaderMenu label="Status" onHide={vi.fn()} onPinLeft={vi.fn()} />,
    );

    openMenu();
    expect(document.querySelectorAll('[role="menu"] .border-t').length).toBe(1);
  });

  it("does not render a divider when only pin actions are shown", () => {
    render(<ColumnHeaderMenu label="Status" onPinLeft={vi.fn()} />);

    openMenu();
    expect(document.querySelectorAll('[role="menu"] .border-t').length).toBe(0);
  });

  it("does not render a divider after sort when no filter, hide, or pin items", () => {
    render(
      <ColumnHeaderMenu label="Status" sorted="asc" onSort={vi.fn()} />,
    );

    openMenu();
    expect(document.querySelectorAll('[role="menu"] .border-t').length).toBe(0);
  });

  it("does not show a right-pin checkmark when pinned left", () => {
    render(
      <ColumnHeaderMenu
        label="Status"
        onPinLeft={vi.fn()}
        onPinRight={vi.fn()}
        pinSide="left"
      />,
    );

    openMenu();
    const rightItem = screen.getByRole("menuitem", { name: /Pin right/i });
    expect(rightItem.querySelector("svg.lucide-check")).toBeNull();
  });

  it("does not render unpin when pinSide is omitted", () => {
    render(<ColumnHeaderMenu label="Status" onUnpin={vi.fn()} />);

    openMenu();
    expect(screen.queryByRole("menuitem", { name: /Unpin/i })).toBeNull();
  });
});
