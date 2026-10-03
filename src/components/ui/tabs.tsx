import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../../lib/utils";

const Tabs = TabsPrimitive.Root;

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-auto max-w-full items-center gap-1 rounded-lg bg-[var(--bg-secondary)] p-1 text-[var(--text-secondary)]",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  count?: React.ReactNode;
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps
>(({ className, children, count, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-secondary)] transition-all hover:text-[var(--text-primary)] data-[state=active]:bg-[var(--bg-surface)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:[box-shadow:var(--shadow-tab-active)]",
      className,
    )}
    {...props}
  >
    <span className="inline-flex items-center gap-1.5">
      <span>{children}</span>
      {count !== undefined ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-[var(--text-utility)] transition-colors group-data-[state=active]:bg-[var(--bg-secondary)] group-data-[state=active]:text-[var(--text-primary)]">
          {count}
        </span>
      ) : null}
    </span>
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("outline-none", className)} {...props} />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
