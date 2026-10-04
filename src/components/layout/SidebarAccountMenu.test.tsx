import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Settings } from "lucide-react";
import { describe, expect, it, vi } from "vitest";
import { SidebarAccountMenu } from "./SidebarAccountMenu";

const AVATAR = "https://example.com/avatar.png";

describe("SidebarAccountMenu", () => {
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

  async function openMenu() {
    const trigger = screen.getByRole("button", { name: /Priya Natarajan/i });
    await act(async () => {
      fireEvent.pointerDown(trigger, { button: 0, pointerType: "mouse" });
      fireEvent.pointerUp(trigger, { button: 0, pointerType: "mouse" });
      fireEvent.click(trigger);
    });
    return waitFor(() => screen.getByRole("menu"));
  }

  it("shows the account role in the menu panel", async () => {
    render(
      <SidebarAccountMenu name="Priya Natarajan" role="Admin" avatarUrl={AVATAR} />,
    );

    await openMenu();
    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("runs a custom menu item handler", async () => {
    const onItem = vi.fn();
    render(
      <SidebarAccountMenu
        name="Priya Natarajan"
        avatarUrl={AVATAR}
        menuItems={[
          { key: "prefs", label: "Preferences", icon: Settings, onClick: onItem },
        ]}
      />,
    );

    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Preferences" }));
    expect(onItem).toHaveBeenCalledTimes(1);
  });

  it("runs sign-out from the menu", async () => {
    const onSignOut = vi.fn();
    render(
      <SidebarAccountMenu name="Priya Natarajan" avatarUrl={AVATAR} onSignOut={onSignOut} />,
    );

    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Sign Out" }));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it("styles destructive menu items", async () => {
    render(
      <SidebarAccountMenu
        name="Priya Natarajan"
        avatarUrl={AVATAR}
        menuItems={[
          { key: "danger", label: "Delete workspace", variant: "destructive" },
        ]}
      />,
    );

    await openMenu();
    expect(screen.getByRole("menuitem", { name: "Delete workspace" }).className).toContain(
      "text-red-600",
    );
  });

  it("renders initials when no avatar image is provided", () => {
    render(<SidebarAccountMenu name="Priya Natarajan" />);

    expect(screen.getByText("PN")).toBeTruthy();
  });

  it("applies a custom className on the trigger button", () => {
    render(
      <SidebarAccountMenu
        name="Priya Natarajan"
        avatarUrl={AVATAR}
        className="account-trigger"
      />,
    );

    expect(screen.getByRole("button").className).toContain("account-trigger");
  });

  it("omits the role line when role is not provided", async () => {
    render(<SidebarAccountMenu name="Priya Natarajan" avatarUrl={AVATAR} />);

    await openMenu();
    expect(screen.queryByText("Admin")).toBeNull();
  });

  it("renders the theme switch when theme controls are provided", async () => {
    const onThemeChange = vi.fn();
    render(
      <SidebarAccountMenu
        name="Priya Natarajan"
        avatarUrl={AVATAR}
        theme="light"
        onThemeChange={onThemeChange}
      />,
    );

    await openMenu();
    expect(screen.getByText("Theme")).toBeTruthy();
  });
});
