import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { LayoutGrid } from "lucide-react";
import { describe, expect, it } from "vitest";
import { DrawerShell } from "./data-table/DrawerShell";
import { TableLayout } from "./data-table/TableLayout";
import { Sidebar } from "./layout/Sidebar";
import { SidebarAccountMenu } from "./layout/SidebarAccountMenu";
import { SidebarUser } from "./layout/SidebarUser";
import type { NavGroup } from "./layout/types";

const AVATAR = "https://example.com/avatar.png";

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { key: "home", label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
    ],
  },
];

describe("a11y quick wins", () => {
  it("gives collapsed sidebar nav links an accessible name", () => {
    render(<Sidebar groups={SIDEBAR_GROUPS} collapsed activeKey="/dashboard" />);

    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link.getAttribute("aria-label")).toBe("Dashboard");
  });

  it("omits aria-label on expanded sidebar links when the label is visible", () => {
    render(<Sidebar groups={SIDEBAR_GROUPS} activeKey="/dashboard" />);

    const link = screen.getByRole("link", { name: "Dashboard" });
    expect(link.getAttribute("aria-label")).toBeNull();
  });

  it("makes the drawer body scroll region keyboard focusable", () => {
    const { container } = render(
      <div className="relative h-96">
        <DrawerShell open onClose={() => {}} title="Details">
          <p>Scrollable content</p>
        </DrawerShell>
      </div>,
    );

    const scrollRegion = container.querySelector(".overflow-y-auto");
    expect(scrollRegion?.getAttribute("tabindex")).toBe("0");
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

  it("uses an empty alt on SidebarAccountMenu trigger when the name is visible", () => {
    render(
      <SidebarAccountMenu name="Priya Natarajan" role="Admin" avatarUrl={AVATAR} />,
    );

    expect(screen.getByRole("button").querySelector("img")?.getAttribute("alt")).toBe(
      "",
    );
  });

  it("keeps SidebarAccountMenu trigger avatar alt when collapsed", () => {
    render(
      <SidebarAccountMenu
        name="Priya Natarajan"
        avatarUrl={AVATAR}
        collapsed
      />,
    );

    expect(screen.getByRole("img", { name: "Priya Natarajan" })).toBeTruthy();
  });

  it("uses an empty alt on the SidebarAccountMenu panel avatar beside visible name", async () => {
    render(
      <SidebarAccountMenu name="Priya Natarajan" role="Admin" avatarUrl={AVATAR} />,
    );

    const trigger = screen.getByRole("button", { name: /Priya Natarajan/i });
    await act(async () => {
      fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
      fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
      fireEvent.click(trigger);
    });

    const menu = await waitFor(() => screen.getByRole("menu"));
    expect(menu.querySelector("img")?.getAttribute("alt")).toBe("");
  });
});
