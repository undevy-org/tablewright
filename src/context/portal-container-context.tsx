import { createContext, useContext } from "react";

const PortalContainerContext = createContext<HTMLElement | null>(null);

PortalContainerContext.displayName = "PortalContainerContext";

/**
 * Container element that Radix-based portals (dropdown, popover, dialog,
 * select) should render into, so their content resolves CSS custom
 * properties from the same DOM subtree as the rest of the page instead of
 * defaulting to `document.body`, which sits outside any `data-theme`
 * wrapper. Returns null when no provider is present, in which case each
 * primitive's own Radix `Portal` falls back to its default (`document.body`)
 * — verified by reading `@radix-ui/react-portal`'s compiled source directly:
 * `const container = containerProp || mounted && globalThis?.document?.body;`, so `null`
 * and `undefined` both take the same fallback path.
 */
export function usePortalContainer(): HTMLElement | null {
  return useContext(PortalContainerContext);
}

export { PortalContainerContext };
