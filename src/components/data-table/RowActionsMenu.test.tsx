import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Copy } from "lucide-react";
import { RowActionsMenu } from "./RowActionsMenu";

describe("RowActionsMenu", () => {
  it('defaults the trigger accessible name to "Row actions"', () => {
    render(
      <RowActionsMenu
        actions={[{ label: "Copy", icon: Copy, onClick: vi.fn() }]}
      />,
    );

    expect(screen.getByRole("button", { name: "Row actions" })).toBeTruthy();
  });

  it("passes triggerAriaLabel to the trigger button", () => {
    render(
      <RowActionsMenu
        triggerAriaLabel="Actions for TX-123"
        actions={[{ label: "Copy", icon: Copy, onClick: vi.fn() }]}
      />,
    );

    expect(screen.getByRole("button", { name: "Actions for TX-123" })).toBeTruthy();
  });
});
