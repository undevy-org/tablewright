import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "../../lib/utils";
import { STYLE_SCOPE } from "../../lib/style-scope";
import { usePortalContainer } from "../../context/portal-container-context";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const container = usePortalContainer();
  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          STYLE_SCOPE,
          "z-50 w-72 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-[var(--text-primary)] outline-none [box-shadow:var(--shadow-menu)]",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
