import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, LogOut, Moon, Sun, SunMoon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";
import { useAppShell } from "./app-shell-context";

export interface AccountMenuItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive";
  onClick?: () => void;
}

export interface SidebarAccountMenuProps {
  name: string;
  role?: string;
  avatarUrl?: string;
  theme?: "light" | "dark";
  onThemeChange?: (value: "light" | "dark") => void;
  menuItems?: AccountMenuItem[];
  onSignOut?: () => void;
  collapsed?: boolean;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function SidebarAccountMenu({
  name,
  role,
  avatarUrl,
  theme,
  onThemeChange,
  menuItems,
  onSignOut,
  collapsed: collapsedProp,
  className,
}: SidebarAccountMenuProps) {
  const shell = useAppShell();
  const effectiveCollapsed = collapsedProp ?? shell?.effectiveCollapsed ?? false;

  const showTheme = theme !== undefined && onThemeChange !== undefined;
  const hasItemsBelow = (menuItems && menuItems.length > 0) || Boolean(onSignOut);

  const avatar = avatarUrl ? (
    <img
      src={avatarUrl}
      alt={effectiveCollapsed ? name : ""}
      className="h-7 w-7 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[11px] font-semibold text-[var(--text-secondary)]">
      {getInitials(name)}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "group flex w-full items-center rounded-[var(--radius-md)] transition-colors hover:bg-[var(--bg-hover)]",
            effectiveCollapsed
              ? "justify-center p-1.5"
              : "gap-2.5 px-3 py-2",
            className,
          )}
        >
          {avatar}
          {!effectiveCollapsed && (
            <>
              <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium text-[var(--text-primary)]">
                {name}
              </span>
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-tertiary)] transition-transform group-data-[state=open]:rotate-180" />
            </>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="start"
        sideOffset={6}
        className="min-w-[220px]"
      >
        <DropdownMenuLabel
          className="flex cursor-default select-none items-center gap-2.5 px-2 py-2 font-normal"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[11px] font-semibold text-[var(--text-secondary)]">
              {getInitials(name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-[13px] font-medium text-[var(--text-primary)]">
              {name}
            </div>
            {role && (
              <div className="truncate text-[12px] text-[var(--text-secondary)]">
                {role}
              </div>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {showTheme && (
          <>
            <DropdownMenuGroup className="flex items-center justify-between px-3 py-2">
              <DropdownMenuLabel
                className="flex cursor-default select-none items-center gap-2 p-0 font-normal"
              >
                <SunMoon className="h-4 w-4" />
                <span className="text-[13px]">Theme</span>
              </DropdownMenuLabel>
              <DropdownMenuPrimitive.RadioGroup
                value={theme}
                onValueChange={(value) => onThemeChange(value as "light" | "dark")}
                className="inline-flex h-[var(--size-control-md)] items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1 py-1"
              >
                <div className="inline-flex self-stretch items-center gap-1">
                  <DropdownMenuPrimitive.RadioItem
                    value="light"
                    aria-label="Light"
                    onSelect={(event) => event.preventDefault()}
                    className={cn(
                      "relative flex cursor-default select-none items-center justify-center rounded-md px-2 py-0 outline-none hover:bg-[var(--bg-hover)] data-[highlighted]:bg-[var(--bg-hover)] data-[state=checked]:bg-[var(--bg-secondary)] data-[state=checked]:text-[var(--text-primary)] text-[var(--text-secondary)]",
                    )}
                  >
                    <Sun className="h-4 w-4" />
                  </DropdownMenuPrimitive.RadioItem>
                  <DropdownMenuPrimitive.RadioItem
                    value="dark"
                    aria-label="Dark"
                    onSelect={(event) => event.preventDefault()}
                    className={cn(
                      "relative flex cursor-default select-none items-center justify-center rounded-md px-2 py-0 outline-none hover:bg-[var(--bg-hover)] data-[highlighted]:bg-[var(--bg-hover)] data-[state=checked]:bg-[var(--bg-secondary)] data-[state=checked]:text-[var(--text-primary)] text-[var(--text-secondary)]",
                    )}
                  >
                    <Moon className="h-4 w-4" />
                  </DropdownMenuPrimitive.RadioItem>
                </div>
              </DropdownMenuPrimitive.RadioGroup>
            </DropdownMenuGroup>
            {hasItemsBelow && <DropdownMenuSeparator />}
          </>
        )}

        {/* Custom menu items */}
        {menuItems && menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <DropdownMenuItem
              key={item.key}
              onClick={item.onClick}
              className={cn(
                "gap-2 px-3 py-2",
                item.variant === "destructive" && "text-red-600",
              )}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </DropdownMenuItem>
          );
        })}

        {/* Separator before sign-out */}
        {menuItems && menuItems.length > 0 && onSignOut && <DropdownMenuSeparator />}

        {/* Sign out */}
        {onSignOut && (
          <DropdownMenuItem
            onClick={onSignOut}
            className="gap-2 px-3 py-2 text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
