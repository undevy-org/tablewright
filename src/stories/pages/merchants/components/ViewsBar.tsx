import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";

import type { MerchantViewKey, MerchantViewPreset } from "../types";

interface ViewSelectorBarProps {
  views: MerchantViewPreset[];
  activeView: MerchantViewKey;
  onViewChange: (key: MerchantViewKey) => void;
}

export function ViewSelectorBar({ views, activeView, onViewChange }: ViewSelectorBarProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-3">
      <span className="text-[12px] font-medium text-[var(--text-tertiary)]">View</span>
      <Select value={activeView} onValueChange={(v) => onViewChange(v as MerchantViewKey)}>
        <SelectTrigger aria-label="View" className="h-8 w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {views.map((view) => (
            <SelectItem key={view.key} value={view.key}>
              {view.label}
            </SelectItem>
          ))}
          {activeView === "custom" && (
            <SelectItem value="custom" disabled>
              Custom
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
