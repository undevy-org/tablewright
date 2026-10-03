import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Check, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "../../lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/* ------------------------------------------------------------------ */
/*  Command primitives (cmdk wrapped with design-system styles)       */
/* ------------------------------------------------------------------ */

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-[var(--bg-surface)] text-[var(--text-primary)]",
      className,
    )}
    {...props}
  />
));
Command.displayName = "Command";

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="flex items-center border-b border-[var(--border-subtle)] px-2.5">
    <Search className="mr-2 h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-9 w-full bg-transparent py-2 text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]",
        className,
      )}
      {...props}
    />
  </div>
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("max-h-[280px] overflow-y-auto overflow-x-hidden p-1", className)}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-[12px] text-[var(--text-tertiary)]"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-[var(--text-primary)] [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-[var(--text-tertiary)]",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-[12px] outline-none",
      "data-[selected=true]:bg-[var(--bg-hover)] data-[selected=true]:text-[var(--text-primary)]",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      className,
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem };

/* ------------------------------------------------------------------ */
/*  Combobox — opinionated wrapper over Popover + Command             */
/* ------------------------------------------------------------------ */

export interface ComboboxOption<TValue extends string = string> {
  value: TValue;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface ComboboxProps<TValue extends string = string> {
  value: TValue | null;
  onChange: (value: TValue | null) => void;
  options: ComboboxOption<TValue>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Allow clearing the selection by clicking the selected item again. Default true. */
  clearable?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  /** Custom render of the selected label inside the trigger. */
  renderSelected?: (option: ComboboxOption<TValue>) => React.ReactNode;
  /** Accessible name for the trigger button (e.g. the field label). */
  triggerAriaLabel?: string;
}

export function Combobox<TValue extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results.",
  disabled,
  clearable = true,
  className,
  triggerClassName,
  contentClassName,
  renderSelected,
  triggerAriaLabel,
}: ComboboxProps<TValue>) {
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-label={triggerAriaLabel}
            className={cn(
              "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2.5 text-left text-[13px] text-[var(--text-primary)] outline-none transition-colors",
              "hover:border-[var(--border-focus)] focus-visible:border-[var(--border-focus)] focus-visible:ring-2 focus-visible:ring-[var(--border-focus)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              triggerClassName,
            )}
          >
            <span className={cn("truncate", !selected && "text-[var(--text-tertiary)]")}>
              {selected
                ? renderSelected
                  ? renderSelected(selected)
                  : selected.label
                : placeholder}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn("w-[var(--radix-popover-trigger-width)] p-0", contentClassName)}
        >
          <Command
            filter={(itemValue: string, search: string) =>
              itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={`${option.label} ${option.value}`}
                      disabled={option.disabled}
                      onSelect={() => {
                        if (isSelected && clearable) onChange(null);
                        else onChange(option.value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "text-[var(--accent-primary)]" : "text-transparent",
                        )}
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{option.label}</span>
                        {option.description && (
                          <span className="truncate text-[11px] text-[var(--text-tertiary)]">
                            {option.description}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
