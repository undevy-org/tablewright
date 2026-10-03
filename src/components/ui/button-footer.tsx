import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** "stretch" (default, current behavior) | "end" (natural-width, right-aligned) */
  align?: "stretch" | "end";
}

export function ButtonFooter({
  children,
  className,
  align = "stretch",
  ...props
}: ButtonFooterProps) {
  return (
    <div
      className={cn(
        "flex gap-2 border-t border-[var(--border-subtle)] pt-4",
        align === "stretch" ? "[&>*]:flex-1" : "justify-end",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
