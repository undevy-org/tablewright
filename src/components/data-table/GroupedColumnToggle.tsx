import { TwoPanelMenuBase } from "./TwoPanelMenu";
import type { TwoPanelMenuGroup } from "./TwoPanelMenu";
import type { ColumnGroup } from "./filter-types";
import { Columns, ChevronDown } from "lucide-react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

interface GroupedColumnToggleProps {
  columnGroups: ColumnGroup[];
  columnLabels: Record<string, string>;
  columnVisibility: Record<string, boolean>;
  onColumnToggle: (columnId: string) => void;
  onGroupToggleAll: (groupKey: string, show: boolean) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CheckboxRightPanelProps {
  group: TwoPanelMenuGroup;
  columnVisibility: Record<string, boolean>;
  onColumnToggle: (columnId: string) => void;
  onGroupToggleAll: (groupKey: string, show: boolean) => void;
}

function CheckboxRightPanel({
  group,
  columnVisibility,
  onColumnToggle,
  onGroupToggleAll,
}: CheckboxRightPanelProps) {
  const allVisible = group.items.every((item) => columnVisibility[item.id] !== false);
  const noneVisible = group.items.every((item) => columnVisibility[item.id] === false);
  const isIndeterminate = !allVisible && !noneVisible;

  return (
    <div style={{ padding: 4 }}>
      {/* Tri-state "All" checkbox */}
      <label
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-[var(--bg-hover)] cursor-pointer"
        style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}
      >
        <Checkbox
          checked={isIndeterminate ? "indeterminate" : allVisible}
          onCheckedChange={() => onGroupToggleAll(group.key, !allVisible)}
          className="h-3.5 w-3.5 rounded-[3px]"
        />
        <span>All</span>
      </label>
      {/* Inset separator */}
      <div className="border-t border-[var(--border-subtle)]" style={{ margin: "0 8px 4px 8px" }} />
      {/* Items */}
      {group.items.map((item) => {
        const isChecked = columnVisibility[item.id] !== false;
        return (
          <label
            key={item.id}
            className={`flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-[var(--bg-hover)] cursor-pointer ${item.disabled ? "pointer-events-none opacity-50" : ""}`}
            style={{ fontSize: 13 }}
          >
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => onColumnToggle(item.id)}
              disabled={item.disabled}
              className="h-3.5 w-3.5 rounded-[3px]"
            />
            <span>{item.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export function GroupedColumnToggle({
  columnGroups,
  columnLabels,
  columnVisibility,
  onColumnToggle,
  onGroupToggleAll,
  open,
  onOpenChange,
}: GroupedColumnToggleProps) {
  const groups: TwoPanelMenuGroup[] = columnGroups.map((cg) => ({
    key: cg.key,
    label: cg.label,
    items: cg.columnIds.map((columnId) => ({
      id: columnId,
      label: columnLabels[columnId] ?? columnId,
      checked: columnVisibility[columnId] !== false,
      disabled: false,
    })),
  }));

  const activeCountPerGroup: Record<string, number> = {};
  for (const cg of columnGroups) {
    const hiddenCount = cg.columnIds.filter((id) => columnVisibility[id] === false).length;
    activeCountPerGroup[cg.key] = hiddenCount;
  }

  const trigger = (
    <Button variant="secondary">
      <Columns size={14} />
      Columns
      <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
    </Button>
  );

  return (
    <TwoPanelMenuBase
      groups={groups}
      activeCountPerGroup={activeCountPerGroup}
      trigger={trigger}
      width={380}
      open={open}
      onOpenChange={onOpenChange}
      renderRightPanel={(group) => (
        <CheckboxRightPanel
          group={group}
          columnVisibility={columnVisibility}
          onColumnToggle={onColumnToggle}
          onGroupToggleAll={onGroupToggleAll}
        />
      )}
    />
  );
}
