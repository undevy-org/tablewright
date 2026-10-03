import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--accent-primary)] text-[var(--text-on-accent)] hover:opacity-90",
        secondary:
          "border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--border-focus)] hover:text-[var(--text-primary)]",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]",
      },
      size: {
        default: "h-[var(--size-control-md)] px-4",
        sm: "h-[var(--size-control-sm)] rounded-md px-3 text-[12px]",
        icon: "h-[var(--size-control-md)] w-[var(--size-control-md)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
