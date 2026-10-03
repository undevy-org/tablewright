import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { ChevronDown, Columns3 } from "lucide-react";

import { cn } from "../../lib/utils";

import { Button } from "../ui/button";
import { SegmentedControl } from "../ui/segmented-control";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export interface ColumnToggleItem {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
}

export function Root({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("py-3", className)} {...props}>
      <div className="flex flex-wrap items-start gap-2.5 lg:items-center">{children}</div>
    </section>
  );
}

export function SearchForm({
  children,
  className,
  ...props
}: ComponentProps<"form">) {
  return (
    <form
      className={cn(
        "flex min-w-[280px] flex-[0_1_360px] items-center gap-2 md:max-w-[460px]",
        className,
      )}
      {...props}
    >
      {children}
    </form>
  );
}

export function Filters({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-w-0 flex-wrap items-center gap-2.5 lg:flex-nowrap lg:gap-2", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Utility({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2 lg:flex-nowrap", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Actions({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2 xl:ml-auto", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ActiveFilters({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

interface ColumnVisibilityMenuProps {
  columns: ColumnToggleItem[];
  onColumnToggle: (columnId: string) => void;
  label?: string;
  buttonClassName?: string;
}

export function ColumnVisibilityMenu({
  columns,
  onColumnToggle,
  label = "Show/Hide columns",
  buttonClassName,
}: ColumnVisibilityMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="secondary" className={cn("shrink-0", buttonClassName)}>
          <Columns3 className="h-4 w-4" />
          {label}
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuGroup>
          {columns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.checked}
              disabled={column.disabled}
              onCheckedChange={() => onColumnToggle(column.id)}
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DensityControl({
  density,
  onDensityChange,
  className,
}: {
  density: "normal" | "dense";
  onDensityChange: (value: "normal" | "dense") => void;
  className?: string;
}) {
  return (
    <SegmentedControl
      value={density}
      options={[
        { value: "normal", label: "Normal" },
        { value: "dense",  label: "Dense"  },
      ]}
      onValueChange={onDensityChange}
      variant="toolbar"
      className={className}
    />
  );
}
