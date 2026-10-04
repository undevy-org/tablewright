import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SidebarUser } from "./SidebarUser";

const AVATAR = "https://example.com/avatar.png";

describe("SidebarUser", () => {
  it("uses an empty alt on SidebarUser when the name is visible", () => {
    const { container } = render(
      <SidebarUser name="Jordan Ellis" avatarUrl={AVATAR} />,
    );

    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("keeps SidebarUser avatar alt when collapsed without adjacent text", () => {
    render(<SidebarUser name="Jordan Ellis" avatarUrl={AVATAR} collapsed />);

    expect(screen.getByRole("img", { name: "Jordan Ellis" })).toBeTruthy();
  });

  it("shows the user name when expanded", () => {
    render(<SidebarUser name="Jordan Ellis" avatarUrl={AVATAR} />);

    expect(screen.getByText("Jordan Ellis")).toBeTruthy();
  });

  it("renders initials when no avatar is provided", () => {
    render(<SidebarUser name="Jordan Ellis" />);

    expect(screen.getByText("JE")).toBeTruthy();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("uses a single initial for one-word names", () => {
    render(<SidebarUser name="Madonna" />);
    expect(screen.getByText("M")).toBeTruthy();
  });

  it("hides the user name when collapsed", () => {
    render(<SidebarUser name="Jordan Ellis" collapsed />);

    expect(screen.queryByText("Jordan Ellis")).toBeNull();
  });

  it("applies a custom className on the root row", () => {
    const { container } = render(
      <SidebarUser name="Jordan Ellis" className="user-row" />,
    );

    expect(container.firstChild).toBeTruthy();
    expect((container.firstChild as HTMLElement).className).toContain("user-row");
  });
});
