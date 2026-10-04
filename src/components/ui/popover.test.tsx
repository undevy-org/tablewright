import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("labels content by its trigger by default", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Filter options</Button>
        </PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );

    const trigger = screen.getByRole("button", { name: "Filter options" });
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBe(trigger.id);
    expect(trigger.id.length).toBeGreaterThan(0);
  });

  it("uses an explicit aria-label on content instead of the trigger id", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Custom popover name">Popover body</PopoverContent>
      </Popover>,
    );

    const dialog = screen.getByRole("dialog", { name: "Custom popover name" });
    expect(dialog.getAttribute("aria-labelledby")).toBeNull();
  });

  it("keeps an explicit aria-labelledby on content", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open</Button>
        </PopoverTrigger>
        <PopoverContent aria-labelledby="external-label">Popover body</PopoverContent>
      </Popover>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBe("external-label");
  });

  it("does not set aria-labelledby when opened from an anchor without a trigger", () => {
    render(
      <Popover defaultOpen>
        <PopoverAnchor asChild>
          <span data-testid="anchor">Anchor</span>
        </PopoverAnchor>
        <PopoverContent>Anchor body</PopoverContent>
      </Popover>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBeNull();
  });
});
