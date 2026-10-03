import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium leading-[1.4]",
  {
    variants: {
      variant: {
        success: "bg-[var(--tag-green-bg)] text-[var(--tag-green-text)]",
        warning: "bg-[var(--tag-orange-bg)] text-[var(--tag-orange-text)]",
        danger: "bg-[var(--tag-pink-bg)] text-[var(--tag-pink-text)]",
        info: "bg-[var(--tag-blue-bg)] text-[var(--tag-blue-text)]",
        neutral: "bg-[var(--tag-gray-bg)] text-[var(--tag-gray-text)]",
        purple: "bg-[var(--tag-purple-bg)] text-[var(--tag-purple-text)]",
        sky: "bg-[var(--tag-sky-bg)] text-[var(--tag-sky-text)]",
        indigo: "bg-[var(--tag-indigo-bg)] text-[var(--tag-indigo-text)]",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
