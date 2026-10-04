import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TableLayout } from "./TableLayout";

describe("TableLayout", () => {
  it("merges a custom class onto the root layout", () => {
    const { container } = render(
      <TableLayout className="custom-root">
        <p>Content</p>
      </TableLayout>,
    );

    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("custom-root");
    expect(root.className).toContain("relative");
  });

  it("makes the table layout scroll region keyboard focusable", () => {
    const { container } = render(
      <TableLayout>
        <TableLayout.ScrollArea>
          <p>Table body</p>
        </TableLayout.ScrollArea>
      </TableLayout>,
    );

    const scrollRegion = container.querySelector(".overflow-auto");
    expect(scrollRegion?.getAttribute("tabindex")).toBe("0");
  });
});
