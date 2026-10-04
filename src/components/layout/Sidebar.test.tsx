import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { LayoutGrid, Settings } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { AppShellContext } from "./app-shell-context";
import { Sidebar } from "./Sidebar";
import type { NavGroup } from "./types";

const SIDEBAR_GROUPS: NavGroup[] = [
  {
    label: "Main",
    items: [
      { key: "home", label: "Dashboard", icon: LayoutGrid, href: "/dashboard" },
      { key: "settings", label: "Settings", icon: Settings, href: "/settings" },
    ],
  },
  {
    label: "Other",
    items: [
      { key: "root", label: "Home", icon: LayoutGrid, href: "/" },
    ],
  },
];

describe("Sidebar", () => {
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

  it("passes aria-label to renderLink when collapsed", () => {
    const renderLink = vi.fn(
      (
        href: string,
        props: {
          className: string;
          children: ReactNode;
          "aria-label"?: string;
        },
      ) => <a href={href} {...props} />,
    );

    render(
      <Sidebar
        groups={SIDEBAR_GROUPS}
        collapsed
        activeKey="/dashboard"
        renderLink={renderLink}
      />,
    );

    expect(renderLink).toHaveBeenCalled();
    const linkProps = renderLink.mock.calls[0][1];
    expect(linkProps["aria-label"]).toBe("Dashboard");
  });

  it("omits aria-label in renderLink props when expanded", () => {
    const renderLink = vi.fn(
      (
        href: string,
        props: {
          className: string;
          children: ReactNode;
          "aria-label"?: string;
        },
      ) => <a href={href} {...props} />,
    );

    render(
      <Sidebar
        groups={SIDEBAR_GROUPS}
        activeKey="/dashboard"
        renderLink={renderLink}
      />,
    );

    const linkProps = renderLink.mock.calls[0][1];
    expect(linkProps["aria-label"]).toBeUndefined();
  });

  it("labels the navigation landmark and shows group headings when expanded", () => {
    render(<Sidebar groups={SIDEBAR_GROUPS} activeKey="/dashboard" header={<span>Acme</span>} />);

    expect(screen.getByRole("complementary", { name: "Primary navigation" })).toBeTruthy();
    expect(screen.getByText("Main")).toBeTruthy();
    expect(screen.getByText("Acme")).toBeTruthy();
  });

  it("hides group headings when collapsed", () => {
    render(<Sidebar groups={SIDEBAR_GROUPS} collapsed activeKey="/dashboard" />);

    expect(screen.queryByText("Main")).toBeNull();
  });

  it("marks nested routes active for their parent item", () => {
    render(<Sidebar groups={SIDEBAR_GROUPS} activeKey="/settings/profile" />);

    const settings = screen.getByRole("link", { name: "Settings" });
    expect(settings.className).toContain("bg-[var(--bg-nav-item-active)]");
  });

  it("renders a divider between navigation groups", () => {
    const { container } = render(
      <Sidebar groups={SIDEBAR_GROUPS} activeKey="/dashboard" />,
    );

    expect(container.querySelectorAll(".border-t").length).toBeGreaterThan(0);
  });

  it("marks the root route active when activeKey is slash", () => {
    render(<Sidebar groups={SIDEBAR_GROUPS} activeKey="/" />);

    const home = screen.getByRole("link", { name: "Home" });
    expect(home.className).toContain("bg-[var(--bg-nav-item-active)]");
  });

  it("marks an empty href active when activeKey is empty", () => {
    const groups: NavGroup[] = [
      {
        label: "Root",
        items: [{ key: "root", label: "Overview", icon: LayoutGrid, href: "" }],
      },
    ];
    render(<Sidebar groups={groups} activeKey="" />);

    const link = screen.getByText("Overview").closest("a");
    expect(link?.className).toContain("bg-[var(--bg-nav-item-active)]");
  });

  it("renders footer content", () => {
    render(
      <Sidebar
        groups={SIDEBAR_GROUPS}
        activeKey="/dashboard"
        footer={<span>User slot</span>}
      />,
    );

    expect(screen.getByText("User slot")).toBeTruthy();
  });

  it("toggles collapsed state from the sidebar control", () => {
    const onCollapsedChange = vi.fn();
    render(
      <Sidebar
        groups={SIDEBAR_GROUPS}
        collapsed
        onCollapsedChange={onCollapsedChange}
        activeKey="/dashboard"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(false);
  });

  it("requests collapse when expanded and the control is clicked", () => {
    const onCollapsedChange = vi.fn();
    render(
      <Sidebar
        groups={SIDEBAR_GROUPS}
        onCollapsedChange={onCollapsedChange}
        activeKey="/dashboard"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(onCollapsedChange).toHaveBeenCalledWith(true);
  });

  it("shows the hover overlay labels when the shell expands a collapsed rail", () => {
    render(
      <AppShellContext.Provider
        value={{
          collapsed: true,
          hovering: true,
          effectiveCollapsed: false,
          onCollapsedChange: vi.fn(),
        }}
      >
        <Sidebar groups={SIDEBAR_GROUPS} activeKey="/dashboard" />
      </AppShellContext.Provider>,
    );

    expect(screen.getByText("Expand")).toBeTruthy();
    expect(screen.getByText("Main")).toBeTruthy();
  });

  it("uses shell effectiveCollapsed when the collapsed prop is omitted", () => {
    render(
      <AppShellContext.Provider
        value={{
          collapsed: true,
          hovering: false,
          effectiveCollapsed: true,
          onCollapsedChange: vi.fn(),
        }}
      >
        <Sidebar groups={SIDEBAR_GROUPS} activeKey="/dashboard" />
      </AppShellContext.Provider>,
    );

    expect(screen.queryByText("Main")).toBeNull();
  });

  it("applies a custom className on the aside root", () => {
    const { container } = render(
      <Sidebar groups={SIDEBAR_GROUPS} activeKey="/dashboard" className="rail-custom" />,
    );

    expect(container.querySelector("aside")?.className).toContain("rail-custom");
  });

  it("highlights an item for an exact activeKey match", () => {
    render(<Sidebar groups={SIDEBAR_GROUPS} activeKey="/settings" />);

    const settings = screen.getByRole("link", { name: "Settings" });
    expect(settings.className).toContain("bg-[var(--bg-nav-item-active)]");
    expect(screen.getByRole("link", { name: "Dashboard" }).className).not.toContain(
      "bg-[var(--bg-nav-item-active)]",
    );
  });

  it("passes the item href to renderLink", () => {
    const renderLink = vi.fn(
      (href: string, props: { className: string; children: ReactNode }) => (
        <a href={href} {...props} />
      ),
    );

    render(
      <Sidebar groups={SIDEBAR_GROUPS} activeKey="/dashboard" renderLink={renderLink} />,
    );

    expect(renderLink.mock.calls[0][0]).toBe("/dashboard");
  });
});
