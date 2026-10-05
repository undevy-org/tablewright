import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NarrowWithTruncation } from "./TopBar.stories";

type NarrowRender = NonNullable<typeof NarrowWithTruncation.render>;

describe("TopBar stories", () => {
  it("names the icon-only action in NarrowWithTruncation", () => {
    const view = (NarrowWithTruncation.render as NarrowRender)(
      {} as Parameters<NarrowRender>[0],
      {} as Parameters<NarrowRender>[1],
    );
    expect(view).toBeTruthy();
    render(view!);
    expect(screen.getByRole("button", { name: "Add" })).toBeTruthy();
  });
});
