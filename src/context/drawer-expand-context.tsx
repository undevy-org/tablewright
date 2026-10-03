import { createContext, useContext } from "react";

const DrawerExpandContext = createContext<boolean>(false);

DrawerExpandContext.displayName = "DrawerExpandContext";

/**
 * Returns true when rendered inside an expanded DrawerShell modal.
 * Safe to call outside DrawerShell — returns false.
 */
export function useDrawerExpanded(): boolean {
  return useContext(DrawerExpandContext);
}

export { DrawerExpandContext };
