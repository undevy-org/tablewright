import { Columns, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface FlatColumnToggleProps {
  toggleableColumnIds: readonly string[];
  columnLabels: Record<string, string>;
  columnVisibility: Record<string, boolean>;
  onColumnToggle: (columnId: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FlatColumnToggle({
  toggleableColumnIds,
  columnLabels,
  columnVisibility,
  onColumnToggle,
  open,
  onOpenChange,
}: FlatColumnToggleProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <Columns size={14} />
          Columns
          <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-48 p-1">
        {toggleableColumnIds.map((columnId) => {
          const isChecked = columnVisibility[columnId] !== false;
          return (
            <label
              key={columnId}
              className="flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-[var(--bg-hover)]"
              style={{ fontSize: 13 }}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => onColumnToggle(columnId)}
                className="h-3.5 w-3.5 rounded-[3px]"
              />
              <span>{columnLabels[columnId] ?? columnId}</span>
            </label>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
