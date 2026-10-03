import { useEffect, useState } from "react";

export type DemoTheme = "light" | "dark";

const STORAGE_KEY = "tablewright-demo-theme";

function readInitialTheme(): DemoTheme {
  if (typeof window === "undefined") return "light";
  return window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";
}

/**
 * Theme state for story demos that render a live theme switch (e.g.
 * SidebarAccountMenu). Callers apply the returned theme to a `data-theme`
 * attribute on a wrapper element around their own content — this hook only
 * owns the state and its localStorage persistence, not the DOM write.
 */
export function useDemoTheme(): [DemoTheme, (theme: DemoTheme) => void] {
  const [theme, setTheme] = useState<DemoTheme>(readInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}
