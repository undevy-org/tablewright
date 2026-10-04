import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { STYLE_SCOPE } from "../../lib/style-scope";
import { Button } from "./button";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("requires components to be used within Popover", () => {
    expect(() => render(<PopoverTrigger>Open</PopoverTrigger>)).toThrow(/within Popover/);
  });

  it("scopes popover content styles under the library root class", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open</Button>
        </PopoverTrigger>
        <PopoverContent>Scoped</PopoverContent>
      </Popover>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain(STYLE_SCOPE);
    expect(dialog.className).toContain("rounded-lg");
  });

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

  it("omits aria-labelledby when content has aria-label but no aria-labelledby", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger asChild>
          <Button variant="secondary">Open</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Named by label">Body</PopoverContent>
      </Popover>,
    );

    expect(screen.getByRole("dialog").getAttribute("aria-labelledby")).toBeNull();
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
