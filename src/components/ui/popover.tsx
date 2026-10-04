import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "../../lib/utils";
import { STYLE_SCOPE } from "../../lib/style-scope";
import { usePortalContainer } from "../../context/portal-container-context";

type PopoverContextValue = {
  triggerId: string | undefined;
  setTriggerId: (id: string | undefined) => void;
  triggerMounted: boolean;
  setTriggerMounted: (mounted: boolean) => void;
};

const PopoverContext = React.createContext<PopoverContextValue | null>(null);

function usePopoverContext() {
  const context = React.useContext(PopoverContext);
  if (!context) {
    throw new Error("Popover components must be used within Popover");
  }
  return context;
}

function Popover(props: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const [triggerId, setTriggerId] = React.useState<string | undefined>(undefined);
  const [triggerMounted, setTriggerMounted] = React.useState(false);
  const setTriggerMountedStable = React.useCallback((mounted: boolean) => {
    setTriggerMounted(mounted);
  }, []);

  return (
    <PopoverContext.Provider
      value={{
        triggerId,
        setTriggerId,
        triggerMounted,
        setTriggerMounted: setTriggerMountedStable,
      }}
    >
      <PopoverPrimitive.Root {...props} />
    </PopoverContext.Provider>
  );
}

const PopoverTrigger = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>
>(({ id, ...props }, ref) => {
  const generatedId = React.useId();
  const resolvedId = id ?? generatedId;
  const { setTriggerId, setTriggerMounted } = usePopoverContext();

  React.useEffect(() => {
    setTriggerId(resolvedId);
    setTriggerMounted(true);
    return () => {
      setTriggerMounted(false);
      setTriggerId(undefined);
    };
  }, [resolvedId, setTriggerId, setTriggerMounted]);

  return <PopoverPrimitive.Trigger ref={ref} id={resolvedId} {...props} />;
});
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => {
  const container = usePortalContainer();
  const { triggerId, triggerMounted } = usePopoverContext();
  const { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledBy, ...rest } = props;

  const resolvedAriaLabelledBy =
    ariaLabel !== undefined && ariaLabelledBy === undefined
      ? undefined
      : (ariaLabelledBy ?? (triggerMounted && triggerId ? triggerId : undefined));

  return (
    <PopoverPrimitive.Portal container={container}>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        aria-label={ariaLabel}
        aria-labelledby={resolvedAriaLabelledBy}
        className={cn(
          STYLE_SCOPE,
          "z-50 w-72 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 text-[var(--text-primary)] outline-none [box-shadow:var(--shadow-menu)]",
          className,
        )}
        {...rest}
      />
    </PopoverPrimitive.Portal>
  );
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
