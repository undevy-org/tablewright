import { createContext, useContext } from "react";

export interface AppShellContextValue {
  collapsed: boolean;
  hovering: boolean;
  effectiveCollapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue | null {
  return useContext(AppShellContext);
}
