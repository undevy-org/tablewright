import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("dropdown-menu", () => {
  it("renders label and separator menu primitives", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Account</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Profile</DropdownMenuLabel>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByText("Profile")).toBeTruthy();
    expect(screen.getByRole("separator")).toBeTruthy();
  });

  it("renders a checkbox menu item", () => {
    render(
      <DropdownMenu open>
        <DropdownMenuTrigger>Account</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>Show archived</DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(screen.getByRole("menuitemcheckbox", { name: "Show archived" })).toBeTruthy();
  });
});
