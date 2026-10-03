import * as React from "react";

import { cn } from "../../lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-[var(--size-control-md)] w-full rounded-md border bg-[var(--bg-surface)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none transition-colors placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-focus)] disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[var(--border-danger)]"
            : "border-[var(--border-subtle)]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
