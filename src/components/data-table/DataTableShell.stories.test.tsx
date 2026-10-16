import { Profiler, createElement, type ReactElement } from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import * as stories from "./DataTableShell.stories";

const COMMIT_LIMIT = 50;

function openHeaderMenu(columnLabel: string) {
  const trigger = screen
    .getAllByRole("button", { name: new RegExp("^" + columnLabel) })
    .find((b) => b.getAttribute("aria-haspopup") === "menu");
  if (!trigger) throw new Error(`no header menu for ${columnLabel}`);
  act(() => {
    fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
    fireEvent.click(trigger);
  });
}

function menuItemByLabel(text: string): HTMLElement {
  const el = [...document.querySelectorAll<HTMLElement>('[role="menu"] [role^="menuitem"]')].find(
    (e) => e.textContent?.trim() === text,
  );
  if (!el) throw new Error(`menu item "${text}" not found`);
  return el;
}

async function renderPinningStory(): Promise<{ countCommitsDuring: (action: () => void) => Promise<number> }> {
  let commits = 0;
  const Story = stories.WithColumnPinning.render as (() => ReactElement) | undefined;
  if (!Story) throw new Error("WithColumnPinning story has no render function");

  render(
    createElement(Profiler, {
      id: "pinning-story",
      onRender: () => {
        commits++;
      },
    }, createElement(Story)),
  );

  await act(async () => {
    await new Promise((r) => setTimeout(r, 200));
  });

  return {
    async countCommitsDuring(action: () => void) {
      const before = commits;
      await act(async () => {
        action();
        await new Promise((r) => setTimeout(r, 300));
      });
      return commits - before;
    },
  };
}

describe("DataTableShell WithColumnPinning story", () => {
  it("settles after Status › Ascending and sorts status ascending", async () => {
    const { countCommitsDuring } = await renderPinningStory();
    openHeaderMenu("Status");
    const target = menuItemByLabel("Ascending");
    const n = await countCommitsDuring(() => {
      fireEvent.click(target);
    });
    expect(n).toBeLessThan(COMMIT_LIMIT);

    const table = screen.getByRole("table");
    const bodyRows = within(table).getAllByRole("row").slice(1);
    expect(bodyRows.length).toBeGreaterThan(0);
    expect(within(bodyRows[0]).getByText("ACTIVE")).toBeTruthy();
  });

  it("settles after Workspace › Pin right and marks Pin right checked", async () => {
    const { countCommitsDuring } = await renderPinningStory();
    openHeaderMenu("Workspace");
    const target = menuItemByLabel("Pin right");
    const n = await countCommitsDuring(() => {
      fireEvent.click(target);
    });
    expect(n).toBeLessThan(COMMIT_LIMIT);

    openHeaderMenu("Workspace");
    expect(screen.getByRole("menuitemradio", { name: /Pin right/i }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });

  it("settles after Status › Pin left", async () => {
    const { countCommitsDuring } = await renderPinningStory();
    openHeaderMenu("Status");
    const target = menuItemByLabel("Pin left");
    const n = await countCommitsDuring(() => {
      fireEvent.click(target);
    });
    expect(n).toBeLessThan(COMMIT_LIMIT);

    openHeaderMenu("Status");
    expect(screen.getByRole("menuitemradio", { name: /Pin left/i }).getAttribute("aria-checked")).toBe(
      "true",
    );
  });
});
