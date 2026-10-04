import type { LucideIcon } from "lucide-react";
import { ChevronDown, LogOut, SunMoon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../ui/dropdown-menu";
import { ThemeSwitch } from "../ui/theme-switch";
import { decorativeAvatarAlt } from "../../lib/decorative-avatar-alt";
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
      alt={decorativeAvatarAlt(!effectiveCollapsed, name)}
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
        {/* Account info */}
        <div className="flex items-center gap-2.5 px-2 py-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={decorativeAvatarAlt(true, name)}
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
        </div>

        <div className="my-1 border-t border-[var(--border-subtle)]" />

        {/* Theme row */}
        {showTheme && (
          <>
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex items-center gap-2">
                <SunMoon className="h-4 w-4" />
                <span className="text-[13px]">Theme</span>
              </div>
              <ThemeSwitch
                variant="icon"
                value={theme!}
                onValueChange={onThemeChange}
              />
            </div>
            {hasItemsBelow && (
              <div className="my-1 border-t border-[var(--border-subtle)]" />
            )}
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
        {menuItems && menuItems.length > 0 && onSignOut && (
          <div className="my-1 border-t border-[var(--border-subtle)]" />
        )}

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
