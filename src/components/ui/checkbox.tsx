import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check, Minus } from "lucide-react";

import { cn } from "../../lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-primary)] outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-focus)] data-[state=checked]:border-[var(--accent-primary)] data-[state=checked]:bg-[var(--accent-primary)] data-[state=indeterminate]:border-[var(--accent-primary)] data-[state=indeterminate]:bg-[var(--accent-primary)]",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="group flex items-center justify-center text-[var(--text-on-accent)]">
      <Minus className="hidden h-3 w-3 group-data-[state=indeterminate]:block" />
      <Check className="h-3 w-3 group-data-[state=indeterminate]:hidden" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
