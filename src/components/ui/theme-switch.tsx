import * as React from "react";
import { Sun, Moon } from "lucide-react";

import { SegmentedControl } from "./segmented-control";

type ThemeSwitchValue = "light" | "dark";

export interface ThemeSwitchProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: ThemeSwitchValue;
  variant?: "toolbar" | "icon";
  label?: string;
  onValueChange?: (value: ThemeSwitchValue) => void;
  lightHref?: string;
  darkHref?: string;
}

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

const themeIconOptions = [
  { value: "light", icon: Sun, ariaLabel: "Light" },
  { value: "dark", icon: Moon, ariaLabel: "Dark" },
] as const;

export function ThemeSwitch({
  value,
  variant = "toolbar",
  label = "Theme",
  onValueChange,
  lightHref,
  darkHref,
  className,
  ...props
}: ThemeSwitchProps) {
  const linkMode = Boolean(lightHref && darkHref);

  const handleValueChange = (newValue: ThemeSwitchValue) => {
    if (linkMode) {
      window.location.href = newValue === "light" ? lightHref! : darkHref!;
    } else {
      onValueChange?.(newValue);
    }
  };

  const isIcon = variant === "icon";

  return (
    <SegmentedControl
      value={value}
      options={isIcon ? themeIconOptions : themeOptions}
      variant={isIcon ? "toolbar" : variant}
      label={label}
      onValueChange={handleValueChange}
      className={className}
      {...props}
    />
  );
}
