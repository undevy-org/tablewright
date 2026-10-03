import type { LucideIcon } from "lucide-react";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}
