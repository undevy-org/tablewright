import type { ComponentProps } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DrawerShell } from "./DrawerShell";

function shell(props: Partial<ComponentProps<typeof DrawerShell>> = {}) {
  const onClose = vi.fn();
  const result = render(
    <div className="relative h-96">
      <DrawerShell
        open
        onClose={onClose}
        title="Details"
        subtitle="Ref 42"
        footer={<p>Footer actions</p>}
        {...props}
      >
        <p>Scrollable content</p>
      </DrawerShell>
    </div>,
  );
  return { ...result, onClose };
}

describe("DrawerShell", () => {
  it("makes the drawer body scroll region keyboard focusable", () => {
    const { container } = shell();

    const scrollRegion = container.querySelector(".overflow-y-auto");
    expect(scrollRegion?.getAttribute("tabindex")).toBe("0");
  });

  it("renders the title, subtitle, body, and footer in side mode", () => {
    shell();

    expect(screen.queryByTitle("Expand to full view")).toBeNull();
    expect(screen.getByRole("heading", { name: "Details" })).toBeTruthy();
    expect(screen.getByText("Ref 42")).toBeTruthy();
    expect(screen.getByText("Scrollable content")).toBeTruthy();
    expect(screen.getByText("Footer actions")).toBeTruthy();
    expect(screen.getByRole("complementary", { name: "Details panel" })).toBeTruthy();
  });

  it("calls onClose when the close button is clicked", () => {
    const { onClose } = shell();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("opens as a modal when mode is modal", () => {
    shell({ mode: "modal" });

    expect(screen.queryByRole("complementary", { name: "Details panel" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Details" })).toBeTruthy();
  });

  it("does not render the modal layer when closed in modal mode", () => {
    render(
      <div className="relative h-96">
        <DrawerShell open={false} onClose={() => {}} title="Details" mode="modal">
          <p>Hidden</p>
        </DrawerShell>
      </div>,
    );

    expect(screen.queryByText("Hidden")).toBeNull();
  });

  it("expands to a full view from side+modal mode", () => {
    shell({ mode: "side+modal" });

    fireEvent.click(screen.getByTitle("Expand to full view"));

    expect(screen.queryByRole("complementary", { name: "Details panel" })).toBeNull();
    expect(screen.getByTitle("Collapse to panel")).toBeTruthy();
  });

  it("closes on Escape when dismissible", () => {
    const { onClose } = shell({ dismissible: true });

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the dismiss scrim is clicked", () => {
    const { container, onClose } = shell({ dismissible: true });

    const scrim = container.querySelector("[aria-hidden]");
    expect(scrim).toBeTruthy();
    fireEvent.click(scrim!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("keeps the side panel off-screen when closed", () => {
    const { container } = render(
      <div className="relative h-96">
        <DrawerShell open={false} onClose={() => {}} title="Details">
          <p>Hidden</p>
        </DrawerShell>
      </div>,
    );

    const panel = container.querySelector("aside");
    expect(panel?.className).toContain("translate-x-full");
    expect(screen.queryByText("Hidden")).toBeTruthy();
  });

  it("does not close on Escape when dismissible is off", () => {
    const onClose = vi.fn();
    render(
      <div className="relative h-96">
        <DrawerShell open onClose={onClose} title="Details">
          <p>Body</p>
        </DrawerShell>
      </div>,
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("omits the title heading when title is empty", () => {
    render(
      <div className="relative h-96">
        <DrawerShell open onClose={() => {}} title="">
          <p>Body</p>
        </DrawerShell>
      </div>,
    );

    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByText("Body")).toBeTruthy();
  });

  it("renders header extras beside the title", () => {
    shell({ headerExtra: <span>Extra</span> });
    expect(screen.getByText("Extra")).toBeTruthy();
  });

  it("calls onClose from the modal scrim in modal mode", () => {
    const onClose = vi.fn();
    render(
      <div className="relative h-96">
        <DrawerShell open onClose={onClose} title="Details" mode="modal">
          <p>Modal body</p>
        </DrawerShell>
      </div>,
    );

    const scrim = document.querySelector(".fixed.inset-0.z-50.bg-black\\/50");
    expect(scrim).toBeTruthy();
    fireEvent.click(scrim!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("collapses back to the side panel from expanded side+modal mode", () => {
    shell({ mode: "side+modal" });

    fireEvent.click(screen.getByTitle("Expand to full view"));
    fireEvent.click(screen.getByTitle("Collapse to panel"));

    expect(screen.getByRole("complementary", { name: "Details panel" })).toBeTruthy();
  });

  it("does not render a dismiss scrim unless dismissible is enabled", () => {
    const { container } = shell();

    expect(container.querySelector(".absolute.inset-0.z-30")).toBeNull();
  });

  it("omits the subtitle block when subtitle is not provided", () => {
    render(
      <div className="relative h-96">
        <DrawerShell open onClose={() => {}} title="Details">
          <p>Body</p>
        </DrawerShell>
      </div>,
    );

    expect(screen.queryByText("Ref 42")).toBeNull();
  });
});
