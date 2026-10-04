import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./combobox";

describe("Combobox", () => {
  it("uses secondary text for the empty placeholder state", () => {
    render(
      <Combobox
        value={null}
        onChange={vi.fn()}
        options={[{ value: "a", label: "Alpha" }]}
        placeholder="Pick one"
      />,
    );

    const placeholder = screen.getByRole("button", { name: "Pick one" }).querySelector("span.truncate");
    expect(placeholder?.className).toContain("text-[var(--text-secondary)]");
    expect(placeholder?.textContent).toBe("Pick one");
  });
});
