import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const capturedSideOffsets: Array<number | undefined> = [];

vi.mock("@radix-ui/react-tooltip", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@radix-ui/react-tooltip")>();
  const OriginalContent = actual.Content;
  const Content = React.forwardRef<
    React.ElementRef<typeof OriginalContent>,
    React.ComponentPropsWithoutRef<typeof OriginalContent>
  >((props, ref) => {
    capturedSideOffsets.push(props.sideOffset);
    return <OriginalContent {...props} ref={ref} />;
  });
  Content.displayName = OriginalContent.displayName;
  return { ...actual, Content };
});

import { STYLE_SCOPE } from "../../lib/style-scope";
import { Button } from "./button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

describe("Tooltip", () => {
  it("works with no TooltipProvider when the trigger is focused", () => {
    render(
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary">Show hint</Button>
        </TooltipTrigger>
        <TooltipContent>Helpful note</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Show hint" });
    fireEvent.focus(trigger);

    expect(screen.getByRole("tooltip").textContent).toContain("Helpful note");
  });

  it("sets aria-describedby on the open trigger and clears it when closed", () => {
    const { rerender } = render(
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="secondary">Label</Button>
        </TooltipTrigger>
        <TooltipContent>Described text</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Label" });
    const tooltip = screen.getByRole("tooltip");
    expect(trigger.getAttribute("aria-describedby")).toBe(tooltip.id);

    rerender(
      <Tooltip open={false}>
        <TooltipTrigger asChild>
          <Button variant="secondary">Label</Button>
        </TooltipTrigger>
        <TooltipContent>Described text</TooltipContent>
      </Tooltip>,
    );

    expect(trigger.getAttribute("aria-describedby")).toBeNull();
  });

  it("closes on Escape", () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="secondary">Dismiss me</Button>
        </TooltipTrigger>
        <TooltipContent>Visible until escape</TooltipContent>
      </Tooltip>,
    );

    expect(screen.getByRole("tooltip")).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  describe("delay", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("opens on hover only after delayDuration on Tooltip", () => {
      render(
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <Button variant="secondary">Delayed</Button>
          </TooltipTrigger>
          <TooltipContent>After delay</TooltipContent>
        </Tooltip>,
      );

      const trigger = screen.getByRole("button", { name: "Delayed" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });

      act(() => {
        vi.advanceTimersByTime(399);
      });
      expect(screen.queryByRole("tooltip")).toBeNull();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole("tooltip").textContent).toContain("After delay");
    });

    it("honours TooltipProvider delayDuration when Tooltip has no delay", () => {
      render(
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="secondary">Provider delay</Button>
            </TooltipTrigger>
            <TooltipContent>Provider timed</TooltipContent>
          </Tooltip>
        </TooltipProvider>,
      );

      const trigger = screen.getByRole("button", { name: "Provider delay" });
      fireEvent.pointerMove(trigger, { pointerType: "mouse" });

      act(() => {
        vi.advanceTimersByTime(199);
      });
      expect(screen.queryByRole("tooltip")).toBeNull();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(screen.getByRole("tooltip").textContent).toContain("Provider timed");
    });
  });

  it("scopes tooltip content under STYLE_SCOPE and merges className", () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="secondary">Open</Button>
        </TooltipTrigger>
        <TooltipContent className="custom-tip">Styled</TooltipContent>
      </Tooltip>,
    );

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.className).toContain(STYLE_SCOPE);
    expect(tooltip.className).toContain("custom-tip");
  });

  it("defaults sideOffset to 4 and honours side", () => {
    capturedSideOffsets.length = 0;

    render(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="secondary">Placement</Button>
        </TooltipTrigger>
        <TooltipContent side="left">Left side</TooltipContent>
      </Tooltip>,
    );

    expect(screen.getByRole("tooltip").getAttribute("data-side")).toBe("left");
    expect(capturedSideOffsets).toContain(4);
  });

  it("keeps the trigger element when asChild is used", () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <button type="button">Native button</button>
        </TooltipTrigger>
        <TooltipContent>Child trigger</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Native button" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.closest("[data-radix-tooltip-trigger]") ?? trigger).toBe(trigger);
  });

  it("requires TooltipContent to be used within Tooltip", () => {
    expect(() => render(<TooltipContent>Orphan</TooltipContent>)).toThrow();
  });
});
