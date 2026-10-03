import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export interface TwoPanelMenuItem {
  id: string;
  label: string;
  checked?: boolean;
  disabled?: boolean;
}

export interface TwoPanelMenuGroup {
  key: string;
  label: string;
  items: TwoPanelMenuItem[];
}

interface TwoPanelMenuBaseProps {
  groups: TwoPanelMenuGroup[];
  activeCountPerGroup?: Record<string, number>;
  trigger: React.ReactNode;
  width?: number;
  renderRightPanel: (group: TwoPanelMenuGroup, onClose: () => void) => React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CategoryRowProps {
  group: TwoPanelMenuGroup;
  activeCount: number;
  isSelected: boolean;
  onClick: () => void;
}

function CategoryRow({ group, activeCount, isSelected, onClick }: CategoryRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full cursor-pointer items-center justify-between gap-1 rounded-md px-3 py-2 text-left text-[13px] transition-colors hover:bg-[var(--bg-hover)] ${isSelected ? "bg-[var(--bg-secondary)] font-medium" : "font-normal"}`}
    >
      <span
        className={`truncate leading-[1.4] ${isSelected ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}
      >
        {group.label}
      </span>
      {activeCount > 0 && (
        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[var(--bg-tertiary)] px-1.5 text-[11px] font-semibold tabular-nums text-[var(--text-utility)]">
          {activeCount}
        </span>
      )}
    </button>
  );
}

export function TwoPanelMenuBase({
  groups,
  activeCountPerGroup = {},
  trigger,
  width = 380,
  renderRightPanel,
  open,
  onOpenChange,
}: TwoPanelMenuBaseProps) {
  const [selectedGroupKey, setSelectedGroupKey] = useState<string>(groups[0]?.key ?? "");

  const selectedGroup = groups.find((g) => g.key === selectedGroupKey) ?? groups[0];

  const handleClose = () => onOpenChange?.(false);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="flex max-h-[60vh] overflow-hidden p-0"
        style={{ width: `${width}px` }}
      >
        {/* Left panel */}
        <div className="w-44 shrink-0 overflow-y-auto bg-[var(--bg-surface-muted)] p-1.5">
          {groups.map((group) => (
            <CategoryRow
              key={group.key}
              group={group}
              activeCount={activeCountPerGroup[group.key] ?? 0}
              isSelected={group.key === selectedGroupKey}
              onClick={() => setSelectedGroupKey(group.key)}
            />
          ))}
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-y-auto bg-[var(--bg-surface)]">
          {selectedGroup ? renderRightPanel(selectedGroup, handleClose) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
